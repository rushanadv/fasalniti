import {existsSync} from 'node:fs';
for(const path of ['.env.local','.env'])if(existsSync(path))process.loadEnvFile(path);
import {readdir,readFile} from 'node:fs/promises';
const names=['DATA_GOV_IN_API_KEY','ELEVENLABS_API_KEY','OPEN_METEO_API_KEY','server-only-test-sentinel','xi-api-key'];
for(const name of await readdir('dist/assets')){if(!/\.(js|css)$/.test(name))continue;const text=await readFile('dist/assets/'+name,'utf8');for(const key of names)if(text.includes(key))throw Error('Server-only marker found in frontend artifact: '+key);for(const key of ['DATA_GOV_IN_API_KEY','ELEVENLABS_API_KEY','OPEN_METEO_API_KEY']){const value=process.env[key];if(value&&value.length>8&&text.includes(value))throw Error('Provider secret found in frontend artifact')}}
console.log('Client artifact check passed: no provider keys, SDK credentials, or server-only test markers.');
