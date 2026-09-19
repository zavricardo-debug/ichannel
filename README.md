# iChannel | Multi-Listing Vacation Rental Channel Manager

A modern, production-grade Vacation Rental Channel Manager & Property Management System (PMS) designed to be hosted on **Cloudflare Pages & Workers**.

iChannel enables vacation rental hosts, property managers, and hospitality teams to distribute real-time pricing and availability across **Airbnb**, **Booking.com**, **Vrbo (Expedia Group)**, and direct booking channels — all from a single unified multi-calendar interface.

---

## 🌟 Key Features

### 1. Unified Multi-Listing Calendar View
- **Multi-Property Timeline Matrix**: View all your vacation rentals stacked vertically with dates running horizontally across 14, 21, or 30 days.
- **Color-Coded OTA Reservations**:
  - **Airbnb** (Rose / Pink `#FF385C`)
  - **Booking.com** (Navy Blue `#003580`)
  - **Vrbo / Expedia** (Cyan / Sky `#1668B8`)
  - **Direct Bookings** (Emerald `#10B981`)
- **Direct Cell & Range Inspector**:
  - Click any cell or multi-select date ranges to adjust base nightly rates.
  - Live preview showing the exact calculated prices for Airbnb, Booking.com, and Vrbo with channel markup formulas.
  - One-click block/unblock with custom hold reasons (e.g. *Hot Tub Maintenance*, *Owner Stay*, *Deep Cleaning*).
  - Minimum stay restrictions (1n, 2n, 3n, 5n, 7n, 14n).
  - Closed to Arrival (CTA) and Closed to Departure (CTD) restriction toggles.

### 2. Bulk Rate & Availability Manager
- Select single, multiple, or all listings simultaneously.
- Define custom date ranges with quick presets (*Next 14 Days*, *Next 30 Days*, *October*, *November*).
- Filter by days of the week (e.g. *Weekends Only* [Fri & Sat], *Weekdays Only* [Sun-Thu], or *All Days*).
- Apply mass updates:
  - Set new fixed nightly rates
  - Percentage price adjustments (+15% holiday surge, -10% mid-week discount)
  - Fixed dollar adjustments (+/- $50)
  - Mass block / unblock dates
  - Mass minimum stay rules
- One-click instant dispatch to all connected channels.

### 3. Discounts & Dynamic Pricing Rules Engine
- **Length of Stay (LOS) Discounts**:
  - Weekly Discount (e.g. 10% off for 7+ nights)
  - Two-Week Stay (e.g. 15% off for 14+ nights)
  - Monthly Workation Deal (e.g. 25% off for 28+ nights)
- **Lead Time Discounts**:
  - Last-Minute Flash Sale (e.g. 12% off for bookings within 3 days)
  - Early Bird Booking Advantage (e.g. 8% off for bookings made 60+ days in advance)
- **Channel Commission Offsetting / Markups**:
  - Automatically offsets Booking.com's 15% commission (+15% markup) so your net take-home pay matches direct bookings.
  - Offsets Airbnb's host service fee (+3% markup).
  - Offsets Vrbo's partner fee (+5% markup).
- **Interactive Price & Payout Simulator**:
  - Test real-time guest pricing and host net take-home side-by-side across Airbnb, Booking.com, Vrbo, and Direct.

### 4. Platform Access & Admin Center
- **Airbnb Connectivity Hub**:
  - Direct Partner API (OAuth 2.0 Client ID, Client Secret, Host User ID).
  - Permissions control: Rates push, Availability blocks, Min stay, Instant Book.
  - Webhook URL endpoint (`/api/webhooks/airbnb`).
  - Interactive "Test Connection & Ping API" diagnostic tool.
- **Booking.com Connectivity Interface**:
  - Machine XML Account ID, Connectivity Partner ID, Hotel Code, Rate Plan IDs.
  - Two-way XML rate and availability push.
  - "Test Booking.com XML Ping" diagnostic tool.
- **Vrbo / Expedia Partner API**:
  - Advertiser ID, OAuth Client ID, Client Secret, unit mapping.
  - "Test Vrbo API Interface" diagnostic tool.
- **Universal RFC 5545 iCal Feeds**:
  - Live export `.ics` link per listing (`/api/ical/[listingId].ics`) with 1-click copy.
  - Inbound iCal import feeds for 2-way non-API calendar sync.
- **Cloudflare Edge Configuration**:
  - Architecture breakdown, edge functions, and environment variables list.
