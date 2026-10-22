import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {filterRecords, httpsUrl, csvCell, directoryCsv, loadOutreach, saveOutreach} from '../public/ecosystem-data.js';

const directory = JSON.parse(await readFile(new URL('../public/data/uae-ecosystem.v1.json', import.meta.url), 'utf8'));
const {records} = directory;

test('source import preserves 200 distinct records, contact coverage and unresolved funding status', async () => {
  assert.equal(records.length, 200);
  assert.equal(new Set(records.map(r => r.id)).size, 200);
  assert.equal(new Set(records.map(r => r.name)).size, 200);
  for (const [kind, emails, phones] of [['startup', 95, 60], ['funder', 71, 34]]) {
    const subset = records.filter(r => r.kind === kind);
    assert.equal(subset.length, 100);
    assert.equal(subset.filter(r => r.email).length, emails);
    assert.equal(subset.filter(r => r.phone).length, phones);
    for (const record of subset) {
      assert.ok(httpsUrl(record.website)); assert.ok(httpsUrl(record.contactPage));
      assert.equal(record.reviewedAt, '2026-10-22');
      assert.equal(record[kind === 'startup' ? 'fundraisingStatus' : 'applicationStatus'], 'unconfirmed');
      assert.ok(record.sources.profile.length);
      for (const field of ['email', 'phone']) if (record[field]) {
        assert.ok(record.sources[field].length, `${record.id} ${field} needs evidence`);
        assert.ok(record.contactEvidence[field]);
      }
      for (const sources of Object.values(record.sources)) for (const source of sources) assert.ok(httpsUrl(source));
    }
  }
  assert.equal(records.filter(r => r.historicalRound).length, 52);
  const workbook = await readFile(new URL('../public/data/UAE_Startups_Funders_200_AR.xlsx', import.meta.url));
  assert.equal(createHash('sha256').update(workbook).digest('hex'), directory.sourceWorkbookSha256);
});

test('combined search and filters operate on real bilingual directory records', () => {
  assert.deepEqual(filterRecords(records, {kind: 'startup', query: 'aLaAn دبي', contact: 'both'}).map(r => r.id), ['S001']);
  assert.equal(filterRecords(records, {query: 'أبوظبي'}).length, filterRecords(records, {query: 'ابوظبي'}).length);
  assert.equal(filterRecords(records, {query: 'no-such-company-123'}).length, 0);
  assert.equal(filterRecords(records, {kind: 'funder', contact: 'missing'}).length, 73);
  assert.equal(filterRecords(records, {category: 'التقنية المالية', kind: 'funder'}).length, 0);
  assert.deepEqual(filterRecords(records, {status: 'interested'}, {S001: 'interested'}).map(r => r.id), ['S001']);
  assert.equal(filterRecords(records, {status: 'not_contacted'}, {S001: 'interested'}).length, 199);
});

test('CSV exports every filtered result with provenance and protects Excel formula cells', () => {
  assert.equal(csvCell('+971 58 825 8554'), '"\'+971 58 825 8554"');
  assert.equal(csvCell(' =HYPERLINK("x")'), '"\' =HYPERLINK(""x"")"');
  const csv = directoryCsv(filterRecords(records, {query: 'Alaan', kind: 'startup'}), {S001: 'contacted'});
  assert.ok(csv.startsWith('\uFEFF'));
  assert.match(csv, /outreach_status_browser_only/); assert.match(csv, /contacted/);
  assert.match(csv, /https:\/\/www.alaan.com/); assert.match(csv, /unconfirmed/);
  assert.equal(httpsUrl('javascript:alert(1)'), null);
  assert.equal(httpsUrl('http://example.com'), null);
});

test('browser-local outreach survives reload and is not reassigned when a record ID changes identity', () => {
  let saved = ''; const storage = {getItem: () => saved, setItem: (_key, value) => { saved = value; }};
  saveOutreach(storage, records, {S001: 'interested', F001: 'awaiting_reply', S002: 'unsupported'});
  assert.deepEqual(loadOutreach(storage, records), {S001: 'interested', F001: 'awaiting_reply'});
  assert.deepEqual(loadOutreach(storage, [{...records[0], name: 'Different company'}]), {});
  saved = '{broken'; assert.deepEqual(loadOutreach(storage, records), {});
});
