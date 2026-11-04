# Background depth and volumetric flow

November 3, 2026. Meta Muse Spark reviewed the latest screenshot and rendering source specifically for the flat background and ribbon-like flow problem.

Applied: gradient sky, a continuous sculpted distant landscape, layered stage architecture and haze, no giant flat reflector, closed elliptical conduits, tapered source/target ports, opaque colored interiors and instanced moving capsules inside the shells. The endpoint geometry still comes from the actual per-entity relationship curves. No UI was added.

The proposed geometry snippet in the review omitted caps despite describing a closed conduit. We implemented and tested closed manifold end caps and bounded dimensions ourselves. We also avoided scattering 60 decorative pillars among business entities. The sky shader includes the renderer's color-space chunks; existing shared transmission sampling avoids per-conduit scene captures.

## Raw Meta feedback

No UI, no symbols. Only scene + flows. Current fails on 2 points: uniform `#24374f` void + `Line` floor, and flows as flat `ribbon + 2 rails` reads as road.

Keep: `curveForEdge()` end points, per-edge `Curve`, picking, independent edges. Replace how you dress curve + world.

### 1. Background: deep atmosphere, not color

Remove `<color attach=background>` + `fog 65-160` + `1000x1000 MeshReflectorMaterial`. That's washout source: huge flat reflector at same color as fog kills depth.

Replace with 3 layers, 0 deps, 1 draw each:

**a) Sky dome:** inverted sphere `r=180`, `BackSide` shader gradient. No lighting needed.

```jsx
<mesh scale={[180,120,180]} renderOrder={-10} frustumCulled={false}>
 <sphereGeometry args={[1,32,24]} />
 <shaderMaterial side={THREE.BackSide} depthWrite={false} fog={false}
  uniforms={{top:{value:new THREE.Color('#0b1e3a')},mid:{value:new THREE.Color('#14365e')},bot:{value:new THREE.Color('#0a1628')},glow:{value:new THREE.Color('#1d5a7a')}}}
  vertexShader={`varying vec3 vP; void main(){vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
  fragmentShader={`varying vec3 vP; uniform vec3 top,mid,bot,glow;
   void main(){ float h=normalize(vP).y*0.5+0.5;
    vec3 c=mix(bot,mid,smoothstep(0.,0.55,h)); c=mix(c,top,smoothstep(0.55,1.,h));
    c+=glow*pow(max(0.,1.-abs(h-0.42)*3.),3.)*0.35; // horizon band
    gl_FragColor=vec4(c,1.);}`} />
</mesh>
<fog attach="fog" args={['#10294a',55,170]} />
```

**b) Floor abyss:** `circleGeometry [140,64]` at `y=-2.15`, `MeshStandardMaterial #0e233d roughness .92 metalness 0`, + radial fade ring texture via canvas: center opaque -> edge transparent into fog. `transparent:true, depthWrite:true`. Don't use reflector. Reflection cost + smear is why shot 1 looks milky.

**c) Sculpted depth:** 4-5 dark silhouettes: large flattened `dodecahedron / cylinder` mesas at `y=-3..-6, z=-25..-60, scale [20-35,3-6,10]`, material `#0d2038 roughness 1`. + 60 instanced distant pillars/crystals for parallax. This alone creates deep scene. Add `hemisphereLight ['#4a6a9a','#0a1424',0.5]` only.

Pitfall: toneMapped sky: set `toneMapped:false` on sky material false? Keep true so ACES unifies it. Keep bloom threshold `~0.7`.

### 2. Volumetric conduits: thick tube + inner liquid

Delete: `makeGlassChannel ribbon + 2x tube rails + bead spheres`. Thin from side view.

Need: closed elliptical tube. Build once per edge, cached:

