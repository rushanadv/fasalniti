# FasalNiti

Hindi-first produce marketplace with a separate buyer workspace, transparent take-home comparisons, immutable negotiation history, and a voice-first Ask section.

## Run locally

Requires Node.js 22.12+.

```sh
npm ci
cp .env.example .env.local
# Add your own server-side credentials if enabling official mandi data or ElevenLabs.
npm run dev
```

Frontend: http://localhost:5173 · Backend: http://127.0.0.1:8787. The dev command runs both, proxies `/api` to the backend, and reloads backend source changes. Set the mandi key only as the server environment variable `DATA_GOV_IN_API_KEY`. No provider credential belongs in a `VITE_` or `NEXT_PUBLIC_` variable; keys must never be committed, returned to a browser, or logged. `.env` and `.env.local` are ignored by Git.

```sh
npm run build
npm test
npm run check:client
npm run check:integrations
# Serve the production frontend and API from one local origin:
npm start
```

Production output requires the Node backend. A static-only upload does not provide market, weather or speech APIs. Open http://127.0.0.1:8787 after `npm start`.

## What works

Home / Sell / Offers / Ask navigation; visual searchable crop selection; four-step listing drafts; buyer discovery and structured offers; preserved counteroffer proposals; exact-version acceptance summaries; unknown costs kept distinct from confirmed zero; Hindi/English text; numeric units and money; profile sharing controls and empty accounts. Comparison supports a selected listing and equal-quantity offers, normalizes kg/quintal/tonne, and retains the reproducible ₹47,500 versus ₹48,700 wheat example.

Ask has consented microphone capture, labelled browser compatibility STT or a configurable ElevenLabs adapter, stop/cancel/error states, transcript editing, guarded question submission, visible source-grounded answers, spoken playback controls and opt-in autoplay. Question drafts persist locally; raw recordings do not. Optional Ask code is lazy-loaded. Real speech recognition still needs user-consented live audio testing; browser support is not universal.

Official market data flows frontend → backend → data.gov.in. The default AGMARKNET resource is verified. Alternate resources require contract verification and a matching `DATA_GOV_MANDI_VERIFIED_RESOURCE_ID`. Missing credentials show setup-required; fictional data is available only by explicitly choosing a labelled sample. Market reporting dates and fetch timestamps are separate. Unverified price units cannot enter selling calculations. Selling comparison has a separate reported market price calculator that requires the farmer’s quantity and costs.

Open-Meteo supplies retrieved weather by supported district, with source, forecast dates, units, fetch time and an explicit unavailable issue timestamp. Weather and mandi outages do not disable marketplace routes. Ask explanations use retrieved records and deterministic offer calculations. An approved agronomy corpus is not connected, so farming questions ask for context and abstain from unsupported advice.

## Setup and verification boundaries

See [integration contracts](docs/INTEGRATIONS.md) for the verified official references, units policy, filters, pagination, costs, retention configuration and remaining live acceptance gates. No API key was copied from a public repository or invented.

The marketplace is still a fictional browser-local demo: no real OTP, trade, payment, delivery booking or secure persistent upload is implemented. The live data.gov.in test passed using server-side credentials. Configured Hindi/English STT/TTS requires ElevenLabs credentials and real audio. The Node server binds loopback; multi-user hosting needs authentication and shared infrastructure.

## Source structure

- `src/pages`, `src/components`: connected, mobile-first journeys
- `src/domain`: integer-paise calculations, conversions, transitions and demo data
- `src/assistant`: grounded answer routing and pluggable speech boundary
- `src/services`: typed API responses and client requests
- `server/providers`: isolated market, weather and speech adapters
- `server/http.ts`: bounded fetches, caches and rate limits
- `src/i18n.ts`: Hindi/English strings
- `scripts`: local startup and integration/artifact checks

See [validation notes](VALIDATION.md) for automated and browser checks and their limits.
