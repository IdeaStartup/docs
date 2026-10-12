import test from 'node:test';import assert from 'node:assert/strict';import {Miniflare,convertV4MiniflareOptions} from 'miniflare';import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
test('Workers/Agents persist a synthetic review and enforce API boundaries',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ifh-runtime-'));const config=()=>convertV4MiniflareOptions({name:'ifh-intake-demo',modules:true,scriptPath:'.build/worker.js',compatibilityDate:'2026-10-12',compatibilityFlags:['nodejs_compat'],durableObjects:{INTAKE_AGENT:{className:'IntakeAgent',useSQLite:true}},resourcePersistencePath:dir,host:'127.0.0.1',port:0});let mf=new Miniflare(config());
 const req=(path,body,origin='http://localhost')=>mf.dispatchFetch('http://localhost'+path,{method:body?'POST':'GET',headers:body?{Origin:origin,'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
 try{
  const created=await req('/api/runs',{scenario:'missing'});assert.equal(created.status,201);const data=await created.json();assert.equal(data.record.findings.find(f=>f.id==='plan').status,'missing');const route='/api/runs/'+data.id;
  assert.equal((await req('/api/runs',{scenario:'missing',customer:'real data'})).status,400);assert.equal((await req('/api/runs',{scenario:'__proto__'})).status,400);assert.equal((await req('/api/runs',{scenario:'complete'},'https://other.example')).status,403);
  assert.equal((await req(route+'/review',{action:'send'})).status,400);const approved=await (await req(route+'/review',{action:'approve'})).json();assert.equal(approved.record.status,'approved_demo');assert.equal((await req(route+'/review',{action:'reject'})).status,409);const again=await(await req(route+'/review',{action:'approve'})).json();assert.equal(again.record.events.length,2);
  await mf.dispose();mf=new Miniflare(config());const restored=await(await req(route)).json();assert.equal(restored.record.status,'approved_demo');assert.equal(restored.record.events.length,2);
  assert.equal((await req('/api/runs/00000000-0000-0000-0000-000000000000')).status,404);
 }finally{await mf.dispose();await rm(dir,{recursive:true,force:true});}
});
