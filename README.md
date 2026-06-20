# darsi-veg-data

Firestore schema definitions, seed data, and migration scripts for **Darsi Vegetable Shop** — a daily vegetable retail management system built for a small shop in Darsi, Andhra Pradesh.

---

## Collections Overview

| Collection       | Purpose                                              | Documents        |
|------------------|------------------------------------------------------|------------------|
| `vegetables`     | Master list of vegetables (names in Telugu + English)| ~20              |
| `prices`         | Daily buy + sell prices per vegetable                | 20 × days        |
| `sales`          | Individual sale transactions                         | High volume      |
| `vendors`        | Vegetable supplier master list                       | ~5–10            |
| `vendor_orders`  | Daily incoming stock deliveries from vendors         | 1–3/day          |
| `stock_log`      | Append-only stock movement audit trail               | High volume      |
| `daily_summary`  | End-of-day financial and stock totals                | 1/day            |

---

## Repository Structure

```
darsi-veg-data/
├── schema/
│   ├── vegetables.json       # Master vegetable definitions
│   ├── prices.json           # Daily buy/sell prices
│   ├── sales.json            # Sale transactions
│   ├── vendors.json          # Vendor master list
│   ├── vendor_orders.json    # Vendor delivery records
│   ├── stock_log.json        # Stock movement log
│   └── daily_summary.json    # End-of-day summaries
├── seeds/
│   ├── seed-vegetables.js    # Seeds 20 Telugu vegetables
│   └── seed-vendors.js       # Seeds 3 sample vendors
├── migrations/
│   └── README.md             # How to write & run migrations
└── README.md                 # This file
```

---

## Schema Details

### `vegetables`
Master catalogue of vegetables sold in the shop.

| Field         | Type      | Description                                 |
|---------------|-----------|---------------------------------------------|
| `name_te`     | string    | Name in Telugu script (e.g. `టమాట`)         |
| `name_en`     | string    | Name in English (e.g. `Tomato`)             |
| `emoji`       | string    | Single emoji for UI display                 |
| `unit`        | string    | `kg` / `bundle` / `piece` / `dozen`         |
| `category`    | string    | `leafy` / `gourd` / `root` / `fruit_veg` / `flower` / `bean` / `other` |
| `active`      | boolean   | Whether currently stocked                   |
| `created_at`  | Timestamp | Firestore server timestamp                  |
| `updated_at`  | Timestamp | Firestore server timestamp                  |

**Document ID:** Firestore auto-generated

---

### `prices`
One document per vegetable per day.

| Field          | Type    | Description                                      |
|----------------|---------|--------------------------------------------------|
| `veg_id`       | string  | Ref → `vegetables/{id}`                          |
| `veg_name_en`  | string  | Denormalized for fast reads                      |
| `veg_name_te`  | string  | Denormalized Telugu name                         |
| `date`         | string  | `YYYY-MM-DD`                                     |
| `buy_price`    | number  | Price paid to vendor (INR per unit)              |
| `sell_price`   | number  | Price charged to customer (INR per unit)         |
| `unit`         | string  | `kg` / `bundle` / `piece` / `dozen`              |
| `margin`       | number  | `sell_price - buy_price`                         |
| `margin_pct`   | number  | Margin as percentage                             |
| `created_at`   | Timestamp |                                                |
| `updated_at`   | Timestamp |                                                |

**Document ID:** `{veg_id}_{YYYY-MM-DD}` — enables O(1) lookup without a query

---

### `sales`
One document per line item sold (high-volume, append-only).

| Field            | Type      | Description                                    |
|------------------|-----------|------------------------------------------------|
| `veg_id`         | string    | Ref → `vegetables/{id}`                        |
| `veg_name_en`    | string    | Denormalized                                   |
| `veg_name_te`    | string    | Denormalized                                   |
| `veg_emoji`      | string    | Denormalized for receipt                       |
| `sale_date`      | string    | `YYYY-MM-DD` — for daily grouping              |
| `quantity`       | number    | Sold quantity (decimal for kg)                 |
| `unit`           | string    | Unit of measure                                |
| `sell_price`     | number    | Price at time of sale                          |
| `total_amount`   | number    | `quantity × sell_price`                        |
| `payment_mode`   | string    | `cash` / `upi` / `credit`                     |
| `customer_name`  | string    | Optional (for credit sales)                    |
| `customer_phone` | string    | Optional (for credit sales)                    |
| `created_at`     | Timestamp | Exact time of sale                             |

**Document ID:** Firestore auto-generated

---

### `vendors`
Supplier master list (low-volume, rarely changes).

| Field                   | Type      | Description                            |
|-------------------------|-----------|----------------------------------------|
| `name`                  | string    | Vendor full name                       |
| `phone`                 | string    | 10-digit mobile number                 |
| `area`                  | string    | Market / locality (e.g. Darsi Market)  |
| `address`               | string    | Full address (optional)                |
| `vegetables_supplied`   | string[]  | Array of `veg_id` refs                 |
| `payment_terms`         | string    | `daily_cash` / `weekly_credit` / `monthly_credit` |
| `active`                | boolean   |                                        |
| `notes`                 | string    | Free-text notes                        |
| `created_at`            | Timestamp |                                        |
| `updated_at`            | Timestamp |                                        |

