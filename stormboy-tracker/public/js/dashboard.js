const STG=[{id:'64066367',n:'Qualified Account',c:'#3B82F6'},{id:'2929183214',n:'Discovery Call',c:'#8B5CF6'},{id:'64066368',n:'Strategy Call',c:'#F59E0B'},{id:'64066369',n:'SLA/KCT Mapping',c:'#EF4444'},{id:'1026535686',n:'KCT Issued',c:'#2D6A4F'},{id:'231921676',n:'Closed Won',c:'#34D399'}];
const SM=Object.fromEntries(STG.map(s=>[s.id,s]));
const MD=86400000;
const DP=['dealname','dealstage','pipeline','createdate','closedate','amount','num_contacted_notes','num_notes',...STG.flatMap(s=>['hs_v2_date_entered_'+s.id,'hs_v2_cumulative_time_in_'+s.id])];
let deals=[],sbIds=new Set(),tab='overview',ch={},processedCache=null,pipeFilter='all',sbContacts=null,renderGen=0;
// Last-viewed tab persistence: first visit lands on Overview; subsequent visits restore.
try{const saved=localStorage.getItem('stormboy_tab');if(saved)tab=saved;}catch(e){}

async function hs(p){const r=await fetch('/api/hubspot/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});if(!r.ok)throw new Error('HubSpot '+r.status);return await r.json();}
function lg(m,e){const el=document.getElementById('ll');if(el){const d=document.createElement('div');d.className='lg'+(e?' lge':'');d.textContent=new Date().toLocaleTimeString()+' '+m;el.appendChild(d);el.scrollTop=el.scrollHeight;}}
function lm(m){const el=document.getElementById('lm');if(el)el.textContent=m;}
function setst(m){document.getElementById('st').textContent=m;}
function md2h(s){if(!s)return'';return s
  .replace(/^### (.+)$/gm,'<h4 style="font-size:14px;font-weight:600;margin:16px 0 6px">$1</h4>')
  .replace(/^## (.+)$/gm,'<h3 style="font-size:15px;font-weight:600;margin:18px 0 8px;color:var(--text)">$1</h3>')
  .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
  .replace(/\n\n/g,'</p><p style="margin:8px 0">')
  .replace(/\n- /g,'</p><ul style="margin:6px 0 6px 20px"><li>')
  .replace(/<\/li>(?=<li>)/g,'</li>')
  .replace(/^- (.+)$/gm,'<li>$1</li>')
  .replace(/\n/g,'<br>');}

const TABS=[['overview','Overview'],['plays','Plays'],['pipeline','Active Pipeline'],['wins','Recent Wins'],['patterns','Patterns'],['losses','Loss Analysis'],['funnel','SB Funnel'],['evolution','Process Evolution'],['ranking','Deal Ranking'],['trends','Trends'],['deepdive','Deep Dive']];
// Validate persisted tab against current TABS (in case names change); fall back to overview.
if(!TABS.find(t=>t[0]===tab))tab='overview';
document.getElementById('tb').innerHTML=TABS.map(([k,l])=>'<button class="tab'+(k===tab?' on':'')+'" data-t="'+k+'">'+l+'</button>').join('');
document.getElementById('tb').onclick=e=>{if(!e.target.dataset.t)return;document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));e.target.classList.add('on');tab=e.target.dataset.t;try{localStorage.setItem('stormboy_tab',tab);}catch(_){}render();};

async function fetchSB(){
  sbIds=new Set();
  try{lg('Stormboy contacts...');let cIds=[],off=0;
  while(true){const r=await hs({objectType:'CONTACT',filterGroups:[{filters:[{propertyName:'storm_boy_campaign_member',operator:'EQ',value:'Yes'},{propertyName:'num_associated_deals',operator:'GT',value:'0'}]}],properties:['firstname'],limit:200,offset:off});const pg=r.results||[];cIds.push(...pg.map(c=>Number(c.id)));lg('Contacts: +'+pg.length+' ('+cIds.length+'/'+(r.total||'?')+')');if(!pg.length||cIds.length>=(r.total||0)||pg.length<200)break;off=r.offset||(off+200);}
  if(!cIds.length){lg('No SB contacts with deals');return;}
  lg('Looking up contact-deal associations...');
  const ar=await fetch('/api/hubspot/associations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fromType:'contacts',toType:'deals',ids:cIds})});
  if(!ar.ok)throw new Error('Associations '+ar.status);
  const assoc=await ar.json();
  Object.values(assoc.results||{}).forEach(dealIds=>dealIds.forEach(id=>sbIds.add(String(id))));
  lg(sbIds.size+' SB deals');
  }catch(e){lg('SB failed: '+e.message,true);}
}
async function fetchDeals(){
  deals=[];const seen=new Set();
  function add(a){a.forEach(d=>{if(!seen.has(d.id)){seen.add(d.id);deals.push(d);}});}
  async function fs(sid){let res=[],off=0;while(true){const r=await hs({objectType:'DEAL',filterGroups:[{filters:[{propertyName:'pipeline',operator:'EQ',value:'default'},{propertyName:'dealstage',operator:'EQ',value:sid}]}],properties:DP,limit:200,offset:off});const pg=r.results||[];res.push(...pg);if(!pg.length||res.length>=(r.total||0)||pg.length<200)break;off=r.offset||(off+200);}return res;}
  for(const[sid,label]of[['231921676','Closed Won'],['closedlost','Closed Lost'],['64066367','Qualified Account'],['2929183214','Discovery Call'],['64066368','Strategy Call'],['64066369','SLA/KCT Mapping'],['1026535686','KCT Issued']]){lm(label+'...');lg(label+'...');add(await fs(sid));}
  lg('Total: '+deals.length);
}

function proc(raw){
  const p=raw.properties||{};
  const d={id:String(raw.id),name:(p.dealname||'Unnamed').trim()||'Unnamed',stage:p.dealstage,created:p.createdate?new Date(p.createdate):null,closed:p.closedate?new Date(p.closedate):null,amount:parseFloat(p.amount)||0,notes:parseInt(p.num_contacted_notes||'0'),totalNotes:parseInt(p.num_notes||'0'),stages:{},isSB:sbIds.has(String(raw.id)),era:'Legacy',days:null,conf:'high',url:'https://app.hubspot.com/contacts/24224559/record/0-3/'+raw.id};
  STG.forEach(s=>{const ent=p['hs_v2_date_entered_'+s.id];const ms=parseInt(p['hs_v2_cumulative_time_in_'+s.id]||'0');d.stages[s.id]={entered:ent?new Date(ent):null,days:ms>0?ms/MD:0};});
  d.era=eraOf(d);const first=d.stages['64066367'].entered||d.created;
  if(['231921676','closedlost'].includes(d.stage)&&d.closed&&first)d.days=Math.round((d.closed-first)/MD);
  else if(first)d.days=Math.round((new Date()-first)/MD);
  const ec=STG.filter(s=>d.stages[s.id].entered).length;if(ec<=1)d.conf='low';else if(ec<=3)d.conf='med';
  return d;
}
function eraOf(d){if(d.isSB)return d.stages['2929183214'].entered?'Stormboy v2':'Stormboy v1';if(d.stages['1026535686'].entered)return'KCT Process';const dt=d.stages['64066367'].entered||d.created;if(dt&&dt<new Date('2025-03-07'))return'Legacy';return'KCT Process';}
function ecl(e){return e==='Legacy'?'e-leg':e==='KCT Process'?'e-kct':e==='Stormboy v1'?'e-sb1':'e-sb2'}
function ccl(c){return c==='high'?'ch':c==='med'?'cm':'cl'}
function bench(ds){const s=ds.filter(d=>d.days!=null&&d.days>0).map(d=>d.days).sort((a,b)=>a-b);if(!s.length)return{p25:0,p50:0,p75:0,avg:0,n:0};const pc=p=>{const i=(s.length-1)*p,lo=Math.floor(i);return lo===i?s[lo]:s[lo]+(s[lo+1]-s[lo])*(i-lo)};return{p25:Math.round(pc(.25)),p50:Math.round(pc(.5)),p75:Math.round(pc(.75)),avg:Math.round(s.reduce((a,b)=>a+b,0)/s.length),n:s.length};}
function sbench(ds,sid){const v=ds.map(d=>d.stages[sid]?.days||0).filter(x=>x>0).sort((a,b)=>a-b);if(!v.length)return{p50:0,n:0};const m=Math.floor(v.length/2);return{p50:Math.round(v.length%2?v[m]:(v[m-1]+v[m])/2),n:v.length};}
function sbar(d){const tot=STG.reduce((s,st)=>s+(d.stages[st.id]?.days||0),0)||1;return'<div class="sb" title="'+STG.map(s=>s.n+': '+Math.round(d.stages[s.id]?.days||0)+'d').join(' → ')+'">'+STG.map(s=>{const dy=d.stages[s.id]?.days||0,pc=(dy/tot)*100;return pc>0?'<div style="width:'+Math.max(pc,2)+'%;background:'+s.c+'"></div>':'';}).join('')+'</div>';}
function dc(){Object.values(ch).forEach(c=>{try{c.destroy()}catch(e){}});ch={};}
function safeChart(id,cfg){const cv=document.getElementById(id);if(!cv)return null;try{const c=new Chart(cv,cfg);return c;}catch(e){console.warn('Chart '+id+' failed:',e);return null;}}
function getAll(){if(!processedCache)processedCache=deals.map(proc);return processedCache;}

function render(){
  dc();processedCache=null;renderGen++;const m=document.getElementById('mn');
  // Plays and Patterns are driven by the coaching cache, not HubSpot. They render
  // independently of `deals` so the dashboard works pre-token (mock-data demo) and
  // when the HubSpot fetch fails.
  if(!deals.length){
    if(tab==='plays'){rPlays(m,[],[]);return;}
    if(tab==='patterns'){rPatterns(m,[],[],[]);return;}
    m.innerHTML='<div class="cd">No deals loaded. Click Refresh.</div>';return;
  }
  const all=getAll(),cw=all.filter(d=>d.stage==='231921676'),act=all.filter(d=>!['231921676','closedlost'].includes(d.stage)),lost=all.filter(d=>d.stage==='closedlost');
  switch(tab){
    case'overview':rOverview(m,all,cw,act,lost);break;
    case'plays':rPlays(m,all,act);break;
    case'pipeline':rPipe(m,act,cw);break;
    case'wins':rWins(m,all,cw);break;
    case'patterns':rPatterns(m,all,cw,lost);break;
    case'losses':rLosses(m,all,cw,act,lost);break;
    case'funnel':rFunnel(m,all,cw);break;
    case'evolution':rEvo(m,all,cw);break;
    case'ranking':rRank(m,cw);break;
    case'trends':rTrend(m,cw);break;
    case'deepdive':rDD(m,all);break;
  }
}

// === OVERVIEW ===
function rOverview(el,all,cw,act,lost){
  const b=bench(cw),eras={};all.forEach(d=>{eras[d.era]=(eras[d.era]||0)+1});
  const sbA=all.filter(d=>d.era.startsWith('Stormboy')),sbW=cw.filter(d=>d.era.startsWith('Stormboy')),preW=cw.filter(d=>!d.era.startsWith('Stormboy'));
  const sbB=bench(sbW),preB=bench(preW);
  const winRate=cw.length&&(cw.length+lost.length)?Math.round(cw.length/(cw.length+lost.length)*100):0;
  el.innerHTML=`<div class="ks">
    <div class="k h"><div class="kl">Total Deals</div><div class="kv">${all.length}</div><div class="ksub">${cw.length} won · ${act.length} active · ${lost.length} lost</div></div>
    <div class="k h"><div class="kl">Median Conversion</div><div class="kv">${b.p50}d</div><div class="ksub">P25: ${b.p25}d · P75: ${b.p75}d</div></div>
    <div class="k"><div class="kl">Win Rate</div><div class="kv">${winRate}%</div><div class="ksub">${cw.length} / ${cw.length+lost.length} closed</div></div>
    <div class="k"><div class="kl">Pre-SB Median</div><div class="kv">${preB.n?preB.p50+'d':'—'}</div><div class="ksub">${preB.n} deals</div></div>
    <div class="k"><div class="kl">Stormboy Median</div><div class="kv">${sbB.n?sbB.p50+'d':'—'}</div><div class="ksub">${sbB.n} deals</div></div>
    <div class="k"><div class="kl">SB Pipeline</div><div class="kv">${sbA.length}</div><div class="ksub">${sbA.length-sbW.length-lost.filter(d=>d.era.startsWith('Stormboy')).length} active</div></div>
  </div><div class="sg"><div class="cd"><h2>Era Breakdown</h2><canvas id="c1"></canvas></div><div class="cd"><h2>Conversion Distribution</h2><div class="cw"><canvas id="c2"></canvas></div></div></div>
  <div class="cd"><h2>Timeline</h2>
    <div class="ml"><div class="md">Pre-2025</div><div class="mt">Legacy — Qualified → Strategy → SLA/KCT Mapping → Closed Won</div></div>
    <div class="ml"><div class="md">7 Mar 2025</div><div class="mt">KCT Issued stage added</div></div>
    <div class="ml"><div class="md">~13 Jan 2026</div><div class="mt">Operation Stormboy launched</div></div>
    <div class="ml"><div class="md">22 Apr 2026</div><div class="mt">Discovery Call added — Recruitment Process v2</div></div>
  </div>`;
  const eL=Object.keys(eras),eC=eL.map(e=>e==='Legacy'?'#94A3B8':e==='KCT Process'?'#3B82F6':e==='Stormboy v1'?'#34D399':'#2D6A4F');
  ch.c1=safeChart('c1',{type:'doughnut',data:{labels:eL,datasets:[{data:Object.values(eras),backgroundColor:eC,borderWidth:0}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{font:{family:'Inter',size:12},color:'#6B7C8D'}}}}});
  const bins=[0,30,60,90,120,180,240,360,999],bL=bins.slice(0,-1).map((x,i)=>i===bins.length-2?x+'+':x+'-'+bins[i+1]),pC=Array(bins.length-1).fill(0),sC=Array(bins.length-1).fill(0);
  cw.forEach(d=>{if(d.days==null)return;const i=bins.findIndex((x,j)=>j<bins.length-1&&d.days>=x&&d.days<bins[j+1]);if(i<0)return;d.era.startsWith('Stormboy')?sC[i]++:pC[i]++;});
  ch.c2=safeChart('c2',{type:'bar',data:{labels:bL,datasets:[{label:'Pre-Stormboy',data:pC,backgroundColor:'#3B82F6',borderRadius:4},{label:'Stormboy',data:sC,backgroundColor:'#2D6A4F',borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,scales:{x:{grid:{display:false},ticks:{font:{family:'Inter',size:11},color:'#6B7C8D'}},y:{beginAtZero:true,ticks:{font:{family:'Inter',size:11},color:'#6B7C8D'},grid:{color:'#E2E8F0'}}},plugins:{legend:{labels:{font:{family:'Inter',size:12},color:'#6B7C8D'}}}}});
  // Surface highest-risk deal from coaching cache as a callout (no-op if cache empty).
  if(typeof mountAttentionWidget==='function')mountAttentionWidget(el);
}

// === RECENT WINS ===
function rWins(el,all,cw){
  const sorted=[...cw].filter(d=>d.days!=null).sort((a,b)=>(b.closed||0)-(a.closed||0));
  const b=bench(cw);
  // Per-stage benchmarks for comparison
  const stageMed={};
  STG.forEach(s=>{const vals=cw.map(d=>d.stages[s.id]?.days||0).filter(x=>x>0).sort((a,b)=>a-b);if(vals.length){const m=Math.floor(vals.length/2);stageMed[s.id]=Math.round(vals.length%2?vals[m]:(vals[m-1]+vals[m])/2);}else stageMed[s.id]=0;});
  // Max stage days for bar scaling
  let maxDays=1;sorted.forEach(d=>STG.forEach(s=>{const dy=d.stages[s.id]?.days||0;if(dy>maxDays)maxDays=dy;}));
  const maxForBar=Math.max(maxDays,Math.max(...Object.values(stageMed),1));

  let panels=sorted.map((d,i)=>{
    const delta=b.p50?Math.round((1-d.days/b.p50)*100):0;
    const deltaClass=delta>10?'fast':delta<-10?'slow':'avg';
    const deltaLabel=delta>0?delta+'% faster':delta<0?Math.abs(delta)+'% slower':'On median';
    const closedStr=d.closed?d.closed.toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}):'—';

    // Stage rows with vs-benchmark
    const stageRows=STG.map(s=>{
      const dy=Math.round(d.stages[s.id]?.days||0);
      const med=stageMed[s.id];
      const entered=d.stages[s.id]?.entered;
      const barPct=Math.round((dy/maxForBar)*100);
      const benchPct=med?Math.round((med/maxForBar)*100):0;
      let cmpText='',cmpClass='na';
      if(dy>0&&med>0){const diff=Math.round((1-dy/med)*100);cmpText=diff>0?'↓'+diff+'% faster':diff<0?'↑'+Math.abs(diff)+'% slower':'= median';cmpClass=diff>5?'faster':diff<-5?'slower':'na';}
      else if(!entered){cmpText='Skipped';cmpClass='na';}
      return`<div class="ws-row">
        <div class="ws-dot" style="background:${s.c}"></div>
        <div class="ws-name">${s.n}</div>
        <div class="ws-bar-bg"><div class="ws-bar" style="width:${Math.max(barPct,dy>0?2:0)}%;background:${s.c};opacity:0.8"></div>${benchPct>0?'<div class="ws-bar-bench" style="width:'+benchPct+'%"></div>':''}</div>
        <div class="ws-val">${dy>0?dy+'d':entered?'<1d':'—'}</div>
        <div class="ws-cmp ${cmpClass}">${cmpText}</div>
        <div class="ws-date">${entered?entered.toLocaleDateString('en-AU',{day:'numeric',month:'short'}):'—'}</div>
      </div>`;
    }).join('');

    return`<div class="wp" id="wp_${i}">
      <div class="wp-head" onclick="toggleWin(${i})">
        <span class="wp-chevron">▸</span>
        <span class="wp-name">${d.name}</span>
        <div class="wp-meta">
          <span class="eb ${ecl(d.era)}">${d.era}</span>
          <span class="wp-days">${d.days}d</span>
          <span class="wp-delta ${deltaClass}">${deltaLabel}</span>
        </div>
      </div>
      <div class="wp-body">
        <div class="wp-footer" style="margin-top:0;margin-bottom:12px">
          <span>Closed: ${closedStr}</span>
          <span>Created: ${d.created?d.created.toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}):'—'}</span>
          <span>Engagement notes: ${d.notes}</span>
          <span class="cf ${ccl(d.conf)}">${d.conf} confidence</span>
          <a class="dl" href="${d.url}" target="_blank" style="margin-left:auto">HubSpot →</a>
        </div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:4px">Dashed line = median benchmark for all won deals</div>
        <div class="wp-stages">${stageRows}</div>
        <div class="wp-insight" id="wi_${i}">
          <button class="ab" onclick="event.stopPropagation();winInsight(${i})" style="font-size:12px;padding:4px 14px">Generate insight</button>
        </div>
      </div>
    </div>`;
  }).join('');

  el.innerHTML=`
    <div class="ks">
      <div class="k h"><div class="kl">Won Deals</div><div class="kv">${cw.length}</div></div>
      <div class="k"><div class="kl">Fastest</div><div class="kv">${sorted[0]?.days||'—'}d</div><div class="ksub">${sorted[0]?.name||''}</div></div>
      <div class="k"><div class="kl">Median</div><div class="kv">${b.p50}d</div><div class="ksub">P25: ${b.p25}d · P75: ${b.p75}d</div></div>
      <div class="k"><div class="kl">Most Recent</div><div class="kv">${sorted[0]?.closed?sorted[0].closed.toLocaleDateString('en-AU',{day:'numeric',month:'short'}):'—'}</div><div class="ksub">${sorted[0]?.name||''}</div></div>
    </div>
    <div class="cd" style="border-left:3px solid var(--accent)">
      <h2>Patterns Across Recent Wins</h2>
      <div id="winPatterns"><button class="ab" onclick="winPatternAi()">Synthesise patterns from recent wins</button></div>
    </div>
    <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:13px;font-weight:500">Won deals — most recent first</span>
      <span style="font-size:12px;color:var(--muted)">Click to expand · dashed line = median</span>
    </div>
    ${panels}`;
}

window.toggleWin=function(i){
  const wp=document.getElementById('wp_'+i);
  if(!wp)return;
  const wasOpen=wp.classList.contains('open');
  // Close all
  document.querySelectorAll('.wp.open').forEach(w=>w.classList.remove('open'));
  if(!wasOpen)wp.classList.add('open');
};

window.winInsight=async function(i){
  const all=getAll(),cw=all.filter(d=>d.stage==='231921676').sort((a,b)=>(b.closed||0)-(a.closed||0));
  const d=cw[i];if(!d)return;
  const el=document.getElementById('wi_'+i);
  el.innerHTML='<span class="wp-insight-loading">Analysing deal journey...</span>';
  const b=bench(cw);
  const stageMed={};STG.forEach(s=>{const vals=cw.map(dd=>dd.stages[s.id]?.days||0).filter(x=>x>0).sort((a,b)=>a-b);if(vals.length){const m=Math.floor(vals.length/2);stageMed[s.id]=Math.round(vals.length%2?vals[m]:(vals[m-1]+vals[m])/2);}});
  // Pre-compute the interesting signals
  let fastest=null,slowest=null,skipped=[];
  STG.forEach(s=>{
    const dy=Math.round(d.stages[s.id]?.days||0),med=stageMed[s.id]||0;
    if(!d.stages[s.id]?.entered){skipped.push(s.n);return;}
    if(med>0){
      const delta=Math.round((1-dy/med)*100);
      if(!fastest||delta>(fastest.delta||0))fastest={stage:s.n,days:dy,med,delta};
      if(!slowest||delta<(slowest.delta||0))slowest={stage:s.n,days:dy,med,delta};
    }
  });
  const prompt=`You're an AgriProve sales process analyst. Analyse what worked (or didn't) for this specific won deal and extract one actionable takeaway.

Deal: ${d.name} | Era: ${d.era} | Total: ${d.days}d (median ${b.p50}d — ${d.days<b.p50?'faster':'slower'} than typical)
${fastest?'Fastest stage: '+fastest.stage+' at '+fastest.days+'d vs '+fastest.med+'d median ('+fastest.delta+'% faster)':''}
${slowest?'Slowest stage: '+slowest.stage+' at '+slowest.days+'d vs '+slowest.med+'d median ('+Math.abs(slowest.delta)+'% slower)':''}
${skipped.length?'Skipped stages: '+skipped.join(', '):'All stages traversed'}
Engagement notes: ${d.notes}
Created: ${d.created?.toLocaleDateString()} | Closed: ${d.closed?.toLocaleDateString()}

Give: (1) one sentence on what was distinctive about this deal's journey, (2) one specific actionable insight that could be applied to current pipeline deals. Be concrete — name the stages and numbers.`;
  try{const r=await fetch('/api/ai/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})}).then(r=>{if(!r.ok)throw new Error('AI '+r.status);return r.json();});const txt=typeof r==='string'?r:r&&r.text?r.text:(r&&r.content&&r.content[0]?r.content[0].text:JSON.stringify(r));el.innerHTML=md2h(txt);}catch(e){el.innerHTML='<span style="color:var(--error)">Failed: '+e.message+'</span>';}
};

window.winPatternAi=async function(){
  const el=document.getElementById('winPatterns');
  el.innerHTML='<span class="wp-insight-loading">Synthesising patterns across recent wins...</span>';
  const all=getAll(),cw=all.filter(d=>d.stage==='231921676'&&d.days!=null).sort((a,b)=>(b.closed||0)-(a.closed||0));
  const recent=cw.slice(0,10);const b=bench(cw);
  const stageMed={};STG.forEach(s=>{const vals=cw.map(d=>d.stages[s.id]?.days||0).filter(x=>x>0).sort((a,b)=>a-b);if(vals.length){const m=Math.floor(vals.length/2);stageMed[s.id]=Math.round(vals.length%2?vals[m]:(vals[m-1]+vals[m])/2);}});
  // Pre-compute signals
  const eraCounts={};recent.forEach(d=>{eraCounts[d.era]=(eraCounts[d.era]||0)+1;});
  const fastDeals=recent.filter(d=>d.days<b.p50);
  const slowDeals=recent.filter(d=>d.days>b.p75);
  // Find which stage most often bottlenecks
  const bottlenecks={};recent.forEach(d=>{let worst=null,worstDelta=-999;STG.forEach(s=>{const dy=d.stages[s.id]?.days||0,med=stageMed[s.id]||0;if(med>0){const delta=dy/med;if(delta>worstDelta){worstDelta=delta;worst=s.n;}}});if(worst)bottlenecks[worst]=(bottlenecks[worst]||0)+1;});
  const topBottleneck=Object.entries(bottlenecks).sort(([,a],[,b])=>b-a)[0];

  const prompt=`You're an AgriProve sales process analyst. Synthesise patterns from the 10 most recent won deals into actionable insights.

Overall: ${cw.length} total won, median ${b.p50}d, P25 ${b.p25}d, P75 ${b.p75}d
Recent 10: ${recent.map(d=>d.name+' ('+d.era+', '+d.days+'d)').join('; ')}
Era mix in recent 10: ${Object.entries(eraCounts).map(([e,c])=>e+': '+c).join(', ')}
${fastDeals.length} below median, ${slowDeals.length} above P75
Most common bottleneck stage: ${topBottleneck?topBottleneck[0]+' ('+topBottleneck[1]+'/10 deals)':'none'}
Stage medians: ${STG.map(s=>s.n+': '+stageMed[s.id]+'d').join(', ')}

Give exactly 3 insights: (1) What pattern distinguishes the fast wins from the slow ones? (2) What's the single biggest process bottleneck and what would fix it? (3) One specific thing to do differently for the current active pipeline based on these wins. Be concrete with stage names and numbers.`;
  try{const r=await fetch('/api/ai/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})}).then(r=>{if(!r.ok)throw new Error('AI '+r.status);return r.json();});const txt=typeof r==='string'?r:r&&r.text?r.text:(r&&r.content&&r.content[0]?r.content[0].text:JSON.stringify(r));el.innerHTML='<div class="ar">'+md2h(txt)+'</div>';}catch(e){el.innerHTML='<span style="color:var(--error)">Failed: '+e.message+'</span>';}
};


// === LOSS ANALYSIS ===
function lastStage(d){
  // Find the furthest stage this deal reached
  const order=['64066367','2929183214','64066368','64066369','1026535686','231921676'];
  let last=null;
  for(const sid of order){if(d.stages[sid]?.entered)last=sid;}
  return last;
}
function rLosses(el,all,cw,act,lost){
  const totalClosed=cw.length+lost.length;
  const lossRate=totalClosed?Math.round(lost.length/totalClosed*100):0;
  const eras=['All','Legacy','KCT Process','Stormboy v1','Stormboy v2'];
  // Era-level stats
  const eraStats={};eras.forEach(e=>{
    const fd=e==='All'?all:all.filter(d=>d.era===e);
    const fw=e==='All'?cw:cw.filter(d=>d.era===e);
    const fl=e==='All'?lost:lost.filter(d=>d.era===e);
    const tc=fw.length+fl.length;
    eraStats[e]={total:fd.length,won:fw.length,lost:fl.length,closed:tc,lossRate:tc?Math.round(fl.length/tc*100):0,active:(e==='All'?act:act.filter(d=>d.era===e)).length};
  });
  // Stage drop-off: for lost deals, find where they stalled
  const stageOfLoss={};lost.forEach(d=>{const ls=lastStage(d);if(ls){const n=SM[ls]?.n||ls;stageOfLoss[n]=(stageOfLoss[n]||0)+1;}});
  const sortedDropoff=Object.entries(stageOfLoss).sort(([,a],[,b])=>b-a);
  const worstStage=sortedDropoff[0];
  // Funnel: how many deals entered each stage (all closed deals)
  const funnelAll={},funnelWon={},funnelLost={};
  const stageOrder=STG.map(s=>s.id);
  stageOrder.forEach(sid=>{
    funnelAll[sid]=all.filter(d=>d.stages[sid]?.entered).length;
    funnelWon[sid]=cw.filter(d=>d.stages[sid]?.entered).length;
    funnelLost[sid]=lost.filter(d=>d.stages[sid]?.entered).length;
  });
  const maxFunnel=Math.max(...Object.values(funnelAll),1);

  // Lost deal panels (sorted by most recent close, then by age)
  const sortedLost=[...lost].sort((a,b)=>(b.closed||b.created||0)-(a.closed||a.created||0));

  // Per-stage benchmarks from won deals
  const stageMed={};
  STG.forEach(s=>{const vals=cw.map(d=>d.stages[s.id]?.days||0).filter(x=>x>0).sort((a,b)=>a-b);if(vals.length){const m=Math.floor(vals.length/2);stageMed[s.id]=Math.round(vals.length%2?vals[m]:(vals[m-1]+vals[m])/2);}else stageMed[s.id]=0;});

  // Quarterly loss rate trend
  const qData={};[...cw,...lost].forEach(d=>{if(!d.closed)return;const k=d.closed.getFullYear()+' Q'+Math.ceil((d.closed.getMonth()+1)/3);if(!qData[k])qData[k]={w:0,l:0};d.stage==='231921676'?qData[k].w++:qData[k].l++;});
  const sqd=Object.entries(qData).sort(([a],[b])=>a.localeCompare(b));

  // Build funnel HTML
  const funnelHtml=STG.map((s,i)=>{
    const cnt=funnelAll[s.id];
    const pct=maxFunnel?Math.round(cnt/maxFunnel*100):0;
    const prevCnt=i>0?funnelAll[stageOrder[i-1]]:cnt;
    const dropPct=prevCnt?Math.round((1-cnt/prevCnt)*100):0;
    return`<div class="fn-step">
      <div class="fn-bar-wrap"><div class="fn-bar" style="height:${Math.max(pct,3)}%;background:${s.c}"><span class="fn-pct">${cnt}</span></div></div>
      <div class="fn-lbl">${s.n}</div>
      ${i>0&&dropPct>0?'<div class="fn-drop">-'+dropPct+'%</div>':''}
    </div>`;
  }).join('');

  // Build lost deal panels
  let maxSD=1;sortedLost.forEach(d=>STG.forEach(s=>{const dy=d.stages[s.id]?.days||0;if(dy>maxSD)maxSD=dy;}));
  const maxForBar=Math.max(maxSD,Math.max(...Object.values(stageMed),1));
  const lostPanels=sortedLost.map((d,i)=>{
    const ls=lastStage(d);const lsName=ls?SM[ls]?.n||ls:'Unknown';
    const age=d.days||'?';
    const closedStr=d.closed?d.closed.toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}):'—';

    const stageRows=STG.map(s=>{
      const dy=Math.round(d.stages[s.id]?.days||0);
      const med=stageMed[s.id];
      const entered=d.stages[s.id]?.entered;
      const barPct=maxForBar?Math.round((dy/maxForBar)*100):0;
      const benchPct=med&&maxForBar?Math.round((med/maxForBar)*100):0;
      let cmpText='',cmpClass='na';
      if(dy>0&&med>0){const diff=Math.round((1-dy/med)*100);cmpText=diff>0?'↓'+diff+'% faster':diff<0?'↑'+Math.abs(diff)+'% slower':'= median';cmpClass=diff>5?'faster':diff<-5?'slower':'na';}
      else if(!entered){cmpText='Never reached';cmpClass='na';}
      const isLast=s.id===ls;
      return'<div class="ws-row"'+(isLast?' style="background:rgba(239,68,68,0.05);border-radius:4px;padding:6px 4px"':'')+'>'+
        '<div class="ws-dot" style="background:'+s.c+'"></div>'+
        '<div class="ws-name">'+s.n+(isLast?' <span style="color:var(--error);font-size:10px">● STALLED</span>':'')+'</div>'+
        '<div class="ws-bar-bg"><div class="ws-bar" style="width:'+Math.max(barPct,dy>0?2:0)+'%;background:'+s.c+';opacity:0.8"></div>'+(benchPct>0?'<div class="ws-bar-bench" style="width:'+benchPct+'%"></div>':'')+'</div>'+
        '<div class="ws-val">'+(dy>0?dy+'d':entered?'<1d':'—')+'</div>'+
        '<div class="ws-cmp '+cmpClass+'">'+cmpText+'</div>'+
        '<div class="ws-date">'+(entered?entered.toLocaleDateString('en-AU',{day:'numeric',month:'short'}):'—')+'</div>'+
      '</div>';
    }).join('');

    return'<div class="lp" id="lp_'+i+'">'+
      '<div class="lp-head" onclick="toggleLoss('+i+')">'+
        '<span class="lp-chevron">▸</span>'+
        '<span class="lp-name">'+d.name+'</span>'+
        '<div class="lp-meta">'+
          '<span class="eb '+ecl(d.era)+'">'+d.era+'</span>'+
          '<span class="lp-stage-tag">Lost at '+lsName+'</span>'+
          '<span style="font-weight:600">'+age+'d</span>'+
        '</div>'+
      '</div>'+
      '<div class="lp-body">'+
        '<div class="wp-footer" style="margin-top:12px;margin-bottom:12px">'+
          '<span>Closed: '+closedStr+'</span>'+
          '<span>Created: '+(d.created?d.created.toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}):'—')+'</span>'+
          '<span>Engagement notes: '+d.notes+'</span>'+
          '<span class="cf '+ccl(d.conf)+'">'+d.conf+' confidence</span>'+
          '<a class="dl" href="'+d.url+'" target="_blank" style="margin-left:auto">HubSpot →</a>'+
        '</div>'+
        '<div style="font-size:12px;color:var(--muted);margin-bottom:4px">Dashed line = median for won deals · Red highlight = stage where deal stalled</div>'+
        '<div class="wp-stages">'+stageRows+'</div>'+
        '<div class="wp-insight" id="li_'+i+'">'+
          '<button class="ab" onclick="event.stopPropagation();lossInsight('+i+')" style="font-size:12px;padding:4px 14px">Why did this deal stall?</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  }).join('');

  el.innerHTML='<div class="ks">'+
    '<div class="k h"><div class="kl">Lost Deals</div><div class="kv" style="color:var(--error)">'+lost.length+'</div><div class="ksub">of '+totalClosed+' closed</div></div>'+
    '<div class="k h"><div class="kl">Loss Rate</div><div class="kv" style="color:var(--error)">'+lossRate+'%</div><div class="ksub">'+cw.length+' won / '+lost.length+' lost</div></div>'+
    '<div class="k"><div class="kl">Worst Drop-off</div><div class="kv" style="font-size:16px">'+(worstStage?worstStage[0]:'—')+'</div><div class="ksub">'+(worstStage?worstStage[1]+' deals stalled':'')+' </div></div>'+
    '<div class="k"><div class="kl">SB Loss Rate</div><div class="kv" style="color:'+(eraStats['Stormboy v1'].lossRate>lossRate?'var(--error)':'var(--success)')+'">'+((eraStats['Stormboy v1'].closed+eraStats['Stormboy v2'].closed)?Math.round((eraStats['Stormboy v1'].lost+eraStats['Stormboy v2'].lost)/(eraStats['Stormboy v1'].closed+eraStats['Stormboy v2'].closed)*100):0)+'%</div><div class="ksub">vs '+eraStats['KCT Process'].lossRate+'% KCT</div></div>'+
  '</div>'+

  '<div class="cd" style="border-left:3px solid var(--error)"><h2>Conversion Funnel — All Deals</h2>'+
    '<div style="font-size:12px;color:var(--muted);margin-bottom:8px">How many deals entered each stage. Red % = drop-off from previous stage.</div>'+
    '<div class="fn">'+funnelHtml+'</div>'+
  '</div>'+

  '<div class="sg">'+
    '<div class="cd"><h2>Where Deals Die</h2>'+
      '<div style="font-size:12px;color:var(--muted);margin-bottom:12px">Last stage reached before closing lost</div>'+
      '<div class="cw"><canvas id="cLossDist"></canvas></div>'+
    '</div>'+
    '<div class="cd"><h2>Loss Rate by Era</h2>'+
      '<div style="font-size:12px;color:var(--muted);margin-bottom:12px">Has the loss rate improved over time?</div>'+
      '<div class="cw"><canvas id="cLossEra"></canvas></div>'+
    '</div>'+
  '</div>'+

  '<div class="cd"><h2>Quarterly Win/Loss Trend</h2>'+
    '<div class="cw"><canvas id="cLossTrend"></canvas></div>'+
  '</div>'+

  '<div class="cd" style="border-left:3px solid var(--accent)"><h2>Loss Pattern Analysis</h2>'+
    '<div id="lossPatterns"><button class="ab" onclick="lossPatternAi()">Analyse loss patterns</button></div>'+
  '</div>'+

  '<div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">'+
    '<span style="font-size:13px;font-weight:500">Lost deals — most recent first</span>'+
    '<span style="font-size:12px;color:var(--muted)">Click to expand · red highlight = stall point</span>'+
  '</div>'+
  lostPanels;

  // Charts
  // 1. Where deals die — horizontal bar
  if(sortedDropoff.length){
    ch.cLossDist=safeChart('cLossDist',{type:'bar',data:{
      labels:sortedDropoff.map(([n])=>n),
      datasets:[{data:sortedDropoff.map(([,c])=>c),backgroundColor:'#EF4444',borderRadius:4}]
    },options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,scales:{
      x:{beginAtZero:true,grid:{color:'#E2E8F0'},ticks:{font:{family:'Inter',size:11},color:'#6B7C8D'}},
      y:{grid:{display:false},ticks:{font:{family:'Inter',size:12},color:'#1A2B3C'}}
    },plugins:{legend:{display:false}}}});
  }

  // 2. Loss rate by era
  const eraLabels=eras.slice(1),eraWinData=eraLabels.map(e=>eraStats[e].won),eraLossData=eraLabels.map(e=>eraStats[e].lost);
  ch.cLossEra=safeChart('cLossEra',{type:'bar',data:{
    labels:eraLabels,
    datasets:[
      {label:'Won',data:eraWinData,backgroundColor:'#34D399',borderRadius:4},
      {label:'Lost',data:eraLossData,backgroundColor:'#EF4444',borderRadius:4}
    ]
  },options:{responsive:true,maintainAspectRatio:false,scales:{
    x:{stacked:true,grid:{display:false},ticks:{font:{family:'Inter',size:11},color:'#6B7C8D'}},
    y:{stacked:true,beginAtZero:true,ticks:{font:{family:'Inter',size:11},color:'#6B7C8D'},grid:{color:'#E2E8F0'}}
  },plugins:{legend:{labels:{font:{family:'Inter',size:12},color:'#6B7C8D'}}}}});

  // 3. Quarterly trend line
  if(sqd.length){
    ch.cLossTrend=safeChart('cLossTrend',{type:'line',data:{
      labels:sqd.map(([k])=>k),
      datasets:[
        {label:'Win Rate %',data:sqd.map(([,v])=>(v.w+v.l)?Math.round(v.w/(v.w+v.l)*100):0),borderColor:'#34D399',backgroundColor:'rgba(52,211,153,.1)',fill:true,tension:.3,pointRadius:5,pointBackgroundColor:'#34D399',yAxisID:'y'},
        {label:'Deals Closed',data:sqd.map(([,v])=>v.w+v.l),borderColor:'#94A3B8',borderDash:[5,5],tension:.3,pointRadius:3,pointBackgroundColor:'#94A3B8',yAxisID:'y1'}
      ]
    },options:{responsive:true,maintainAspectRatio:false,scales:{
      x:{grid:{display:false},ticks:{font:{family:'Inter',size:11},color:'#6B7C8D'}},
      y:{beginAtZero:true,max:100,title:{display:true,text:'Win Rate %',font:{family:'Inter',size:12},color:'#6B7C8D'},ticks:{font:{family:'Inter',size:11},color:'#6B7C8D'},grid:{color:'#E2E8F0'}},
      y1:{position:'right',beginAtZero:true,title:{display:true,text:'Volume',font:{family:'Inter',size:12},color:'#6B7C8D'},ticks:{font:{family:'Inter',size:11},color:'#94A3B8'},grid:{display:false}}
    },plugins:{legend:{labels:{font:{family:'Inter',size:12},color:'#6B7C8D'}}}}});
  }
}

window.toggleLoss=function(i){
  const lp=document.getElementById('lp_'+i);
  if(!lp)return;
  const wasOpen=lp.classList.contains('open');
  document.querySelectorAll('.lp.open').forEach(w=>w.classList.remove('open'));
  if(!wasOpen)lp.classList.add('open');
};

window.lossInsight=async function(i){
  const all=getAll(),lost=all.filter(d=>d.stage==='closedlost').sort((a,b)=>(b.closed||b.created||0)-(a.closed||a.created||0));
  const d=lost[i];if(!d)return;
  const el=document.getElementById('li_'+i);
  el.innerHTML='<span class="wp-insight-loading">Analysing loss pattern...</span>';
  const cw=all.filter(dd=>dd.stage==='231921676');
  const b=bench(cw);
  const stageMed={};STG.forEach(s=>{const vals=cw.map(dd=>dd.stages[s.id]?.days||0).filter(x=>x>0).sort((a,b)=>a-b);if(vals.length){const m=Math.floor(vals.length/2);stageMed[s.id]=Math.round(vals.length%2?vals[m]:(vals[m-1]+vals[m])/2);}});
  const ls=lastStage(d);const lsName=ls?SM[ls]?.n||ls:'Unknown';
  // Find slowest stage before stall
  let slowest=null;
  STG.forEach(s=>{
    if(!d.stages[s.id]?.entered)return;
    const dy=Math.round(d.stages[s.id]?.days||0),med=stageMed[s.id]||0;
    if(med>0){const delta=Math.round((1-dy/med)*100);if(!slowest||delta<(slowest.delta||0))slowest={stage:s.n,days:dy,med,delta};}
  });
  const prompt='You are an AgriProve sales process analyst. Analyse why this deal was lost and what could have been done differently.\n\n'+
    'Deal: '+d.name+' | Era: '+d.era+' | Total: '+(d.days||'?')+'d | Won deal median: '+b.p50+'d\n'+
    'Last stage reached: '+lsName+' (stalled here)\n'+
    'Stages entered: '+STG.filter(s=>d.stages[s.id]?.entered).map(s=>s.n+' ('+Math.round(d.stages[s.id]?.days||0)+'d)').join(' → ')+'\n'+
    'Stages never reached: '+STG.filter(s=>!d.stages[s.id]?.entered).map(s=>s.n).join(', ')+'\n'+
    (slowest?'Slowest stage vs benchmark: '+slowest.stage+' at '+slowest.days+'d vs '+slowest.med+'d median ('+Math.abs(slowest.delta)+'% slower)\n':'')+
    'Engagement notes: '+d.notes+'\n'+
    'Created: '+(d.created?.toLocaleDateString()||'?')+' | Closed: '+(d.closed?.toLocaleDateString()||'?')+'\n\n'+
    'Give: (1) most likely reason this deal stalled at '+lsName+', (2) one early warning signal that could have flagged this, (3) one process change that might have saved it. Be specific with stage names and timing.';
  try{const r=await fetch('/api/ai/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})}).then(r=>{if(!r.ok)throw new Error('AI '+r.status);return r.json();});const txt=typeof r==='string'?r:r&&r.text?r.text:(r&&r.content&&r.content[0]?r.content[0].text:JSON.stringify(r));el.innerHTML=md2h(txt);}catch(e){el.innerHTML='<span style="color:var(--error)">Failed: '+e.message+'</span>';}
};

window.lossPatternAi=async function(){
  const el=document.getElementById('lossPatterns');
  el.innerHTML='<span class="wp-insight-loading">Analysing loss patterns across deals...</span>';
  const all=getAll(),cw=all.filter(d=>d.stage==='231921676'),lost=all.filter(d=>d.stage==='closedlost');
  const totalClosed=cw.length+lost.length;
  const lossRate=totalClosed?Math.round(lost.length/totalClosed*100):0;
  // Stage of loss distribution
  const stageOfLoss={};lost.forEach(d=>{const ls=lastStage(d);if(ls){const n=SM[ls]?.n||ls;stageOfLoss[n]=(stageOfLoss[n]||0)+1;}});
  // Era loss rates
  const eraLoss={};['Legacy','KCT Process','Stormboy v1','Stormboy v2'].forEach(e=>{
    const ew=cw.filter(d=>d.era===e).length,el2=lost.filter(d=>d.era===e).length;
    eraLoss[e]={won:ew,lost:el2,rate:(ew+el2)?Math.round(el2/(ew+el2)*100):0};
  });
  // Average time before loss
  const lostDays=lost.filter(d=>d.days!=null).map(d=>d.days);
  const avgLostDays=lostDays.length?Math.round(lostDays.reduce((a,b)=>a+b,0)/lostDays.length):0;
  // Most common stage
  const worstStage=Object.entries(stageOfLoss).sort(([,a],[,b])=>b-a)[0];

  const prompt='You are an AgriProve sales process analyst. Analyse loss patterns and give specific, actionable recommendations to reduce losses.\n\n'+
    'Overall: '+lost.length+' lost / '+totalClosed+' closed = '+lossRate+'% loss rate\n'+
    'Average days before loss: '+avgLostDays+'d (won deals median: '+bench(cw).p50+'d)\n'+
    'Stage where most deals die: '+(worstStage?worstStage[0]+' ('+worstStage[1]+'/'+lost.length+' = '+Math.round(worstStage[1]/lost.length*100)+'%)':'none')+'\n'+
    'Full drop-off: '+Object.entries(stageOfLoss).map(([s,c])=>s+': '+c).join(', ')+'\n'+
    'Era loss rates: '+Object.entries(eraLoss).map(([e,v])=>e+': '+v.rate+'% ('+v.lost+'/'+((v.won||0)+(v.lost||0))+')').join(', ')+'\n'+
    'Recent lost examples: '+lost.slice(0,5).map(d=>d.name+' ('+d.era+', stalled at '+(SM[lastStage(d)]?.n||'?')+', '+d.days+'d)').join('; ')+'\n\n'+
    'Give exactly 3 insights: (1) What is the single biggest loss pattern and what specific process change would address it? (2) Are Stormboy deals performing better or worse on loss rate, and why? (3) What early warning signals should trigger intervention on active deals? Be concrete with numbers and stage names.';
  try{const r=await fetch('/api/ai/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})}).then(r=>{if(!r.ok)throw new Error('AI '+r.status);return r.json();});const txt=typeof r==='string'?r:r&&r.text?r.text:(r&&r.content&&r.content[0]?r.content[0].text:JSON.stringify(r));el.innerHTML='<div class="ar">'+md2h(txt)+'</div>';}catch(e){el.innerHTML='<span style="color:var(--error)">Failed: '+e.message+'</span>';}
};


// === SB FUNNEL ===
const SB_PROPS=['firstname','lastname','contact_lead_stage_storm_boy','storm_boy__call_outcome','storm_boy__meeting_scheduled','storm_boy__meeting_completed','storm_boy__horizon_snapshot_created','storm_boy__date_called','storm_boy__date_assessed','storm_boy__meeting_date','storm_boy__proceed_to_kct_stage','num_associated_deals'];
const SB_FUNNEL_STAGES=[
  {id:'Identified',n:'Identified',c:'#94A3B8'},
  {id:'In Conversation',n:'In Conversation',c:'#3B82F6'},
  {id:'Farm Visit booked',n:'Farm Visit Booked',c:'#8B5CF6'},
  {id:'Farm Visit completed',n:'Farm Visit Done',c:'#F59E0B'},
  {id:'Proceed to Sales Pipeline',n:'To Sales Pipeline',c:'#2D6A4F'}
];
const SB_EXIT_STAGES=['Not interested','Not Eligible','On Hold/More research required'];

async function fetchSBFunnel(){
  if(sbContacts)return sbContacts;
  const all=[];let off=0;
  while(true){
    const r=await hs({objectType:'CONTACT',filterGroups:[{filters:[{propertyName:'storm_boy_campaign_member',operator:'EQ',value:'Yes'}]}],properties:SB_PROPS,limit:200,offset:off});
    const pg=r.results||[];
    pg.forEach(c=>{
      const p=c.properties||{};
      all.push({id:c.id,name:(p.firstname||'')+' '+(p.lastname||''),stage:p.contact_lead_stage_storm_boy||'Unknown',callOutcome:p.storm_boy__call_outcome||null,meetingSched:p.storm_boy__meeting_scheduled||null,meetingDone:p.storm_boy__meeting_completed||null,horizon:p.storm_boy__horizon_snapshot_created||null,dateCalled:p.storm_boy__date_called?new Date(p.storm_boy__date_called):null,dateAssessed:p.storm_boy__date_assessed?new Date(p.storm_boy__date_assessed):null,meetingDate:p.storm_boy__meeting_date?new Date(p.storm_boy__meeting_date):null,kctStage:p.storm_boy__proceed_to_kct_stage||null,hasDeals:parseInt(p.num_associated_deals||'0')>0,url:'https://app.hubspot.com/contacts/24224559/record/0-1/'+c.id});
    });
    if(!pg.length||all.length>=(r.total||0)||pg.length<200)break;
    off=r.offset||(off+200);
  }
  sbContacts=all;
  return all;
}

async function rFunnel(el,allDeals,cw){
  const gen=renderGen;
  el.innerHTML='<div class="ld"><div class="sp"></div><span>Loading Stormboy contacts...</span></div>';
  let contacts;
  try{contacts=await fetchSBFunnel();}catch(e){if(renderGen!==gen)return;el.innerHTML='<div class="cd"><div style="color:var(--error)">Failed to load SB contacts: '+e.message+'</div><button class="ab" onclick="sbContacts=null;render()">Retry</button></div>';return;}
  if(renderGen!==gen)return;
  const total=contacts.length;
  // Stage counts
  const stageCounts={};SB_FUNNEL_STAGES.forEach(s=>stageCounts[s.id]=0);
  const exitCounts={};SB_EXIT_STAGES.forEach(s=>exitCounts[s]=0);
  let unknownCount=0;
  contacts.forEach(c=>{
    if(stageCounts[c.stage]!==undefined)stageCounts[c.stage]++;
    else if(exitCounts[c.stage]!==undefined)exitCounts[c.stage]++;
    else unknownCount++;
  });
  const totalExits=SB_EXIT_STAGES.reduce((s,k)=>s+exitCounts[k],0);
  const inFunnel=total-totalExits-unknownCount;
  const toPipeline=stageCounts['Proceed to Sales Pipeline'];
  const convRate=total?((toPipeline/total)*100).toFixed(1):0;

  // Call outcome breakdown
  const callCounts={};contacts.forEach(c=>{if(c.callOutcome){callCounts[c.callOutcome]=(callCounts[c.callOutcome]||0)+1;}});
  const contacted=contacts.filter(c=>c.dateCalled).length;

  // Meeting & HORIZON rates
  const meetSched=contacts.filter(c=>c.meetingSched==='true').length;
  const meetDone=contacts.filter(c=>c.meetingDone==='true').length;
  const horizonDone=contacts.filter(c=>c.horizon==='true').length;
  const withDeals=contacts.filter(c=>c.hasDeals).length;

  // Funnel HTML — progressive funnel
  const maxFn=Math.max(...SB_FUNNEL_STAGES.map(s=>stageCounts[s.id]),1);
  // Cumulative funnel: how many reached at least this stage
  // Since contacts are AT a stage (not cumulative), we show current distribution
  const funnelHtml=SB_FUNNEL_STAGES.map((s,i)=>{
    const cnt=stageCounts[s.id];
    const pct=maxFn?Math.round(cnt/maxFn*100):0;
    const prevCnt=i>0?stageCounts[SB_FUNNEL_STAGES[i-1].id]:cnt;
    const dropPct=prevCnt?Math.round((1-cnt/prevCnt)*100):0;
    return'<div class="fn-step">'+
      '<div class="fn-bar-wrap"><div class="fn-bar" style="height:'+Math.max(pct,3)+'%;background:'+s.c+'"><span class="fn-pct">'+cnt+'</span></div></div>'+
      '<div class="fn-lbl">'+s.n+'</div>'+
      (i>0&&dropPct>0?'<div class="fn-drop">-'+dropPct+'%</div>':'')+
    '</div>';
  }).join('');

  // Exit breakdown for chart
  const exitLabels=SB_EXIT_STAGES.map(s=>s.replace('/More research required',''));
  const exitData=SB_EXIT_STAGES.map(s=>exitCounts[s]);
  const exitColors=['#EF4444','#F59E0B','#94A3B8'];

  // Call outcome for chart
  const coLabels=Object.keys(callCounts);
  const coData=Object.values(callCounts);
  const coColors=['#94A3B8','#34D399','#F59E0B','#3B82F6','#EF4444'];

  el.innerHTML='<div class="ks">'+
    '<div class="k h"><div class="kl">SB Contacts</div><div class="kv">'+total+'</div><div class="ksub">'+contacted+' contacted ('+Math.round(contacted/total*100)+'%)</div></div>'+
    '<div class="k h"><div class="kl">Active in Funnel</div><div class="kv">'+inFunnel+'</div><div class="ksub">'+totalExits+' exits · '+unknownCount+' unset</div></div>'+
    '<div class="k"><div class="kl">To Sales Pipeline</div><div class="kv" style="color:var(--accent)">'+toPipeline+'</div><div class="ksub">'+convRate+'% of total</div></div>'+
    '<div class="k"><div class="kl">With Deals</div><div class="kv">'+withDeals+'</div><div class="ksub">contacts linked to a deal</div></div>'+
    '<div class="k"><div class="kl">Meetings Done</div><div class="kv">'+meetDone+'</div><div class="ksub">'+meetSched+' scheduled · '+(meetSched?Math.round(meetDone/meetSched*100):0)+'% completion</div></div>'+
    '<div class="k"><div class="kl">HORIZON Snapshots</div><div class="kv">'+horizonDone+'</div><div class="ksub">'+(total?((horizonDone/total)*100).toFixed(1):0)+'% of contacts</div></div>'+
  '</div>'+

  '<div class="cd" style="border-left:3px solid var(--accent)"><h2>Stormboy Recruitment Funnel</h2>'+
    '<div style="font-size:12px;color:var(--muted);margin-bottom:8px">Current distribution across lead stages. Contacts are assigned to one stage at a time.</div>'+
    '<div class="fn">'+funnelHtml+'</div>'+
  '</div>'+

  '<div class="sg">'+
    '<div class="cd"><h2>Exit Reasons</h2>'+
      '<div style="font-size:12px;color:var(--muted);margin-bottom:12px">'+totalExits+' contacts exited the funnel</div>'+
      '<div class="cw"><canvas id="cSbExit"></canvas></div>'+
    '</div>'+
    '<div class="cd"><h2>Call Outcomes</h2>'+
      '<div style="font-size:12px;color:var(--muted);margin-bottom:12px">'+Object.values(callCounts).reduce((a,b)=>a+b,0)+' contacts with a call outcome recorded</div>'+
      '<div class="cw"><canvas id="cSbCall"></canvas></div>'+
    '</div>'+
  '</div>'+

  '<div class="cd"><h2>Milestone Conversion Rates</h2>'+
    '<div style="font-size:12px;color:var(--muted);margin-bottom:16px">How contacts progress through key Stormboy milestones</div>'+
    '<div class="cw"><canvas id="cSbMilestones"></canvas></div>'+
  '</div>'+

  '<div class="cd" style="border-left:3px solid var(--accent)"><h2>Funnel Analysis</h2>'+
    '<div id="sbFunnelAi"><button class="ab" onclick="sbFunnelAiAnalysis()">Analyse recruitment funnel</button></div>'+
  '</div>';

  // Charts
  if(totalExits){
    ch.cSbExit=safeChart('cSbExit',{type:'doughnut',data:{
      labels:exitLabels,datasets:[{data:exitData,backgroundColor:exitColors,borderWidth:0}]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{family:'Inter',size:12},color:'#6B7C8D'}}}}});
  }

  if(coLabels.length){
    ch.cSbCall=safeChart('cSbCall',{type:'doughnut',data:{
      labels:coLabels,datasets:[{data:coData,backgroundColor:coColors.slice(0,coLabels.length),borderWidth:0}]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{family:'Inter',size:12},color:'#6B7C8D'}}}}});
  }

  // Milestone bar chart
  const milestones=[
    {label:'Contacted',val:contacted},
    {label:'Meeting Sched.',val:meetSched},
    {label:'Meeting Done',val:meetDone},
    {label:'HORIZON Snap.',val:horizonDone},
    {label:'Farm Visit Bkd',val:stageCounts['Farm Visit booked']+(stageCounts['Farm Visit completed']||0)+toPipeline},
    {label:'Farm Visit Done',val:(stageCounts['Farm Visit completed']||0)+toPipeline},
    {label:'To Pipeline',val:toPipeline}
  ];
  ch.cSbMilestones=safeChart('cSbMilestones',{type:'bar',data:{
    labels:milestones.map(m=>m.label),
    datasets:[{data:milestones.map(m=>m.val),backgroundColor:milestones.map((_,i)=>{const t=i/(milestones.length-1);return'rgba(45,106,79,'+(0.3+t*0.7)+')';}),borderRadius:4}]
  },options:{responsive:true,maintainAspectRatio:false,scales:{
    x:{grid:{display:false},ticks:{font:{family:'Inter',size:11},color:'#6B7C8D'}},
    y:{beginAtZero:true,ticks:{font:{family:'Inter',size:11},color:'#6B7C8D'},grid:{color:'#E2E8F0'}}
  },plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ctx){return ctx.raw+' contacts ('+Math.round(ctx.raw/total*100)+'%)';}}}}}});
}