- **Team Roles & Permissions**:
  - Role management (Super Admin, Revenue Manager, Operations / Cleaning).
- **Live Audit & Distribution Log**:
  - Real-time stream of all API dispatches, HTTP 200 responses, latency metrics, and webhook payloads.

---

## 🚀 Cloudflare Hosting & Deployment

This project is tailored specifically for **Cloudflare Pages & Workers**:

### Option 1: Instant CLI Deploy via Wrangler
```bash
# 1. Install dependencies and build the production bundle
npm install
npm run build

# 2. Deploy directly to Cloudflare Pages
npx wrangler pages deploy dist --project-name ichannel
```

### Option 2: Continuous Deployment via GitHub
1. Push this repository to your GitHub account (`zavricardo-debug/ichannel`).
2. Log into the [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select this repository and set the build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
4. Click **Save and Deploy**. Cloudflare Pages will build and deploy your site to a global edge network with custom SSL and `.pages.dev` domain.

### Included Cloudflare Configuration Files:
- `wrangler.jsonc`: Cloudflare Pages configuration, nodejs_compat flag, and variables.
- `public/_routes.json`: SPA fallback routing rules.
- `public/_headers`: Security headers and CORS configuration.
- `functions/api/sync.js`: Cloudflare Pages Function edge endpoint for OTA synchronization.
- `functions/api/ical/[listingId].js`: Cloudflare Pages Function serving RFC 5545 iCalendar feeds.
- `functions/api/channels.js`: Cloudflare Pages Function returning supported channel specs.
- `functions/api/import-airbnb.js`: Cloudflare Pages Function for inbound Airbnb iCal import (server-side `.ics` fetch + parse).
- `functions/lib/ical.js`: Shared RFC 5545 parser (line unfolding, VEVENT extraction, exclusive DTEND).

---

## 📥 Import from Airbnb (Inbound iCal)

Airbnb's calendar export endpoints do **not** send CORS headers, so the browser cannot fetch them directly. The **Airbnb Import** button on each listing card (in *Properties & Listings*) opens a modal where you paste the Airbnb iCal export URL — it is `POST`ed to the `POST /api/import-airbnb` Cloudflare Pages Function, which fetches and parses the feed **server-side** and returns the blocked nights, which are merged into `dateOverrides` and immediately render as blocked in the multi-calendar.

```bash
curl -X POST https://ichannel.pages.dev/api/import-airbnb \
  -H "Content-Type: application/json" \
  -d '{"listingId":"prop-1","icalUrl":"https://www.airbnb.com/calendar/ical/883921.ics?s=xyz"}'
```

```json
{
  "success": true,
  "listingId": "prop-1",
  "eventsImported": 6,
  "eventsSkipped": 1,
  "nightsBlocked": 16,
  "dateOverrides": {
    "prop-1": {
      "2026-09-20": { "blocked": true, "reason": "Airbnb: Reserved" },
      "2026-09-21": { "blocked": true, "reason": "Airbnb: Reserved" }
    }
  }
}
```

Behavior details:
- **DTEND is exclusive (RFC 5545 §3.6.1)**: a stay `DTSTART 2026-09-20 → DTEND 2026-09-24` blocks the nights `2026-09-20`–`2026-09-23`; the checkout day stays sellable, so back-to-back reservations can share a turnover day.
- Missing `DTEND` defaults to exactly one blocked night; `STATUS:CANCELLED` events are skipped; overlapping events are deduplicated (first summary wins as the block reason).
- Merging preserves any existing per-night `price` / `minStay` overrides and writes an `ICAL_IMPORT` entry to the audit log.
- The endpoint validates HTTPS-only URLs and rejects loopback/private/link-local hosts (SSRF guard), applies a 15s upstream timeout, and verifies the payload is a real `VCALENDAR`.
- Where to find the URL: Airbnb → *Menu → Listings → Calendar → Availability → Calendar sync → Export calendar*.

### Tests

The parser and the endpoint are covered by a vitest suite with a realistic Airbnb iCal fixture (`test/fixtures/airbnb-export.ics`, CRLF + folded lines + back-to-back stays + a cancelled event + a missing-DTEND event + UTC datetimes):

```bash
npm test          # run once (vitest run)
npm run test:watch
```

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start development server (binds to 0.0.0.0:3000 for preview)
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview

# Run the test suite (iCal parser + import endpoint)
npm test
```

---

## 📄 License
MIT License
