export class ApiError extends Error {constructor(public status:number,public code:string){super(code)}}
export async function fetchBounded(url:URL|string,init:RequestInit={},retries=1,timeout=8000):Promise<Response>{
 for(let attempt=0;;attempt++){
  try {const r=await fetch(url,{...init,signal:AbortSignal.timeout(timeout)});if((r.status===429||r.status>=500)&&attempt<retries){await r.body?.cancel();await new Promise(r=>setTimeout(r,200*(attempt+1)));continue}if(!r.ok){await r.body?.cancel();throw new ApiError(502,r.status===429?'provider-rate-limited':'provider-unavailable')}return r}
  catch(e){if(e instanceof ApiError)throw e;if(attempt>=retries)throw new ApiError(502,'provider-unavailable')}
 }
}
export class Cache<T>{private entries=new Map<string,{value:T;at:number}>();constructor(private max=100){}get(key:string,age:number){const e=this.entries.get(key);return e&&Date.now()-e.at<age?e.value:null}set(key:string,value:T){if(this.entries.size>=this.max)this.entries.delete(this.entries.keys().next().value!);this.entries.set(key,{value,at:Date.now()})}}
export class RateLimiter{private clients=new Map<string,{count:number;until:number}>();constructor(private max=60,private windowMs=60000){}allow(ip:string,now=Date.now()){for(const [k,v]of this.clients)if(v.until<=now)this.clients.delete(k);const entry=this.clients.get(ip)??{count:0,until:now+this.windowMs};if(this.clients.size>=10000&&!this.clients.has(ip))return false;entry.count++;this.clients.set(ip,entry);return entry.count<=this.max}}
