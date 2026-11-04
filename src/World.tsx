import { compileScene, type ScenePlan } from './scene-plan';
import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, CameraControls, CameraControlsImpl, Line } from '@react-three/drei';
import * as THREE from 'three';
import { FLOWS, entitiesAtDay, type Connection, type Entity, type FlowId } from './entities';
import { sceneFlows, connectionId, describeFlow } from './flow-graph';
import { clientRadius, curveForEdge, positionFor, OVERVIEW } from './scene-layout';
import { ClientEntities, SolidEntity, StructuralFlow, StudioEnvironment, SceneFinishing } from './scene/GlassArchitecture';
import { ArrowUpRight, Box, Droplets, Factory, Layers3, Recycle, Users } from 'lucide-react';
export { positionFor, curveForEdge } from './scene-layout';
export type CameraAction={kind:'home'|'focus'|'in'|'out'|'left'|'right'|'up'|'down';seq:number};
export type FlowFilter='all'|'clients'|'products'|'environment';
type Props={selected:string|null;onSelect:(id:string)=>void;day:number;playing:boolean;reduced:boolean;connections:boolean;filter:FlowFilter;action:CameraAction;traceRoot?:string|null;plan?:ScenePlan|null};
const v=(x:number,y:number,z:number)=>new THREE.Vector3(x,y,z);
function viewGraph(p:Props,entities:Entity[]){const g=sceneFlows(p.traceRoot??p.selected,p.day);if(!p.plan)return {...g,trace:{...g.trace,entities:g.trace.entities.map(e=>entities.find(n=>n.id===e.id)??e)}};const ids=new Set(entities.map(e=>e.id)),all=g.all.filter(e=>ids.has(e.from)&&ids.has(e.to));const highlighted=new Set(p.plan.highlightIds);const edges=all.filter(e=>highlighted.has(e.from)||highlighted.has(e.to));return {...g,all,trace:{...g.trace,edges,ids:highlighted,entities}};}
function BackgroundConnections({edges,entities,day}:{edges:Connection[];entities:Entity[];day:number}){
 const {points,colors,arrows}=useMemo(()=>{const points:THREE.Vector3[]=[],colors:[number,number,number][]=[],arrows:{point:THREE.Vector3;quaternion:THREE.Quaternion;color:THREE.Color}[]=[];
 for(const edge of edges){const curve=curveForEdge(edge,entities),samples=curve.getPoints(15),color=new THREE.Color(describeFlow(edge,day).color);for(let i=0;i<samples.length-1;i++){points.push(samples[i],samples[i+1]);colors.push([color.r,color.g,color.b],[color.r,color.g,color.b]);}arrows.push({point:curve.getPoint(.87),quaternion:new THREE.Quaternion().setFromUnitVectors(v(0,1,0),curve.getTangent(.87).normalize()),color});}
 return {points,colors,arrows};},[edges,entities,day]);
 const mesh=useRef<THREE.InstancedMesh>(null),dummy=useMemo(()=>new THREE.Object3D(),[]);
 useEffect(()=>{if(!mesh.current)return;arrows.forEach((a,i)=>{dummy.position.copy(a.point);dummy.quaternion.copy(a.quaternion);dummy.scale.setScalar(1);dummy.updateMatrix();mesh.current!.setMatrixAt(i,dummy.matrix);mesh.current!.setColorAt(i,a.color);});mesh.current.instanceMatrix.needsUpdate=true;if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;mesh.current.computeBoundingSphere();},[arrows,dummy]);
 if(!points.length)return null;
 return <><Line points={points} vertexColors={colors} segments lineWidth={.7} transparent opacity={.07}/><instancedMesh ref={mesh} args={[undefined,undefined,arrows.length]}><coneGeometry args={[.065,.17,5]}/><meshBasicMaterial transparent opacity={.12}/></instancedMesh></>;
}
function RelationshipPaths(p:Props&{entities:Entity[]}){
 const graph=useMemo(()=>viewGraph(p,p.entities),[p.traceRoot,p.selected,p.day,p.plan,p.entities]);
 const focusIds=new Set(graph.trace.edges.map(connectionId));
 const context=graph.all.filter(c=>!focusIds.has(connectionId(c))&&p.entities.find(e=>e.id===c.from)?.kind!=='client');
 const background=graph.all.filter(c=>!focusIds.has(connectionId(c))&&p.entities.find(e=>e.id===c.from)?.kind==='client');
 return <><BackgroundConnections edges={background} entities={p.entities} day={p.day}/>{[...context,...graph.trace.edges].map(edge=><StructuralFlow key={connectionId(edge)} edge={edge} entities={p.entities} day={p.day} active={focusIds.has(connectionId(edge))} playing={p.playing} reduced={p.reduced} onSelect={p.onSelect}/>)}</>;
}
function CameraRig({selected,action,reduced,context,filter,entities,plan}:{selected:Entity|null;action:CameraAction;reduced:boolean;context:Entity[];filter:FlowFilter;entities:Entity[];plan?:ScenePlan|null}){
 const controls=useRef<CameraControls>(null),first=useRef(true);const {size,camera,performance}=useThree();
 const direction=useMemo(()=>(plan?.camera==='overhead'?v(.1,1,.12):plan?.camera==='front'?v(0,.18,1):new THREE.Vector3(...OVERVIEW.position).sub(new THREE.Vector3(...OVERVIEW.target))).normalize(),[plan?.camera]);
 const overview=()=>{if(plan){frame(entities);return;}const c=controls.current;if(!c)return;const narrow=size.width/size.height<1.15;const target=new THREE.Vector3(...OVERVIEW.target),eye=new THREE.Vector3(...OVERVIEW.position);if(narrow)eye.sub(target).multiplyScalar(1.55).add(target);void c.setLookAt(eye.x,eye.y,eye.z,target.x,target.y,target.z,!reduced);};
 const frame=(members:Entity[])=>{const c=controls.current;if(!c||!members.length)return;const points=members.map(positionFor),center=new THREE.Box3().setFromPoints(points).getCenter(new THREE.Vector3());const right=new THREE.Vector3().crossVectors(v(0,1,0),direction).normalize(),up=new THREE.Vector3().crossVectors(direction,right).normalize();let x=0,y=0,depth=0;for(const point of points){const d=point.clone().sub(center);x=Math.max(x,Math.abs(d.dot(right)));y=Math.max(y,Math.abs(d.dot(up)));depth=Math.max(depth,Math.abs(d.dot(direction)));}const fov=(camera as THREE.PerspectiveCamera).fov*Math.PI/180,panelWidth=selected?(size.width>1150?350:size.width>600?310:0):0,aspect=(size.width-panelWidth)/size.height;const distance=Math.max((x+2)/(Math.tan(fov/2)*aspect),(y+2)/(Math.tan(fov/2)*.76),9)+depth+3;const shift=distance*Math.tan(fov/2)*(size.width/size.height)*panelWidth/size.width;const target=center.addScaledVector(right,shift),eye=target.clone().addScaledVector(direction,distance);void c.setLookAt(eye.x,eye.y,eye.z,target.x,target.y,target.z,!reduced);};
 useEffect(()=>{if(plan?.focusId){const e=entities.find(e=>e.id===plan.focusId);if(e)frame([e]);}else overview();},[plan,size.width,size.height]);
 useEffect(()=>{if(filter==='all'){overview();return;}frame(entities.filter(e=>FLOWS.find(f=>f.id===e.flow)?.family===filter));},[filter]);
 useEffect(()=>{if(first.current){first.current=false;return;}if(selected)frame(context.length?context:[selected]);},[selected?.id,reduced]);
 useEffect(()=>{const c=controls.current;if(!c)return;const smooth=!reduced;switch(action.kind){case 'home':overview();break;case 'focus':if(selected){const p=positionFor(selected),eye=p.clone().addScaledVector(direction,9);void c.setLookAt(eye.x,eye.y,eye.z,p.x,p.y,p.z,smooth);}break;case 'in':void c.dolly(2.8,smooth);break;case 'out':void c.dolly(-2.8,smooth);break;case 'left':void c.truck(-1.4,0,smooth);break;case 'right':void c.truck(1.4,0,smooth);break;case 'up':void c.truck(0,1.4,smooth);break;case 'down':void c.truck(0,-1.4,smooth);break;}},[action]);
 return <CameraControls ref={controls} makeDefault onControlStart={()=>performance.regress()} onControl={()=>performance.regress()} minDistance={4} maxDistance={300} minPolarAngle={.15} maxPolarAngle={1.47} dollyToCursor smoothTime={reduced?0:.5} mouseButtons={{left:CameraControlsImpl.ACTION.TRUCK,middle:CameraControlsImpl.ACTION.ROTATE,right:CameraControlsImpl.ACTION.ROTATE,wheel:CameraControlsImpl.ACTION.DOLLY}} touches={{one:CameraControlsImpl.ACTION.TOUCH_TRUCK,two:CameraControlsImpl.ACTION.TOUCH_DOLLY_TRUCK,three:CameraControlsImpl.ACTION.NONE}}/>;
}
function Labels({elements,entities,selected,filter,focusIds}:{elements:RefObject<(HTMLDivElement|null)[]>;entities:Entity[];selected:string|null;filter:FlowFilter;focusIds:Set<string>}){
 const {camera,size}=useThree(),vector=useMemo(()=>new THREE.Vector3(),[]);
 const positions=useMemo(()=>entities.map(e=>positionFor(e).add(v(0,e.kind==='client'?clientRadius(e)+.43:1,0))),[entities]);
 useFrame(()=>{const placed:{x:number;y:number;w:number;h:number}[]=[];const order=entities.map((e,i)=>({e,i,d:camera.position.distanceTo(positions[i])})).sort((a,b)=>{const rank=(e:Entity)=>e.id===selected?0:focusIds.has(e.id)?1:e.kind==='product'?2:e.kind==='client'&&(e.clientIndex??9)<2?2:e.kind==='water'||e.kind==='waste'||e.kind==='emission'?3:4;return rank(a.e)-rank(b.e)||a.d-b.d});
  let count=0;for(const {e,i,d} of order){const el=elements.current[i];if(!el)continue;const family=FLOWS.find(f=>f.id===e.flow)!.family;const featured=e.kind!=='client'||(e.clientIndex??9)<2||e.clientIndex===247;
   const visible=e.id===selected;
   if(!visible){el.style.visibility='hidden';continue;}
   vector.copy(positions[i]).project(camera);const x=(vector.x*.5+.5)*size.width,y=(-vector.y*.5+.5)*size.height;const w=e.kind==='client'?128:153,h=e.kind==='client'?44:66;
   const overlap=placed.some(p=>Math.abs(x-p.x)<(w+p.w)/2+8&&Math.abs(y-p.y)<(h+p.h)/2+7);
   if(vector.z>1||x<45||x>size.width-45||y<105||y>size.height-140||(overlap&&e.id!==selected&&!focusIds.has(e.id))){el.style.visibility='hidden';continue;}
   el.style.visibility='visible';el.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-100%)`;el.style.zIndex=e.id===selected?'8':'3';placed.push({x,y,w,h});count++;
  }
 });return null;
}
const entityIcons={client:Users,product:Box,operation:Layers3,emission:Factory,water:Droplets,waste:Recycle};
function FlowLabels({labels,nodeLabels,edges,entities,enabled}:{labels:RefObject<(HTMLDivElement|null)[]>;nodeLabels:RefObject<(HTMLDivElement|null)[]>;edges:Connection[];entities:Entity[];enabled:boolean}){
 const {camera,size}=useThree(),point=useMemo(()=>new THREE.Vector3(),[]);
 const anchors=useMemo(()=>edges.map(edge=>curveForEdge(edge,entities).getPoint(edge.type==='uses'?.56:.53).add(v(0,.25,0))),[edges,entities]);
 useFrame(()=>{
 const occupied:{x:number;y:number;w:number;h:number}[]=[];
 nodeLabels.current.forEach((el,i)=>{if(!el||el.style.visibility!=='visible')return;const match=el.style.transform.match(/translate3d\(([-\d.e+]+)px,\s*([-\d.e+]+)px/);if(!match)return;const w=entities[i]?.kind==='client'?165:185,h=entities[i]?.kind==='client'?63:81;occupied.push({x:Number(match[1])-w/2,y:Number(match[2])-h,w,h});});
 anchors.forEach((anchor,i)=>{const el=labels.current[i];if(!el)return;if(!enabled){el.style.visibility='hidden';return;}point.copy(anchor).project(camera);const x=(point.x*.5+.5)*size.width,y=(-point.y*.5+.5)*size.height;const w=177,h=43;let offset=20;
 for(const candidate of [20,65,110,-65,-110,155,-155]){const box={x:x-w/2,y:y+candidate,w,h};if(box.y<145||box.y+h>size.height-155)continue;if(!occupied.some(o=>box.x<o.x+o.w+5&&box.x+box.w>o.x-5&&box.y<o.y+o.h+4&&box.y+box.h>o.y-4)){offset=candidate;break;}}
 el.style.visibility=point.z>1||x<55||x>size.width-55||y+offset<130||y+offset>size.height-150?'hidden':'visible';el.style.transform=`translate3d(${x}px,${y+offset}px,0) translate(-50%,0)`;el.style.setProperty('--leader-height',offset>0?offset+'px':'0px');occupied.push({x:x-w/2,y:y+offset,w,h});
 });});return null;
}
function Scene(p:Props&{entities:Entity[];labels:RefObject<(HTMLDivElement|null)[]>;edgeLabels:RefObject<(HTMLDivElement|null)[]>;edges:Connection[];focusIds:Set<string>;focusEntities:Entity[]}){
 const selected=p.entities.find(e=>e.id===p.selected)??null;
 return <><color attach='background' args={[1.7,1.65,1.9]}/><fog attach='fog' args={['#edeaf4',p.plan?150:50,p.plan?450:110]}/><StudioEnvironment/><ClientEntities entities={p.entities} selected={p.selected} onSelect={p.onSelect} muted={false} arranged={Boolean(p.plan)}/>{p.entities.filter(e=>e.kind!=='client').map(e=><SolidEntity key={e.id} entity={e} selected={p.selected===e.id||Boolean(p.plan?.highlightIds.includes(e.id))} onSelect={p.onSelect}/>)}{p.connections&&<RelationshipPaths {...p}/>}<CameraRig selected={selected} action={p.action} reduced={p.reduced} context={p.focusEntities} filter={p.filter} entities={p.entities} plan={p.plan}/><Labels elements={p.labels} entities={p.entities} selected={p.selected} filter={p.filter} focusIds={p.focusIds}/>{p.connections&&<FlowLabels labels={p.edgeLabels} nodeLabels={p.labels} edges={p.edges} entities={p.entities} enabled={Boolean(p.selected)}/>}<AdaptiveDpr/><SceneFinishing/></>;
}
export default function World(p:Props){
 const entities=useMemo(()=>p.plan?compileScene(p.plan,p.day):entitiesAtDay(p.day),[p.day,p.plan]),labels=useRef<(HTMLDivElement|null)[]>([]),edgeLabels=useRef<(HTMLDivElement|null)[]>([]);
 const graph=useMemo(()=>viewGraph(p,entities),[p.traceRoot,p.selected,p.day,p.plan,entities]);
 return <div className='spatial-renderer' data-scene-layout={p.plan?.layout??'original'} data-scene-entities={entities.length}><Canvas shadows camera={{position:OVERVIEW.position,fov:OVERVIEW.fov,near:.1,far:500}} frameloop={p.playing&&!p.reduced?'always':'demand'} performance={{min:.7}} dpr={[1,1.5]} gl={{antialias:true,alpha:false,powerPreference:'high-performance',toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.02}} onPointerMissed={()=>{document.body.style.cursor='auto'}}><Suspense fallback={null}><Scene {...p} entities={entities} labels={labels} edgeLabels={edgeLabels} edges={graph.trace.edges} focusIds={graph.trace.ids} focusEntities={graph.trace.entities}/></Suspense></Canvas><div className='entity-label-layer'>{entities.map((e,i)=>{const Icon=entityIcons[e.kind],main=e.metrics[0];return <div className={'entity-label-anchor '+(e.id===p.selected?'selected-anchor':'')+(graph.trace.ids.has(e.id)?' on-traced-flow':'')} key={e.id} ref={el=>{labels.current[i]=el}}><button className={'entity-label '+e.kind+(p.selected===e.id?' selected':'')} onClick={()=>p.onSelect(e.id)} style={{'--entity-color':e.color} as React.CSSProperties} aria-label={'Explore '+e.name}><span className='entity-label-icon'><Icon size={e.kind==='client'?12:17}/></span><span><strong>{e.name}</strong>{e.kind==='product'?<small>{Number(e.metrics[0]?.value)} client relationships</small>:e.kind!=='client'&&<small>{main?.value} <span>{main?.unit}</span></small>}{e.kind==='client'&&<small>{e.category} · individual account</small>}</span><ArrowUpRight size={12}/></button><span className='label-stem'/></div>})}</div>{p.connections&&<div className='flow-label-layer'>{graph.trace.edges.map((edge,i)=>{const text=describeFlow(edge,p.day),from=entities.find(e=>e.id===edge.from)!,to=entities.find(e=>e.id===edge.to)!;return <div className='flow-label-anchor' data-flow-id={connectionId(edge)} data-from={edge.from} data-to={edge.to} key={connectionId(edge)} ref={el=>{edgeLabels.current[i]=el}}><button className='specific-flow-label' style={{'--flow-color':text.color} as React.CSSProperties} onClick={()=>p.onSelect(edge.to)} aria-label={from.name+' '+text.title+' '+to.name}><span className='flow-direction'>→</span><span><strong>{text.title}</strong><small>{text.detail}</small></span></button></div>})}</div>}</div>;
}
