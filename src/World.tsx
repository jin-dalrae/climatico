import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, CameraControls, CameraControlsImpl, Line } from '@react-three/drei';
import * as THREE from 'three';
import { FLOWS, entitiesAtDay, type Connection, type Entity, type FlowId } from './entities';
import { sceneFlows, connectionId, describeFlow } from './flow-graph';
import { clientRadius, curveForEdge, positionFor, OVERVIEW } from './scene-layout';
import { ClientEntities, SolidEntity, StructuralFlow, StudioEnvironment, SceneFinishing } from './scene/GlassArchitecture';
export { positionFor, curveForEdge } from './scene-layout';
export type CameraAction={kind:'home'|'focus'|'in'|'out'|'left'|'right'|'up'|'down';seq:number};
export type FlowFilter='all'|'clients'|'products'|'environment';
type Props={selected:string|null;onSelect:(id:string)=>void;day:number;playing:boolean;reduced:boolean;connections:boolean;filter:FlowFilter;action:CameraAction;traceRoot?:string|null};
const v=(x:number,y:number,z:number)=>new THREE.Vector3(x,y,z);
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
 const graph=useMemo(()=>sceneFlows(p.traceRoot??p.selected,p.day),[p.traceRoot,p.selected,p.day]);
 const focusIds=new Set(graph.trace.edges.map(connectionId));
 const context=graph.all.filter(c=>!focusIds.has(connectionId(c))&&p.entities.find(e=>e.id===c.from)?.kind!=='client');
 const background=graph.all.filter(c=>!focusIds.has(connectionId(c))&&p.entities.find(e=>e.id===c.from)?.kind==='client');
 return <><BackgroundConnections edges={background} entities={p.entities} day={p.day}/>{[...context,...graph.trace.edges].map(edge=><StructuralFlow key={connectionId(edge)} edge={edge} entities={p.entities} day={p.day} active={focusIds.has(connectionId(edge))} playing={p.playing} reduced={p.reduced} onSelect={p.onSelect} labels={Boolean(p.selected)}/>)}</>;
}
function CameraRig({selected,action,reduced,context,filter,entities}:{selected:Entity|null;action:CameraAction;reduced:boolean;context:Entity[];filter:FlowFilter;entities:Entity[]}){
 const controls=useRef<CameraControls>(null),first=useRef(true);const {size,camera,performance}=useThree();
 const direction=useMemo(()=>new THREE.Vector3(...OVERVIEW.position).sub(new THREE.Vector3(...OVERVIEW.target)).normalize(),[]);
 const overview=()=>{const c=controls.current;if(!c)return;const narrow=size.width/size.height<1.15;const target=new THREE.Vector3(...OVERVIEW.target),eye=new THREE.Vector3(...OVERVIEW.position);if(narrow)eye.sub(target).multiplyScalar(1.55).add(target);void c.setLookAt(eye.x,eye.y,eye.z,target.x,target.y,target.z,!reduced);};
 const frame=(members:Entity[])=>{const c=controls.current;if(!c||!members.length)return;const points=members.map(positionFor),center=new THREE.Box3().setFromPoints(points).getCenter(new THREE.Vector3());const right=new THREE.Vector3().crossVectors(v(0,1,0),direction).normalize(),up=new THREE.Vector3().crossVectors(direction,right).normalize();let x=0,y=0,depth=0;for(const point of points){const d=point.clone().sub(center);x=Math.max(x,Math.abs(d.dot(right)));y=Math.max(y,Math.abs(d.dot(up)));depth=Math.max(depth,Math.abs(d.dot(direction)));}const fov=(camera as THREE.PerspectiveCamera).fov*Math.PI/180,panelWidth=0,aspect=(size.width-panelWidth)/size.height;const distance=Math.max((x+2)/(Math.tan(fov/2)*aspect),(y+2)/(Math.tan(fov/2)*.76),9)+depth+3;const shift=distance*Math.tan(fov/2)*(size.width/size.height)*panelWidth/size.width;const target=center.addScaledVector(right,shift),eye=target.clone().addScaledVector(direction,distance);void c.setLookAt(eye.x,eye.y,eye.z,target.x,target.y,target.z,!reduced);};
 useEffect(()=>{overview();},[size.width,size.height]);
 useEffect(()=>{if(filter==='all'){overview();return;}frame(entities.filter(e=>FLOWS.find(f=>f.id===e.flow)?.family===filter));},[filter]);
 useEffect(()=>{if(first.current){first.current=false;return;}if(selected)frame(context.length?context:[selected]);},[selected?.id,reduced]);
 useEffect(()=>{const c=controls.current;if(!c)return;const smooth=!reduced;switch(action.kind){case 'home':overview();break;case 'focus':if(selected){const p=positionFor(selected),eye=p.clone().addScaledVector(direction,9);void c.setLookAt(eye.x,eye.y,eye.z,p.x,p.y,p.z,smooth);}break;case 'in':void c.dolly(2.8,smooth);break;case 'out':void c.dolly(-2.8,smooth);break;case 'left':void c.truck(-1.4,0,smooth);break;case 'right':void c.truck(1.4,0,smooth);break;case 'up':void c.truck(0,1.4,smooth);break;case 'down':void c.truck(0,-1.4,smooth);break;}},[action]);
 return <CameraControls ref={controls} makeDefault onControlStart={()=>performance.regress()} onControl={()=>performance.regress()} minDistance={5} maxDistance={110} minPolarAngle={.15} maxPolarAngle={1.47} dollyToCursor smoothTime={reduced?0:.5} mouseButtons={{left:CameraControlsImpl.ACTION.ROTATE,middle:CameraControlsImpl.ACTION.ROTATE,right:CameraControlsImpl.ACTION.TRUCK,wheel:CameraControlsImpl.ACTION.DOLLY}} touches={{one:CameraControlsImpl.ACTION.TOUCH_ROTATE,two:CameraControlsImpl.ACTION.TOUCH_DOLLY_TRUCK,three:CameraControlsImpl.ACTION.NONE}}/>;
}
function Scene(p:Props&{entities:Entity[];focusEntities:Entity[]}){
 const selected=p.entities.find(e=>e.id===p.selected)??null;
 return <><fog attach='fog' args={['#55738b',55,135]}/><StudioEnvironment/><ClientEntities entities={p.entities} selected={p.selected} onSelect={p.onSelect} muted={false}/>{p.entities.filter(e=>e.kind!=='client').map(e=><SolidEntity key={e.id} entity={e} selected={p.selected===e.id} onSelect={p.onSelect}/>)}{p.connections&&<RelationshipPaths {...p}/>}<CameraRig selected={selected} action={p.action} reduced={p.reduced} context={p.focusEntities} filter={p.filter} entities={p.entities}/><AdaptiveDpr/><SceneFinishing/></>;
}
export default function World(p:Props){
 const entities=useMemo(()=>entitiesAtDay(p.day),[p.day]);
 const graph=useMemo(()=>sceneFlows(p.traceRoot??p.selected,p.day),[p.traceRoot,p.selected,p.day]);
 return <div className='spatial-renderer' data-selected={p.selected??''} data-entities={entities.length} data-connections={graph.all.length}><Canvas aria-label='Explore the business landscape. Drag to orbit, right-drag to pan, scroll to zoom. Select an entity to follow its route. Escape returns home; Space pauses motion.' shadows camera={{position:OVERVIEW.position,fov:OVERVIEW.fov,near:.1,far:200}} frameloop={p.playing&&!p.reduced?'always':'demand'} performance={{min:.7}} dpr={[1,1.5]} gl={{antialias:true,alpha:false,powerPreference:'high-performance',toneMapping:THREE.NoToneMapping,toneMappingExposure:1}} onPointerMissed={()=>{document.body.style.cursor='auto'}}><Suspense fallback={null}><Scene {...p} entities={entities} focusEntities={graph.trace.entities}/></Suspense></Canvas></div>;
}
