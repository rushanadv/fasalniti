import {config} from '../config';import {ApiError,Cache,fetchBounded} from '../http';import {commodityMap,marketIsStale,type MarketRecord,type MarketResult} from '../../src/services/types';
const source={name:'data.gov.in · AGMARKNET',url:'https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi'};
const verifiedResource='9ef84268-d588-465a-a308-a864a43d0070';
const agmarknetManual='https://www.agmarknet.gov.in/DailyDataEntry/UserManual.pdf';
const verifiedUnits={Wheat:'quintal',Soyabean:'quintal',Maize:'quintal'};
const cache=new Cache<MarketResult>();const pending=new Map<string,Promise<MarketResult>>();
export function reportingDate(raw:unknown):string|null {if(typeof raw!=='string')return null;const m=raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);const value=m?`${m[3]}-${m[2]}-${m[1]}`:raw.match(/^\d{4}-\d{2}-\d{2}$/)?raw:null;if(!value)return null;const d=new Date(value+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value?value:null}
function price(raw:unknown):number|null{if(raw===null||raw===undefined||(typeof raw==='string'&&!raw.trim()))return null;const n=Number(String(raw).replace(/,/g,''));return Number.isFinite(n)&&n>=0?Math.round(n*100):null}
export function normalizeMarket(raw:unknown,fetchedAt:string,units:Record<string,string>={},unitSource=''):MarketRecord|null{
 if(!raw||typeof raw!=='object')return null;const r=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k.toLowerCase(),v]));
 const text=(k:string)=>typeof r[k]==='string'?(r[k] as string).trim():'';
 if(!text('market')||!text('commodity')||!text('state')||!text('district'))return null;
 const rawUnit=text('price_unit')||text('unit');const canonical:Record<string,'kg'|'quintal'|'tonne'>={kg:'kg',kilogram:'kg',quintal:'quintal','rs/quintal':'quintal','rs./quintal':'quintal','₹/quintal':'quintal',tonne:'tonne','metric tonne':'tonne'};
 // A missing provider unit never defaults to quintal. Overrides must be commodity-specific and cited.
 const providerUnit=canonical[rawUnit.toLowerCase()]??null;const overrideValue=Object.hasOwn(units,text('commodity'))?units[text('commodity')]:'';const override=unitSource&&typeof overrideValue==='string'?canonical[overrideValue.toLowerCase()]:null;
 const arrivalDate=text('arrival_date')||null;const date=reportingDate(arrivalDate);return {id:[text('market'),text('commodity'),text('variety'),text('grade'),date].join(':'),state:text('state'),district:text('district'),market:text('market'),commodity:text('commodity'),variety:text('variety')||null,grade:text('grade')||null,minPrice:price(r.min_price),maxPrice:price(r.max_price),modalPrice:price(r.modal_price),priceUnit:providerUnit??override??null,unitSource:providerUnit?source.url:override?unitSource:null,reportingDate:date,arrivalDate,fetchedAt,source,fictional:false};
}
export function parseFilters(params:URLSearchParams){
 const names=['crop','state','district','commodity','market','offset','limit','demo'];
 for(const key of params.keys())if(!names.includes(key)||params.getAll(key).length!==1)throw new ApiError(400,'invalid-filter');
 const crop=params.get('crop');
 if(crop&&(!Object.hasOwn(commodityMap,crop)||params.has('commodity')))throw new ApiError(400,'invalid-filter');
 const state=(params.get('state')??'Madhya Pradesh').trim();
 const district=(params.get('district')??'Sehore').trim();
 const commodity=(params.get('commodity')??(crop?commodityMap[crop]:'Wheat')).trim();
 const market=params.get('market')?.trim();
 const safeName=(value:string)=>value.length<=100&&/^[\p{L}\p{M}\p{N} .,'()&/–-]+$/u.test(value)&&/[\p{L}\p{N}]/u.test(value)&&!value.includes('..');
 if(![state,district,commodity,...(market===undefined?[]:[market])].every(safeName))throw new ApiError(400,'invalid-filter');
 const offset=Number(params.get('offset')||0),limit=Number(params.get('limit')||20);
 if(!Number.isInteger(offset)||offset<0||offset>2000||!Number.isInteger(limit)||limit<1||limit>50)throw new ApiError(400,'invalid-pagination');
 return {state,district,commodity,market,offset,limit};
}
export async function getMarkets(params:URLSearchParams):Promise<MarketResult>{const f=parseFilters(params);const base:Omit<MarketResult,'status'>={records:[],fetchedAt:null,total:0,offset:f.offset,limit:f.limit,hasMore:false};
 if(params.get('demo')==='1'){const record:MarketRecord={id:'fictional-market',state:f.state,district:f.district,market:`${f.district} sample`,commodity:f.commodity,variety:null,grade:null,minPrice:240000,maxPrice:275000,modalPrice:260000,priceUnit:'quintal',unitSource:'Fictional sample definition',reportingDate:'2026-11-17',arrivalDate:'17/11/2026',fetchedAt:new Date().toISOString(),source:{name:'Fictional sample · not official data',url:''},fictional:true};return {...base,status:'demo',records:[record],total:1,fetchedAt:record.fetchedAt}}
 if(!config.dataKey)return {...base,status:'setup-required',reason:'data-key-missing'};
 if(!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(config.resource))return {...base,status:'setup-required',reason:'invalid-resource'};
 if(config.resource!==verifiedResource&&config.verifiedMandiResource!==config.resource)return {...base,status:'setup-required',reason:'market-contract-unverified'};
 const key=JSON.stringify(f);const cached=cache.get(key,10*60000);if(cached)return {...cached,cached:true};if(pending.has(key))return pending.get(key)!;
 const task=(async():Promise<MarketResult>=>{try{const url=new URL(`https://api.data.gov.in/resource/${config.resource}`);url.search=new URLSearchParams({'api-key':config.dataKey,format:'json',limit:String(f.limit),offset:String(f.offset),'filters[state]':f.state,'filters[district]':f.district,'filters[commodity]':f.commodity,...(f.market?{'filters[market]':f.market}:{})}).toString();const data=await(await fetchBounded(url,{redirect:'error'})).json();if(!Array.isArray(data.records)||data.records.length>f.limit)throw new ApiError(502,'schema-mismatch');let units:Record<string,string>={};
 if(config.resource===verifiedResource)units=verifiedUnits;
 if(config.unitSource){try{units={...JSON.parse(config.unitOverrides)}}catch{}}
 const unitSource=config.unitSource||(config.resource===verifiedResource?agmarknetManual:'');const fetchedAt=new Date().toISOString();const records=data.records.map((r:unknown)=>normalizeMarket(r,fetchedAt,units,unitSource)).filter((r:MarketRecord|null):r is MarketRecord=>!!r&&r.state.toLowerCase()===f.state.toLowerCase()&&r.district.toLowerCase()===f.district.toLowerCase()&&r.commodity.toLowerCase()===f.commodity.toLowerCase()&&(!f.market||r.market.toLowerCase()===f.market.toLowerCase()));if(data.records.length!==records.length)throw new ApiError(502,'schema-mismatch');const total=Number(data.total);const result:MarketResult={status:!records.length?'empty':records.some((r:MarketRecord)=>marketIsStale(r))?'stale':'ready',records:records.sort((a:MarketRecord,b:MarketRecord)=>(b.reportingDate??'').localeCompare(a.reportingDate??'')),total:Number.isFinite(total)?total:f.offset+records.length,offset:f.offset,limit:f.limit,hasMore:records.length===f.limit&&(!Number.isFinite(total)||f.offset+records.length<total),fetchedAt};cache.set(key,result);return result}catch(error){const reason=error instanceof ApiError&&error.code==='provider-rate-limited'?error.code:'provider-unavailable';const old=cache.get(key,24*3600000);return old?{...old,status:'stale',cached:true,reason}:{...base,status:'unavailable',reason}}finally{pending.delete(key)}})();pending.set(key,task);return task;
}
