# Climatico Spatial — product plan

Updated November 2, 2026. Working name. This is a proposed real product direction, not an accelerator traction claim or a hackathon specification.

## Product intent

A living 3D view of a startup that lets its team see how the business is flowing and growing. It runs in a desktop browser, supports zooming into individual areas and browsing their details, and can remain on an office display throughout the day. It should be enjoyable enough that people return voluntarily and understandable enough that a glance tells them something useful.

The buyer hypothesis is a founder or operations lead at a small startup with a shared office. The audience is the team. The proposed first segment is a software startup with approximately 5–30 people; this is a focus for discovery, not validated demand.

Climatico contributes the underlying idea: connect actual operations to current status, scaling scenarios, decisions, and subsequent outcomes. Environmental impact remains an extensible layer as credible data becomes available. The first version focuses on business flow and growth; the earlier prototype's invented company totals and emissions heuristics are not inputs to this product.

## Experience

Use a compact, crafted company landscape with a few recognizable areas and visible routes between them. The initial visual proposal is a miniature campus with customer, product, delivery, and resource areas. This metaphor needs testing: people must be able to identify areas and interpret changes without a tour.

The scene is a stable representation of the company. Areas retain their positions between sessions. New activity moves through the scene, completed milestones create restrained moments of delight, and growth adds visible history. Avoid random rearrangement, endless camera movement, and unexplained decorative motion.

### Two modes in the same desktop product

- **Ambient:** fixed overview, readable labels, subtle movement, a short summary of recent changes, visible data freshness, optional scheduled recap. Suitable for an office display.
- **Explore:** mouse and trackpad navigation, click to focus on an area, zoom to reveal detail, inspect an object, trace a connection, select a period, and return home.

Idle return to ambient mode is configurable. Public display permissions are enforced by the server, so private records are never sent to the display and merely hidden visually.

### Navigation and detail

Scroll or pinch zooms toward the pointer. Drag pans; a secondary gesture gives bounded orbit. Clicking an area smoothly frames it. Breadcrumbs preserve context: Company → Product → Release. Escape steps back, Home restores the overview, and a search/list view offers another way to reach everything.

Use three levels of detail:

1. Company: a few areas, overall changes, notable issues, recent milestones.
2. Area: its stages, queue sizes, recent events, and trends.
3. Object: a release, subscription cohort, task, or other record with its source and history.

Keep exact metrics and text in normal HTML panels so they remain readable and keyboard accessible. Avoid putting a spreadsheet inside a 3D scene.

### Visual meaning

| Visual | Proposed meaning | Constraint |
| --- | --- | --- |
| Area footprint or capacity modules | A named metric such as active customers or monthly throughput | Show metric, units, scale, and time window; do not mix incomparable measures |
| Moving tokens | Recent source events | Aggregate busy periods; distinguish historical replay from new activity |
| Route | Recorded workflow or configured dependency | A route does not establish business causation |
| Queue or buffer | Open work in a specific state | Age and quantity are available on inspection |
| Milestone object | Achieved, dated milestone | Corrections remain possible; no permanent rewards for reversed transactions |
| Accent plus icon | A defined threshold or failed process | No unsupported universal business-health score |
| Ghosted extension | Explicit future scenario | Separate from actual activity in appearance and labeling |

Render motion locally from data snapshots. No model calls per frame. Use optional sound only for intentional interactions; ambient mode is silent by default. Support reduced motion and avoid celebrating every commit or purchase.

## First useful workflow

Start with product delivery and customer/revenue movement. Connect GitHub and Stripe, plus a small manual milestone/import workflow. These are proposed data sources, not event sponsors. Additional project management, analytics, CRM, accounting, and cloud integrations follow observed pilot needs.

An example day:

1. A team member sees a new release and a change in active subscriptions in the office overview.
2. They click Product and zoom into the release history.
3. A side panel lists the release and its source. A separate customer trend shows the selected period.
4. They ask, “What changed since Monday?”
5. The assistant summarizes computed changes with links to records and names data gaps. It does not claim the release caused subscription growth without supporting analysis.
6. The team saves a milestone or a question to review later.

