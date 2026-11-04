import * as THREE from 'three';
import { entityPosition } from './flow-graph';
import type { Connection, Entity } from './entities';
export const OVERVIEW={position:[26,13,40] as [number,number,number],target:[5,1.5,2] as [number,number,number],fov:40};
export function positionFor(e:Entity){return new THREE.Vector3(...entityPosition(e));}
export function clientRadius(e:Entity){const i=e.clientIndex??0;return i===0?1.16:i<6?.32:i===247?.31:.11+(i%4)*.023;}
export function radiusFor(e:Entity){return e.kind==='client'?clientRadius(e):e.kind==='product'?1.15:e.kind==='water'?.67:e.kind==='emission'?1.02:e.kind==='waste'?.86:1.02;}
export function curveForEdge(edge:Connection,entities:Entity[]){
 const source=entities.find(e=>e.id===edge.from),target=entities.find(e=>e.id===edge.to);
 if(!source||!target)throw new Error('Both flow endpoints must exist at the selected date.');
 const a=positionFor(source).add(new THREE.Vector3(radiusFor(source),0,0)),b=positionFor(target).add(new THREE.Vector3(-radiusFor(target),0,0));
 const distance=Math.max(1.1,Math.abs(b.x-a.x)),rise=edge.type==='uses'?1.1:edge.type==='produces'?1.65:.85;
 const bend=edge.type==='uses'?(target.id==='product-platform'?-.6:.65):edge.type==='produces'?-.65:.55;
 const curve=new THREE.CubicBezierCurve3(a,a.clone().add(new THREE.Vector3(distance*.4,rise,bend)),b.clone().add(new THREE.Vector3(-distance*.4,rise,-bend)),b);
 curve.arcLengthDivisions=300;return curve;
}
