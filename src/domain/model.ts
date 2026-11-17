export type Lang='hi'|'en';
export type Text={hi:string;en:string};
export type Unit='kg'|'quintal'|'tonne';
export type Costs={transport:number|null;grading:number|null;handling:number|null;storage:number|null;fees:number|null;other:number|null};
export const costKeys=(['transport','grading','handling','storage','fees','other'] as const);
export type Status='pending'|'countered'|'accepted'|'rejected'|'expired'|'withdrawn';
export interface Proposal {id:string;sender:'farmer'|'buyer';at:string;price:number;quantity:number;unit:Unit;costs:Costs;payment:Text;pickup:Text;transport:'buyer'|'farmer';expires:string}
export interface Offer {id:string;listingId:string;buyer:Text;type:Text;status:Status;history:Proposal[];owner:string}
export interface Listing {id:string;crop:string;variety:string;quantity:number;unit:Unit;location:string;available:string;grade:string;moisture:string;status:'active'|'draft'|'closed';shareContact:boolean;shareDocuments:boolean}
export const factors:Record<Unit,number>={kg:1,quintal:100,tonne:1000};
export function quantityIn(q:number,from:Unit,to:Unit){return q*factors[from]/factors[to]}
export function calculate(price:number,quantity:number,costs:Costs){const gross=Math.round(price*quantity);const missing=costKeys.filter(k=>costs[k]===null);const known=costKeys.reduce((s,k)=>s+(costs[k]??0),0);return {gross,known,net:gross-known,complete:missing.length===0,missing,perUnit:Math.round((gross-known)/quantity)}}
export function bestOffer(offers:Offer[]){return offers.filter(o=>['pending','countered'].includes(o.status)).map(o=>({id:o.id,...calculate(o.history.at(-1)!.price,o.history.at(-1)!.quantity,o.history.at(-1)!.costs)})).filter(o=>o.complete).sort((a,b)=>b.net-a.net)[0]?.id}
export function transition(offer:Offer,action:'counter'|'accept'|'reject'|'withdraw',actor:'farmer'|'buyer',proposal?:Proposal):Offer{
 if(!['pending','countered'].includes(offer.status))throw new Error('Offer is no longer open');
 const last=offer.history.at(-1)!;
 if(new Date(last.expires).getTime()<=Date.now())throw new Error('Offer expired');
 if(action==='withdraw' && actor!==last.sender)throw new Error('Only the sender can withdraw');
 if(action!=='withdraw' && actor===last.sender)throw new Error('Wait for the other party');
 if(action==='counter'){if(!proposal||proposal.sender!==actor||proposal.quantity<=0||proposal.price<=0)throw new Error('Invalid proposal');return {...offer,status:'countered',history:[...offer.history,proposal]}}
 return {...offer,status:action==='accept'?'accepted':action==='reject'?'rejected':'withdrawn'};
}
export function permittedListing(l:Listing){return {crop:l.crop,quantity:l.quantity,unit:l.unit,location:l.location,available:l.available,grade:l.grade,contact:l.shareContact?'Demo contact sharing allowed':null,documents:l.shareDocuments?'Demo document sharing allowed':null}}
