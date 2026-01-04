# Production deployment guide

Bu rehber, proje için temel production kurulum adımlarını içerir: Docker, MongoDB, Caddy (otomatik TLS) ve temel konfigürasyon.

1) Hazırlık
- Rehberi `c:\Users\acer\Desktop\mlm websayfam\kutbulzaman` kökünde uygulayın.
- `docker` ve `docker-compose` yüklü olmalı.

2) Ortam değişkenleri
- `.env.production.example` dosyasını `.env.production` olarak kopyalayın ve `JWT_SECRET`, `DOMAIN` ve `MONGO_URI` değerlerini doldurun.

```powershell
Copy-Item .env.production.example .env.production
# edit .env.production ile gerekli değerleri girin
```

3) Caddy yapılandırması
- `Caddyfile.template` içindeki `your.domain.com` değerini kendi domaininiz ile değiştirip `Caddyfile` olarak kaydedin.

4) Başlatma (staging/production)

```powershell
docker compose up -d --build
```

5) Yedek/geri yükleme
- `scripts/import-users-to-mongo.js` ile arşivden MongoDB'ye import yapabilirsiniz. Önce arşivi açın:

```powershell
Expand-Archive -Path .\data\backups\users_backup.zip -DestinationPath .\tmp\users_backup -Force
npm install mongodb minimist
node scripts/import-users-to-mongo.js --dir=./tmp/users_backup --uri="mongodb://root:example@localhost:27017" --db=mlm --collection=users
```

6) Güvenlik ve izleme
- `JWT_SECRET`, ödeme anahtarları ve SMTP bilgileri gibi gizli değerleri `secrets manager` veya ortam değişkeni olarak saklayın.
- İzleme için Sentry veya Prometheus + Grafana önerilir.

7) Notlar
- Let's Encrypt otomatik olarak Caddy tarafından yönetilir; DNS A kaydınızı `your.domain.com` için sunucunuza işaret edin.
- Büyük veri taşıma ve 1M kullanıcı hedefi için IO, disk ve DB konfigürasyonlarını (sharding, indices) planlayın.
