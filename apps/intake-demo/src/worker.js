import {Agent, getAgentByName} from 'agents';
import {assess,scenarios,transition} from './assessment.js';
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
export class IntakeAgent extends Agent {
 initialState={record:null};
 async start(scenario){
  if(this.state.record)return this.state.record;
  const now=new Date().toISOString();
  const record={...assess(scenario),status:'awaiting_review',createdAt:now,events:[{at:now,type:'synthetic_assessment_created'}]};
  this.setState({record});return record;
 }
 async read(){return this.state.record;}
 async review(action){const record=transition(this.state.record,action);this.setState({record});return record;}
}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(request);
  if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)return json({error:'Same-origin request required'},403);
  try{
   if(url.pathname==='/api/scenarios'&&request.method==='GET')return json({scenarios:Object.entries(scenarios).map(([id,s])=>({id,label:s.label})),mode:'synthetic-rules-demo'});
   if(url.pathname==='/api/runs'&&request.method==='POST'){
    const raw=await request.text();if(raw.length>512)return json({error:'Input too large'},413);
    const body=JSON.parse(raw);
    if(Object.keys(body).some(k=>k!=='scenario')||!Object.hasOwn(scenarios,body.scenario))return json({error:'Only predefined synthetic scenarios are accepted'},400);
    const id=crypto.randomUUID();const agent=await getAgentByName(env.INTAKE_AGENT,id);const record=await agent.start(body.scenario);return json({id,record},201);
   }
   const match=url.pathname.match(/^\/api\/runs\/([0-9a-f-]{36})(\/review)?$/);
   if(!match)return json({error:'Not found'},404);
   const agent=await getAgentByName(env.INTAKE_AGENT,match[1]);
   if(request.method==='GET'&&!match[2]){const record=await agent.read();return record?json({id:match[1],record}):json({error:'Run not found'},404);}
   if(request.method==='POST'&&match[2]){
    const raw=await request.text();if(raw.length>128)return json({error:'Input too large'},413);
    const body=JSON.parse(raw);if(Object.keys(body).some(k=>k!=='action')||!['approve','reject'].includes(body.action))return json({error:'Invalid review action'},400);
    if(!await agent.read())return json({error:'Run not found'},404);
    try{return json({id:match[1],record:await agent.review(body.action)});}catch{return json({error:'Review already completed'},409);}
   }
   return json({error:'Method not allowed'},405);
  }catch(error){return json({error:error instanceof SyntaxError?'Invalid JSON':'Processing failed'},error instanceof SyntaxError?400:500);}
 }
};
