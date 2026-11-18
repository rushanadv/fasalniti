import {existsSync} from 'node:fs';
for(const file of ['.env.local','.env'])if(existsSync(file))process.loadEnvFile(file);
export const config={
 port:Number(process.env.API_PORT||8787),dataKey:process.env.DATA_GOV_IN_API_KEY||'',resource:process.env.DATA_GOV_MANDI_RESOURCE_ID||'9ef84268-d588-465a-a308-a864a43d0070',
 verifiedMandiResource:process.env.DATA_GOV_MANDI_VERIFIED_RESOURCE_ID||'',unitOverrides:process.env.DATA_GOV_VERIFIED_UNITS_JSON||'{}',unitSource:process.env.DATA_GOV_UNIT_SOURCE_URL||'',
 elevenKey:process.env.ELEVENLABS_API_KEY||'',voice:process.env.ELEVENLABS_VOICE_ID||'',
 sttModel:process.env.ELEVENLABS_STT_MODEL||'scribe_v2',zeroRetention:process.env.ELEVENLABS_ZERO_RETENTION==='true',
 weatherKey:process.env.OPEN_METEO_API_KEY||'',speechEnabled:process.env.SPEECH_PROVIDER==='elevenlabs',weather:process.env.WEATHER_ENABLED!=='false',
};
