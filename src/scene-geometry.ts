import * as THREE from 'three';

export function channelFrame(curve:THREE.Curve<THREE.Vector3>,t:number){
 const tangent=curve.getTangentAt(t).normalize();
 const lateral=new THREE.Vector3(tangent.z,0,-tangent.x).normalize();
 if(lateral.lengthSq()<.5)lateral.set(0,0,1);
 const up=new THREE.Vector3().crossVectors(tangent,lateral).normalize();
 return {center:curve.getPointAt(t),tangent,lateral,up};
}
/** Closed, filleted cross-section swept through true XYZ space. Width and
 * thickness are structural dimensions, not encodings of business quantity. */
export function makeGlassChannel(curve:THREE.Curve<THREE.Vector3>,width:number,thickness:number,steps=84,offset=0,endWidths?:[number,number]){
 if(width<=0||thickness<=0||steps<2)throw new Error('Channel dimensions must be positive.');
 const halfW=width/2,halfH=thickness/2,r=Math.min(halfH*.9,.09);
 const section:THREE.Vector2[]=[];
 const corners=[{x:halfW-r,y:halfH-r,start:0},{x:-halfW+r,y:halfH-r,start:Math.PI/2},{x:-halfW+r,y:-halfH+r,start:Math.PI},{x:halfW-r,y:-halfH+r,start:Math.PI*1.5}];
 for(const corner of corners)for(let i=0;i<5;i++){const angle=corner.start+i/4*Math.PI/2;section.push(new THREE.Vector2(corner.x+Math.cos(angle)*r,corner.y+Math.sin(angle)*r));}
 const positions:number[]=[],uvs:number[]=[],indices:number[]=[],ring=section.length;
 for(let i=0;i<=steps;i++){const t=i/steps,{center,lateral,up}=channelFrame(curve,t),scale=channelWidthScale(t,width,endWidths);for(let j=0;j<ring;j++){const vertex=center.clone().addScaledVector(lateral,section[j].x*scale).addScaledVector(up,section[j].y*(.5+.5*scale)+offset);positions.push(vertex.x,vertex.y,vertex.z);uvs.push(j/ring,t);}}
 for(let i=0;i<steps;i++)for(let j=0;j<ring;j++){const next=(j+1)%ring,a=i*ring+j,b=i*ring+next,c=(i+1)*ring+j,d=(i+1)*ring+next;indices.push(a,b,c,b,d,c);}
 for(let j=1;j<ring-1;j++){indices.push(0,j+1,j);const base=steps*ring;indices.push(base,base+j,base+j+1);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}
export function channelEdge(curve:THREE.Curve<THREE.Vector3>,width:number,side:number,height:number,endWidths?:[number,number]){return new THREE.CatmullRomCurve3(Array.from({length:85},(_,i)=>{const frame=channelFrame(curve,i/84);return frame.center.addScaledVector(frame.lateral,width/2*side*channelWidthScale(i/84,width,endWidths)).addScaledVector(frame.up,height);}));}

function channelWidthScale(t:number,width:number,ends?:[number,number]){if(!ends)return 1;const start=THREE.MathUtils.clamp(ends[0]/width,.1,1),end=THREE.MathUtils.clamp(ends[1]/width,.1,1);return THREE.MathUtils.lerp(start,1,THREE.MathUtils.smoothstep(t,0,.2))*THREE.MathUtils.lerp(1,end,THREE.MathUtils.smoothstep(t,.8,1));}

/** Closed elliptical conduit. The radial cross-section preserves real volume
 * from every camera angle; both ends taper to individual entity ports. */
export function makeFlowConduit(curve:THREE.Curve<THREE.Vector3>,width:number,height:number,steps=96,ends?:[number,number]){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||!Number.isInteger(steps)||steps<2)throw new Error('Invalid conduit dimensions.');
 const ring=32,positions:number[]=[],uvs:number[]=[],indices:number[]=[];
 for(let i=0;i<=steps;i++){const t=i/steps,frame=channelFrame(curve,t),scale=channelWidthScale(t,width,ends);for(let j=0;j<ring;j++){const angle=j/ring*Math.PI*2,point=frame.center.clone().addScaledVector(frame.lateral,Math.cos(angle)*width*.5*scale).addScaledVector(frame.up,Math.sin(angle)*height*.5*scale);positions.push(point.x,point.y,point.z);uvs.push(j/ring,t);}}
 for(let i=0;i<steps;i++)for(let j=0;j<ring;j++){const a=i*ring+j,b=i*ring+(j+1)%ring,c=a+ring,d=b+ring;indices.push(a,b,c,b,d,c);}
 for(let j=1;j<ring-1;j++){indices.push(0,j+1,j);const base=steps*ring;indices.push(base,base+j,base+j+1);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}
