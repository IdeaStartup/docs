# Startup preparation AI pilot / تفعيل مساعد تجهيز ملفات الشركات الناشئة

## Implemented behaviour

The `/startup` questionnaire keeps its editable, downloadable deterministic draft. Two optional Workers AI actions suggest follow-up questions and an improved draft. Suggestions never automatically overwrite the current draft. Applying an AI draft resets human review; concurrent edits prevent applying a stale suggestion. Admissions and verification remain with the institution. No outbound institutional submission, browsing, attachments, lending decision, or financial integration is implemented.

Model: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, via `env.AI.run`, max 1,800 output tokens per request. Arabic quality and hallucination resistance must be assessed against real model responses before release; mock tests do not establish output quality.

## Activation in the owner's Cloudflare account

1. Review and merge this change, wait for a successful deployment. Production deploy command remains `npx wrangler deploy`, root `apps/intake-demo`. Do not change Mintlify DNS.
2. Confirm the Worker has a Workers AI binding named `AI` (declared in Wrangler for production and previews). It requires access to Workers AI in this account. If Cloudflare requests terms acceptance or a paid plan, the owner reviews and accepts that separately. No new service credentials or payment are created by this change.
3. In Worker **Settings → Variables and Secrets**, create a **Secret** named `STARTUP_AI_ACCESS_TOKEN`. Generate a random private pilot code of at least 24 characters in a password manager. Save it there; do not put it in GitHub, chat, screenshots or public documentation. Share only with authorized pilot testers. This code is not a Cloudflare API token. The UI holds it in page memory only.
4. Add a plain text variable `STARTUP_AI_ENABLED` with value `true`. Redeploy/apply changes as required by the dashboard. This flag is intentionally absent from the repository, so deployments without owner configuration stay off. Configure each preview separately; production secrets are not a promise of preview availability.
5. Open `https://app.innofinhub.com/startup`, complete fictional answers, enter the pilot code and tick consent. Test both AI actions, edit/apply a suggestion, re-check review, download and inspect the UTF-8 text. `GET /api/startup-ai` reports availability, never credentials. Availability means configuration is present, not a successful model call.
6. Disable immediately by setting `STARTUP_AI_ENABLED=false`. Rotate the pilot secret if disclosed. The deterministic questionnaire and download continue when AI is off or fails.

## Cost and data boundaries

The code admits at most **20 attempts per UTC day per deployed environment**, at least 5 seconds apart, through a single SQLite-backed Durable Object. Attempts count even if the model fails; counters survive restart. Previews use isolated counters, so this is not an account-wide billing cap. It does not bound other Workers, storage, or inference in the account. Review current account plan/usage before enabling. No dollar spending cap or free-use guarantee is asserted.

Only fictional inputs in this pilot. Consent explicitly describes sending answers and the current edited draft to Cloudflare Workers AI. The application does not store prompts or output in its database or application logs; the provider's own data processing rules still apply. Only date/count/last-request time persist for AI admission. The shared pilot code is limited access, not individual user authentication or tenant isolation. Real confidential company files require the additional gates in README.

## خطوات مختصرة بالعربية

بعد الدمج ونجاح النشر: تحقق من ربط `AI`، ثم أضف السر `STARTUP_AI_ACCESS_TOKEN` داخل Cloudflare فقط، والمتغير `STARTUP_AI_ENABLED=true`. لا ترسل السر في المحادثة. اختبر ببيانات خيالية خيار كشف النواقص ثم تحسين الصياغة. راجع الاقتراح قبل نقله إلى المسودة وتنزيلها. التفعيل لا يُثبت جودة الإجابات حتى نختبر النموذج الفعلي. الحد 20 محاولة يومياً لكل بيئة، وليس سقف فاتورة للحساب.

## References

- https://developers.cloudflare.com/workers-ai/configuration/bindings/
- https://developers.cloudflare.com/workers-ai/models/llama-3.3-70b-instruct-fp8-fast/
- https://developers.cloudflare.com/workers-ai/platform/pricing/
