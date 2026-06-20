/**
 * Seed script — adds 20 Telugu vegetables to Firestore.
 *
 * Usage:
 *   node seeds/seed-vegetables.js
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS or Firebase Admin SDK initialised
 * via .env (see migrations/README.md).
 */

const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = require("../serviceAccountKey.json");
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

const VEGETABLES = [
  {
    name_te: "టమాట",
    name_en: "Tomato",
    emoji: "🍅",
    unit: "kg",
    category: "fruit_veg",
    active: true,
  },
  {
    name_te: "ఉల్లిపాయ",
    name_en: "Onion",
    emoji: "🧅",
    unit: "kg",
    category: "root",
    active: true,
  },
  {
    name_te: "బంగాళదుంప",
    name_en: "Potato",
    emoji: "🥔",
    unit: "kg",
    category: "root",
    active: true,
  },
  {
    name_te: "వంకాయ",
    name_en: "Brinjal",
    emoji: "🍆",
    unit: "kg",
    category: "fruit_veg",
    active: true,
  },
  {
    name_te: "బెండకాయ",
    name_en: "Okra",
    emoji: "🌿",
    unit: "kg",
    category: "fruit_veg",
    active: true,
  },
  {
    name_te: "కాకరకాయ",
    name_en: "Bitter Gourd",
    emoji: "🥒",
    unit: "kg",
    category: "gourd",
    active: true,
  },
  {
    name_te: "బీరకాయ",
    name_en: "Ridge Gourd",
    emoji: "🥒",
    unit: "kg",
    category: "gourd",
    active: true,
  },
  {
    name_te: "సొరకాయ",
    name_en: "Bottle Gourd",
    emoji: "🎃",
    unit: "piece",
    category: "gourd",
    active: true,
  },
  {
    name_te: "పొట్లకాయ",
    name_en: "Snake Gourd",
    emoji: "🌿",
    unit: "kg",
    category: "gourd",
    active: true,
  },
  {
    name_te: "దోసకాయ",
    name_en: "Cucumber",
    emoji: "🥒",
    unit: "kg",
    category: "gourd",
    active: true,
  },
  {
    name_te: "పచ్చి మిర్చి",
    name_en: "Green Chilli",
    emoji: "🌶️",
    unit: "kg",
    category: "fruit_veg",
    active: true,
  },
  {
    name_te: "క్యాప్సికం",
    name_en: "Capsicum",
    emoji: "🫑",
    unit: "kg",
    category: "fruit_veg",
    active: true,
  },
  {
    name_te: "క్యారెట్",
    name_en: "Carrot",
    emoji: "🥕",
    unit: "kg",
    category: "root",
    active: true,
  },
  {
    name_te: "కాలిఫ్లవర్",
    name_en: "Cauliflower",
    emoji: "🥦",
    unit: "piece",
    category: "flower",
    active: true,
  },
  {
    name_te: "క్యాబేజీ",
    name_en: "Cabbage",
    emoji: "🥬",
    unit: "piece",
    category: "leafy",
    active: true,
  },
  {
    name_te: "పాలకూర",
    name_en: "Spinach",
    emoji: "🥬",
    unit: "bundle",
    category: "leafy",
    active: true,
  },
  {
    name_te: "మెంతికూర",
    name_en: "Fenugreek Leaves",
    emoji: "🌿",
    unit: "bundle",
    category: "leafy",
    active: true,
  },
  {
    name_te: "మునగకాయ",
    name_en: "Drumstick",
    emoji: "🌿",
    unit: "kg",
    category: "other",
    active: true,
  },
  {
    name_te: "అరటికాయ",
    name_en: "Raw Banana",
    emoji: "🍌",
    unit: "dozen",
    category: "fruit_veg",
    active: true,
  },
  {
    name_te: "గోరుచిక్కుడు",
    name_en: "Cluster Beans",
    emoji: "🫘",
    unit: "kg",
    category: "bean",
    active: true,
  },
];

async function seedVegetables() {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const col = db.collection("vegetables");

  // Check existing count to avoid duplicates on re-run
  const existing = await col.get();
  if (!existing.empty) {
    console.log(
      `⚠️  vegetables collection already has ${existing.size} documents. Skipping seed.`
    );
    console.log("   Delete the collection first if you want to re-seed.");
    process.exit(0);
  }

  const batch = db.batch();

  VEGETABLES.forEach((veg) => {
    const ref = col.doc();
    batch.set(ref, { ...veg, created_at: now, updated_at: now });
  });

  await batch.commit();
  console.log(`✅  Seeded ${VEGETABLES.length} vegetables successfully.`);
  process.exit(0);
}

seedVegetables().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
