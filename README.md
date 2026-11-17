# FasalNiti

A Hindi-first, bilingual React + TypeScript application for comparing produce selling options after costs. Built with Vite and React Router.

## Run

```sh
npm install
npm run dev
npm test
npm run build
```

## Working demo

Farmer home, four-step listing with saved progress, produce details, buyer offers, comparison with editable assumptions, immutable counteroffer history, confirmation before acceptance, and a separate buyer workspace. Use the labelled profile menu to switch roles, change language/location, or explore an empty account. All people, offers, locations and market quotes are fictional sample records. Ordinary records persist in localStorage; files remain session-only and are never uploaded or stored there.

The signature comparison uses 20 quintals of Grade A wheat available 18 November 2026. Option A returns ₹47,500; B returns ₹48,700, a ₹1,200 difference. Every other cost is explicitly zero. Mandi and an additional buyer demonstrate missing costs, which are never ranked as a complete best result. Comparison assumptions do not modify signed buyer proposals. Selection is restricted to the same listing and 20-quintal basis.

## Boundaries

This is a browser-local commercial workflow demonstration. `src/domain/adapter.ts` provides an explicitly simulated acknowledgement, not a server. Offline submissions are blocked; drafts remain local. Loading the app for the first time offline and multi-device synchronization are not implemented. Publishing, offers and acceptance are demo-only and do not constitute transactions, payments, transport bookings or delivery confirmation.

Production requires authenticated farmer/buyer identities, server-side ownership and version checks, durable storage, secure document uploads and explicit sharing enforcement, real contact data, market/weather feeds, and agriculture assistance integrations. No OTP is sent. Optional farm-assistance and voice features honestly state that they are unavailable. No diagnosis or chemical advice is generated. Mandi quotes are stale fictional estimates, not executable offers. Exact farm coordinates are never collected. No fake verification is shown.

Uploads can be reviewed during the listing session. They intentionally do not appear as uploaded files after publication or reload; a real secure upload adapter is required. Contact/document switches record permission, but this demo has no real private contact information or persistent documents to disclose.

## Structure

- `src/components`: shell, accessible modal, receipt, crop illustrations and shared UI
- `src/pages`: connected farmer and buyer journeys
- `src/domain/model.ts`: integer-paise money calculations, conversions, and transitions
- `src/domain/data.ts`: fictional fixtures and bilingual names/terms
- `src/domain/adapter.ts`: replaceable mutation acknowledgement boundary
- `src/i18n.ts`: Hindi/English UI strings
- `src/store.tsx`: ordinary local persistence and UI state

## Checks

Focused tests cover exact PRD money examples, zero versus unknown costs, best complete option, kg/quintal/tonne conversion, immutable proposal history, sender permissions, expiry and closed-state rules, and default contact/document visibility. Build checks TypeScript before bundling. Responsive CSS targets 360px, 390px, 768px and desktop.
