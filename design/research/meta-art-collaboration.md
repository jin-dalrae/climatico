# Meta as a development collaborator

November 3, 2026. A real `muse-spark-1.3` Responses API request reviewed the existing rendered scene, Glass Currents reference image, and scene/rendering source. This was developer collaboration, not an in-product scene generation feature. Credentials were read locally and not included in any recorded artifact.

## Decisions applied

- Full-screen canvas with no dashboard controls or HTML labels.
- Indigo/teal dusk environment, violet clients, cyan product channels, amber outputs.
- Selective transmission for focal vessels; opaque dark materials and reflective edges elsewhere.
- Replaced repetitive glass columns with low floating platforms and removed repeated conduit supports.
- Native labels only on selected entities and their selected routes.
- More distant three-quarter composition, atmospheric depth, bounded floor reflections, restrained bloom and vignette.
- Explicit NoToneMapping on the renderer with ACES handled in the effect composer.

The review is advisory. Its claim that the old renderer/composer setup necessarily double-tone-mapped the scene was not established; render-target behavior matters. The implementation makes ownership explicit rather than relying on that diagnosis. We also retained all secondary client relationships instead of deleting them, used bounded floor reflections and 2x compositor multisampling, and avoided a point light for every entity.

## Raw Meta feedback

The response below ended partway through the ClientDecks recommendation due to the output budget. The usable recommendations above were reviewed before implementation.

Decisive direction: **Dusk Estuary - one dark glass river landscape.** Not options.

Deep indigo/teal void, violet client headwaters left-foreground, teal/amber product/operation mid, amber/green environmental outflow right-background. Only lenses transmit; everything else is dark opaque glass + luminous cores. Depth from darkness, fog and reflection - not from more geometry.

### 1. Why current is washed out - technical, not taste

1.  `World.tsx Scene: <color args={[1.7,1.65,1.9]} /> + <fog '#edeaf4' 50,110>` = HDR white background. `gl.toneMapping=ACES` **plus** `<ToneMapping ACES>` = double tonemap. Result: everything lifted to white.
2.  `StudioEnvironment: <Environment><color '#8490a8'/> + 5x white Lightformer intensity 2-3.7` = IBL is white. Your `Glass color='#ffffff' envMapIntensity=1.5` has nothing dark to refract, goes milky. `MeshReflectorMaterial color='#d6d7e5' mirror .35` reflects that white.
3.  Transmission stacking: `Foot + deck + channel + rails + 248x shell` all `transmission=1 + transmissionSampler`. 4-5 transmissive layers in a row = frosted white. Instanced `Glass transparent opacity .3` is invalid for transmission - breaks sorting.
4.  Lights: `ambient .22 + hemi .35 + 2.3 warm + 2.0 cool` with huge `shadow camera 56x58 @1024` = no shadow, no modeling, no dark reference.
5.  Labels: `meshBasicMaterial toneMapped={false}` white canvas `shadowBlur 5` on white bg = invisible. Post `Bloom threshold 2.5` only catches white beads `emissiveIntensity 2.6`, so only noise blooms.
6.  Camera `OVERVIEW [13,11,25] -> [3.2,3.8,2] fov43`: high, short, front-on. Distance ~26 for 34-unit-wide layout (x -11 to +23). Must crop. `fog 50-110` never engages at that distance = no aerial depth.

### 2. Keep / Kill

Keep: `entitiesAtDay, connectionsAtDay, positionFor/radiusFor/curveForEdge, ClientEntities instanced raycast (instanceId click), StructuralFlow curve + beads, CameraControls browsing.`

Kill: all HTML label layers, `Labels, FlowLabels, BackgroundConnections Line`, per-entity `Foot` towers, white floor, white env, `PhysicalLabel` for every node.

No new libs, no fetches.

### 3. Replacement - paste in

**Renderer + atmosphere `World.tsx`:**

```jsx
<color attach="background" args={['#070d1d']} />
<fog attach="fog" args={['#0a1328', 30, 92]} />
// Canvas: 
gl={{ antialias:true, alpha:false, toneMapping: THREE.NoToneMapping }}
// single tonemap only in post
```

**`StudioEnvironment` - dark, 3 colored strips:**