**Document ID:** Firestore auto-generated

---

### `vendor_orders`
One document per delivery from a vendor (can have multiple items).

| Field            | Type      | Description                                    |
|------------------|-----------|------------------------------------------------|
| `vendor_id`      | string    | Ref → `vendors/{id}`                           |
| `vendor_name`    | string    | Denormalized                                   |
| `order_date`     | string    | `YYYY-MM-DD`                                   |
| `items`          | array     | Line items — see below                         |
| `total_amount`   | number    | Sum of all `line_total` values                 |
| `amount_paid`    | number    | Amount settled so far                          |
| `payment_status` | string    | `pending` / `partial` / `paid`                 |
| `payment_mode`   | string    | `cash` / `upi` / `credit`                     |
| `notes`          | string    | Quality issues, partial delivery, etc.         |
| `created_at`     | Timestamp |                                                |
| `updated_at`     | Timestamp |                                                |

**`items` array element:**

| Field          | Type   | Description               |
|----------------|--------|---------------------------|
| `veg_id`       | string | Ref → `vegetables/{id}`   |
| `veg_name_en`  | string | Denormalized              |
| `veg_name_te`  | string | Denormalized              |
| `quantity`     | number | Received quantity         |
| `unit`         | string |                           |
| `buy_price`    | number | Price paid per unit       |
| `line_total`   | number | `quantity × buy_price`    |

**Document ID:** Firestore auto-generated

---

### `stock_log`
Append-only audit trail for all stock movements.

| Field            | Type      | Description                                         |
|------------------|-----------|-----------------------------------------------------|
| `veg_id`         | string    | Ref → `vegetables/{id}`                             |
| `veg_name_en`    | string    | Denormalized                                        |
| `veg_name_te`    | string    | Denormalized                                        |
| `movement_type`  | string    | `in` / `out` / `adjustment` / `wastage` / `return` |
| `quantity`       | number    | Always positive — direction from `movement_type`    |
| `unit`           | string    |                                                     |
| `log_date`       | string    | `YYYY-MM-DD`                                        |
| `reference_type` | string    | `vendor_order` / `sale` / `manual` / `return`       |
| `reference_id`   | string    | ID of source document                               |
| `stock_before`   | number    | Stock before movement (optional, for auditing)      |
| `stock_after`    | number    | Stock after movement (optional, for auditing)       |
| `notes`          | string    | Required for `adjustment` and `wastage` types       |
| `created_by`     | string    | Staff UID or name                                   |
| `created_at`     | Timestamp |                                                     |

**Document ID:** Firestore auto-generated

---

### `daily_summary`
One document per day — computed EOD summary.

| Field                  | Type      | Description                               |
|------------------------|-----------|-------------------------------------------|
| `date`                 | string    | `YYYY-MM-DD`                              |
| `total_sales_amount`   | number    | Total revenue (INR)                       |
| `total_buy_amount`     | number    | Total buying cost (INR)                   |
| `gross_profit`         | number    | `sales - buy`                             |
| `gross_profit_pct`     | number    | Gross margin %                            |
| `total_transactions`   | number    | Count of sale records                     |
| `total_wastage_amount` | number    | Estimated value of wastage                |
| `payment_breakdown`    | object    | `{ cash, upi, credit }` amounts           |
| `vegetables_sold`      | array     | Per-vegetable revenue breakdown           |
| `top_seller`           | string    | Best-selling vegetable by revenue         |
| `status`               | string    | `draft` (in-progress) / `finalized` (EOD) |
| `created_at`           | Timestamp |                                           |
| `updated_at`           | Timestamp |                                           |

**Document ID:** `YYYY-MM-DD` — enables direct lookup and date-range queries

---

## Quick Start

### 1. Install dependencies
```bash
npm install firebase-admin
```

### 2. Add service account key
Download from Firebase Console → Project Settings → Service Accounts and save as `serviceAccountKey.json` in the repo root.

```
darsi-veg-data/
└── serviceAccountKey.json   ← add here (git-ignored)
```

### 3. Seed the database
```bash
# Always seed vegetables first — other collections reference veg_ids
node seeds/seed-vegetables.js
node seeds/seed-vendors.js
```

### 4. Run against the local emulator (optional)
```bash
firebase emulators:start --only firestore
export FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
node seeds/seed-vegetables.js
```

---

## Key Design Decisions

- **Denormalization** — vegetable names are copied into prices, sales, stock_log, and vendor_orders so reads never require a join.
- **Composite price IDs** (`{veg_id}_{date}`) — eliminates a `where` query when loading today's price board.
- **Daily summary doc ID = date** — range queries like "last 7 days summary" use `startAt` / `endAt` on the document ID directly.
- **Stock log is append-only** — never update or delete entries; add an `adjustment` or `return` record instead.
- **Units** — stored per-vegetable in `vegetables` collection and denormalized everywhere to avoid unit confusion across collections.

---

## Related Repositories

| Repo                  | Description                          |
|-----------------------|--------------------------------------|
| `darsi-veg-app`       | Flutter mobile app (shop owner UI)   |
| `darsi-veg-functions` | Firebase Cloud Functions (triggers, EOD summaries) |
| `darsi-veg-data`      | This repo — schema + seeds           |
