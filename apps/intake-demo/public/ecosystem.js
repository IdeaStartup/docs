import {OUTREACH_STATUSES, filterRecords, httpsUrl, directoryCsv, loadOutreach, saveOutreach} from './ecosystem-data.js';

const copy = {
  ar: {
    title: 'منظومة الشركات الناشئة في الإمارات', intro: 'ابحث عن الشركات وجهات التمويل والدعم، وراجع قنوات التواصل ومصادر البيانات قبل الاستقطاب.',
    limits: 'حالات جمع التمويل وفتح التقديم غير مؤكدة. الجولات المنشورة تاريخية وقد لا تكون الأحدث. بعض السجلات تحتاج تأكيد الوجود الإماراتي الحالي؛ راجع الملاحظات. الإدراج لا يعني شراكة مع IFH.',
    copilot: 'تجهيز ملف الشركة', filters: 'البحث والتصفية', search: 'ابحث بالاسم أو القطاع أو المؤسس', kind: 'نوع السجل', all: 'الكل', startups: 'الشركات الناشئة والنامية', funders: 'التمويل والدعم', category: 'القطاع / نوع الجهة', location: 'الموقع كما ورد بالمصدر', contacts: 'توافر التواصل', hasEmail: 'يوجد بريد', hasPhone: 'يوجد هاتف', both: 'يوجد بريد وهاتف', missing: 'بيانات تحتاج استكمالاً', outreach: 'حالة التواصل في هذا المتصفح', reset: 'مسح الفلاتر', export: 'تنزيل النتائج CSV', workbook: 'ملف Excel الأصلي بالعربية',
    localNote: 'حالات التواصل تحفظ في هذا المتصفح فقط، ولا تتزامن مع الفريق. ملف Excel نسخة المصدر؛ CSV يشمل حالات هذا المتصفح. لم يرسل IFH رسائل إلى هذه الجهات.',
    languageNote: 'أوصاف السجلات والملاحظات محفوظة بلغتها الأصلية العربية، وتبقى الأسماء وبيانات التواصل كما نُشرت.', loading: 'جارٍ تحميل الدليل…', more: 'عرض المزيد', reviewed: 'مراجعة المصادر:', emailCoverage: 'بريد إلكتروني معلن', phoneCoverage: 'هاتف معلن',
    results: (count, shown) => `${count} نتيجة. المعروض: ${shown}.`, empty: 'لا توجد نتائج مطابقة. غيّر الفلاتر أو كلمات البحث.', error: 'تعذر تحميل الدليل. أعد تحميل الصفحة للمحاولة مجدداً.',
    unknown: 'غير متاح في المصادر المراجعة', website: 'الموقع الإلكتروني', contactPage: 'صفحة التواصل / التقديم', email: 'البريد الإلكتروني', phone: 'الهاتف', purpose: 'نوع قناة التواصل', source: 'المصدر', detail: 'التفاصيل ومصادر التحقق', profile: 'البيانات الأساسية', founders: 'المؤسسون المذكورون', funding: 'التمويل التاريخي', founded: 'سنة التأسيس', focus: 'التركيز العام', stage: 'المراحل المستهدفة', instrument: 'أداة التمويل / الدعم', role: 'دور الجهة', eligibility: 'الأهلية', historical: 'جولة منشورة؛ قد لا تكون الأحدث', roundDate: 'تاريخ الجولة', unconfirmed: 'حالة التمويل / التقديم الحالية غير مؤكدة',
    statuses: ['لم يتم التواصل', 'تم التواصل', 'بانتظار الرد', 'مهتم', 'غير مهتم', 'تم الاجتماع', 'تم الاتفاق', 'مؤجل'],
    storageError: 'تعذر الحفظ المحلي. تبقى حالات التواصل في ذاكرة هذه الصفحة فقط؛ نزّل CSV قبل إغلاقها.', saved: 'تم حفظ حالة التواصل في هذا المتصفح فقط.'
  },
  en: {
    title: 'UAE startup ecosystem', intro: 'Find startups, investors and support organisations. Review published contact channels and evidence before outreach.',
    limits: 'Current fundraising and application windows are unconfirmed. Published rounds are historical and may not be the latest. Some records need confirmation of their current UAE presence; check the notes. Listing does not imply an IFH partnership.',
    copilot: 'Prepare a startup dossier', filters: 'Search and filter', search: 'Search name, sector or founder', kind: 'Record type', all: 'All', startups: 'Startups and scaleups', funders: 'Funding and support', category: 'Sector / organisation type', location: 'Location as published', contacts: 'Contact availability', hasEmail: 'Email available', hasPhone: 'Phone available', both: 'Email and phone', missing: 'Incomplete contact details', outreach: 'Outreach in this browser', reset: 'Reset filters', export: 'Download results CSV', workbook: 'Original Arabic Excel workbook',
    localNote: 'Outreach statuses are saved only in this browser and do not sync with your team. Excel is the source snapshot; CSV includes this browser’s statuses. IFH has not sent messages to these organisations.',
    languageNote: 'Record descriptions and notes retain their original Arabic. Names and contact details remain as published.', loading: 'Loading directory…', more: 'Show more', reviewed: 'Sources reviewed:', emailCoverage: 'Published emails', phoneCoverage: 'Published phones',
    results: (count, shown) => `${count} results. Showing ${shown}.`, empty: 'No matching records. Adjust the filters or search terms.', error: 'The directory could not be loaded. Reload this page to retry.',
    unknown: 'Not found in reviewed sources', website: 'Website', contactPage: 'Contact / application page', email: 'Email', phone: 'Phone', purpose: 'Contact channel purpose', source: 'Source', detail: 'Details and source evidence', profile: 'Profile', founders: 'Named founders', funding: 'Historical funding', founded: 'Founded', focus: 'General focus', stage: 'Target stages', instrument: 'Funding / support instrument', role: 'Organisation role', eligibility: 'Eligibility', historical: 'Published round; may not be the latest', roundDate: 'Round announced', unconfirmed: 'Current fundraising / applications unconfirmed',
    statuses: ['Not contacted', 'Contacted', 'Awaiting reply', 'Interested', 'Not interested', 'Meeting held', 'Agreed', 'Deferred'],
    storageError: 'Local saving is unavailable. Statuses remain only in this page’s memory; export CSV before closing.', saved: 'Outreach status saved only in this browser.'
  }
};
let lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'ar';
let dataset = null, statuses = {}, visible = [], limit = 20;
const $ = id => document.getElementById(id);
const t = key => copy[lang][key];
const node = (tag, text, className) => {
  const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el;
};
function link(url, text) {
  const safe = httpsUrl(url); if (!safe) return node('span', text);
  const el = node('a', text); el.href = safe; el.target = '_blank'; el.rel = 'noopener noreferrer'; return el;
}
function original(text) { const el = node('span', text); el.dir = 'auto'; if (/[\u0600-\u06ff]/.test(text || '')) el.lang = 'ar'; return el; }
function options(select, values, current = '') {
  const all = node('option', t('all')); all.value = ''; select.replaceChildren(all);
  for (const [value, text] of values) { const option = node('option', text); option.value = value; select.append(option); }
  select.value = [...select.options].some(o => o.value === current) ? current : '';
}
function statusOptions(select, current = 'not_contacted') {
  select.replaceChildren();
  OUTREACH_STATUSES.forEach((value, i) => { const option = node('option', t('statuses')[i]); option.value = value; select.append(option); });
  select.value = current;
}
function applyLanguage() {
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = 'IFH | ' + t('title');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $('language').textContent = lang === 'ar' ? 'English' : 'العربية'; $('language').lang = lang === 'ar' ? 'en' : 'ar';
  const current = $('status').value;
  options($('status'), OUTREACH_STATUSES.map((value, i) => [value, t('statuses')[i]]), current);
  if (dataset) { populateFilters(); showStats(); render(); }
}
function populateFilters() {
  const records = dataset.records.filter(r => $('kind').value === 'all' || r.kind === $('kind').value);
  for (const key of ['category', 'location']) {
    const current = $(key).value;
    options($(key), [...new Set(records.map(r => r[key]))].sort((a, b) => a.localeCompare(b, 'ar')).map(v => [v, v]), current);
  }
}
function showStats() {
  const records = dataset.records;
  const stats = [[records.filter(r => r.kind === 'startup').length, t('startups')], [records.filter(r => r.kind === 'funder').length, t('funders')], [records.filter(r => r.email).length, t('emailCoverage')], [records.filter(r => r.phone).length, t('phoneCoverage')]];
  $('stats').replaceChildren(...stats.map(([value, label]) => { const box = node('div', undefined, 'directory-stat'); box.append(node('strong', String(value)), node('span', label)); return box; }));
  $('review-date').textContent = `${t('reviewed')} ${dataset.reviewedAt}`;
}
function field(list, label, value) {
  if (value === null || value === undefined || value === '') return;
  const term = node('dt', label), definition = node('dd'); definition.append(original(String(value))); list.append(term, definition);
}
function card(record) {
  const article = node('article', undefined, 'directory-card'); article.dataset.recordId = record.id;
  article.append(node('span', record.id, 'record-id'), node('span', t(record.kind === 'startup' ? 'startups' : 'funders'), 'pill'));
  article.append(node('h2', record.name));
  const meta = node('p', undefined, 'record-meta'); meta.append(original(`${record.category} · ${record.location}`)); article.append(meta);
  article.append(node('p', t('unconfirmed'), 'small-note'));
  if (record.notes) { const warning = node('p', undefined, 'record-warning'); warning.append(original(record.notes)); article.append(warning); }
  const contacts = node('div', undefined, 'contact-list');
  for (const [key, label] of [['email', t('email')], ['phone', t('phone')]]) {
    if (record[key]) {
      const value = record[key]; const a = node('a', value); a.setAttribute('aria-label', `${label}: ${value}`);
      a.href = key === 'email' ? 'mailto:' + encodeURIComponent(value) : 'tel:' + value.replace(/[^+0-9]/g, ''); contacts.append(a);
      const note = node('span', undefined, 'evidence-note'); note.append(original(record.contactEvidence[key] || t('unknown'))); contacts.append(note);
    } else contacts.append(node('span', `${label}: ${t('unknown')}`, 'small-note'));
  }
  const purpose = node('p', undefined, 'small-note'); purpose.append(node('strong', t('purpose') + ': '), original(record.contactPurpose)); contacts.append(purpose);
  contacts.append(link(record.website, t('website')), link(record.contactPage, t('contactPage'))); article.append(contacts);
  const label = node('label', t('outreach')); label.htmlFor = 'outreach-' + record.id;
  const status = node('select', undefined, 'record-status'); status.id = label.htmlFor; statusOptions(status, statuses[record.id] || 'not_contacted');
  status.addEventListener('change', () => {
    statuses[record.id] = status.value;
    try { saveOutreach(localStorage, dataset.records, statuses); $('storage-message').textContent = t('saved'); }
    catch { $('storage-message').textContent = t('storageError'); }
    if ($('status').value) render();
  });
  article.append(label, status);
  const details = node('details'); details.append(node('summary', t('detail'))); const list = node('dl');
  if (record.kind === 'startup') {
    field(list, t('founded'), record.founded); field(list, t('founders'), record.founders);
    if (record.historicalRound) {
      const round = record.historicalRound;
      const amount = round.amountUSD == null ? '' : ' · ' + new Intl.NumberFormat(lang === 'ar' ? 'ar-AE' : 'en-AE', {style: 'currency', currency: 'USD', maximumFractionDigits: 0}).format(round.amountUSD);
      field(list, t('historical'), round.stage + amount); field(list, t('roundDate'), round.announced); field(list, t('funding'), round.note);
    }
  } else {
    for (const key of ['focus', 'stage', 'instrument', 'role', 'eligibility']) field(list, t(key), record[key]);
  }
  field(list, t('reviewed'), record.reviewedAt); details.append(list);
  for (const [key, urls] of Object.entries(record.sources)) {
    if (!urls.length) continue;
    const row = node('div', undefined, 'source-line'); row.append(node('strong', `${t('source')} — ${t(key)}: `));
    for (const url of urls) { const safe = httpsUrl(url); if (safe) row.append(link(safe, new URL(safe).hostname.replace(/^www\./, ''))); }
    details.append(row);
  }
  article.append(details); return article;
}
function render() {
  if (!dataset) return;
  const filters = Object.fromEntries(['query', 'kind', 'category', 'location', 'contact', 'status'].map(key => [key, $(key).value]));
  visible = filterRecords(dataset.records, filters, statuses);
  const shown = visible.slice(0, limit);
  $('results').replaceChildren(...shown.map(card)); $('results').setAttribute('aria-busy', 'false');
  $('message').textContent = visible.length ? t('results')(visible.length, shown.length) : t('empty');
  $('more').hidden = shown.length >= visible.length; $('export-csv').disabled = !visible.length;
}
$('language').addEventListener('click', () => {
  lang = lang === 'ar' ? 'en' : 'ar'; const url = new URL(location.href); url.searchParams.set('lang', lang); history.replaceState(null, '', url); applyLanguage();
});
for (const key of ['query', 'kind', 'category', 'location', 'contact', 'status']) {
  $(key).addEventListener(key === 'query' ? 'input' : 'change', () => { limit = 20; if (key === 'kind' && dataset) populateFilters(); render(); });
}
$('reset').addEventListener('click', () => { $('query').value = ''; $('kind').value = 'all'; $('contact').value = 'all'; for (const key of ['category', 'location', 'status']) $(key).value = ''; if (dataset) populateFilters(); limit = 20; render(); });
$('more').addEventListener('click', () => { limit += 20; render(); });
$('export-csv').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([directoryCsv(visible, statuses)], {type: 'text/csv;charset=utf-8'}));
  const a = node('a'); a.href = url; a.download = `IFH-UAE-ecosystem-${dataset.reviewedAt}.csv`; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
applyLanguage();
try {
  const response = await fetch('/data/uae-ecosystem.v1.json', {cache: 'no-cache'});
  if (!response.ok) throw new Error('Directory unavailable');
  const payload = await response.json();
  if (payload.schemaVersion !== 1 || !Array.isArray(payload.records) || payload.records.length !== 200) throw new Error('Invalid directory');
  dataset = payload;
  try { statuses = loadOutreach(localStorage, dataset.records); } catch { $('storage-message').textContent = t('storageError'); }
  populateFilters(); showStats(); render();
} catch { $('message').textContent = t('error'); $('results').setAttribute('aria-busy', 'false'); }