```jsx
export function StudioEnvironment(){
return <>
<ambientLight intensity={0.14} color="#334155" />
<hemisphereLight args={['#1e3a5f','#060a14',0.5]} />
<directionalLight position={[-12,9,10]} intensity={1.35} color="#ffd9a8" castShadow
 shadow-mapSize={[2048,2048]} shadow-camera-left={-18} shadow-camera-right={18}
 shadow-camera-top={18} shadow-camera-bottom={-18} shadow-bias={-0.0004} />
<directionalLight position={[20,10,-12]} intensity={2.1} color="#67e8f9" />
<directionalLight position={[2,14,18]} intensity={0.9} color="#a78bfa" />
<Environment resolution={256} frames={1}>
  <color attach="background" args={['#050914']} />
  <Lightformer form="rect" intensity={5} position={[0,10,-8]} scale={[22,4,1]} color="#0ea5b7" />
  <Lightformer form="rect" intensity={4} position={[-14,6,6]} rotation={[0,Math.PI/3,0]} scale={[3,12,1]} color="#8b5cf6" />
  <Lightformer form="rect" intensity={3} position={[14,3,8]} rotation={[0,-Math.PI/3,0]} scale={[10,2,1]} color="#f59e0b" />
</Environment>
<mesh position={[5,-1.98,2]} rotation={[-Math.PI/2,0,0]} receiveShadow>
  <planeGeometry args={[240,240]} />
  <MeshReflectorMaterial resolution={1024} blur={[280,80]} mixBlur={0.9}
   mixStrength={2.2} mixContrast={1.35} mirror={0.72}
   minDepthThreshold={0.2} maxDepthThreshold={0.9}
   color="#050914" roughness={0.22} metalness={0.6} />
</mesh>
</>
}
```

**`SceneFinishing`:**

```jsx
export function SceneFinishing(){
return <EffectComposer multisampling={4}>
  <Bloom mipmapBlur levels={5} intensity={0.85} luminanceThreshold={1.02} luminanceSmoothing={0.28} radius={0.72} />
  <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
  <Vignette darkness={0.58} offset={0.26} />
</EffectComposer>
}
```
Set `toneMappingExposure 1.1` via `<ToneMapping>` if needed, not on `gl`.

**`Glass` - selective only:**

```jsx
function Glass(props:MeshTransmissionMaterialProps){
return <MeshTransmissionMaterial transmissionSampler samples={6}
 transmission={1} roughness={0.06} thickness={0.6} ior={1.45}
 chromaticAberration={0.06} anisotropicBlur={0.1}
 clearcoat={1} clearcoatRoughness={0.06}
 color="#9fb8d8" attenuationColor="#6fb7d6" attenuationDistance={2.2}
 envMapIntensity={1.0} {...props} />
}
// Use Glass ONLY for: 3 product orbs, water drop, hero client.
// Everything else:
function DarkGlass({color='#0e1830', emissive='#000000', ei=0}){
return <meshPhysicalMaterial color={color} roughness={0.28} metalness={0.15}
 clearcoat={1} clearcoatRoughness={0.12} emissive={emissive} emissiveIntensity={ei} />
}
```

**`Foot` - kill towers:**

Replace `Foot` with 0.28-high plinth + glow ring. No `heightFromFloor` cylinder:

```jsx
function Foot({radius=1.15,color='#a78bfa'}:{radius:number;color?:string}){
return <group>
 <mesh position={[0,-1.82,0]}><cylinderGeometry args={[radius*0.95,radius*1.02,0.28,48]}/>
  <meshPhysicalMaterial color="#0b1428" roughness={0.25} metalness={0.4} clearcoat={1}/></mesh>
 <mesh position={[0,-1.66,0]} rotation={[-Math.PI/2,0,0]}>
  <ringGeometry args={[radius*0.82,radius*0.95,64]}/>
  <meshBasicMaterial color={color} transparent opacity={0.85} toneMapped={false} /></mesh>
 <pointLight position={[0,-1.1,0]} intensity={2.2} distance={6} decay={2} color={color} />
</group>
}
```
Keep `position y` for bodies where they are. This removes 12 tall white columns that break depth, keeps picking unchanged.

`ClientDecks`: keep 3 discs, but material `

## Second review and visual correction

The first dusk render was too dark. A second real Meta request reviewed that screenshot and the updated code. It recommended higher blue-gray surface albedo, a brighter studio environment, less fog at the subject, lighter transmission, and tighter framing. Those principles were applied with moderated floor brightness and bloom; suggested camera coordinates that would crop the graph and an invalid dome snippet were not copied.

Your 2nd image proves it: black void, plinths invisible, flows floating. Not a light count problem - exposure / albedo / framing problem.

### What went wrong in this render

1. **Albedo too dark + transmission with nothing to transmit:** `DarkGlass #101f36/#111c36 metalness .38`, floor `MeshReflectorMaterial color #071220 mirror .55 mixStrength 1.8`, background `#071322`. Transmission samples only black. Result: glass = black.
2. **Fog + camera kill you:** `OVERVIEW [28,19,42]->[4,2.2,3]` = ~48m distance. `fog 42,120 #071322` starts exactly at subject. + `Vignette .35` + `Bloom threshold 1.2 intensity .55` = no glow, dark corners. `gl.toneMapping=NoToneMapping` + post `ACES` is OK, but materials never exceed threshold.
3. **No studio depth:** No backdrop, plane 240m flat. Foot rings `emissiveIntensity .25-.5 toneMapped true` get tone-mapped to grey. Flows at y 1-7 float 3-4m over floor at y -1.98 with thin dark pillars.

