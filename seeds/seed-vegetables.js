/**
 * Seed script — adds 20 Telugu vegetables to Firestore.
 *
 * Usage:
 *   node seeds/seed-vegetables.js --env=dev
 *   node seeds/seed-vegetables.js --env=staging
 *   node seeds/seed-vegetables.js --env=prod   (default)
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
console.log(`🌱  Seeding vegetables → ${serviceAccount.project_id} (${env})`);

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

const VEGETABLES = [
  { name_te: "టమాట",        name_en: "Tomato",           emoji: "🍅", unit: "kg",     category: "fruit_veg", active: true },
  { name_te: "ఉల్లిపాయ",    name_en: "Onion",            emoji: "🧅", unit: "kg",     category: "root",      active: true },
  { name_te: "బంగాళదుంప",   name_en: "Potato",           emoji: "🥔", unit: "kg",     category: "root",      active: true },
  { name_te: "వంకాయ",       name_en: "Brinjal",          emoji: "🍆", unit: "kg",     category: "fruit_veg", active: true },
  { name_te: "బెండకాయ",     name_en: "Okra",             emoji: "🌿", unit: "kg",     category: "fruit_veg", active: true },
  { name_te: "కాకరకాయ",     name_en: "Bitter Gourd",     emoji: "🥒", unit: "kg",     category: "gourd",     active: true },
  { name_te: "బీరకాయ",      name_en: "Ridge Gourd",      emoji: "🥒", unit: "kg",     category: "gourd",     active: true },
  { name_te: "సొరకాయ",      name_en: "Bottle Gourd",     emoji: "🎃", unit: "piece",  category: "gourd",     active: true },
  { name_te: "పొట్లకాయ",    name_en: "Snake Gourd",      emoji: "🌿", unit: "kg",     category: "gourd",     active: true },
  { name_te: "దోసకాయ",      name_en: "Cucumber",         emoji: "🥒", unit: "kg",     category: "gourd",     active: true },
  { name_te: "పచ్చి మిర్చి", name_en: "Green Chilli",     emoji: "🌶️", unit: "kg",     category: "fruit_veg", active: true },
  { name_te: "క్యాప్సికం",   name_en: "Capsicum",         emoji: "🫑", unit: "kg",     category: "fruit_veg", active: true },
  { name_te: "క్యారెట్",    name_en: "Carrot",           emoji: "🥕", unit: "kg",     category: "root",      active: true },
  { name_te: "కాలిఫ్లవర్",  name_en: "Cauliflower",      emoji: "🥦", unit: "piece",  category: "flower",    active: true },
  { name_te: "క్యాబేజీ",    name_en: "Cabbage",          emoji: "🥬", unit: "piece",  category: "leafy",     active: true },
  { name_te: "పాలకూర",      name_en: "Spinach",          emoji: "🥬", unit: "bundle", category: "leafy",     active: true },
  { name_te: "మెంతికూర",    name_en: "Fenugreek Leaves", emoji: "🌿", unit: "bundle", category: "leafy",     active: true },
  { name_te: "మునగకాయ",     name_en: "Drumstick",        emoji: "🌿", unit: "kg",     category: "other",     active: true },
  { name_te: "అరటికాయ",     name_en: "Raw Banana",       emoji: "🍌", unit: "dozen",  category: "fruit_veg", active: true },
  { name_te: "గోరుచిక్కుడు", name_en: "Cluster Beans",   emoji: "🫘", unit: "kg",     category: "bean",      active: true },
];

async function seedVegetables() {
  const col = db.collection("vegetables");

  const existing = await col.get();
  if (!existing.empty) {
    console.log(`⚠️   vegetables already has ${existing.size} docs in ${serviceAccount.project_id}. Skipping.`);
    console.log("    Delete the collection first to re-seed.");
    process.exit(0);
  }

  const now   = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();
  VEGETABLES.forEach((veg) => batch.set(col.doc(), { ...veg, created_at: now, updated_at: now }));

  await batch.commit();
  console.log(`✅  Seeded ${VEGETABLES.length} vegetables → ${serviceAccount.project_id}`);
  process.exit(0);
}

seedVegetables().catch((err) => {
  console.error("❌  Seed failed:", err.message ?? err);
  if (err.code === 5) {
    console.error("    Firestore may not be enabled for this project.");
    console.error(`    Go to: https://console.firebase.google.com/project/${serviceAccount.project_id}/firestore`);
  }
  process.exit(1);
});
