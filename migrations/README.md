# Migrations

This directory contains one-time data migration scripts for the Darsi Veg Firestore database.

## Prerequisites

1. **Node.js** — v18 or higher
2. **Firebase Admin SDK** — install in the repo root:
   ```bash
   npm install firebase-admin
   ```
3. **Service Account Key** — download from Firebase Console:
   - Firebase Console → Project Settings → Service Accounts → Generate New Private Key
   - Save as `serviceAccountKey.json` in the repo root
   - **Never commit this file** — it is git-ignored

## Running Seed Scripts

Seed scripts populate fresh collections with initial data. They are idempotent — safe to inspect, but will skip if the collection already has documents.

```bash
# Seed vegetables (20 Telugu vegetables)
node seeds/seed-vegetables.js

# Seed vendors (3 sample vendors)
node seeds/seed-vendors.js
```

Run vegetables first — vendor_orders and prices reference veg_ids.

## Running Migration Scripts

Each migration script in this directory is prefixed with a version number (e.g. `001_add_category_field.js`). Run them in order:

```bash
node migrations/001_add_category_field.js
```

Migrations are designed to be **idempotent** — running them twice should produce the same result as running once. Each script logs what it did and exits with code 0 on success or 1 on failure.

## Migration Script Template

```js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

async function migrate() {
  // TODO: migration logic here
  console.log('✅  Migration complete.');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌  Migration failed:', err);
  process.exit(1);
});
```

## Environment Variables (Alternative to serviceAccountKey.json)

Instead of a key file, you can set:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

Then initialise without explicitly referencing the file:

```js
admin.initializeApp(); // picks up GOOGLE_APPLICATION_CREDENTIALS automatically
```

## Firestore Emulator

To run against the local Firestore emulator instead of production:

```bash
export FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
node seeds/seed-vegetables.js
```

Start the emulator with:

```bash
firebase emulators:start --only firestore
```

## Collections & Document ID Strategy

| Collection       | Document ID                        | Notes                              |
|------------------|------------------------------------|------------------------------------|
| `vegetables`     | Firestore auto-ID                  | Name stays stable via ID reference |
| `prices`         | `{veg_id}_{YYYY-MM-DD}`           | Enables direct lookup without query|
| `sales`          | Firestore auto-ID                  | Append-only, high write volume     |
| `vendors`        | Firestore auto-ID                  | Low cardinality, rarely changes    |
| `vendor_orders`  | Firestore auto-ID                  | One doc per delivery per vendor    |
| `stock_log`      | Firestore auto-ID                  | Append-only audit log              |
| `daily_summary`  | `YYYY-MM-DD`                       | One doc per day, easy range query  |
