# Validation — revised requirements

18 November 2026.

## Automated

- TypeScript + Vite production build passed.
- 23 focused tests passed: original exact money examples, conversions, unknown costs, permissions, negotiation history, official response normalization, missing units, invalid dates, allowlisted filters, pagination, credential boundary, cache, sanitized bounded provider failures, rate limit recovery, forecast values/units, grounded Hindi/English offer explanations, buyer access, weather abstention, unsupported speech, language selection and transcript response handling.
- Client artifact scan passed: no server-only provider environment names, credential header markers, test secret, or configured provider secret values in built frontend assets.
- `npm audit` reports the Vite/picomatch development dependency chain advisory (4 reported nodes). Vite remains on 6.4.6. A compatible patched picomatch release was not available in the configured registry; a forced major change was not applied. `npm audit --omit=dev` returned 0 vulnerabilities in production dependencies.

## Live integrations

- The shared server-side key worked. The official endpoint returned HTTP 200 and five valid records. Lowercase state, district, commodity and market filters were verified against live data.
- Gautampura APMC, Indore reported wheat at ₹3,211 per quintal on 18 November 2026. The local API, 390px market screen, farmer home, and Hindi Ask answer agreed. A separate comparison with two quintals and ₹100 of entered costs returned ₹6,322. A second identical API query returned the cached response with its original fetch timestamp. The Sehore wheat query returned a clean empty result.
- The Ask smoke test used a typed question at the same answer entry point used by speech transcripts. Live microphone recognition was outside this smoke test.
- Open-Meteo live Sehore forecast succeeded. The Ask UI's Hindi and English answer for 19 November reproduced the retrieved 0% rain probability, 0 mm precipitation, and 15.4–25.2 °C. Fetch time was separate from forecast date; model issue time remained explicitly unavailable.
- Configured ElevenLabs Hindi/English STT/TTS was not tested live: no key, voice, or real consented recordings provided. Browser English TTS play/pause/resume/stop was exercised. An intentional-stop error found during QA was corrected and the stop path retested successfully.

## Browser / mobile

- Home, Sell, Offers, Compare, Market screens measured at 360, 390, 768 and 1280px without horizontal document overflow. Ask was checked separately after its lazy module fully loaded at all four widths, also without overflow.
- Hindi Ask: microphone consent gate; working text fallback; starter question review; deterministic ₹47,500 take-home explanation; live weather answer.
- English Ask: edited question submission; weather answer; missing mandi setup answer without fabricated price; playback controls; source sections; persistent question draft.
- Keyboard-sized viewport simulation at 390×420: focused textarea at y145–275 and Send button at y325–379; bottom navigation hidden; both visible within the 420px viewport. This is a browser simulation, not an Android device certification.
- Counteroffer dialog inspected at 360×480: full-screen scrollable form and persistent visible Cancel/Confirm controls. No proposal was submitted during this regression check.
- Existing wheat comparison still reconciles ₹47,500 vs ₹48,700 and ₹1,200 difference; incomplete ₹50,600 buyer option remains provisional and unranked. Cost breakdowns are expandable.

## Remaining limits

- Real microphone STT quality, real device keyboards, regional dialects, 200% device text scaling and configured provider playback still require device/audio testing; these are not claimed as verified.
- Commodities without verified units cannot enter market take-home calculations.
- No approved agricultural knowledge corpus or general-purpose LLM is configured; crop advice abstains and asks for crop/growth-stage context.
- Marketplace authentication, production uploads, durable user ownership and payment/delivery integrations remain outside this fictional local demo.

## Environment naming and official-data gate update

- The server reads `DATA_GOV_IN_API_KEY`; the example assignment is empty. The frontend contains no reference to this secret.
- Official resource metadata was rechecked successfully: the published mandi resource and API availability are confirmed. The default resource was also verified through authenticated requests.
- For alternate resource IDs, the backend requires an exact `DATA_GOV_MANDI_VERIFIED_RESOURCE_ID` match before serving official records.
- The obsolete profile integration requirement was removed from project documentation. Voice-first Ask, mobile navigation and existing commercial workflows are preserved.
- Build, all 23 tests, and the client artifact secret scan pass after the update.
