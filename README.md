# Climatico — Glass Currents

A desktop 3D business space inspired by the selected Glass Currents concept. Glass conduits are generated directly from individual relationship records. Each client, product line, operating input, emissions record, water record, and waste record retains its own identity and source.

## Run

```sh
npm install
cp .env.example .env
# Add MODEL_API_KEY. The existing local meta_api_key name is also accepted.
npm run dev
```

The local Vite server serves both the scene and the server-side Meta API. Credentials stay in an ignored env file and are never included in the browser build.

## Explore

- Select a client globe or its label to inspect that individual account.
- Follow a client → product → operating input → recorded output using connected-entity buttons or the scene's labeled, directed paths. The camera frames the connected route on selection; Focus still provides a close-up.
- Use Search & explore (⌘/Ctrl K) to find any individual entity, source ID, or category. Client categories organize distinct spatial clusters; they do not replace individual client records or their actual connection paths.
- Scroll to zoom, drag to pan, and right-drag to orbit. The directional puck, zoom buttons, and central reset also control the camera.
- Browse the seven sample dates or replay the week. Historical views contain only records available at that date.
- Inspect each record's source, units, method, coverage, and attribution. Liters, material mass, and kg CO₂e remain distinct.
- Ask Meta Muse Spark about the selected entity. The server derives the selected record and related context rather than accepting client-provided metric values.
- Export the selected-date entity graph as JSON, change motion settings, or enter office mode.

## Data model

`src/entities.ts` contains the independent entity and relationship model. The latest sample snapshot has 260 entities:

- 248 individually addressable B2B clients, organized into Enterprise (18), Growth-stage (82), and Early-stage (148) channels.
- Three separate product lines: Core platform, Developer API, and Studio.
- Three operational inputs/activities, two emissions calculations, two water-use records, and two material/waste records.

Client IDs, names, and source IDs are unique. Synthetic client MRR allocations reconcile exactly to each of the existing seven revenue snapshots. Product client counts are relationships: a client may use more than one product, so those counts are not summed as unique clients.

Edges express configured sample relationships such as uses, depends on, consumes, and produces. They do not establish causal effects or client-level environmental attribution. The relationship browser prioritizes operational dependencies and outputs while keeping all related clients available.

All business data is sample data. Environmental inputs and factors are invented interface fixtures, labeled illustrative, and available only on the latest sample date. They are not measured company impacts, validated emissions factors, or a complete environmental inventory. No actual GitHub, Stripe, cloud, utility, or waste account is connected.

## Runtime integrations

Meta Model API (`muse-spark-1.3`) is the active runtime AI integration. `/api/ask` preserves the selected entity, period, and source relationships, limits requests, and returns explicit provider errors. The hosted handler requires platform identity for paid requests; the local middleware explicitly enables local development access.

Modal processing and Fireworks/Baseten inference remain planned integrations. No connection or sponsor entitlement is simulated.

## Verification and build

```sh
npm test
npm run build
```

Tests cover independent entity identities, historical revenue reconciliation, temporal availability, units, relationship endpoints, unavailable-entity rejection, server-derived assistant context, request origin, authentication, and safe provider failures. Browser QA additionally exercises real 3D selection, relationship traversal, individual search, history, settings, camera controls, office mode, and a live selected-entity Meta response.

The build emits the client into `dist/client` and a Worker ESM bundle in `dist/server/index.js` with embedded client assets. Runtime credentials are configured separately; `.env` and generated bundles remain ignored by Git. Sites project identity is preserved in `.openai/hosting.json`. Hosted publication was blocked by source-repository authentication permissions in this environment; the local preview is the available handoff.

## Next product work

Add persistent company workspaces, authorized connectors, historical reconciliation against real sources, validated environmental calculation methods, usage quotas, and operational monitoring before expanding beyond a private prototype. Chat and view settings currently last for the session. Directional pulses illustrate relationship direction and are not measured transaction volume. Every path is anchored to its source and destination entity ports. All 308 latest-snapshot relationships are represented; the active route is emphasized with typed labels and arrowheads. Shared workloads and outputs are deduplicated in a traced route, and a route does not imply client-level environmental allocation.

The original product plan is in `PRODUCT-PLAN.md`. The selected visual reference and prompts are in `design/concepts/`.

## Specific flow rendering

`src/flow-graph.ts` derives the highlighted route from actual connections and stable individual entity positions. Following a path preserves its originating client and reconstructs breadcrumbs through real edges. Separate branch labels distinguish product use, workload dependencies, water use, carbon calculations, and material outputs. Earlier snapshots omit paths whose operating records are not yet available.

## Solid 3D architecture

The scene uses React Three Fiber, Drei, Three.js, and React Postprocessing. Principal connections are closed, swept glass meshes with rounded cross-sections, tapered ports, raised rails, colored interiors, and supports. Clients occupy physical decks while products, operations, water, emissions, and waste have distinct modeled forms. Physical labels sit in the scene; the inspector supplies detailed sources and units.

A locally generated studio environment, shared transmission sampling, bounded planar reflections, selective bloom, and explicit ACES tone mapping establish the glass rendering pipeline. Repeated clients use instancing, secondary relationships use batched geometry, and paused/reduced-motion views use demand rendering. These are performance measures, not a device-independent frame-rate guarantee. Shared transmission cannot reproduce glass seen through other glass accurately.

Implementation decisions and primary documentation are in [the spatial scene research](design/research/solid-spatial-scene.md). Geometry tests check closed topology, outward winding, curved frames, physical dimensions, and port tapering. Browser checks cover the rendered scene, orbiting, individual picking, exact connection endpoints, route navigation, focused views, history, and reduced-motion camera updates.

## Meta scene director

Use **Design this space with Meta** above the scene to describe a view. `/api/scene` makes a real server-side Muse Spark request with a JSON Schema response format. Meta chooses individual entity IDs, highlights, a lanes/orbit/terraces layout, spacing, palette, camera angle, and optional focal entity. Follow-up prompts include the current validated plan.

The server validates every ID against the selected snapshot, restricts all layout parameters, and derives source IDs and directed connections from the authoritative sample registry. The client compiles that plan into actual React Three Fiber positions, materials, channels, and camera framing. It does not execute model-generated JavaScript or load model-supplied assets. Entity names, units, metrics, and connection endpoints come from the records, not model prose.

Undo, Original view, and JSON scene-plan export are available in the designer. Changing the snapshot clears a generated plan; cancellation, invalid output, and provider failures preserve the current view. Scene plans last for the session. This feature arranges existing records; it does not yet ingest business files, discover new relationships, simulate growth, or generate arbitrary 3D meshes. It uses Meta's API; the other sponsor integrations remain planned.

See [the scene director implementation notes](design/research/meta-scene-director.md).
