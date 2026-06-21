/**
 * Seed script — adds 3 sample vendors to Firestore.
 *
 * Usage:
 *   node seeds/seed-vendors.js --env=dev
 *   node seeds/seed-vendors.js --env=staging
 *   node seeds/seed-vendors.js --env=prod   (default)
 */

const admin = require("firebase-admin");
const path  = require("path");

// Parse --env flag
const envArg = process.argv.find((a) => a.startsWith("--env="));
const env    = envArg ? envArg.split("=")[1] : "prod";

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

const VENDORS = [
  {
    name: "Raju Vegetables",
    phone: "9848012345",
    area: "Darsi Market",
    address: "Shop No. 12, Main Market Road, Darsi, Prakasam Dist.",
    vegetables_supplied: [],
    payment_terms: "daily_cash",
    active: true,
    notes: "Primary supplier. Arrives by 6 AM daily.",
  },
  {
    name: "Krishna Wholesale",
    phone: "9701234567",
    area: "Ongole APMC",
    address: "APMC Yard, Ongole, Prakasam Dist.",
    vegetables_supplied: [],
    payment_terms: "weekly_credit",
    active: true,
    notes: "Leafy greens and root vegetables specialist. Weekly credit cycle.",
  },
  {
    name: "Suresh Farm Fresh",
    phone: "9550123456",
    area: "Kandukur",
    address: "NH-16, Kandukur, Prakasam Dist.",
    vegetables_supplied: [],
    payment_terms: "daily_cash",
    active: true,
    notes: "Local farmer — seasonal gourds and beans. Freshest stock.",
  },
];

async function seedVendors() {
  const col = db.collection("vendors");

  const existing = await col.get();
  if (!existing.empty) {
    console.log(`⚠️   vendors already has ${existing.size} docs in ${serviceAccount.project_id}. Skipping.`);
    console.log("    Delete the collection first to re-seed.");
    process.exit(0);
  }

  const now   = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();
  VENDORS.forEach((vendor) => batch.set(col.doc(), { ...vendor, created_at: now, updated_at: now }));

  await batch.commit();
  console.log(`✅  Seeded ${VENDORS.length} vendors → ${serviceAccount.project_id}`);
  process.exit(0);
}

seedVendors().catch((err) => {
  console.error("❌  Seed failed:", err.message ?? err);
  if (err.code === 5) {
    console.error("    Firestore may not be enabled for this project.");
    console.error(`    Go to: https://console.firebase.google.com/project/${serviceAccount.project_id}/firestore`);
  }
  process.exit(1);
});
