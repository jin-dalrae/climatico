export type ZoneId = 'customers' | 'product' | 'revenue' | 'resources' | 'company';
export type Area = { id: ZoneId; name: string; subtitle: string; color: string; position: [number, number, number]; metric: string; value: string; change: string; description: string; source: string; stats: [string,string][] };
export const AREAS: Area[] = [
  {id:'customers',name:'Customers',subtitle:'Relationships taking root',color:'#aa88db',position:[-5.6,0,-3.8],metric:'Active customers',value:'248',change:'+18 this week',description:'The people and companies growing with you. Explore new subscriptions, customer milestones, and the relationships behind the numbers.',source:'Stripe · sample subscriptions',stats:[['New this week','18'],['Canceled this week','3'],['Net additions','15']]},
  {id:'product',name:'Product',subtitle:'Ideas becoming real',color:'#6688f1',position:[5.3,0,-3.6],metric:'Releases this week',value:'4',change:'+2 vs. last week',description:'Follow work as it moves from an idea to something customers can use. Releases and delivery milestones live here.',source:'GitHub · sample release records',stats:[['Merged pull requests','23'],['Open pull requests','8'],['Releases','4']]},
  {id:'revenue',name:'Revenue',subtitle:'Fuel for the next chapter',color:'#51aa87',position:[-5.2,0,4.1],metric:'Monthly recurring revenue',value:'$24.8k',change:'+12.7% this week',description:'Explore recurring revenue and subscription movement. This sample uses a single USD monthly plan; collections and recurring revenue remain separate.',source:'Stripe · sample monthly USD subscriptions',stats:[['MRR at start of week','$22.0k'],['MRR now','$24.8k'],['Change','$2.8k']]},
  {id:'resources',name:'Resources',subtitle:'What keeps things moving',color:'#d7a15a',position:[5.8,0,4.2],metric:'Team members',value:'14',change:'2 joined this month',description:'The people and operational resources supporting your growth. Headcount is manually maintained in this prototype; spend and environmental data are not connected.',source:'Manual · sample team record',stats:[['Team members','14'],['Cloud spend','Not connected'],['Environmental impact','Not connected']]},
  {id:'company',name:'Company',subtitle:'A little world, working together',color:'#4f77e8',position:[0,0,0],metric:'Milestones reached',value:'3',change:'A good week of building',description:'Your company, brought to life. Browse the areas around your campus to see how customer, product, revenue, and resource activity are changing.',source:'Combined sample workspace',stats:[['Active customers','248'],['Releases this week','4'],['Team members','14']]},
];
export const DAYS = ['Oct 27','Oct 28','Oct 29','Oct 30','Oct 31','Nov 1','Nov 2'];
export const SNAPSHOTS = [
 {customers:233,mrr:22000,releases:0,team:14}, {customers:235,mrr:22400,releases:1,team:14}, {customers:238,mrr:22900,releases:1,team:14}, {customers:240,mrr:23300,releases:2,team:14}, {customers:243,mrr:23800,releases:3,team:14}, {customers:245,mrr:24300,releases:3,team:14}, {customers:248,mrr:24800,releases:4,team:14},
];
export const EVENTS: {id:string;day:number;zone:ZoneId;title:string;body:string;time:string;source:string}[] = [
 {id:'evt-108',day:6,zone:'product',title:'A new release is out in the world',body:'Version 1.8 introduces shared workspaces and a faster onboarding flow.',time:'10:42 AM',source:'GitHub · release v1.8 · sample'},
 {id:'evt-107',day:6,zone:'customers',title:'Welcome, Northstar Studio',body:'A new monthly subscription joined your customer community.',time:'10:18 AM',source:'Stripe · subscription sample_248'},
 {id:'evt-106',day:6,zone:'revenue',title:'$24k recurring revenue milestone',body:'Monthly recurring revenue reached $24,800 in this sample workspace.',time:'9:36 AM',source:'Stripe · sample MRR snapshot'},
 {id:'evt-105',day:5,zone:'customers',title:'Three new teams joined',body:'Three new subscriptions were added to the sample customer workspace.',time:'Yesterday',source:'Stripe · sample subscriptions'},
 {id:'evt-104',day:4,zone:'product',title:'Version 1.7.2 shipped',body:'A maintenance release improved import reliability.',time:'Oct 31',source:'GitHub · release v1.7.2 · sample'},
 {id:'evt-103',day:3,zone:'product',title:'Version 1.7.1 shipped',body:'The team shipped a collection of workspace improvements.',time:'Oct 30',source:'GitHub · release v1.7.1 · sample'},
 {id:'evt-102',day:2,zone:'customers',title:'Customer community keeps growing',body:'The sample workspace reached 238 active customers.',time:'Oct 29',source:'Stripe · sample subscription snapshot'},
 {id:'evt-101',day:1,zone:'product',title:'Version 1.7 shipped',body:'The first release of this sample week went live.',time:'Oct 28',source:'GitHub · release v1.7 · sample'},
 {id:'evt-100',day:0,zone:'company',title:'A new week of possibilities',body:'This sample week starts with 233 customers and $22,000 MRR.',time:'Oct 27',source:'Sample workspace baseline'},
];
export const areaById = (id: ZoneId) => AREAS.find(a=>a.id===id)!;
export function getSnapshot(day:number) { return SNAPSHOTS[Math.max(0,Math.min(6,Math.round(day)))]; }
export function formatMoney(n:number) { return '$'+(n/1000).toFixed(1)+'k'; }
export function metricFor(id:ZoneId,day:number) { const s=getSnapshot(day); return id==='customers'?String(s.customers):id==='revenue'?formatMoney(s.mrr):id==='product'?String(s.releases):id==='resources'?String(s.team):String(day>=6?3:day>=1?2:1); }
