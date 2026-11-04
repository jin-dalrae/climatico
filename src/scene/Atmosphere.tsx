import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
const vertex=`varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment=`varying vec3 vDirection;uniform vec3 zenith,horizon,abyss;
void main(){vec3 d=normalize(vDirection);float h=d.y;
vec3 c=mix(abyss,horizon,smoothstep(-.65,.02,h));c=mix(c,zenith,smoothstep(.03,.85,h));
float light=pow(max(0.,dot(d,normalize(vec3(-.6,.18,-1.)))),8.);c+=vec3(.025,.065,.09)*light;
gl_FragColor=vec4(c,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
function Sky(){const ref=useRef<THREE.Mesh>(null);const uniforms=useMemo(()=>({zenith:{value:new THREE.Color('#111b35')},horizon:{value:new THREE.Color('#55738b')},abyss:{value:new THREE.Color('#101e34')}}),[]);useFrame(({camera})=>{ref.current?.position.copy(camera.position)});return <mesh ref={ref} renderOrder={-10} frustumCulled={false}><sphereGeometry args={[150,48,32]}/><shaderMaterial side={THREE.BackSide} depthWrite={false} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment}/></mesh>}
function Haze({position,color,scale}:{position:[number,number,number];color:string;scale:[number,number,number]}){const uniforms=useMemo(()=>({tint:{value:new THREE.Color(color)}}),[color]);return <mesh position={position} scale={scale} rotation={[-Math.PI/2,0,0]} renderOrder={3}><planeGeometry args={[1,1]}/><shaderMaterial transparent depthWrite={false} uniforms={uniforms} blending={THREE.AdditiveBlending} vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`} fragmentShader={`varying vec2 vUv;uniform vec3 tint;void main(){vec2 p=(vUv-.5)*2.;float a=pow(max(0.,1.-dot(p,p)),3.)*.12;gl_FragColor=vec4(tint,a);\n#include <colorspace_fragment>\n}`}/></mesh>}
function DistantLandscape(){
 const geometry=useMemo(()=>{const g=new THREE.PlaneGeometry(270,180,160,90);g.rotateX(-Math.PI/2);g.translate(0,0,-90);const p=g.getAttribute('position'),colors:number[]=[];for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),ridge=Math.exp(-Math.pow((z+63)/17,2))*(3+5*Math.pow(Math.sin(x*.027+.4),2))+Math.exp(-Math.pow((z+117)/23,2))*(7+7*Math.pow(Math.cos(x*.025),2));const y=-7+ridge+THREE.MathUtils.smoothstep(-z,60,170)*7;p.setY(i,y);const c=new THREE.Color('#1a2c47').lerp(new THREE.Color('#415e7a'),THREE.MathUtils.clamp((y+7)/22,0,1));colors.push(c.r,c.g,c.b)}g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g},[]);useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry}><meshStandardMaterial vertexColors roughness={.95} metalness={0}/></mesh>;
}
export function Atmosphere(){return <>
 <Sky/>
 {/* Large sculpted terraces are stage architecture, never business entities. */}
 <mesh position={[4,-4.25,1]} scale={[34,3.8,27]} receiveShadow><cylinderGeometry args={[1,.86,1,128]}/><meshStandardMaterial color='#1b3049' roughness={.8} metalness={.12}/></mesh>
 <mesh position={[4,-6.65,1]} scale={[36,1.2,29]}><cylinderGeometry args={[.96,1,1,128]}/><meshStandardMaterial color='#172b43' roughness={.8} metalness={.06}/></mesh>
 <DistantLandscape/>
 <Haze position={[-9,-1.85,-9]} scale={[60,38,1]} color='#6c87bc'/><Haze position={[17,-1.9,14]} scale={[44,28,1]} color='#4aafbc'/><Haze position={[0,-1,-38]} scale={[150,40,1]} color='#829dbc'/>
 </>}
