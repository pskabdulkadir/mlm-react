# Migration & Cleanup Notes

Date: 2026-01-04

Summary
- Demo/test user files and indices have been backed up and cleaned to prepare the project for real production data.
- Backups created:
  - `data/backups/database.json.bak` (compact summary)
  - `data/backups/mlm-db.json.bak` (compact summary)
  - `data/backups/users_backup.zip` (full `data/users` archive)
- Cleaned files:
  - `database.json` and `data/mlm-db.json` were cleared of demo/test users (skeleton left in place).
  - `data/index/*.json` (referral, phone, sponsor, email, memberId) were emptied (`{}`) to remove seed mappings.
- The on-disk per-user shard directory `data/users/` was archived and then emptied.

Restore / Verify
- To inspect the backup ZIP:

```powershell
Expand-Archive -Path .\data\backups\users_backup.zip -DestinationPath .\tmp\users_backup -Force
# then inspect files in .\tmp\users_backup
```

- To restore user files back into `data/users` (careful: this will overwrite current contents):

```powershell
# stop server first
Expand-Archive -Path .\data\backups\users_backup.zip -DestinationPath .\data\users -Force
# verify permissions and restart server
```

Recommended next steps
- Keep `data/backups/users_backup.zip` in cold storage or move to a dedicated backup location before deleting old backups.
- If you want to permanently remove demo data, confirm then run removal on backups as well.
- Create a `migration/` directory with exported CSV/JSON snapshots if you need long-term archival.

Production recommendations
- Move to a real database (MongoDB or Postgres) for production and use migrations instead of manual JSON edits.
- Suggested flow:
  1. Export per-user JSON files to a staging database.
  2. Rebuild indices in DB (unique constraints for phone/email/memberId).
  3. Run verification scripts (counts, sample user lookups, commission reconciliation).

Useful commands (Windows PowerShell)
```powershell
# Backup current data/users folder (if you want another archive)
Compress-Archive -Path .\data\users\* -DestinationPath .\data\backups\users_backup-$(Get-Date -Format yyyyMMdd).zip -Force

# Remove user files (irreversible)
Remove-Item -Recurse -Force .\data\users\*

# Create compact JSON backups of database files
Copy-Item .\database.json .\data\backups\database.json.bak -Force
Copy-Item .\data\mlm-db.json .\data\backups\mlm-db.json.bak -Force
```

Notes
- The cleanup done so far was conservative: `data/users` was archived then emptied. Indices and root DB JSON were cleared.
- If you want full removal (including backups), reply with `permanent-delete` and I'll remove backups after a confirmation prompt.

Contact
- If you want I can also generate a migration script to import the archived per-user JSON files into MongoDB/Postgres and create indices.

MongoDB import aracÄ±
---------------------

HazÄ±r bir Node aracaÄŸÄ± ekledim: `scripts/import-users-to-mongo.js`.
KullanÄ±m (Ã–rnek):

```powershell
# Ã–nce arÅŸivi Ã§Ä±karÄ±n (varsa)
Expand-Archive -Path .\data\backups\users_backup.zip -DestinationPath .\tmp\users_backup -Force

# MongoDB'ye aktarmak iÃ§in node scriptini Ã§alÄ±ÅŸtÄ±rÄ±n
# npm install mongodb minimist
# node scripts/import-users-to-mongo.js --dir=./tmp/users_backup --uri="mongodb://localhost:27017" --db=mlm --collection=users
```

Notlar
- Script klasÃ¶r altÄ±ndaki tüm `.json` dosyalarÄ±nÄ± okur ve `id` veya `email` alanÄ±na gÃ¶re upsert yapar.
- Büyük veri iÃ§in paralelleÅŸtirme/ayrÄ± parti yaklaÅŸÄ±mlarÄ± eklemek mantÄ±klÄ±dÄ±r.
