export const requirements = [
 {id:'profile',label:'وصف الشركة والمنتج',source:'قائمة المتطلبات الافتراضية v1 — البند 1'},
 {id:'deck',label:'عرض تقديمي للمشروع',source:'قائمة المتطلبات الافتراضية v1 — البند 2'},
 {id:'plan',label:'خطة عمل أولية',source:'قائمة المتطلبات الافتراضية v1 — البند 3'}
];
const documents = [
 {type:'profile',company:'شركة نمو التجريبية',text:'شركة افتراضية تقدم أداة لتنظيم طلبات الخدمات. المرحلة: نموذج أولي. السوق: الإمارات.'},
 {type:'deck',company:'شركة نمو التجريبية',text:'عرض تجريبي: المشكلة، المستخدم، الحل، وخطة الاختبار.'},
 {type:'plan',company:'شركة نمو التجريبية',text:'خطة تجريبية: مقابلات عملاء ثم اختبار لدى حاضنة. لا توجد نتائج تجارية مثبتة.'}
];
export const scenarios = {
 complete:{label:'ملف مكتمل',company:'شركة نمو التجريبية',documents},
 missing:{label:'ملف ناقص',company:'شركة نمو التجريبية',documents:documents.slice(0,2)},
 conflict:{label:'بيانات متعارضة',company:'شركة نمو التجريبية',documents:documents.map(d=>d.type==='plan'?{...d,company:'شركة أخرى التجريبية'}:d)}
};
export function assess(key){
 const sample=scenarios[key];if(!Object.hasOwn(scenarios,key))throw new Error('Unknown scenario');
 const findings=requirements.map(rule=>{
  const doc=sample.documents.find(d=>d.type===rule.id);
  return {...rule,status:!doc?'missing':doc.company!==sample.company?'conflict':'present',evidence:doc?`${doc.type}: اسم المنشأة = ${doc.company}`:'لا يوجد مستند من هذا النوع في العينة'};
 });
 const gaps=findings.filter(f=>f.status!=='present');
 return {sample:structuredClone(sample),findings,complete:!gaps.length,summary:gaps.length?`يوجد ${gaps.length} بند يحتاج استكمالًا أو مراجعة.`:'جميع أنواع المستندات الافتراضية موجودة ومتسقة في العينة.',draft:gaps.length?`مسودة إلى ${sample.company}: يرجى مراجعة البنود التالية: ${gaps.map(g=>g.label+(g.status==='missing'?' — مستند ناقص':' — اسم الشركة مختلف')).join('؛ ')}. هذه رسالة تجريبية لم تُرسل.`:'مسودة داخلية: الملف مكتمل وفق قائمة التجربة ويمكن إحالته إلى موظف المراجعة. هذا لا يعني قبول الشركة. لا توجد رسالة مرسلة.',method:'rules',notice:'فحص قواعد على بيانات منظمة اصطناعية؛ ليس استخراجًا من PDF أو تقييمًا بالذكاء الاصطناعي أو قرار قبول.'};
}
export function transition(record, action){
 if(!record)throw new Error('No assessment');
 if(!['approve','reject'].includes(action))throw new Error('Unknown action');
 if(record.status!=='awaiting_review'){
  if(record.status===(action==='approve'?'approved_demo':'revision_requested'))return record;
  throw new Error('Review already completed');
 }
 return {...record,status:action==='approve'?'approved_demo':'revision_requested',events:[...record.events,{at:new Date().toISOString(),type:action==='approve'?'demo_draft_approved':'demo_revision_requested'}]};
}