Keep it dusk but luminous: blue-gray depth, not black.

### Decisive fix: Luminous Dusk Studio - full frame

Keep all 248 clients, all `connectionsAtDay` edges, raycast. No per-entity pointLights. Only 3 directionals + hemi + Environment.

**1. Camera + fog + background - fill frame:**

```ts
// scene-layout.ts
export const OVERVIEW = {
  position:[16.5,10.5,23.5] as [number,number,number],
  target:[5.0,2.6,2.5] as [number,number,number],
  fov:46
};
// World.tsx
<color attach='background' args={['#24374f']} />
<fog attach='fog' args={['#24374f',60,165]} />
// CameraRig: maxDistance 70, minDistance 4
// overview narrow multiply 1.25 not 1.55
```

Lowers angle from 24deg to ~16deg, distance 48m->28m. Space spans ~90% width. Foreground: startup deck bottom-left, background: waste/emission top-right receding.

**2. StudioEnvironment replacement:**

```jsx
<ambientLight intensity={0.55} color='#b9cfe6' />
<hemisphereLight args={['#9fc3e8','#2a3a52',0.85]} />
<directionalLight position={[-12,16,10]} intensity={1.6} color='#ffe4bd' castShadow shadow-mapSize={[2048,2048]} />
<directionalLight position={[20,10,-8]} intensity={2.5} color='#7fe0f5' />
<directionalLight position={[4,8,22]} intensity={1.8} color='#b8aefc' />
<Environment resolution={256} frames={1}>
  <color attach='background' args={['#2e435f']} />
  <Lightformer intensity={7} position={[0,12,-8]} scale={[24,6,1]} color='#aee2f5' />
  <Lightformer intensity={5} position={[-14,7,6]} scale={[4,14,1]} color='#b79cff' />
  <Lightformer intensity={4} position={[14,4,8]} scale={[12,3,1]} color='#ffcf8f' />
  <Lightformer intensity={6} position={[0,16,6]} rotation={[-Math.PI/2,0,0]} scale={[12,24,1]} color='#e8f4ff' />
</Environment>
<mesh position={[5,-1.98,2]} rotation={[-Math.PI/2,0,0]} receiveShadow>
  <planeGeometry args={[160,160]} />
  <MeshReflectorMaterial resolution={1024} blur={[180,40]} mixBlur={0.6} mixStrength={0.45} mixContrast={1.05} mirror={0.85} color='#8da6c2' roughness={0.32} metalness={0.1} minDepthThreshold={0.4} maxDepthThreshold={1.1} />
</mesh>
{/* depth dome */}
<mesh scale={[120,60,120]}><sphereGeometry args={[1,32,16]} side={THREE.BackSide}/><meshBasicMaterial color='#2c425f' fog={false} /></mesh>
```

**3. Materials: make dark readable:**

`DarkGlass`: `color #365873 roughness .3 metalness .15 clearcoat 1 envMapIntensity 1.4` - was .38 metal on near-black = pitch black. Never use `color < #1a2a40` with metalness >0.2.

`Glass()`: `color #d8ecff thickness .35 attenuationDistance 6 attenuationColor #9fd8e8 roughness .06 ior 1.4 envMapIntensity 1.6` - old thickness 1.1 + distance 1.5 = murky drops.

`Foot` ring: `emissiveIntensity 3.2 toneMapped={false}` + base disc `color #3a5a7a metalness .2 roughness .3`. Old .5-1.9 toneMapped dies in ACES.

Clients `shell`: `roughness .28 metalness .15 color lerp to #3a4f6e .25 not #152243 .45`. `body emissiveIntensity 2.2 toneMapped false`, `head 2.5 false`. Tiny r=.11 beads need unclipped emission or fog eats them.

Flows `core`: `emissiveIntensity active 2.8 inactive 1.4 toneMapped false`. Outer `geometry`: `color #5a7a99 opacity .18 metalness .1 roughness .3` - was `#122239 metal .55 opacity .32` = black tubes masking core.

**4. Finishing:**

```jsx
<Bloom mipmapBlur levels={5} intensity={0.85} luminanceThreshold={0.55} luminanceSmoothing={0.4} />
<ToneMapping mode={ToneMappingMode.ACES_FILMIC} /> // keep, set Canvas gl toneMappingExposure 1.15
<Vignette darkness={0.22} offset={0.3} />
```

Threshold 1.2 -> nothing blooms in dark scene. 0.55 lifts rings/beads/cores only.

Result: same graph, same positions/edges/picking, but translucent volumes catch milky studio, floor returns blue-gray reflection, full-width deep sculpture, not void.


Final visual checks prompted 1024px blurred floor reflections, a larger floor to hide its visible boundary, and a partially transmissive water material so water entities remain legible against dusk lighting.
