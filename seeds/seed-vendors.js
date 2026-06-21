/**
 * Seed script — adds 3 vendors to Firestore with simplified schema.
 *
 * Usage:
 *   node seeds/seed-vendors.js --env=dev
 *   node seeds/seed-vendors.js --env=staging
 *   node seeds/seed-vendors.js --env=prod   (default)
 *
 * Add --force to overwrite existing vendors instead of skipping.
 */

const admin = require("firebase-admin");
const path  = require("path");

const envArg   = process.argv.find((a) => a.startsWith("--env="));
const env      = envArg ? envArg.split("=")[1] : "prod";
const force    = process.argv.includes("--force");

const KEY_MAP = {
  dev:     "../../serviceAccountKey.dev.json",
  staging: "../../serviceAccountKey.staging.json",
  prod:    "../../serviceAccountKey.json",
};

const keyPath = KEY_MAP[env];
if (!keyPath) {
  console.error(`❌  Unknown env "${env}". Use: --env=dev | --env=staging | --env=prod`);
  process.exit(1);
}

const serviceAccount = require(path.resolve(__dirname, keyPath));
console.log(`🌱  Seeding vendors → ${serviceAccount.project_id} (${env})`);

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

// Bilingual schema — name/area in Telugu + English
const VENDORS = [
  {
    name:    "రాజు",
    name_en: "Raju",
    area:    "దర్సి మార్కెట్",
    area_en: "Darsi Market",
    phone:   "9848012345",
    active:  true,
  },
  {
    name:    "సురేష్",
    name_en: "Suresh",
    area:    "కందుకూరు",
    area_en: "Kandukur",
    phone:   "9550123456",
    active:  true,
  },
  {
    name:    "మురళి",
    name_en: "Murali",
    area:    "దర్సి",
    area_en: "Darsi",
    phone:   "9876543210",
    active:  true,
  },
];

async function seedVendors() {
  const col = db.collection("vendors");

  const existing = await col.get();
  if (!existing.empty && !force) {
    console.log(`⚠️   vendors already has ${existing.size} docs in ${serviceAccount.project_id}.`);
    console.log("    Use --force to delete and re-seed.");
    process.exit(0);
  }

  if (!existing.empty && force) {
    console.log(`🗑️   Deleting ${existing.size} existing vendor docs...`);
    const delBatch = db.batch();
    existing.docs.forEach((d) => delBatch.delete(d.ref));
    await delBatch.commit();
  }

  const now   = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();
  VENDORS.forEach((v) => batch.set(col.doc(), { ...v, created_at: now, updated_at: now }));

  await batch.commit();
  console.log(`✅  Seeded ${VENDORS.length} vendors → ${serviceAccount.project_id}`);
  VENDORS.forEach((v) => console.log(`   • ${v.name} (${v.name_en}) — ${v.area}`));
  process.exit(0);
}

seedVendors().catch((err) => {
  console.error("❌  Seed failed:", err.message ?? err);
  process.exit(1);
});
