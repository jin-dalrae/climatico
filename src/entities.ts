import { getSnapshot } from './data';

export type FlowId = 'enterprise'|'growth'|'startup'|'platform'|'api'|'studio'|'emissions'|'water'|'waste';
export type EntityKind = 'client'|'product'|'operation'|'emission'|'water'|'waste';
export type Entity = {
 id:string; name:string; kind:EntityKind; flow:FlowId; color:string; category:string;
 description:string; source:string; sourceId:string; availableDay:number; sample:true;
 metrics:{label:string;value:number|string;unit?:string}[];
 calculation?:string; coverage?:string; clientIndex?:number;
};
export type Connection = {from:string;to:string;label:string;type:'uses'|'depends'|'consumes'|'produces';attribution:'configured-sample-relationship'};
export const FLOWS:{id:FlowId;name:string;family:'clients'|'products'|'environment';color:string;note:string}[]=[
 {id:'enterprise',name:'Enterprise clients',family:'clients',color:'#9a72dc',note:'Each globe is a separate client'},
 {id:'growth',name:'Growth-stage clients',family:'clients',color:'#ac8ee5',note:'Each globe is a separate client'},
 {id:'startup',name:'Early-stage clients',family:'clients',color:'#bc9beb',note:'Each globe is a separate client'},
 {id:'platform',name:'Core platform',family:'products',color:'#5bafcf',note:'A distinct product line'},
 {id:'api',name:'Developer API',family:'products',color:'#68b8d8',note:'A distinct product line'},
 {id:'studio',name:'Studio',family:'products',color:'#80c1db',note:'A distinct product line'},
 {id:'emissions',name:'Emissions',family:'environment',color:'#969fc2',note:'Separate source records · kg CO₂e'},
 {id:'water',name:'Water',family:'environment',color:'#54b9ce',note:'Separate use records · liters'},
 {id:'waste',name:'Waste',family:'environment',color:'#c6a174',note:'Separate material records · kg'},
];
const prefixes=['Silver','Quiet','Open','Bright','Field','Cedar','Orbit','River','Cloud','Blue','Clear','Day','Wild','Stone','Paper','Copper'];
const suffixes=['Works','Labs','Collective','Systems','Studio','Ventures','Technologies','Research','Design','Partners','Industries','Digital','Group','Software','Space','Supply'];
const featured=['Aurum Labs','Helio Systems','Stride Studio','Atlas Research','Morrow Works','Juniper Digital'];
export const CLIENTS:Entity[]=Array.from({length:248},(_,i)=>{
 const flow:FlowId=i<18?'enterprise':i<100?'growth':'startup';
 const availableDay=[0,1,2,3,4,5,6].find(day=>i<getSnapshot(day).customers)??6;
 return {id:'client-'+String(i+1).padStart(3,'0'),name:i===247?'Northstar Studio':featured[i]??`${prefixes[Math.floor((i-6)/16)%16]} ${suffixes[(i-6)%16]}`,kind:'client',flow,color:flow==='enterprise'?'#9870d7':flow==='growth'?'#a88adf':'#b79ae5',category:flow==='enterprise'?'Enterprise':flow==='growth'?'Growth-stage':'Early-stage',description:'An individual B2B client account with its own product relationships and subscription record. Category controls where it is placed; its identity and records stay separate.',source:'Synthetic subscription record',sourceId:'sample-sub-'+String(i+1).padStart(3,'0'),availableDay,sample:true,clientIndex:i,metrics:[]};
});
const PRODUCTS:Entity[]=[
 {id:'product-platform',name:'Core platform',kind:'product',flow:'platform',color:'#58aac9',category:'Product line',description:'The main workspace product. Client relationships, releases, and configured operational dependencies are linked to this product individually.',source:'Sample product registry + release records',sourceId:'sample-product-core',availableDay:0,sample:true,metrics:[]},
 {id:'product-api',name:'Developer API',kind:'product',flow:'api',color:'#67b6d5',category:'Product line',description:'A separate API product line. This is distinct from the platform and Studio, with its own customers and delivery history.',source:'Sample product registry + release records',sourceId:'sample-product-api',availableDay:0,sample:true,metrics:[]},
 {id:'product-studio',name:'Studio',kind:'product',flow:'studio',color:'#79b9d6',category:'Product line',description:'A separate creative product line with its own client relationships and release history.',source:'Sample product registry + release records',sourceId:'sample-product-studio',availableDay:0,sample:true,metrics:[]},
];
const RECORDS:Entity[]=[
 {id:'operation-office',name:'Office operations',kind:'operation',flow:'waste',color:'#c5b394',category:'Operational activity',description:'The sample facilities activity that connects to its own electricity, water, and material records. These dependencies are not allocated to individual clients.',source:'Illustrative facilities registry',sourceId:'sample-office-001',availableDay:6,sample:true,metrics:[{label:'Activity',value:'Office facilities'}],coverage:'Configured sample relationships, not verified consumption or client attribution.'},
 {id:'operation-electricity',name:'Office electricity',kind:'operation',flow:'emissions',color:'#a1aac7',category:'Operational input',description:'A hypothetical office electricity input used only to demonstrate a traceable emissions calculation.',source:'Illustrative electricity fixture',sourceId:'sample-electricity-001',availableDay:6,sample:true,metrics:[{label:'Electricity',value:120,unit:'kWh'}],coverage:'Illustrative week, Oct 27–Nov 2. No utility account is connected.'},
 {id:'operation-compute',name:'Cloud workload',kind:'operation',flow:'emissions',color:'#a1aac7',category:'Operational input',description:'A hypothetical compute input. Its downstream carbon calculation uses a made-up demonstration factor, not a provider methodology.',source:'Illustrative compute fixture',sourceId:'sample-compute-001',availableDay:6,sample:true,metrics:[{label:'Workload',value:480,unit:'compute-hours'}],coverage:'Illustrative week, Oct 27–Nov 2. No provider usage account is connected.'},
 {id:'emission-electricity',name:'Electricity emissions',kind:'emission',flow:'emissions',color:'#8c96b6',category:'Scope 2 · sample calculation',description:'A separate output linked to office electricity. The factor is invented for interface demonstration and is not an applicable inventory factor.',source:'Sample calculation from sample-electricity-001',sourceId:'sample-emissions-001',availableDay:6,sample:true,metrics:[{label:'Illustrative emissions',value:42,unit:'kg CO₂e'},{label:'Input',value:120,unit:'kWh'},{label:'Demonstration factor',value:0.35,unit:'kg CO₂e / kWh'}],calculation:'120 kWh × 0.35 kg CO₂e/kWh = 42 kg CO₂e. Both input and factor are illustrative.',coverage:'Partial sample source, not a company footprint. No factor has been validated.'},
 {id:'emission-cloud',name:'Cloud emissions',kind:'emission',flow:'emissions',color:'#8c96b6',category:'Scope 3 · sample calculation',description:'A separate illustrative cloud output. It does not use the electricity input and is not combined with it as a complete company footprint.',source:'Sample calculation from sample-compute-001',sourceId:'sample-emissions-002',availableDay:6,sample:true,metrics:[{label:'Illustrative emissions',value:19.2,unit:'kg CO₂e'},{label:'Input',value:480,unit:'compute-hours'},{label:'Demonstration factor',value:0.04,unit:'kg CO₂e / compute-hour'}],calculation:'480 compute-hours × 0.04 kg CO₂e/compute-hour = 19.2 kg CO₂e. This factor is made up for the prototype.',coverage:'Partial sample source, not a company footprint. No provider carbon report is connected.'},
 {id:'water-office',name:'Office water',kind:'water',flow:'water',color:'#4eb8d2',category:'Water use · facilities',description:'A separate sample facilities water-use record. It stays in liters and is not converted into a climate or health score.',source:'Illustrative facilities water record',sourceId:'sample-water-001',availableDay:6,sample:true,metrics:[{label:'Sample water use',value:450,unit:'L'}],coverage:'Illustrative week, Oct 27–Nov 2. No meter or water-stress assessment is connected.'},
 {id:'water-cooling',name:'Cooling water',kind:'water',flow:'water',color:'#59bfd5',category:'Water use · cooling',description:'A distinct hypothetical cooling-water record, kept separate from office use. The relationship to the cloud workload is a configured sample dependency, not verified attribution.',source:'Illustrative cooling-water record',sourceId:'sample-water-002',availableDay:6,sample:true,metrics:[{label:'Sample cooling water',value:80,unit:'L'}],coverage:'Illustrative week, Oct 27–Nov 2. No provider water report is connected.'},
 {id:'waste-cardboard',name:'Packaging waste',kind:'waste',flow:'waste',color:'#c6a174',category:'Waste · cardboard',description:'An individual sample material stream. Its mass and material stay separate from electronics and water.',source:'Illustrative material record',sourceId:'sample-waste-001',availableDay:6,sample:true,metrics:[{label:'Sample material mass',value:12,unit:'kg'},{label:'Material',value:'Cardboard'}],coverage:'Illustrative week, Oct 27–Nov 2. Disposal and recycling outcomes are not verified.'},
 {id:'waste-electronics',name:'Electronic waste',kind:'waste',flow:'waste',color:'#bb986b',category:'Waste · electronics',description:'A separate sample electronics stream. No recycling, recovery, or avoided-emissions claim is attached.',source:'Illustrative material record',sourceId:'sample-waste-002',availableDay:6,sample:true,metrics:[{label:'Sample material mass',value:2,unit:'kg'},{label:'Material',value:'Electronics'}],coverage:'Illustrative week, Oct 27–Nov 2. No collection or treatment evidence is connected.'},
];
export const ENTITIES:Entity[]=[...CLIENTS,...PRODUCTS,...RECORDS];
export const CONNECTIONS:Connection[]=[
 ...CLIENTS.flatMap((c,i)=>{const ids=['product-platform','product-api','product-studio'];return [{from:c.id,to:ids[i%3],label:'Uses',type:'uses' as const,attribution:'configured-sample-relationship' as const},...(i%5===0?[{from:c.id,to:ids[(i+1)%3],label:'Also uses',type:'uses' as const,attribution:'configured-sample-relationship' as const}]:[])];}),
 ...['product-platform','product-api','product-studio'].map(from=>({from,to:'operation-compute',label:'Depends on',type:'depends' as const,attribution:'configured-sample-relationship' as const})),
 {from:'operation-office',to:'operation-electricity',label:'Uses electricity',type:'consumes',attribution:'configured-sample-relationship'},
 {from:'operation-office',to:'water-office',label:'Uses water',type:'consumes',attribution:'configured-sample-relationship'},
 {from:'operation-office',to:'waste-cardboard',label:'Material output',type:'produces',attribution:'configured-sample-relationship'},
 {from:'operation-office',to:'waste-electronics',label:'Material output',type:'produces',attribution:'configured-sample-relationship'},
 {from:'operation-electricity',to:'emission-electricity',label:'Sample calculation',type:'produces',attribution:'configured-sample-relationship'},
 {from:'operation-compute',to:'emission-cloud',label:'Sample calculation',type:'produces',attribution:'configured-sample-relationship'},
 {from:'operation-compute',to:'water-cooling',label:'Sample cooling dependency',type:'consumes',attribution:'configured-sample-relationship'},
];
export function entityAtDay(id:string,day:number):Entity|undefined{
 const entity=ENTITIES.find(e=>e.id===id);if(!entity||entity.availableDay>day)return undefined;
 if(entity.kind==='client'){
  const s=getSnapshot(day);const base=Math.floor(s.mrr/s.customers);const extra=s.mrr-base*s.customers;
  return {...entity,metrics:[{label:'Sample recurring revenue',value:base+((entity.clientIndex??0)<extra?1:0),unit:'USD / month'},{label:'Account',value:'Active'},{label:'Category',value:entity.category}],coverage:'Synthetic allocations reconcile to the selected sample revenue snapshot. These are not actual invoices. Environmental impact is not allocated to this client.'};
 }
 if(entity.kind==='product'){
  const releases=entity.id==='product-platform'?(day>=1?1:0)+(day>=3?1:0):entity.id==='product-api'?(day>=4?1:0):(day>=6?1:0);
  const clients=CONNECTIONS.filter(c=>c.to===id&&entityAtDayExists(c.from,day)).length;
  return {...entity,metrics:[{label:'Client relationships',value:clients,unit:'accounts'},{label:'Releases this week',value:releases}]};
 }
 return entity;
}
function entityAtDayExists(id:string,day:number){const e=ENTITIES.find(e=>e.id===id);return !!e&&e.availableDay<=day;}
export function entitiesAtDay(day:number){return ENTITIES.filter(e=>e.availableDay<=day).map(e=>entityAtDay(e.id,day)!);}
export function connectionsAtDay(day:number){return CONNECTIONS.filter(c=>entityAtDayExists(c.from,day)&&entityAtDayExists(c.to,day));}
export function relatedEntities(id:string,day:number){return connectionsAtDay(day).filter(c=>c.from===id||c.to===id).map(c=>({connection:c,entity:entityAtDay(c.from===id?c.to:c.from,day)!})).sort((a,b)=>({operation:0,emission:1,water:1,waste:1,product:2,client:3}[a.entity.kind])-({operation:0,emission:1,water:1,waste:1,product:2,client:3}[b.entity.kind]));}
export function entityContext(id:string|null|undefined,day:number){return {selected:id?entityAtDay(id,day)??null:null,related:id?relatedEntities(id,day).slice(0,12):[],individualClients:CLIENTS.filter(e=>e.availableDay<=day).slice(0,6).map(e=>entityAtDay(e.id,day)),productLines:PRODUCTS.map(e=>entityAtDay(e.id,day)),environmentRecords:RECORDS.filter(e=>e.availableDay<=day),relationshipMeaning:'All links are configured synthetic relationships, not verified causal or environmental allocation claims. Client-level environmental attribution is missing.'};}

export function relationshipLabel(selectedId:string,connection:Connection){if(connection.from===selectedId)return connection.label;return connection.type==='uses'?'Used by':connection.type==='depends'?'Supports':connection.type==='consumes'?'Used by':connection.label==='Sample calculation'?'Calculated from':'Output from';}
