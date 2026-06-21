/**
 * Cleanup script — removes test data from darsi-veg-staging.
 * Deletes: _test_writes, vendor_orders, sales
 * Keeps:   vegetables, vendors (re-seed if needed)
 *
 * Usage:
 *   node scripts/cleanup-staging.js
 */

const admin = require('firebase-admin');
const path  = require('path');

const serviceAccount = require(path.resolve(__dirname, '../../serviceAccountKey.staging.json'));

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

const COLLECTIONS_TO_DELETE = ['_test_writes', 'vendor_orders', 'sales'];

async function deleteCollection(colName) {
  const col  = db.collection(colName);
  const snap = await col.get();
  if (snap.empty) {
    console.log(`   ⏭  ${colName} — already empty`);
    return 0;
  }
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  console.log(`   🗑  ${colName} — deleted ${snap.size} docs`);
  return snap.size;
}

async function main() {
  console.log(`\n🧹  Cleaning up staging: ${serviceAccount.project_id}\n`);
  let total = 0;
  for (const col of COLLECTIONS_TO_DELETE) {
    total += await deleteCollection(col);
  }
  console.log(`\n✅  Done — deleted ${total} docs total\n`);
  console.log('   Kept: vegetables, vendors (run seed:staging to re-seed if needed)\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌  Cleanup failed:', err.message ?? err);
  process.exit(1);
});
