export type DataState = 'ready' | 'empty' | 'setup-required' | 'unavailable' | 'stale' | 'demo';
export interface Source {name:string;url:string;date?:string}
export interface MarketRecord {
 id:string;state:string;district:string;market:string;commodity:string;variety:string|null;grade:string|null;
 minPrice:number|null;maxPrice:number|null;modalPrice:number|null;priceUnit:'kg'|'quintal'|'tonne'|null;
 unitSource:string|null;reportingDate:string|null;arrivalDate:string|null;fetchedAt:string;source:Source;fictional:boolean;
}
export interface MarketResult {status:DataState;records:MarketRecord[];fetchedAt:string|null;total:number;offset:number;limit:number;hasMore:boolean;reason?:string;cached?:boolean}
export interface ForecastDay {date:string;minC:number;maxC:number;rainProbability:number;rainMm:number}
export interface WeatherResult {status:DataState;location:string;provider:string;sourceUrl:string;fetchedAt:string|null;issuedAt:string|null;timezone:string;days:ForecastDay[];reason?:string;cached?:boolean}
export interface Capabilities {stt:'elevenlabs'|'browser';tts:'elevenlabs'|'browser';speechConfigured:boolean;retention:'zero'|'provider-policy';weather:boolean}
export const districts=[{id:'Sehore',hi:'सीहोर',state:'Madhya Pradesh',lat:23.20,lon:77.08},{id:'Bhopal',hi:'भोपाल',state:'Madhya Pradesh',lat:23.26,lon:77.41},{id:'Indore',hi:'इंदौर',state:'Madhya Pradesh',lat:22.72,lon:75.86}] as const;
export const commodityMap:Record<string,string>={wheat:'Wheat',soybean:'Soyabean',chickpea:'Bengal Gram(Gram)(Whole)',rice:'Rice'};
export function districtFromLocation(location:string):string|null {return districts.find(d=>location.toLowerCase().includes(d.id.toLowerCase())||location.includes(d.hi))?.id??null}
export function marketIsStale(record:MarketRecord,now=Date.now()){const age=now-new Date(record.reportingDate+'T00:00:00+05:30').getTime();return !record.reportingDate||!Number.isFinite(age)||age>48*3600000||age< -24*3600000}

export function mandiPath(crop:string,district:string,extras:Record<string,string>={}){
 const state=districts.find(item=>item.id===district)?.state??'Madhya Pradesh';
 return '/api/mandi-prices?'+new URLSearchParams({state,district,commodity:commodityMap[crop]??crop,...extras});
}
