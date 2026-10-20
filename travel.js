/* قسم السفر والحجوزات — دوال مشتركة (لا تعدّل أي شيء خارج window.TV) */
(function(){
const esc=window.ppEsc||(v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])));
const KINDS={flight:['✈️','حجز طيران'],umrah_hajj:['🕋','عمرة وحج'],tour:['🧳','رحلات سياحية'],visa:['🛂','فيزا وتأشيرات'],hotel:['🏨','حجز فنادق'],transport:['🚌','نقل ومعابر'],other:['⭐','خدمات أخرى']};
const BST={pending:['⏳','قيد المراجعة','#92400e','#fef3c7'],confirmed:['✅','مؤكد','#166534','#dcfce7'],cancelled:['❌','ملغي','#991b1b','#fee2e2'],completed:['🏁','مكتمل','#1e40af','#dbeafe']};
const OST={pending:['⏳','قيد المراجعة','#92400e','#fef3c7'],active:['✅','منشور','#166534','#dcfce7'],rejected:['❌','مرفوض','#991b1b','#fee2e2'],hidden:['🙈','مخفي','#475569','#e2e8f0']};
const CITIES=['القدس','رام الله والبيرة','بيت لحم','الخليل','نابلس','جنين','طولكرم','قلقيلية','أريحا','سلفيت','طوباس','غزة','خان يونس','رفح','دير البلح','شمال غزة','الداخل الفلسطيني','أخرى'];
const CUR={USD:'$',ILS:'₪',JOD:'د.أ',EUR:'€'};
function digits(p){return String(p||'').replace(/[^\d+]/g,'')}
function tel(p){const d=digits(p);return d?'tel:'+d:'#'}
function wa(p){let d=String(p||'').replace(/\D/g,'');if(!d)return '#';if(d.startsWith('00'))d=d.slice(2);else if(/^05[69]/.test(d))d='970'+d.slice(1);else if(d.startsWith('0'))d='972'+d.slice(1);return 'https://wa.me/'+d}
function url(u){try{u=String(u||'').trim();if(!u)return '';const x=new URL(/^https?:\/\//i.test(u)?u:'https://'+u);return /^https?:$/.test(x.protocol)?x.href:''}catch(e){return ''}}
function price(p,c){if(p===null||p===undefined||p==='')return 'السعر عند الاستفسار';const n=Number(p);if(!Number.isFinite(n))return 'السعر عند الاستفسار';return n.toLocaleString('en-US')+' '+(CUR[c]||c||'')}
function date(d){if(!d)return '';try{return new Date(d+'T00:00:00').toLocaleDateString('ar-EG-u-nu-latn',{year:'numeric',month:'short',day:'numeric'})}catch(e){return d}}
function today(){const t=new Date();return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0')}
function badge(map,k){const m=map[k]||['','',"#334155","#eef2f6"];return '<span class="tv-st" style="color:'+m[2]+';background:'+m[3]+'">'+m[0]+' '+esc(m[1]||k)+'</span>'}
function kindLabel(k){const m=KINDS[k];return m?m[0]+' '+m[1]:esc(k)}
function msg(el,text,type){if(!el)return;el.className='tv-msg'+(type?' '+type:'');el.textContent=text||'';el.style.display=text?'block':'none'}
function qs(k){return new URLSearchParams(location.search).get(k)}
function isUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v||'')}
async function need(){const u=await window.ppUser();if(!u){location.href='login.html';return null}return u}
function errText(e){const m=(e&&e.message)||'';if(/row-level security|permission denied/i.test(m))return 'لا تملك صلاحية تنفيذ هذا الإجراء.';if(/relation .* does not exist|schema cache|Could not find the table/i.test(m))return 'قسم السفر لم يُفعَّل بعد في قاعدة البيانات. شغّل ملف SUPABASE_TRAVEL_V1.sql أولًا.';return m||'حدث خطأ غير متوقع، حاول مرة أخرى.'}
window.TV={esc,KINDS,BST,OST,CITIES,tel,wa,url,price,date,today,badge,kindLabel,msg,qs,isUuid,need,errText};
})();
