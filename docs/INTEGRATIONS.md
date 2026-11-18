# Integration contracts and verification

Checked 18 November 2026. No public or third-party API key was used.

## data.gov.in / AGMARKNET

Official references:
- https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
- https://www.data.gov.in/backend/dms/v1/ogdp/node-uuid/9ef84268-d588-465a-a308-a864a43d0070?_format=json
- https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070

The shared key returned HTTP 200 and five records from the published resource. The response lists `state`, `district`, `market`, `commodity`, `variety`, `grade`, `arrival_date`, `min_price`, `max_price`, and `modal_price`. Live requests confirmed the lowercase state, district, commodity and market filter names. The date format was DD/MM/YYYY. The API omits the unit field. [AGMARKNET’s data entry manual](https://www.agmarknet.gov.in/DailyDataEntry/UserManual.pdf) documents standardized prices in rupees per quintal or per item depending on commodity and variety. The verified resource adapter uses the per-quintal standard for wheat, soyabean, and maize. Other commodities require an explicit provider unit or a documented override.

Set `DATA_GOV_IN_API_KEY` in the server environment. Browser requests use `GET /api/mandi-prices?state=Madhya+Pradesh&district=Indore&commodity=Wheat` with optional `market`, `limit` and `offset`. The default resource is already verified. An alternate resource requires separate verification and a matching `DATA_GOV_MANDI_VERIFIED_RESOURCE_ID`. The API normalizes prices to integer paise, returns the original arrival date and normalized reporting date, and includes the fetch timestamp and source. Returned records are checked against the requested filters.

The backend caches equivalent filters and pages for ten minutes, shares concurrent requests, and can serve a labeled cached response for up to 24 hours during outages. Requests have an eight-second timeout, one retry and bounded pagination. Rate limits and no matching records have distinct messages. Explicitly selected demo prices are labeled. Reported mandi prices have their own calculator, which requires a positive quantity and each cost to be entered before showing an estimate.

## Weather: Open-Meteo

References: https://open-meteo.com/en/docs and https://open-meteo.com/en/pricing

The app uses the documented `/v1/forecast` daily temperature min/max (°C), precipitation probability (%), and precipitation sum (mm), with timezone `Asia/Kolkata` and three forecast days. District-centre coordinates come from the server allowlist; microphone and device location are never requested on load. Temperature, rainfall, units and periods are validated. Open-Meteo's standard response does not provide a model issue timestamp: `issuedAt` remains null and the UI says it is unavailable. The app fetch timestamp is never presented as model issue time. Fifteen-minute cache, bounded request retries/timeouts, and at most six-hour stale recovery are implemented. Stale data is not used to invent a fresh weather answer.

Live tested: Sehore forecast returned real daily values, dates and units; Hindi and English Ask answers reproduced the retrieved forecast for the requested day. The public endpoint is for evaluation/non-commercial use. A commercial plan's `OPEN_METEO_API_KEY` switches the server to the documented customer endpoint. This is not a government weather feed.

## Speech: ElevenLabs, with an explicit browser fallback

Official references:
- https://elevenlabs.io/docs/api-reference/speech-to-text/convert
- https://elevenlabs.io/docs/api-reference/text-to-speech/convert
- https://elevenlabs.io/docs/overview/models
- https://elevenlabs.io/pricing/api
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition

The official server SDK is used. The default configurable batch STT model is `scribe_v2` (still documented/available, succeeded by v3); Hindi and English are documented languages. TTS uses `eleven_multilingual_v2`, which documents both `hi` and `en`, plus a voice ID selected by the owner. At verification the published API pricing showed Scribe v2 at $0.20/audio hour and Multilingual v2 at $0.08/1,000 characters; plans and prices can change. No paid API calls were made.

Set `SPEECH_PROVIDER=elevenlabs`, `ELEVENLABS_API_KEY`, and `ELEVENLABS_VOICE_ID` in `.env.local`, then restart. `ELEVENLABS_ZERO_RETENTION=true` asks for provider zero retention, which requires an eligible enterprise plan. Standard-policy mode requires explicit on-screen consent acknowledging that the provider may retain speech. The application never persists raw audio; it buffers at most 3 MiB in memory, transcribes, and releases the bytes. Recordings are limited to 45 seconds. Provider calls have timeouts and no automatic retries to avoid duplicate billed submissions. There is no optional app audio-retention feature.

The default unconfigured mode is an explicitly labelled browser compatibility fallback. SpeechRecognition can send audio to the browser vendor's servers; support and retention vary. The app asks for processing consent and only starts recognition after a microphone tap. Hindi/English language hints are selected explicitly. Unsupported, denied, silence, network and provider errors retain a working text input; no transcript is fabricated. Browser TTS only selects a voice matching the current language and otherwise keeps the answer readable. English play/pause/resume/stop/replay controls were exercised in-browser; raw Hindi/English speech recognition and configured ElevenLabs STT/TTS were **not** tested with live audio/credentials. Regional dialect accuracy is untested.

## Assistant scope and privacy

Answers explain retrieved forecast records, official mandi responses, or the selected accessible local demo proposal. All offer money is calculated by `calculate()`; buyer context is limited to that demo buyer's offers. No private proposal is sent to an LLM. There is no general-purpose LLM or approved agronomy corpus configured: farming doubts ask for crop/stage and abstain from diagnoses, chemical doses, scheme eligibility or unsupported crop actions. References and timestamps accompany data-grounded answers. The assistant cannot publish, accept, negotiate, or share contacts on the user's behalf.

A dedicated application backend now serves `/api/*`; the frontend never contacts a credentialed provider directly. Backend binds loopback. Existing authentication, listing and negotiation persistence remain a local demo; a multi-user hosted version still needs authenticated server-side ownership and proposal version checks. Rate limits in this local prototype are in-memory and keyed by socket address; multiple production instances require a shared limit/cache and authenticated access for paid speech.
