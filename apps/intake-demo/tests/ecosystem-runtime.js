import test from 'node:test';
import assert from 'node:assert/strict';
import {Miniflare, convertV4MiniflareOptions} from 'miniflare';
import {createHash} from 'node:crypto';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('Workers static routes serve the bilingual directory, data and source workbook', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ifh-directory-'));
  const mf = new Miniflare(convertV4MiniflareOptions({
    name: 'ifh-intake-demo', modules: true, scriptPath: '.build/worker.js',
    compatibilityDate: '2026-10-12', compatibilityFlags: ['nodejs_compat'],
    durableObjects: {INTAKE_AGENT: {className: 'IntakeAgent', useSQLite: true}},
    assets: {directory: './public', binding: 'ASSETS', run_worker_first: ['/api/*']},
    resourcePersistencePath: dir, host: '127.0.0.1', port: 0
  }));
  try {
    for (const lang of ['ar', 'en']) {
      const response = await mf.dispatchFetch('http://localhost/ecosystem?lang=' + lang);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /text\/html/);
      assert.match(await response.text(), /src="\/ecosystem.js"/);
    }
    const data = await mf.dispatchFetch('http://localhost/data/uae-ecosystem.v1.json');
    assert.equal(data.status, 200); const raw = await data.text(); assert.ok(raw.startsWith('{'), raw.slice(0,500)); const directory = JSON.parse(raw); assert.equal(directory.records.length, 200);
    const workbook = await mf.dispatchFetch('http://localhost' + directory.sourceWorkbook);
    assert.equal(workbook.status, 200);
    assert.equal(createHash('sha256').update(Buffer.from(await workbook.arrayBuffer())).digest('hex'), directory.sourceWorkbookSha256);
    for (const asset of ['/ecosystem.js', '/ecosystem-data.js', '/ecosystem.css']) assert.equal((await mf.dispatchFetch('http://localhost' + asset)).status, 200);
    for (const path of ['/', '/startup']) assert.match(await (await mf.dispatchFetch('http://localhost' + path)).text(), /\/ecosystem\?lang=ar/);
  } finally { await mf.dispose(); await rm(dir, {recursive: true, force: true}); }
});
