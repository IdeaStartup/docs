// Test-only entrypoint; never deployed. Exposes budget RPC results for Miniflare tests.
import {IntakeAgent} from '../.build/worker.js';
export {IntakeAgent};
export default {async fetch(request,env){const stub=env.INTAKE_AGENT.get(env.INTAKE_AGENT.idFromName('test-budget'));return Response.json(await stub.reserveStartupAi());}};
