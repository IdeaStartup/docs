export const OUTREACH_STATUSES = ['not_contacted', 'contacted', 'awaiting_reply', 'interested', 'not_interested', 'meeting', 'agreed', 'deferred'];

export function normalizeSearch(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u064B-\u065F\u0670\u0640]/g, '').toLocaleLowerCase();
}

export function filterRecords(records, {kind = 'all', category = '', location = '', query = '', contact = 'all', status = ''} = {}, statuses = {}) {
  const terms = normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
  return records.filter(record => {
    if (kind !== 'all' && record.kind !== kind) return false;
    if (category && record.category !== category) return false;
    if (location && record.location !== location) return false;
    if (contact === 'email' && !record.email) return false;
    if (contact === 'phone' && !record.phone) return false;
    if (contact === 'both' && (!record.email || !record.phone)) return false;
    if (contact === 'missing' && record.email && record.phone) return false;
    if (status && (statuses[record.id] || 'not_contacted') !== status) return false;
    const haystack = normalizeSearch([record.id, record.name, record.category, record.location, record.focus,
      record.founders, record.email, record.phone, record.website, record.notes].filter(Boolean).join(' '));
    return terms.every(term => haystack.includes(term));
  });
}

export function httpsUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; }
  catch { return null; }
}

export function csvCell(value) {
  const text = String(value ?? '');
  // Excel must read telephone numbers and untrusted leading formula characters as text.
  const safe = /^[\s\u0000-\u001f]*[=+@-]/.test(text) ? "'" + text : text;
  return '"' + safe.replace(/"/g, '""') + '"';
}

export function directoryCsv(records, statuses = {}) {
  const columns = ['id', 'kind', 'name', 'category', 'location', 'email', 'phone', 'website', 'contactPage',
    'outreach_status_browser_only', 'fundraising_or_applications', 'historical_round', 'round_amount_usd',
    'round_announced', 'notes', 'reviewed_at', 'profile_sources', 'email_sources', 'phone_sources', 'funding_sources',
    'email_evidence', 'phone_evidence'];
  const rows = records.map(r => [r.id, r.kind, r.name, r.category, r.location, r.email, r.phone, r.website, r.contactPage,
    statuses[r.id] || 'not_contacted', 'unconfirmed', r.historicalRound?.stage, r.historicalRound?.amountUSD,
    r.historicalRound?.announced, [r.notes, r.historicalRound?.note, r.eligibility, r.role].filter(Boolean).join(' / '),
    r.reviewedAt, r.sources.profile?.join(' '), r.sources.email?.join(' '), r.sources.phone?.join(' '),
    r.sources.funding?.join(' '), r.contactEvidence.email, r.contactEvidence.phone]);
  return '\uFEFF' + [columns, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
}

export function loadOutreach(storage, records) {
  try {
    const saved = JSON.parse(storage.getItem('ifh-ecosystem-outreach-v1') || '{}');
    return Object.fromEntries(records.filter(r => saved[r.id]?.name === r.name && saved[r.id]?.website === r.website &&
      OUTREACH_STATUSES.includes(saved[r.id]?.status)).map(r => [r.id, saved[r.id].status]));
  } catch { return {}; }
}

export function saveOutreach(storage, records, statuses) {
  const entries = records.filter(r => OUTREACH_STATUSES.includes(statuses[r.id]))
    .map(r => [r.id, {name: r.name, website: r.website, status: statuses[r.id]}]);
  storage.setItem('ifh-ecosystem-outreach-v1', JSON.stringify(Object.fromEntries(entries)));
}
