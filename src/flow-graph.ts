import { CLIENTS, connectionsAtDay, entityAtDay, entitiesAtDay, type Connection, type Entity } from './entities';
export type Position=[number,number,number];
const positions:Record<string,Position>={
 'product-platform':[-1.5,5,-6.5],'product-api':[1.1,3.4,1],'product-studio':[4,1.8,8.5],
 'operation-compute':[8.7,5.2,-3.2],'operation-office':[11,2.1,9.4],'operation-electricity':[16,3,7.1],
 'emission-cloud':[16.8,7,-8.5],'water-cooling':[17,3.8,.5],
 'emission-electricity':[22,4.6,4.1],'water-office':[16.5,1.3,13.3],
 'waste-cardboard':[23,2,10.2],'waste-electronics':[22.8,.9,16],
};
export const CLIENT_REGIONS=[
 {flow:'enterprise',name:'Enterprise',center:[-8.9,2.55,7.2] as Position,radius:2.75},
 {flow:'growth',name:'Growth-stage',center:[-10.4,3.7,.2] as Position,radius:2.75},
 {flow:'startup',name:'Early-stage',center:[-11.4,4.8,-7.1] as Position,radius:2.75},
];
export function entityPosition(e:Entity):Position{
 if(e.kind!=='client')return [...(positions[e.id]??[0,0,0])] as Position;
 const i=e.clientIndex??0,start=i<18?0:i<100?18:100,count=i<18?18:i<100?82:148;
 const local=i-start,angle=local*2.3999632297,radius=Math.sqrt((local+.5)/count);
 const origin=CLIENT_REGIONS[i<18?0:i<100?1:2].center;
 if(i===0)return [-6.6,3.25,7.35];
 if(i===1)return [-9.5,3.15,5.25];
 return [origin[0]+Math.cos(angle)*radius*2.28,origin[1]+.55+Math.sin(angle*1.7)*.24,origin[2]+Math.sin(angle)*radius*2.28];
}
export function connectionId(c:Connection){return c.from+'::'+c.to;}
export type FlowPresentation={title:string;detail:string;color:string;unit:string|null};
export function describeFlow(c:Connection,day:number):FlowPresentation{
 const source=entityAtDay(c.from,day),target=entityAtDay(c.to,day);
 if(!source||!target)throw new Error('A flow must reference records available at the selected date.');
 const metric=target.metrics[0],amount=metric?`${metric.value.toLocaleString()}${metric.unit?' '+metric.unit:''}`:'';
 if(c.type==='uses')return {title:'Uses product',detail:source.name+' → '+target.name,color:'#a37bd0',unit:null};
 if(c.type==='depends')return {title:'Runs on',detail:source.name+' → '+target.name,color:'#649fbe',unit:null};
 if(target.kind==='emission')return {title:'Calculated emissions',detail:amount+' · illustrative',color:'#8a8ea8',unit:metric?.unit??null};
 if(target.kind==='water')return {title:'Water use',detail:amount+' · sample record',color:'#459fb5',unit:metric?.unit??null};
 if(target.kind==='waste')return {title:'Material output',detail:amount+' · '+target.name,color:'#b6956d',unit:metric?.unit??null};
 return {title:c.label,detail:amount,color:'#8b9bb6',unit:metric?.unit??null};
}
export function tracedFlow(rootId:string|null,day:number){
 const nodes=entitiesAtDay(day),all=connectionsAtDay(day),root=entityAtDay(rootId??'client-001',day)??nodes.find(e=>e.kind==='client')??null;
 if(!root)return {root:null,edges:[] as Connection[],entities:[] as Entity[],ids:new Set<string>()};
 const ids=new Set([root.id]),edgeIds=new Set<string>(),queue=[root.id];
 // Trace specific downstream records. Shared inputs are visited once, so a
 // client's two products do not duplicate the workload or environmental output.
 while(queue.length){const id=queue.shift()!;for(const edge of all.filter(c=>c.from===id)){edgeIds.add(connectionId(edge));if(!ids.has(edge.to)){ids.add(edge.to);queue.push(edge.to);}}}
 // A selected output needs its immediate source to make the relationship legible.
 if(root.kind!=='client')for(const edge of all.filter(c=>c.to===root.id&&entityAtDay(c.from,day)?.kind!=='client')){edgeIds.add(connectionId(edge));ids.add(edge.from);}
 return {root,edges:all.filter(c=>edgeIds.has(connectionId(c))),entities:nodes.filter(e=>ids.has(e.id)),ids};
}
export function sceneFlows(rootId:string|null,day:number){const trace=tracedFlow(rootId,day);return {all:connectionsAtDay(day),trace,clientCount:CLIENTS.filter(c=>c.availableDay<=day).length};}
export function pathBetween(from:string,to:string,day:number):string[]{
 const links=connectionsAtDay(day),queue=[[from]],seen=new Set<string>();
 while(queue.length){const path=queue.shift()!,current=path.at(-1)!;if(current===to)return path;if(seen.has(current))continue;seen.add(current);for(const edge of links.filter(c=>c.from===current))queue.push([...path,edge.to]);}return [];
}
