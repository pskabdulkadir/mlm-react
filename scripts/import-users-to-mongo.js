#!/usr/bin/env node
// imports JSON user files from a directory into MongoDB (upsert by id or email)
// Usage: node scripts/import-users-to-mongo.js --dir=./tmp/users_backup --uri=mongodb://localhost:27017/mlm --db=mlm --collection=users

const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

const argv = require('minimist')(process.argv.slice(2));
const dir = argv.dir || argv.d || './tmp/users_backup';
const uri = argv.uri || process.env.MONGO_URI;
const dbName = argv.db || 'mlm';
const collectionName = argv.collection || 'users';

if (!uri) {
  console.error('Mongo URI required via --uri or MONGO_URI env var');
  process.exit(2);
}

async function listFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dirPath, e.name);
    if (e.isDirectory()) {
      files.push(...await listFiles(full));
    } else if (e.isFile() && full.toLowerCase().endsWith('.json')) {
      files.push(full);
    }
  }
  return files;
}

async function run() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection(collectionName);

  const files = await listFiles(dir);
  console.log('Found', files.length, 'json files in', dir);
  if (files.length === 0) {
    console.log('No files to import. Extract your archive to the directory and retry.');
    await client.close();
    return;
  }

  const bulkOps = [];
  for (const f of files) {
    try {
      const raw = await fs.readFile(f, 'utf8');
      const doc = JSON.parse(raw);
      const filter = {};
      if (doc.id) filter.id = doc.id;
      else if (doc.email) filter.email = doc.email;
      else continue;
      bulkOps.push({ replaceOne: { filter, replacement: doc, upsert: true } });
      if (bulkOps.length >= 500) {
        const res = await col.bulkWrite(bulkOps, { ordered: false });
        console.log('Bulk write executed:', res.insertedCount + res.modifiedCount);
        bulkOps.length = 0;
      }
    } catch (err) {
      console.error('Failed to read/parse', f, err.message);
    }
  }
  if (bulkOps.length) {
    const res = await col.bulkWrite(bulkOps, { ordered: false });
    console.log('Final bulk write executed');
  }

  await client.close();
  console.log('Import complete');
}

run().catch(err => { console.error(err); process.exit(1); });