### MVP boundary

Deliver one coherent scene, two live connectors, historical backfill, event replay, sourced metrics, one daily recap, and grounded question answering. Include tenant authentication, source status, display permissions, and reconnect handling before a real office pilot.

Use source-specific definitions. Paid invoice totals are collections, not automatically recurring revenue. Define active subscription and recurring-revenue policies explicitly, including currencies, intervals, discounts, refunds, and cancellations. Releases and merged pull requests indicate activity; they are not standalone measures of employee productivity.

Scaling initially means browsing actual history and comparing periods. Add a scenario workspace after the baseline is trustworthy. A user can set assumptions such as customer additions and processing capacity; deterministic formulas show conditional outcomes. A language model may explain the assumptions but cannot invent growth rates or convert sales targets into forecasts.

## Meta and sponsor API plan

Official documentation was checked on November 2, 2026. Account access, credits, exact model IDs, commercial terms, latency, retention, and account limits still require verification with the available credentials. The plan does not assume promotional credits continue after the event.

| Service | Product role | Priority |
| --- | --- | --- |
| Meta Model API / Muse Spark | Explain computed changes, answer questions using authorized records, suggest scene focus through validated structured commands | Core |
| Meta Model API / Muse Wonder | Optional deeper weekly review across retrieved history and explicit scenario assumptions | Evaluate after Spark baseline |
| Meta Model API / Muse Image | Optional onboarding artwork, company-themed illustrations, or milestone cards generated once and cached | Later; not the 3D geometry engine |
| Muse Code | Development assistance | Build tool, not a runtime feature |
| Modal Functions | Background normalization, historical backfill, scheduled aggregation, and eventually deterministic scenario jobs | First supporting sponsor integration |
| Fireworks | Evaluate an available Meta open-weight model for inexpensive event classification and short recaps | Second-stage inference experiment |
| Baseten | Evaluate a permitted Meta model/deployment as an alternate inference path for the same bounded task | Optional provider adapter |
| SAM | Possible future segmentation of uploaded brand artwork | No initial product need |

Meta documentation lists Spark and Wonder for reasoning, Muse Image for image generation, and SAM for segmentation. These are separate capabilities. Image generation and image segmentation do not supply a live, navigable business scene.

Begin with Meta plus Modal. Keep Fireworks and Baseten behind a common adapter and evaluate them on the same authorized sample tasks before routing customer traffic. Do not send every record to every provider. Only activate fallback providers for a workspace after it is configured to use them. Select exact models from the account's actual catalog; no unverified assumption that a specific Muse release is available from all sponsors.

Model inputs should contain the smallest useful, permission-filtered snapshot. The assistant gets read-only tools such as metric retrieval, recent-event retrieval, and source inspection. A separate schema permits camera focus, time-range changes, or opening a record. The server validates authorization and object existence before applying commands. Source text is untrusted data, not instructions. Metrics and permissions stay outside the model.

If inference is unavailable, the scene, events, and metrics continue working; the assistant shows its unavailability. Cache summaries by snapshot and period, batch background classification, and meter model and compute cost per workspace.

## Architecture proposal

Use React, TypeScript, Three.js through React Three Fiber, and Drei camera controls for the desktop client. Use a normal application backend, relational storage, a durable job queue, and server-sent updates. Hosting is an implementation decision; do not inherit the old public-demo authorization model.

Data path:

```text
GitHub / Stripe / manual input
  → authenticated ingestion and signature verification
  → durable queue and preserved source record
  → idempotent normalization and reconciliation
  → metric snapshots and activity graph
  → permission-filtered scene snapshot and updates
  → desktop 3D scene + readable detail panels

Metric snapshots and authorized source references
  → Meta assistant / selected sponsor inference adapter
  → validated recap or navigation request
```

Store workspace membership, connector credentials, source events, normalized entities, state transitions, metric definitions, snapshots, milestones, and assistant outputs. Each event needs a workspace, provider, external ID, occurrence time, ingestion time, source reference, and schema version. Track deliveries independently from business events and reconcile historical imports with live updates.