```ts
export function makeConduitGeometry(curve:THREE.Curve<THREE.Vector3>, width=0.9, thick=0.42, segs=64, radial=14, flare:[number,number]=[1,1]){
 const frames=curve.computeFrenetFrames(segs,false);
 const pos=[],norm=[],uvs=[],idx=[];
 for(let i=0;i<=segs;i++){ const t=i/segs, C=curve.getPointAt(t);
  const N=frames.normals[Math.min(i,segs-1)], B=frames.binormals[Math.min(i,segs-1)];
  const f=THREE.MathUtils.lerp(flare[0],flare[1],t)*(0.75+0.25*Math.sin(t*Math.PI)); // pinch mid, flare ports
  for(let j=0;j<=radial;j++){ const a=j/radial*Math.PI*2;
   const ex=Math.cos(a)*width*0.5*f, ey=Math.sin(a)*thick*0.5*f;
   const p=C.clone().addScaledVector(N,ex).addScaledVector(B,ey);
   pos.push(p.x,p.y,p.z);
   const n=N.clone().multiplyScalar(ex).addScaledVector(B,ey).normalize();
   norm.push(n.x,n.y,n.z); uvs.push(t,j/radial);
  }}
 for(let i=0;i<segs;i++) for(let j=0;j<radial;j++){
  const a=i*(radial+1)+j, b=a+radial+1; idx.push(a,b,a+1,b,b+1,a+1);}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g.setAttribute('normal',new THREE.Float32BufferAttribute(norm,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
 g.setIndex(idx); return g;
}
```

Ports preserved: first/last ring centered exactly on `curve.getPointAt(0/1)` which is your `positionFor()+radius offset`. Don't offset `+up .22` - breaks contact. Overlap sphere by `0.15` into port.

**Materials - 2 meshes per edge, no per-frame passes:**

Outer shell - one shared material for all:
`meshPhysicalMaterial { color:#9fc6e8, metalness:0, roughness:0.08, transmission:0.92, thickness:0.6, ior:1.42, transparent:true, opacity:1, clearcoat:1, clearcoatRoughness:0.08, envMapIntensity:1.2, depthWrite:false, side:FrontSide }`
`renderOrder=2`. Shared across edges = one program.

> Pitfall: `transmissionSampler + many overlapping transmissive` = washout + 3ms+. If >20 edges visible, switch outer to cheap glass: `transparent opacity 0.28 roughness 0.15 metalness 0` without `transmission`. Keep `MeshTransmissionMaterial` only for product spheres. Use `depthWrite:false` always for shell or interior sorting flickers.

Inner liquid - per-type shared (4 colors, not per-edge):
`meshBasicMaterial? No.` Use `meshStandardMaterial { color:typeColor, emissive:typeColor, emissiveIntensity:1.6, roughness:0.35, transparent:true, opacity:0.85 }` on scaled-down tube: `makeConduitGeometry(curve,width*0.42,thick*0.42)`, `renderOrder=1, depthWrite:true`. This gives luminous core that blooms. Slightly offset `uv.x` scroll via `map.offset`? Better: static core + moving capsules inside.

**Interior flow - instanced capsules, 0 allocations:**

One `InstancedMesh [capsuleGeometry(0.09,0.28,4,8), MeshBasicMaterial toneMapped:false]` per color group, count = `edges*5`. Per frame update only `matrix` from `t=(offset+time*speed)%1`:

```
dummy.position=curve.getPointAt(t); dummy.quaternion=setFromUnitVectors(Y,tangent); dummy.scale pulse 1+0.2*sin
```

Opacity via color, not per-instance opacity. `speed 0.06-0.12`, active `scale 1.2x`. This reads as liquid packets inside tube, stays round from all angles vs. beads on top.

Add faint center line: `tubeGeometry(curve,64,0.03)` `basic color white opacity 0.35 additive` for hot center.

Render order: `core 1 opaque-ish / capsules 3 / shell 4`. All `fog:true` except capsules `fog:false` to keep glow at distance.

Visual iteration reduced refraction and bloom to expose the moving colored interiors, and replaced the first separated landscape forms with a continuous height-field so scenery does not resemble extra entities. Existing background client edges remain lightweight batched lines and become solid conduits when their route is selected.
