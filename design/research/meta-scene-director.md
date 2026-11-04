# Meta-directed 3D business views

Implemented November 3, 2026.

## Workflow

A natural-language view request and selected date reach `/api/scene`. The server loads the snapshot's registry and relationships, and optionally validates the prior scene. Meta Muse Spark returns a constrained JSON scene plan. After semantic validation, the renderer constructs that plan using existing entity geometry and actual connection ports.

Meta controls entity inclusion, up to twelve highlighted entities, layout (lanes, orbit, terraces), spacing, palette, camera direction, and an optional focus entity. The layout compiler calculates deterministic positions and retains individual entity identities. Rendering remains in React Three Fiber; no model-generated code executes in the browser.

## Integrity boundaries

- Unknown or unavailable entity IDs, duplicates, hidden focus targets, extra fields, and unsupported or excessive layout values are rejected.
- Names, measurements, units, source records, and directed connections are derived from the server registry. A model cannot add an edge or change a measurement through this contract.
- Model prose describes view choices, not verified business analysis. All records currently remain sample data.
- Credentials remain server-side. Existing authentication and same-origin checks apply to scene calls as well as assistant calls. Request/response sizes and upstream time are bounded.
- Changing dates clears the generated view and undo history. Cancelled or superseded requests cannot apply a stale scene. Provider errors leave the existing view in place.
- Undo and reset are local; export includes the validated plan, sample date, model/provider, source IDs, and actual connection IDs.

## Verified provider behavior

A real Muse Spark request for Aurum Labs' downstream route returned client-001, product-platform, product-api, operation-compute, emission-cloud, and water-cooling. It selected terraces, contrast colors, spacing 1.5, perspective camera, and full-route framing. The server verified six recorded directed connections and six source records.

## Scope

The current contract selects existing geometry and three supported layout families. It does not generate arbitrary mesh topology, use a text-to-3D asset API, import company records, infer new relationships, or provide numerical simulations. Those need separate contracts and validation.

## Primary references

- [Meta structured output](https://dev.meta.ai/docs/structured-output)
- [Meta Responses protocol](https://dev.meta.ai/docs/protocols/responses): Responses uses `text.format` for JSON schema output.
- [Cloudflare Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/): bounded payload handling, secrets, and awaited request work.

Live browser calls also produced an office orbit with six entities and five relationships, then a follow-up terraces view retaining exactly those entities. The captured responses are in [examples](examples/). Browser regression checks replay these captured responses to avoid repeating paid inference.