Source webhooks can be duplicated, delayed, missed, or delivered out of order. Verify signatures, acknowledge after durable enqueue, deduplicate, process by source semantics, and periodically reconcile. A broken connector must become visible; it must not make a business area appear inactive.

Scene layout is independent of data storage. Persist positions for stable landmarks, aggregate large groups, and progressively load detail. Cap particles, reuse geometry, and reduce render quality automatically on weaker machines. Proposed performance targets: at least 30 fps on the selected integrated-GPU pilot laptop, fluid focus transitions, and a multi-hour office session without material memory growth. These are test targets, not measured performance.

## Build sequence and acceptance gates

1. **Interaction prototype.** Build the overview, area focus, object detail, breadcrumbs, time selection, and ambient mode using clearly marked fixtures. Ask five prospective users to identify what changed and navigate to its source. Gate: the metaphor and controls are understood without coaching.
2. **Real company baseline.** Add authentication, GitHub and Stripe connections, backfill, deduplication, metric definitions, source links, and display permissions. Gate: reconcile the displayed period against the provider records, including duplicate and out-of-order deliveries.
3. **Useful intelligence.** Add Meta summaries and read-only questions; use Modal for background processing. Gate: a small evaluated set of questions produces correct figures and source links, handles missing data, and respects workspace access.
4. **Office pilot.** Run with three to five consenting startups for two to four weeks. Gate: stable display sessions, repeated voluntary use, understandable changes, and evidence that a buyer wants to continue paying.
5. **Growth exploration.** Add deterministic scenarios and selected integrations based on pilot evidence. Gate: users can distinguish actual history, targets, and conditional scenarios.

Sequence is more important than a promised completion date. Estimate time after connector access, design scope, and available builder capacity are known.

## Accelerator and commercial validation

Working description: “We turn a startup's operating tools into a living 3D view of the company, so teams can see progress, explore changes, and understand how the business is growing.”

The business hypothesis is a workspace subscription that includes one office display and interactive desktop access. Test willingness to pay through explicit pilot renewal conversations; set pricing after observing connector costs, support burden, and actual buyer value. Offer no hardware requirement in the first product.

Evaluate usefulness and enjoyment separately. Ask people to explain a change after a glance, observe whether they return to explore, and record concrete decisions or conversations the display supports. Measure active office days, recurring exploration, source drilldowns, successful question answers, stale-data incidents, cost per workspace, and paid continuation. An always-on tab does not prove attention; use interviews and optional explicit interactions without office cameras or employee tracking.

The central uncertainty is whether delight persists after novelty and produces enough shared understanding to justify a recurring subscription. The first pilot should answer that before expanding to many connectors or elaborate generated environments. Other open questions include visual metaphor, shared-display sensitivity, onboarding effort, and whether environmental impact materially strengthens the product for the first buyers.

## Sources and inherited context

- Original vision: `/Users/dalrae/Downloads/Developed/00-2609-climatico-agent/README.md`.
- Earlier PRD, deck, `impact.ts`, `insights.ts`, and `abatement.ts` reviewed as prototype context. Their fixed figures and research flags are not validated company evidence.
- Meta API overview: https://dev.meta.ai/docs/overview
- Meta model capabilities: https://dev.meta.ai/docs/models
- Modal background functions: https://modal.com/docs/guide/functions
- Modal schedules: https://modal.com/docs/guide/cron
- Fireworks capabilities: https://docs.fireworks.ai/
- Baseten Model APIs: https://www.baseten.co/products/model-apis/
- Stripe webhook behavior: https://docs.stripe.com/webhooks
- GitHub webhook practices: https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks
- GitHub ordering and delivery limitations: https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/troubleshooting-webhooks
- React Three Fiber: https://r3f.docs.pmnd.rs/getting-started/introduction
- Drei camera controls: https://drei.docs.pmnd.rs/controls/camera-controls

This document is a product and implementation proposal. It does not establish market size, competitive differentiation, customer traction, sponsor entitlement, or production readiness.
