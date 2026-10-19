# IFH synthetic intake demo

A runnable Arabic prototype for incubator application preparation on Cloudflare Workers and the Agents SDK. The original `/` workflow is a rules-based simulation with three predefined synthetic scenarios. `/startup` accepts fictional questionnaire answers and produces an editable text draft. Optional Workers AI suggestions require owner activation and a private pilot code; see [STARTUP_AI_SETUP.md](STARTUP_AI_SETUP.md). Uploads, PDF extraction, outbound emails, acceptance decisions, Mambu integration and institution credentials are not supported.

## Run locally

From this directory: `npm ci`, `npm test`, `npm run test:runtime`, then `npm run dev`. Open the local URL printed by Wrangler. Create a complete, missing or inconsistent sample; review evidence and draft; approve or request revision; refresh and restore the last run; export JSON. State is stored per run in a SQLite-backed Agent Durable Object. Approved means approval of a simulated draft only; nothing is sent.

## Deployment

Deployment and verification are tracked separately from code checks. Authenticate to the owner's Cloudflare account with `npx wrangler login`, review costs, then `npm run deploy`. Do not change the existing Mintlify apex DNS. Add a separate app subdomain only after a successful deployment test. The original run endpoints accept predefined synthetic scenarios only; anyone with a run URL can see the synthetic run. This is not institutional authentication or multi-tenant isolation. Do not relax fixture-only inputs for real users.

## Acceptance checks

- Complete: all three requirement types present and matching; no admission claim.
- Missing: plan flagged with a requirement reference.
- Conflict: different company name flagged.
- Review is durable and idempotent; opposite decision returns conflict.
- Unknown IDs and extra submitted fields rejected; cross-origin mutations rejected.
- No mail, payment or finance API executed.

## Next delivery gates

Before real data: institution-approved checklist, authenticated roles and tenant isolation, private document storage, retention/deletion and deployment residency review, malware/size checks, explicit data consent, rate limits and logs without sensitive content. Add real document parsing with evidence positions, then LLM summaries with evaluated Arabic accuracy, source attribution and uncertainty. Separate deterministic completeness checks from model recommendations. Add durable Workflows and external connectors only when a concrete approved action requires them. Record baseline timing, review corrections and cost per completed file before making impact claims.

## Validation in the development environment

Five rule/transition tests pass. The Workers bundle passes Wrangler dry-run. A Miniflare runtime test passes creation, missing-item evidence, rejection of extra input/cross-origin mutation, idempotent review, conflicting review prevention, unknown-run response and state restoration after runtime restart. `wrangler dev` itself is blocked here by an OS network-interface error; Miniflare dispatch testing verifies runtime/API behaviour, not rendered browser UI. Cloudflare deployment, visual browser QA and real AI model behaviour remain unverified.

## Optional AI pilot

See [activation and validation instructions](STARTUP_AI_SETUP.md). AI is off unless `STARTUP_AI_ENABLED=true`, a private secret of at least 24 characters and an AI binding are present. Never publish the pilot secret. Unit/runtime tests use simulated model output and do not prove live model availability or Arabic quality.
