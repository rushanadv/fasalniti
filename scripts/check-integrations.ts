import {getMarkets} from '../server/providers/market';import {getWeather} from '../server/providers/weather';import {speechCapabilities} from '../server/providers/speech';
const market=await getMarkets(new URLSearchParams('crop=wheat&district=Sehore&limit=2'));
console.log(JSON.stringify({integration:'data.gov.in',status:market.status,records:market.records.length,unitVerified:market.records.length?market.records.every(r=>!!r.priceUnit):null,note:market.status==='setup-required'?'Requires your server-side credentials':undefined}));
const weather=await getWeather('Sehore');console.log(JSON.stringify({integration:'Open-Meteo',status:weather.status,forecastPeriods:weather.days.map(d=>d.date),fetchedAt:weather.fetchedAt,issuedAt:weather.issuedAt}));
console.log(JSON.stringify({integration:'speech',...speechCapabilities(),liveAudioTest:'not performed; requires real consented Hindi and English recordings'}));
