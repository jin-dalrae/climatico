import { entitiesAtDay, connectionsAtDay, type Entity, type EntityKind } from './entities';
import { connectionId } from './flow-graph';
export type ScenePlan={title:string;description:string;entityIds:string[];highlightIds:string[];layout:'lanes'|'orbit'|'terraces';spacing:number;palette:'original'|'ocean'|'contrast';camera:'perspective'|'front'|'overhead';focusId:string|null};
export type SceneResult={plan:ScenePlan;day:number;provider:'meta';model:string;sample:true;sourceIds:string[];connectionIds:string[]};
export const sceneSchema={type:'object',additionalProperties:false,required:['title','description','entityIds','highlightIds','layout','spacing','palette','camera','focusId'],properties:{title:{type:'string'},description:{type:'string'},entityIds:{type:'array',items:{type:'string'}},highlightIds:{type:'array',items:{type:'string'}},layout:{type:'string',enum:['lanes','orbit','terraces']},spacing:{type:'number'},palette:{type:'string',enum:['original','ocean','contrast']},camera:{type:'string',enum:['perspective','front','overhead']},focusId:{type:['string','null']}}};
export function validateScenePlan(value:unknown,day:number):ScenePlan{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Scene plan must be an object.');
 const p=value as Record<string,unknown>,keys=Object.keys(sceneSchema.properties);
 if(Object.keys(p).some(k=>!keys.includes(k))||keys.some(k=>!(k in p)))throw new Error('Unexpected scene fields.');
 for(const [key,max] of [['title',90],['description',500]] as const)if(typeof p[key]!=='string'||!p[key].trim()||p[key].length>max)throw new Error('Invalid scene text.');
 const available=new Set(entitiesAtDay(day).map(e=>e.id));
 for(const key of ['entityIds','highlightIds'] as const){const ids=p[key];if(!Array.isArray(ids)||ids.length>(key==='entityIds'?260:12)||ids.some(id=>typeof id!=='string'||!available.has(id))||new Set(ids).size!==ids.length)throw new Error('Scene contains invalid or unavailable entities.');}
 const ids=p.entityIds as string[],highlights=p.highlightIds as string[];
 if(!ids.length||highlights.some(id=>!ids.includes(id))||(p.focusId!==null&&(typeof p.focusId!=='string'||!ids.includes(p.focusId))))throw new Error('Scene focus must belong to the visible entities.');
 if(typeof p.layout!=='string'||typeof p.palette!=='string'||typeof p.camera!=='string'||!['lanes','orbit','terraces'].includes(String(p.layout))||!['original','ocean','contrast'].includes(String(p.palette))||!['perspective','front','overhead'].includes(String(p.camera))||typeof p.spacing!=='number'||!Number.isFinite(p.spacing)||p.spacing<1||p.spacing>2)throw new Error('Scene layout is outside supported bounds.');
 return {title:p.title as string,description:p.description as string,entityIds:ids,highlightIds:highlights,layout:p.layout as ScenePlan['layout'],spacing:p.spacing,palette:p.palette as ScenePlan['palette'],camera:p.camera as ScenePlan['camera'],focusId:p.focusId as string|null};
}
export function sceneEvidence(plan:ScenePlan,day:number){const ids=new Set(plan.entityIds);return {sourceIds:entitiesAtDay(day).filter(e=>ids.has(e.id)).map(e=>e.sourceId),connectionIds:connectionsAtDay(day).filter(c=>ids.has(c.from)&&ids.has(c.to)).map(connectionId)};}
export type PlacedEntity=Entity&{scenePosition?:[number,number,number];sceneRadius?:number};
const kinds:EntityKind[]=['client','product','operation','emission','water','waste'];
const colors={ocean:['#3769c7','#169aab','#6972ab','#765395','#139cab','#b2833b'],contrast:['#7139bc','#087b9e','#b66b24','#5c628e','#008f98','#a87520']};
export function compileScene(plan:ScenePlan,day:number):PlacedEntity[]{
 const registry=entitiesAtDay(day),chosen=plan.entityIds.map(id=>registry.find(e=>e.id===id)!).filter(Boolean);
 return chosen.map(e=>{const kind=kinds.indexOf(e.kind),group=chosen.filter(n=>n.kind===e.kind),i=group.findIndex(n=>n.id===e.id),cols=Math.ceil(Math.sqrt(group.length)),row=Math.floor(i/cols),col=i%cols;let position:[number,number,number];
 if(plan.layout==='orbit'){const radius=Math.max(6,Math.sqrt(chosen.length)*1.5),angle=kind*Math.PI/3;position=[Math.cos(angle)*radius+(col-(cols-1)/2)*2.6,2.4+kind*.55,Math.sin(angle)*radius+(row-(Math.ceil(group.length/cols)-1)/2)*2.6];}
 else {const lane=e.kind==='client'?0:e.kind==='product'?1:e.kind==='operation'?2:3;const local=chosen.filter(n=>(n.kind==='client'?0:n.kind==='product'?1:n.kind==='operation'?2:3)===lane),index=local.findIndex(n=>n.id===e.id),columns=lane===0?Math.ceil(Math.sqrt(local.length)):1;position=[lane*9-12+(index%columns)*2.5,plan.layout==='terraces'?2+lane*2.2:3,(Math.floor(index/columns)-(Math.ceil(local.length/columns)-1)/2)*4.2];if(lane===0)position[0]-=(columns-1)*2.5;}
 position=[position[0]*plan.spacing,position[1],position[2]*plan.spacing];
 return {...e,color:plan.palette==='original'?e.color:colors[plan.palette][kind],scenePosition:position,...(e.kind==='client'?{sceneRadius:e.clientIndex===0?1.16:chosen.length<45?.65:.32}:{})};
 });
}
