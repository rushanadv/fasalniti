import {createServer,type IncomingMessage,type ServerResponse} from 'node:http';import {readFile} from 'node:fs/promises';import {resolve,extname} from 'node:path';import {config} from './config';import {ApiError,RateLimiter} from './http';import {getMarkets} from './providers/market';import {getWeather} from './providers/weather';import {speechCapabilities,transcribe,synthesize} from './providers/speech';
const limiter=new RateLimiter(60),speechLimiter=new RateLimiter(6);const root=resolve('dist');
async function body(req:IncomingMessage,max:number){const chunks:Buffer[]=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>max)throw new ApiError(413,'body-too-large');chunks.push(chunk)}return Buffer.concat(chunks)}
function json(res:ServerResponse,status:number,value:unknown){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value))}
export const server=createServer(async(req,res)=>{try{
 const url=new URL(req.url||'/','http://localhost');if(url.pathname.startsWith('/api/')){
  if(!limiter.allow(req.socket.remoteAddress??'local'))throw new ApiError(429,'rate-limited');
  const origin=req.headers.origin;if(origin&&new URL(origin).host!==req.headers.host)throw new ApiError(403,'origin-denied');
  if(req.method==='GET'&&url.pathname==='/api/health')return json(res,200,{ok:true});
  if(req.method==='GET'&&url.pathname==='/api/capabilities')return json(res,200,speechCapabilities());
  if(req.method==='GET'&&['/api/markets','/api/mandi-prices'].includes(url.pathname))return json(res,200,await getMarkets(url.searchParams));
  if(req.method==='GET'&&url.pathname==='/api/weather')return json(res,200,await getWeather(url.searchParams.get('district')||'Sehore'));
  if(req.method==='POST'&&['/api/speech/transcribe','/api/speech/synthesize'].includes(url.pathname)){
   if(!speechLimiter.allow(req.socket.remoteAddress??'local'))throw new ApiError(429,'rate-limited');
   if(url.pathname.endsWith('transcribe')){const mime=(req.headers['content-type']||'').split(';')[0];if(!['audio/webm','audio/mp4','audio/ogg','audio/wav'].includes(mime))throw new ApiError(415,'audio-format');const lang=req.headers['x-language'];if(lang!=='en'&&lang!=='hi')throw new ApiError(400,'invalid-language');return json(res,200,await transcribe(await body(req,3*1024*1024),mime,lang,req.headers['x-provider-retention-consent']==='true'))}
   const data=JSON.parse((await body(req,20000)).toString());if(typeof data.text!=='string'||!data.text.trim()||data.text.length>6000)throw new ApiError(400,'invalid-text');if(!config.zeroRetention&&data.consent!==true)throw new ApiError(400,'consent-required');const audio=await synthesize(data.text);res.writeHead(200,{'Content-Type':'audio/mpeg','Cache-Control':'no-store'});res.end(audio);return;
  }throw new ApiError(404,'not-found');
 }
 if(req.method!=='GET')throw new ApiError(405,'method-not-allowed');const path=resolve(root,'.'+decodeURIComponent(url.pathname));if(path!==root&&!path.startsWith(root+'/'))throw new ApiError(400,'invalid-path');const types:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.svg':'image/svg+xml'};let bytes:Buffer;let extension=extname(path);try{bytes=await readFile(path)}catch{if(extension)throw new ApiError(404,'not-found');bytes=await readFile(resolve(root,'index.html'));extension='.html'}res.writeHead(200,{'Content-Type':types[extension]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(bytes);
 }catch(e){const error=e instanceof ApiError?e:new ApiError(400,'request-failed');json(res,error.status,{error:error.code})}
});
server.requestTimeout=45000;server.headersTimeout=10000;server.listen(config.port,'127.0.0.1',()=>console.log(`FasalNiti backend: http://127.0.0.1:${config.port}`));