window.sbFunnelAiAnalysis=async function(){
  const el=document.getElementById('sbFunnelAi');
  el.innerHTML='<span class="wp-insight-loading">Analysing Stormboy recruitment funnel...</span>';
  const c=sbContacts||[];const total=c.length;
  const stageCounts={};SB_FUNNEL_STAGES.forEach(s=>stageCounts[s.id]=0);
  const exitCounts={};SB_EXIT_STAGES.forEach(s=>exitCounts[s]=0);
  c.forEach(ct=>{if(stageCounts[ct.stage]!==undefined)stageCounts[ct.stage]++;else if(exitCounts[ct.stage]!==undefined)exitCounts[ct.stage]++;});
  const totalExits=SB_EXIT_STAGES.reduce((s,k)=>s+exitCounts[k],0);
  const contacted=c.filter(ct=>ct.dateCalled).length;
  const meetDone=c.filter(ct=>ct.meetingDone==='true').length;
  const horizonDone=c.filter(ct=>ct.horizon==='true').length;
  const withDeals=c.filter(ct=>ct.hasDeals).length;
  const callCounts={};c.forEach(ct=>{if(ct.callOutcome)callCounts[ct.callOutcome]=(callCounts[ct.callOutcome]||0)+1;});

  const prompt='You are an AgriProve Stormboy campaign analyst. Analyse the recruitment funnel and give specific, actionable recommendations.\n\n'+
    'Total Stormboy contacts: '+total+'\n'+
    'Funnel stages: '+SB_FUNNEL_STAGES.map(s=>s.n+': '+stageCounts[s.id]).join(' → ')+'\n'+
    'Exit stages: '+SB_EXIT_STAGES.map(s=>s+': '+exitCounts[s]).join(', ')+' (total exits: '+totalExits+')\n'+
    'Contacted (have date_called): '+contacted+' ('+Math.round(contacted/total*100)+'%)\n'+
    'Call outcomes: '+Object.entries(callCounts).map(([k,v])=>k+': '+v).join(', ')+'\n'+
    'Meetings completed: '+meetDone+' | HORIZON snapshots: '+horizonDone+' | With deals: '+withDeals+'\n'+
    'Conversion to sales pipeline: '+stageCounts['Proceed to Sales Pipeline']+' ('+((stageCounts['Proceed to Sales Pipeline']/total)*100).toFixed(1)+'%)\n\n'+
    'Context: Stormboy is AgriProve\'s outbound recruitment campaign for Australian landholders. The funnel runs from Identified (data list) → phone contact → farm visits → sales pipeline (where HubSpot deals begin).\n\n'+
    'Give exactly 3 insights: (1) Where is the biggest bottleneck in the funnel and what would unblock it? (2) What does the exit rate tell us — is it healthy or concerning? (3) One specific operational recommendation to improve conversion from Identified to Sales Pipeline. Use the actual numbers.';
  try{const r=await fetch('/api/ai/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})}).then(r=>{if(!r.ok)throw new Error('AI '+r.status);return r.json();});const txt=typeof r==='string'?r:r&&r.text?r.text:(r&&r.content&&r.content[0]?r.content[0].text:JSON.stringify(r));el.innerHTML='<div class="ar">'+md2h(txt)+'</div>';}catch(e){el.innerHTML='<span style="color:var(--error)">Failed: '+e.message+'</span>';}
};


// === PROCESS EVOLUTION ===
function rEvo(el,all,cw){
  const eras=['Legacy','KCT Process','Stormboy v1','Stormboy v2'],sids=STG.slice(0,-1).map(s=>s.id);
  let rows='';const cd={};
  eras.forEach(e=>{const ed=cw.filter(d=>d.era===e),b=bench(ed),sb=sids.map(s=>sbench(ed,s));rows+=`<tr><td><span class="eb ${ecl(e)}">${e}</span></td><td>${b.n}</td><td><strong>${b.n?b.p50+'d':'—'}</strong></td><td>${b.n?b.p25+'d':'—'}</td><td>${b.n?b.p75+'d':'—'}</td>${sb.map(s=>'<td>'+(s.n?s.p50+'d':'—')+'</td>').join('')}</tr>`;cd[e]=sb.map(s=>s.p50);});
  const aByE={};all.filter(d=>!['231921676','closedlost'].includes(d.stage)).forEach(d=>{aByE[d.era]=(aByE[d.era]||0)+1});
  el.innerHTML=`<div class="ks">${eras.map(e=>{const c=all.filter(d=>d.era===e).length,w=cw.filter(d=>d.era===e).length;return`<div class="k"><div class="kl">${e}</div><div class="kv">${c}</div><div class="ksub">${w} won · ${aByE[e]||0} active</div></div>`;}).join('')}</div>
  <div class="cd"><h2>Stage Duration — Won Deals (Median)</h2><div style="overflow-x:auto"><table><tr><th>Era</th><th>Won</th><th>P50</th><th>P25</th><th>P75</th>${sids.map(s=>'<th>'+SM[s].n+'</th>').join('')}</tr>${rows}</table></div></div>
  <div class="cd"><h2>Stage Duration by Era</h2><div class="cw"><canvas id="c3"></canvas></div></div>
  <div class="cd"><h2>AI Analysis</h2><button class="ab" onclick="ai('evo',this)">Compare eras</button><div id="ao_evo"></div></div>`;
  ch.c3=safeChart('c3',{type:'bar',data:{labels:sids.map(s=>SM[s].n),datasets:eras.map((e,i)=>({label:e,data:cd[e],backgroundColor:['#94A3B8','#3B82F6','#34D399','#2D6A4F'][i],borderRadius:4}))},options:{responsive:true,maintainAspectRatio:false,scales:{x:{grid:{display:false},ticks:{font:{family:'Inter',size:11},color:'#6B7C8D'}},y:{beginAtZero:true,title:{display:true,text:'Median days',font:{family:'Inter',size:12},color:'#6B7C8D'},ticks:{font:{family:'Inter',size:11},color:'#6B7C8D'},grid:{color:'#E2E8F0'}}},plugins:{legend:{labels:{font:{family:'Inter',size:12},color:'#6B7C8D'}}}}});
}

// === DEAL RANKING ===
function rRank(el,cw){
  const sorted=[...cw].filter(d=>d.days!=null).sort((a,b)=>a.days-b.days),b=bench(cw);
  let maxSD=1;sorted.forEach(d=>STG.forEach(s=>{const dy=d.stages[s.id]?.days||0;if(dy>maxSD)maxSD=dy;}));
  let tr='';sorted.forEach((d,i)=>{
    tr+=`<tr class="xr" data-idx="${i}" onclick="toggleRow(${i})"><td>${i+1}</td><td><a class="dl" href="${d.url}" target="_blank" onclick="event.stopPropagation()">${d.name}</a></td><td><span class="eb ${ecl(d.era)}">${d.era}</span></td><td><strong>${d.days}d</strong></td><td>${b.p50?Math.round(d.days/b.p50*100)+'%':'—'}</td><td><span class="cf ${ccl(d.conf)}">${d.conf}</span></td><td style="min-width:140px">${sbar(d)}</td></tr>`;
    tr+=`<tr class="xd" id="xd_${i}"><td colspan="7"><div style="display:flex;flex-direction:column;gap:6px;max-width:500px">${STG.map(s=>{const dy=Math.round(d.stages[s.id]?.days||0),ent=d.stages[s.id]?.entered,bp=maxSD?Math.round(dy/maxSD*100):0;return`<div style="display:flex;align-items:center;gap:8px;font-size:13px"><div class="ws-dot" style="background:${s.c}"></div><div class="ws-name">${s.n}</div><div class="ws-bar-bg"><div class="ws-bar" style="width:${Math.max(bp,dy>0?2:0)}%;background:${s.c};opacity:.8"></div></div><div class="ws-val">${dy>0?dy+'d':ent?'<1d':'—'}</div><div class="ws-date">${ent?ent.toLocaleDateString('en-AU',{day:'numeric',month:'short'}):'—'}</div></div>`;}).join('')}</div></td></tr>`;
  });
  el.innerHTML=`<div class="cd"><h2>Won Deals — Ranked by Speed</h2><p style="font-size:12px;color:var(--muted);margin-bottom:16px">Click a row to expand</p>
  <div class="ks" style="margin-bottom:16px"><div class="k"><div class="kl">Fastest</div><div class="kv">${sorted[0]?.days||'—'}d</div><div class="ksub">${sorted[0]?.name||''}</div></div><div class="k"><div class="kl">Median</div><div class="kv">${b.p50}d</div></div><div class="k"><div class="kl">Slowest</div><div class="kv">${sorted[sorted.length-1]?.days||'—'}d</div><div class="ksub">${sorted[sorted.length-1]?.name||''}</div></div></div>
  <div style="overflow-x:auto"><table><tr><th>#</th><th>Deal</th><th>Era</th><th>Days</th><th>vs Med</th><th>Conf</th><th>Stages</th></tr>${tr}</table></div></div>`;
}
window.toggleRow=function(i){const mr=document.querySelector(`tr.xr[data-idx="${i}"]`),dr=document.getElementById('xd_'+i);if(!mr||!dr)return;const o=dr.classList.contains('open');document.querySelectorAll('tr.xd.open').forEach(r=>r.classList.remove('open'));document.querySelectorAll('tr.xr.open').forEach(r=>r.classList.remove('open'));if(!o){dr.classList.add('open');mr.classList.add('open');}};

// === ACTIVE PIPELINE ===
function rPipe(el,act,cw){
  const sorted=[...act].sort((a,b)=>(b.days||0)-(a.days||0)),b=bench(cw);
  const arDeals=sorted.filter(d=>(d.days||0)>(b.p75||180));
  const stageMedAll={};
  STG.forEach(s=>{const vals=cw.map(d=>d.stages[s.id]?.days||0).filter(x=>x>0).sort((a,b)=>a-b);if(vals.length){const m=Math.floor(vals.length/2);stageMedAll[s.id]=Math.round(vals.length%2?vals[m]:(vals[m-1]+vals[m])/2);}else stageMedAll[s.id]=0;});
  function predictClose(d){
    const so=STG.map(s=>s.id),ci=so.indexOf(d.stage);if(ci<0)return null;
    const curSpent=d.stages[d.stage]?.days||0,curMed=stageMedAll[d.stage]||0;
    let rem=Math.max(curMed-curSpent,0);
    for(let i=ci+1;i<so.length;i++)rem+=(stageMedAll[so[i]]||0);
    if(rem<=0)return null;
    const dt=new Date();dt.setDate(dt.getDate()+Math.round(rem));
    return{date:dt,days:Math.round(rem)};
  }
  let display=sorted;
  if(pipeFilter==='risk'){
    const risk=sorted.filter(d=>(d.days||0)>(b.p75||180));
    const rest=sorted.filter(d=>(d.days||0)<=(b.p75||180));
    display=[...risk,...rest];
  }
  el.innerHTML=`<div class="ks">
    <div class="k h"><div class="kl">Active Deals</div><div class="kv">${act.length}</div></div>
    <div class="k clickable${pipeFilter==='risk'?' active-filter':''}" onclick="togglePipeFilter()" title="Click to isolate at-risk deals"><div class="kl">At Risk (>P75)</div><div class="kv${pipeFilter!=='risk'?' rh':''}">${arDeals.length}</div><div class="ksub">> ${b.p75||'—'}d${pipeFilter==='risk'?' · FILTERING':' · click to filter'}</div></div>
    <div class="k"><div class="kl">Stormboy Active</div><div class="kv">${act.filter(d=>d.era.startsWith('Stormboy')).length}</div></div>
  </div>
  <div class="cd"><h2>Active Pipeline — by Age</h2>
  ${pipeFilter==='risk'?'<div style="margin-bottom:12px;padding:8px 12px;background:#FEF2F2;border-radius:6px;font-size:12px;color:#DC2626;font-weight:500;display:flex;align-items:center;justify-content:space-between"><span>'+arDeals.length+' at-risk deals isolated to top</span><span style="cursor:pointer;text-decoration:underline" onclick="togglePipeFilter()">Clear filter</span></div>':''}
  <div style="overflow-x:auto"><table><tr><th>Deal</th><th>Era</th><th>Stage</th><th>Age</th><th>Risk</th><th>Pred. Close</th><th>Notes</th><th>Progress</th></tr>
  ${display.map((d,idx)=>{const a=d.days||0,r=a>(b.p75||180)?'h':a>(b.p50||90)?'m':'l',rl=r==='h'?'At Risk':r==='m'?'Monitor':'On Track';
    const pred=predictClose(d);const predStr=pred?pred.date.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+' <span style="font-size:11px;color:var(--muted)">('+pred.days+'d)</span>':'—';
    const isRisk=r==='h';const rowBg=pipeFilter==='risk'&&isRisk?'background:rgba(239,68,68,0.04);':'';
    const sepRow=pipeFilter==='risk'&&isRisk&&idx===arDeals.length-1?'border-bottom:2px solid var(--error);':'';
    return`<tr style="${rowBg}${sepRow}"><td><a class="dl" href="${d.url}" target="_blank">${d.name}</a></td><td><span class="eb ${ecl(d.era)}">${d.era}</span></td><td>${SM[d.stage]?.n||d.stage}</td><td><strong>${a}d</strong></td><td class="r${r}">${rl}</td><td>${predStr}</td><td>${d.notes}</td><td style="min-width:120px">${sbar(d)}</td></tr>`;}).join('')||'<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--muted)">No active deals</td></tr>'}
  </table></div></div>
  <div class="cd"><h2>AI Analysis</h2><button class="ab" onclick="ai('pipe',this)">Identify risks</button><div id="ao_pipe"></div></div>`;
}
window.togglePipeFilter=function(){pipeFilter=pipeFilter==='risk'?'all':'risk';render();};

// === TRENDS ===
function rTrend(el,cw){
  const q={};cw.forEach(d=>{if(!d.closed)return;const k=d.closed.getFullYear()+' Q'+Math.ceil((d.closed.getMonth()+1)/3);(q[k]=q[k]||[]).push(d)});
  const sq=Object.entries(q).sort(([a],[b])=>a.localeCompare(b)),ql=sq.map(([k])=>k),qm=sq.map(([,d])=>bench(d).p50),qc=sq.map(([,d])=>d.length),qs=sq.map(([,d])=>d.filter(x=>x.era.startsWith('Stormboy')).length);
  el.innerHTML=`<div class="cd"><h2>Quarterly Conversion Trend</h2><div class="cw"><canvas id="c4"></canvas></div></div><div class="cd"><h2>Volume & Stormboy Mix</h2><div class="cw"><canvas id="c5"></canvas></div></div><div class="cd"><h2>AI Analysis</h2><button class="ab" onclick="ai('trend',this)">Analyse trends</button><div id="ao_trend"></div></div>`;
  ch.c4=safeChart('c4',{type:'line',data:{labels:ql,datasets:[{label:'Median (days)',data:qm,borderColor:'#2D6A4F',backgroundColor:'rgba(45,106,79,.1)',fill:true,tension:.3,pointRadius:5,pointBackgroundColor:'#2D6A4F'}]},options:{responsive:true,maintainAspectRatio:false,scales:{x:{grid:{display:false},ticks:{font:{family:'Inter',size:11},color:'#6B7C8D'}},y:{beginAtZero:true,title:{display:true,text:'Days',font:{family:'Inter',size:12},color:'#6B7C8D'},ticks:{font:{family:'Inter',size:11},color:'#6B7C8D'},grid:{color:'#E2E8F0'}}},plugins:{legend:{labels:{font:{family:'Inter',size:12},color:'#6B7C8D'}}}}});
  ch.c5=safeChart('c5',{type:'bar',data:{labels:ql,datasets:[{label:'Pre-Stormboy',data:sq.map(([,d],i)=>qc[i]-qs[i]),backgroundColor:'#3B82F6',borderRadius:4},{label:'Stormboy',data:qs,backgroundColor:'#2D6A4F',borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,scales:{x:{stacked:true,grid:{display:false},ticks:{font:{family:'Inter',size:11},color:'#6B7C8D'}},y:{stacked:true,beginAtZero:true,title:{display:true,text:'Deals won',font:{family:'Inter',size:12},color:'#6B7C8D'},ticks:{font:{family:'Inter',size:11},color:'#6B7C8D'},grid:{color:'#E2E8F0'}}},plugins:{legend:{labels:{font:{family:'Inter',size:12},color:'#6B7C8D'}}}}});
}

// === DEEP DIVE ===
function rDD(el,all){
  el.innerHTML=`<div class="cd"><h2>Deal Deep Dive</h2><div style="display:flex;gap:12px;margin-bottom:16px;align-items:end"><div><div class="kl">Select deal</div><select id="dds" style="min-width:300px" onchange="showD()">${all.map(d=>'<option value="'+d.id+'">'+d.name+' ('+d.era+', '+(d.days||'?')+'d)</option>').join('')}</select></div></div><div id="dd"></div><button class="ab" style="margin-top:12px" onclick="ai('deal',this)">AI Analysis</button><div id="ao_deal"></div></div>`;
  if(all.length)showD();
}
window.showD=function(){
  const id=document.getElementById('dds').value,d=getAll().find(x=>x.id===id);if(!d)return;
  document.getElementById('dd').innerHTML=`<div class="ks" style="margin:12px 0">
    <div class="k"><div class="kl">Total Time</div><div class="kv">${d.days||'?'}d</div></div>
    <div class="k"><div class="kl">Era</div><div class="kv"><span class="eb ${ecl(d.era)}">${d.era}</span></div></div>
    <div class="k"><div class="kl">Stage</div><div class="kv" style="font-size:16px">${SM[d.stage]?.n||d.stage}</div></div>
    <div class="k"><div class="kl">Notes</div><div class="kv">${d.notes}</div></div>
    <div class="k"><div class="kl">Confidence</div><div class="kv"><span class="cf ${ccl(d.conf)}">${d.conf}</span></div></div>
  </div>
  <table><tr><th>Stage</th><th>Entered</th><th>Time</th></tr>${STG.map(s=>{const sd=d.stages[s.id];return`<tr><td><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${s.c};margin-right:6px"></span>${s.n}</td><td>${sd.entered?sd.entered.toLocaleDateString():'—'}</td><td>${sd.days?Math.round(sd.days)+'d':'—'}</td></tr>`;}).join('')}</table>
  <div style="margin-top:12px">${sbar(d)}</div>
  <div style="margin-top:8px;font-size:12px"><a class="dl" href="${d.url}" target="_blank">Open in HubSpot →</a></div>`;
};

// === AI ===
window.ai=async function(type,btn){
  btn.disabled=true;btn.textContent='Analysing...';
  const out=document.getElementById('ao_'+type),all=getAll(),cw=all.filter(d=>d.stage==='231921676'),b=bench(cw);
  let prompt='You are an AgriProve sales process analyst. Focus on actionable insights, not reporting. ';
  if(type==='evo'){const eras=['Legacy','KCT Process','Stormboy v1','Stormboy v2'];prompt+='Compare eras — what specifically improved or regressed?\n'+eras.map(e=>{const ed=cw.filter(d=>d.era===e),bb=bench(ed);return e+': '+bb.n+' won, P50='+bb.p50+'d';}).join('\n')+'\n3 bullets: (1) biggest improvement, (2) remaining bottleneck, (3) one action.';}
  else if(type==='pipe'){const act=all.filter(d=>!['231921676','closedlost'].includes(d.stage)).sort((a,bb)=>(bb.days||0)-(a.days||0));prompt+='Pipeline risks — who needs attention and what should we do?\n'+act.length+' active. Top 5: '+act.slice(0,5).map(d=>d.name+' ('+d.days+'d, '+(SM[d.stage]?.n||d.stage)+', '+d.era+')').join('; ')+'\nStage dist: '+STG.slice(0,-1).map(s=>s.n+': '+act.filter(d=>d.stage===s.id).length).join(', ')+'\n3 bullets: name specific deals and stages.';}
  else if(type==='trend'){const q={};cw.forEach(d=>{if(!d.closed)return;const k=d.closed.getFullYear()+' Q'+Math.ceil((d.closed.getMonth()+1)/3);(q[k]=q[k]||[]).push(d)});prompt+='Quarterly trends — is this getting better?\n'+Object.entries(q).sort(([a],[bb])=>a.localeCompare(bb)).map(([k,d])=>k+': '+d.length+' deals, P50='+bench(d).p50+'d ('+d.filter(x=>x.era.startsWith('Stormboy')).length+' SB)').join('\n')+'\n3 bullets: (1) trend direction, (2) what drove it, (3) what to watch next.';}
  else if(type==='loss'){prompt+='Loss analysis...';}
  else if(type==='deal'){const id=document.getElementById('dds').value,d=all.find(x=>x.id===id);if(!d){out.innerHTML='<div class="ar">Select a deal.</div>';btn.disabled=false;btn.textContent='AI Analysis';return;}prompt+='Deal: '+d.name+', '+d.era+', '+(SM[d.stage]?.n||d.stage)+', '+d.days+'d. P25='+b.p25+' P50='+b.p50+' P75='+b.p75+'. 2-3 sentences: what stands out and what to do.';}
  try{const r=await fetch('/api/ai/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})}).then(r=>{if(!r.ok)throw new Error('AI '+r.status);return r.json();});const txt=typeof r==='string'?r:r&&r.text?r.text:(r&&r.content&&r.content[0]?r.content[0].text:JSON.stringify(r));out.innerHTML='<div class="ar">'+md2h(txt)+'</div>';}catch(e){out.innerHTML='<div class="ar" style="color:var(--error)">Failed: '+e.message+'</div>';}
  btn.disabled=false;btn.textContent=type==='deal'?'AI Analysis':type==='evo'?'Compare eras':type==='pipe'?'Identify risks':'Analyse trends';
};

// === MAIN ===
async function go(){
  document.getElementById('rb').disabled=true;processedCache=null;
  document.getElementById('mn').innerHTML='<div class="ld"><div class="sp"></div><span id="lm">Starting...</span><div id="ll" style="margin-top:16px;text-align:left;max-width:600px;width:100%;max-height:180px;overflow-y:auto"></div></div>';
  try{
    lm('Identifying Stormboy deals...');await fetchSB();
    lm('Loading pipeline...');await fetchDeals();
    setst(deals.length+' deals · '+sbIds.size+' Stormboy · AI ✓ · '+new Date().toLocaleTimeString());
  }catch(e){
    lg('HubSpot fetch failed: '+e.message,true);
    setst('No HubSpot · coaching cache only · '+new Date().toLocaleTimeString());
  }
  // Always render — Plays and Patterns are driven by the coaching cache and work
  // independently of HubSpot. Other tabs degrade gracefully to "No deals loaded".
  render();
  document.getElementById('rb').disabled=false;
}
go();
