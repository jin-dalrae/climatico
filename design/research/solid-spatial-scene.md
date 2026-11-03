# Glass Currents: research and implementation decisions

Research checked November 2, 2026. Goal: keep the existing entity/relationship model while replacing its pale graph presentation with a genuinely modeled, navigable 3D structure.

## Findings applied to this project

### 1. Build a volume, not a thick line

The selected concept relies on solid glass cross-sections, raised edges, supports, and different heights. A line renderer cannot provide the corresponding sides, undersides, highlights, or silhouette. Three.js supports extruding a 2D section along a 3D curve; its built-in path extrusion does not support bevels. We therefore generate a closed, rounded cross-section ourselves and sweep it using a tangent/lateral/up frame. This gives each business connection actual width and thickness, including end caps and consistent outward normals.

Source: [Three.js ExtrudeGeometry](https://threejs.org/docs/pages/ExtrudeGeometry.html).

Curves provide arc-length sampling and tangents. We use arc-length sampling for the geometry and animated packets so their apparent speed is not an artifact of how tightly the path bends. All channels still terminate at the correct source and destination ports.

Source: [Three.js Curve](https://threejs.org/docs/pages/Curve.html).

### 2. Glass requires a rendering pipeline

Opacity alone does not reproduce glass. The material needs transmission, thickness, an index of refraction, and an environment with enough contrast to create a readable surface. We use neutral glass with colored interiors, metallic rims, and restrained chromatic dispersion, rather than coloring every surface a flat pastel.

Source: [Three.js MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html).

Drei's MeshTransmissionMaterial adds chromatic aberration and roughness support. Independent material buffers can add a scene render for each material. The shared transmission sampler avoids that multiplication, at the cost of transmissive objects not seeing one another through that shared buffer. All current glass uses shared sampling, including the focal client chamber, to bound the number of scene passes and keep the reflection/composition pipeline consistent. This is an explicit visual/performance tradeoff, not physically complete light transport.

Source: [Drei MeshTransmissionMaterial](https://drei.docs.pmnd.rs/shaders/mesh-transmission-material).

### 3. Design the reflected environment

A uniform bright environment leaves little reflection contrast and makes clear shapes look flat. The studio environment combines broad softboxes, narrower vertical lights, a ring light, and a cooler surrounding environment. It is generated locally as a cubemap and captured once. There is no runtime dependency on an HDRI CDN.

Drei supports rendering custom environment content into a cubemap. Its documentation cautions that convenience preset URLs are not intended as production asset hosting.

Source: [Drei Environment](https://drei.docs.pmnd.rs/staging/environment).

A blurred planar floor reflection anchors the elevated structures and makes vertical separation legible. Its offscreen resolution and blur are bounded; it is not a general scene-wide reflection solution.

Source: [Drei MeshReflectorMaterial](https://drei.docs.pmnd.rs/shaders/mesh-reflector-material).

### 4. Use light selectively

An explicit ACES tone-mapping effect compresses HDR values before display; renderer-only tone mapping is insufficient when the effect composer owns the output. Bloom is reserved for small moving packets and a few luminous edges. It should not wash out the glass, names, or units. HDR emissive materials are paired with a threshold above ordinary surface brightness, following the selective-bloom guidance.

Sources: [React Postprocessing Bloom](https://react-postprocessing.docs.pmnd.rs/effects/bloom), [ToneMapping](https://react-postprocessing.docs.pmnd.rs/effects/tone-mapping).

### 5. Allocate detail where it is visible

Clients retain their independent IDs and picking behavior. Repeated shells and avatar parts use instancing; the focal client and major product vessels receive more geometric detail. The hundreds of secondary client relationships use batched geometry, while the active route and main operating branches receive solid channels. They all retain the same actual relationship endpoints.

Rendering can stop when motion is paused or reduced. Adaptive pixel ratio regresses during camera manipulation. These measures follow the R3F guidance on instancing, reuse, adaptive performance, and on-demand rendering. They do not establish a measured frame-rate guarantee for every device.

Source: [React Three Fiber scaling performance](https://r3f.docs.pmnd.rs/next/advanced/scaling-performance). This page currently describes the v10 deployment; the implementation uses only APIs present in the project's installed v9 packages, checked against their local types.

### 6. Frame a space, not a diagram

The camera starts at a closer three-quarter angle with foreground, middle, and background objects. Following a route fits its actual connected objects into the unobscured viewport; explicit Focus provides a closer view of a node. Pan, orbit, and dolly remain available. Physical label planes travel with objects; normal HTML remains appropriate for detailed source inspection, search, and accessible controls.

Source: [Drei CameraControls](https://drei.docs.pmnd.rs/controls/camera-controls).

## Acceptance criteria

- The default view shows visible channel thickness, raised rails, round vessel silhouettes, interior objects, supports, and floor reflections.
- Orbiting changes occlusion and reveals undersides and side faces.
- Each visible principal conduit corresponds to a real sample relationship and terminates at its two ports.
- All 248 sample client accounts remain independent and searchable; no category replaces an account.
- Water, waste, emissions, products, and clients have distinct forms, sources, and native units.
- Existing trace navigation, timeline, source inspection, Meta integration, and reduced-motion behavior continue to work.
- Browser errors, build output, geometry integrity, and actual rendered screenshots are checked.

All company data and environmental methods remain illustrative. Visual channel dimensions distinguish structure and relationship type; they do not represent measured throughput, environmental allocation, or validated savings.
