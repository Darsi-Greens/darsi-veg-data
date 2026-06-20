/**
 * Seed script — adds 3 sample vendors to Firestore.
 *
 * Usage:
 *   node seeds/seed-vendors.js
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
  const now = admin.firestore.FieldValue.serverTimestamp();
  const col = db.collection("vendors");

  // Check existing count to avoid duplicates on re-run
  const existing = await col.get();
  if (!existing.empty) {
    console.log(
      `⚠️  vendors collection already has ${existing.size} documents. Skipping seed.`
    );
    console.log("   Delete the collection first if you want to re-seed.");
    process.exit(0);
  }

  const batch = db.batch();

  VENDORS.forEach((vendor) => {
    const ref = col.doc();
    batch.set(ref, { ...vendor, created_at: now, updated_at: now });
  });

  await batch.commit();
  console.log(`✅  Seeded ${VENDORS.length} vendors successfully.`);
  process.exit(0);
}

seedVendors().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
