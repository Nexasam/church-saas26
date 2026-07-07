# Church OS — Production Deployment Checklist

## ✅ COMPLETED FIXES

1. **Finance Officer Settings/Logout Bug** — Fixed `EnsureWorkerAccess` middleware route names
2. **Platform Admin Member Count** — Wired real counts from database  
3. **Finance Attachments Storage** — Migrated from local disk to DigitalOcean Spaces
4. **Console Errors** — Removed all console.error statements from notification components
5. **Global Scopes** — Verified all models have proper `ChurchScope` applied
6. **Payment Integration Docs** — Added clear TODO with Paystack/Stripe integration guide
7. **AWS S3 Package** — Installed `league/flysystem-aws-s3-v3` v3.35.2 for DO Spaces support
8. **Finance Attachment URLs** — Fixed to use secure signed URLs instead of direct storage URLs
9. **Missing Notification Classes** — Created `SmsDeliveryNotification` and `WorkerSmsNotification`
10. **CSV Formula Injection** — Added `SanitizesCsv` trait to prevent formula injection attacks in exports
11. **Dashboard Service Entry Link** — Fixed to point to `/finance?tab=service-entry` instead of non-existent route
12. **Mock Data Clarification** — Added clear documentation that mock data is unused, backend provides real data

---

## ⚠️ REQUIRED BEFORE GO-LIVE

### 1. ~~Install AWS S3 Package (for DO Spaces)~~ ✅ DONE
Package already installed: `league/flysystem-aws-s3-v3` v3.35.2

### 2. Configure DigitalOcean Spaces
Add to `.env`:
```env
DO_SPACES_KEY=your_access_key_here
DO_SPACES_SECRET=your_secret_key_here
DO_SPACES_REGION=nyc3
DO_SPACES_BUCKET=your_bucket_name
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
```

**Steps:**
1. Create a Space in DigitalOcean
2. Generate API keys (Spaces access key & secret)
3. Set bucket permissions to private
4. Add keys to `.env`

### 3. Integrate Payment Gateway
Current: Plans update without payment (dev mode only)

**Recommended Provider:** Paystack (for Nigeria/Africa) or Stripe (international)

**Paystack Setup:**
```bash
composer require unicodeveloper/laravel-paystack
```

Add to `.env`:
```env
PAYSTACK_PUBLIC_KEY=pk_xxx
PAYSTACK_SECRET_KEY=sk_xxx
PAYSTACK_PAYMENT_URL=https://api.paystack.co
PAYSTACK_MERCHANT_EMAIL=billing@yourchurch.com
```

**Replace code in:** `app/Http/Controllers/BillingController.php` → `updatePlan()` method
- Follow the TODO comments in that file for exact integration steps

### 4. Configure SMS Provider
Current: SMS module backend ready, provider config needed

Add to `.env`:
```env
SMS_PROVIDER=termii

# Termii (Nigeria)
TERMII_API_KEY=your_key_here
TERMII_SENDER_ID=YourChurch
TERMII_CHANNEL=generic

# OR Twilio (International)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_FROM_NUMBER=+1234567890
```

Get keys from:
- Termii: https://termii.com
- Twilio: https://twilio.com

### 5. Configure Email (Transactional)
For notifications, password resets, invitations

**Recommended:** Resend, Mailgun, or SendGrid

Example for Resend:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=re_xxxxx
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourchurch.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### 6. Set up Queue Worker
SMS sending and notifications use queues — **this is critical for SMS to work**.

**For production (Required):**
```bash
php artisan queue:work --tries=3 --timeout=90 --daemon
```

**Better: Use Supervisor** (Linux) to auto-restart queue workers:
```ini
[program:church-os-worker]
command=php /path/to/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/path/to/logs/worker.log
```

Restart supervisor after changes:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start church-os-worker:*
```

**Or use systemd** (alternative to Supervisor):
```ini
[Unit]
Description=Church OS Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /path/to/artisan queue:work --sleep=3 --tries=3

[Install]
WantedBy=multi-user.target
```

**Or use cron** (simpler, less reliable):
```cron
* * * * * cd /path/to/church-os && php artisan schedule:run >> /dev/null 2>&1
```

### 7. Security Hardening
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
```

Run:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### 8. Database Backup Strategy
Set up automated daily backups:
- Use your hosting provider's backup service, OR
- Set up cron job:
```bash
0 2 * * * cd /path/to/church-os && php artisan backup:run >> /dev/null 2>&1
```

---

## 🔍 OPTIONAL (NICE TO HAVE)

### 1. Error Tracking
Install Sentry for production error monitoring:
```bash
composer require sentry/sentry-laravel
```

### 2. Performance Monitoring
- Enable Redis for cache/sessions (faster than database)
- Set up Laravel Horizon for queue monitoring

### 3. Analytics
- Google Analytics integration on welcome/marketing pages
- Admin dashboard analytics (member growth, finance trends)

---

## 📋 POST-DEPLOYMENT VERIFICATION

After deploying, test these critical flows:

- [ ] User registration & login
- [ ] Finance officer can login, access settings, logout
- [ ] Finance attachments upload successfully to DO Spaces
- [ ] Payment plan upgrade (after payment integration)
- [ ] SMS sending (after provider config)
- [ ] Notification delivery (email + in-app)
- [ ] Member import/export
- [ ] Dashboard loads with correct stats
- [ ] Platform admin can view all churches and member counts

---

## 📞 SUPPORT

If issues arise:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check web server logs: nginx/apache error logs
3. Verify `.env` keys are correct
4. Run `php artisan config:clear` to clear cached config

---

**Last Updated:** $(date)
**Version:** 1.0
