(function(){
  "use strict";
  const $ = id => document.getElementById(id);
  const $main = $('main'), $tabs = $('tabs');
  const EASE = [['easy','Easy'],['right','Just right'],['hard','Too much work']];
  const LEVELS = ['Need all','¾ needed','½ needed','¼ needed','Have it'];
  const ORIGINAL_STORES = ['aldi','jewel','marianos','costco']; // stores the app knew about before any were added
  const STATE_KEY = 'fdp:state', PLAN_KEY = 'fdp:plan';

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = n => '$' + (Math.round(n*100)/100).toFixed(2);
  const store = {
    get(k){ try{ return JSON.parse(localStorage.getItem(k) || 'null'); }catch(e){ return null; } },
    set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } }
  };

  // ---------- state (all on this device) ----------
  let plan = null, planSource = '', loadNote = '';
  const saved = store.get(STATE_KEY) || {};
  let ratings = obj(saved.ratings), inv = obj(saved.inv);
  let enabled = Array.isArray(saved.enabled) ? saved.enabled : null; // null = every store on
  let seenStores = Array.isArray(saved.seenStores) ? saved.seenStores : ORIGINAL_STORES.slice();
  let names = Array.isArray(saved.names) ? saved.names : ['Adult 1','Adult 2'];
  // checklists: {"<weekOf>:<night>:<ing|steps>:<index>": {v: true|false, t: iso time}}
  let checks = obj(saved.checks);
  function obj(x){ return x && typeof x === 'object' && !Array.isArray(x) ? x : {}; }
  function persist(){
    if(!store.set(STATE_KEY, {v:2, ratings, inv, enabled, seenStores, names, checks})) toast("Couldn't save on this device. Storage may be full or blocked.");
  }
  // older versions kept each night's checklist under its own key; fold those in once
  function legacyChecklist(k, v){
    const m = /^fdp:(\d{4}-\d{2}-\d{2}):([^:]+)$/.exec(k);
    if(!m || !v) return;
    ['ing','steps'].forEach(kind=>{ (Array.isArray(v[kind]) ? v[kind] : []).forEach(j=>{
      const ck = m[1] + ':' + m[2] + ':' + kind + ':' + j;
      if(!checks[ck]) checks[ck] = {v:true, t:''};
    }); });
  }
  (function migrateChecklists(){
    const old = [];
    try{ for(let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); if(/^fdp:\d{4}-\d{2}-\d{2}:[^:]+$/.test(k)) old.push(k); } }catch(e){ return; }
    if(!old.length) return;
    old.forEach(k=>legacyChecklist(k, store.get(k)));
    persist();
    old.forEach(k=>{ try{ localStorage.removeItem(k); }catch(e){} });
  })();

  // ---------- plan loading ----------
  function validPlan(p){ return p && typeof p === 'object' && /^\d{4}-\d{2}-\d{2}$/.test(p.weekOf||'') && Array.isArray(p.nights) && p.nights.length && p.grocery && p.prep; }
  function newer(a, b){ // is plan a newer than plan b?
    if(!b) return true; if(!a) return false;
    if(a.weekOf !== b.weekOf) return a.weekOf > b.weekOf;
    return String(a.generatedAt||'') > String(b.generatedAt||'');
  }
  function usePlan(p, source){
    const prevWeek = plan && plan.weekOf;
    plan = p; planSource = source;
    store.set(PLAN_KEY, {plan:p, source});
    if(prevWeek && prevWeek !== p.weekOf && location.hash) history.replaceState(null,'',location.pathname+location.search);
  }
  async function loadPlan(){
    const cached = store.get(PLAN_KEY);
    if(cached && validPlan(cached.plan)){ plan = cached.plan; planSource = cached.source || 'saved'; render(); }
    try{
      const res = await fetch('plans/current.json', {cache:'no-cache'});
      if(!res.ok) throw new Error(res.status);
      const p = await res.json();
      if(!validPlan(p)) throw new Error('bad plan');
      if(!plan || newer(p, plan) || (p.weekOf === plan.weekOf && planSource !== 'imported')) usePlan(p, 'published');
      loadNote = '';
    }catch(e){
      loadNote = plan ? '' : "The plan couldn't load. Check your connection and reopen the app.";
    }
    safeRender();
  }

  // ---------- dates & navigation ----------
  function weekDate(i){
    const d = new Date(plan.weekOf + 'T12:00:00');
    d.setDate(d.getDate() + i);
    return d;
  }
  const fmtDate = (d, opts) => d.toLocaleDateString('en-US', opts);
  function todayId(){
    if(!plan) return 'week';
    const now = new Date().toDateString();
    for(let i=0;i<plan.nights.length;i++) if(weekDate(i).toDateString() === now) return plan.nights[i].id;
    return 'week';
  }
  function tabIds(){ return ['week', ...(plan ? plan.nights.map(n=>n.id) : []), 'groceries']; }
  function current(){
    const h = location.hash.replace('#','');
    return tabIds().includes(h) ? h : todayId();
  }
  function go(id){
    if(location.hash !== '#'+id) location.hash = id; else render();
    window.scrollTo({top:0});
  }

  function renderTabs(active){
    const today = todayId();
    const items = [{id:'week', d:'Plan', n:'Week', wide:true}];
    if(plan) plan.nights.forEach((n,i)=>items.push({id:n.id, d:n.day.slice(0,3), n:weekDate(i).getDate()}));
    items.push({id:'groceries', d:'List', n:'Groceries', wide:true});
    $tabs.innerHTML = items.map(t =>
      `<button class="tab${t.wide?' wide':''}${t.id===today?' today':''}" role="tab" id="tab-${t.id}" aria-selected="${t.id===active}" data-go="${t.id}"><span class="d">${esc(t.d)}</span><span class="n">${esc(t.n)}</span></button>`
    ).join('');
    const sel = $('tab-'+active);
    if(sel) sel.scrollIntoView({inline:'nearest', block:'nearest'});
  }

  function header(){
    const a = weekDate(0), b = weekDate(plan.nights.length-1);
    $('weekLabel').textContent = 'Week of ' + fmtDate(a,{month:'short',day:'numeric'}) + ' – ' + fmtDate(b,{month:'short',day:'numeric'});
    $('sub').textContent = plan.headline || 'Five weeknight dinners for ' + (plan.household||'the family') + '.';
  }

  function plateHTML(p){
    p = p || {};
    // the plate formula is the same every night, so just list what fills each part tonight
    return `<div class="platekey">
        <div><b>Protein</b><span>${esc(p.protein)}</span></div>
        <div><b>Greens</b><span>${esc(p.green)}</span></div>
        <div><b>Slow carb</b><span>${esc(p.carb)}</span></div>
        <div><b>Good fat</b><span>${esc(p.fat)}</span></div>
      </div>`;
  }

  // ---------- week ----------
  function renderWeek(){
    const rows = plan.nights.map(n=>`<button class="weekrow" data-go="${esc(n.id)}"><span class="d">${esc(n.day.slice(0,3))}</span><span class="t">${esc(n.title)}<span class="sm">${esc([n.cuisine, n.meatless?'Meatless':''].filter(Boolean).join(' · '))}</span>${ratingSummary(ratingFor(n))}</span><span class="m">${esc(n.totalMin)} min</span></button>`).join('');
    const prep = plan.prep;
    return `
      <section><h2>This week</h2><p class="lead">${esc(plan.equipment||'')}</p></section>
      <div class="card weekgrid">${rows}</div>
      <div class="note"><b>Shopping</b><p>${esc(plan.shopNote||'')}</p></div>
      <section>
        <h3>Sunday prep · about ${esc(prep.minutes)} minutes</h3>
        <ol class="steps">${(prep.steps||[]).map(s=>`<li><p><b>${esc(s.title)}.</b> ${esc(s.text)}</p></li>`).join('')}</ol>
      </section>
      <section>
        <h3>Leftover map</h3>
        <div class="card tablewrap"><table><thead><tr><th>Cook</th><th>Extra</th><th>Use it for</th></tr></thead><tbody>
          ${(prep.leftovers||[]).map(l=>`<tr><td>${esc(l.cook)}</td><td>${esc(l.extra)}</td><td>${esc(l.use)}</td></tr>`).join('')}
        </tbody></table></div>
        <p class="status">${esc(prep.storage||'')}</p>
      </section>
      <div class="note green"><b>Toddler rules, every night</b><p>${esc(plan.toddlerRules||'')}</p></div>
      <section>
        <h3>Who's rating</h3>
        <p class="status" style="margin-top:-6px">Each dinner tab has a thumbs up or down for each of you, plus an ease rating.</p>
        <div class="names"><label for="name-0">First adult<input id="name-0" data-name="0" value="${esc(names[0])}" maxlength="24"></label><label for="name-1">Second adult<input id="name-1" data-name="1" value="${esc(names[1])}" maxlength="24"></label></div>
      </section>
      ${syncSection()}
      <section>
        <h3>Your data</h3>
        <p class="status" style="margin-top:-6px">Everything is saved on this device. Export a backup to keep a copy or move store choices and names to another phone, or import a new week's plan file.</p>
        <div class="row">
          <button class="btn" id="export">Export backup</button>
          <button class="btn" id="import">Import backup or plan</button>
          <button class="btn" id="refresh">Check for new plan</button>
        </div>
        <p class="status">Plan generated ${esc(plan.generatedAt ? fmtDate(new Date(plan.generatedAt),{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}) : '—')}${planSource==='imported'?' · imported from a file':''}.</p>
      </section>`;
  }

  // ---------- ratings ----------
  function ratingFor(n){ return n && n.mealId ? ratings[n.mealId] : null; }
  const thumbs = v => v==='up'?'👍':v==='down'?'👎':'·';
  function ratingSummary(r){
    if(!r || (!r.a && !r.b && !r.ease)) return '';
    const both = r.a && r.b;
    const tag = both ? (r.a==='up'&&r.b==='up' ? 'Favorite' : r.a==='down'&&r.b==='down' ? 'Retired' : 'Split vote') : 'Partly rated';
    const ease = EASE.find(e=>e[0]===r.ease);
    return `<span class="chip ${tag==='Favorite'?'green':tag==='Retired'?'warm':''}">${thumbs(r.a)}${thumbs(r.b)} ${tag}${ease?' · '+ease[1]:''}</span>`;
  }
  function ratingCard(n){
    if(!n.mealId) return '';
    const r = ratingFor(n);
    if(r && r.ratedWeek && r.ratedWeek !== plan.weekOf){
      return `<div class="card rate"><h3>Your ratings</h3><p class="status">You rated this dinner the week of ${esc(r.ratedWeek)}.</p><div class="meta">${ratingSummary(r)}</div></div>`;
    }
    const cur = r || {};
    const who = (k,i)=>`<div class="raterow"><span class="who">${esc(names[i]||('Adult '+(i+1)))}</span>
      <div class="seg" role="group" aria-label="${esc(names[i])}'s rating">
        <button data-rate="${k}" data-val="up" aria-pressed="${cur[k]==='up'}" aria-label="Thumbs up">👍</button>
        <button data-rate="${k}" data-val="down" aria-pressed="${cur[k]==='down'}" aria-label="Thumbs down">👎</button>
      </div></div>`;
    return `<div class="card rate">
      <h3>How was it?</h3>
      <p class="status">Two thumbs up brings it back within two weeks, a split vote within four, and two thumbs down retires it.</p>
      ${who('a',0)}${who('b',1)}
      <div class="raterow col"><span class="who">How easy was it to make?</span>
        <div class="seg wide" role="group" aria-label="Ease of preparing">${EASE.map(([v,l])=>`<button data-ease="${v}" aria-pressed="${cur.ease===v}">${l}</button>`).join('')}</div>
      </div>
      <p class="status">${n.newTechnique?'New technique this week: '+esc(n.technique)+'. Your ease rating shapes how fast new techniques come.':'Your ease rating shapes how fast new techniques come.'}</p>
    </div>`;
  }
  function saveRating(n, patch){
    const prev = ratings[n.mealId] || {};
    const now = new Date().toISOString();
    // per-field times let two phones rate the same dinner without overwriting each other
    const t = Object.assign({}, prev.t);
    Object.keys(patch).forEach(k=>{ t[k] = now; });
    ratings[n.mealId] = Object.assign({}, prev, patch, {mealId:n.mealId, title:n.title, cuisine:n.cuisine||null, technique:n.technique||null, ratedWeek:plan.weekOf, updatedAt:now, t});
    persist(); render();
    markDirty();
  }

  // ---------- nutrition (per adult serving) ----------
  function nutritionHTML(nu){
    const p = nu && nu.perAdult;
    if(!p || !(p.protein >= 0 && p.carbs >= 0 && p.fat >= 0)) return '';
    const cal = { protein: p.protein*4, carbs: p.carbs*4, fat: p.fat*9 };
    const total = cal.protein + cal.carbs + cal.fat || 1;
    const pct = k => Math.round(cal[k] / total * 100);
    const tile = (k, label) => `<div class="macro m-${k}"><b>${esc(p[k])}<small> g</small></b><span>${label}</span><i>${pct(k)}% of calories</i></div>`;
    return `<section class="card nutri" aria-label="Nutrition per adult serving">
      <div class="row" style="justify-content:space-between;align-items:baseline"><h3 style="margin:0">Per adult serving</h3>${p.calories ? `<span class="kcal"><b>${esc(p.calories)}</b> cal</span>` : ''}</div>
      <div class="macros">${tile('protein','Protein')}${tile('carbs','Carbs')}${tile('fat','Fat')}</div>
      <div class="macrobar" aria-hidden="true"><span class="m-protein" style="width:${pct('protein')}%"></span><span class="m-carbs" style="width:${pct('carbs')}%"></span><span class="m-fat" style="width:${pct('fat')}%"></span></div>
      ${sodiumHTML(p.sodium, nu.sodiumNote)}
      <p class="status">${p.fiber != null ? esc(p.fiber) + ' g fiber. ' : ''}${esc(nu.note || 'Estimated.')}</p>
    </section>`;
  }
  // sodium against the American Heart Association's daily targets: 1,500 mg ideal, 2,300 mg limit
  function sodiumHTML(mg, note){
    if(!(mg >= 0)) return '';
    const IDEAL = 1500, LIMIT = 2300;
    const share = Math.round(mg / IDEAL * 100);
    const level = mg <= 600 ? 'low' : mg <= 900 ? 'mid' : 'high';
    const words = {low:'Low for a dinner', mid:'Moderate for a dinner', high:'High for a dinner'}[level];
    return `<div class="sodium s-${level}">
      <div class="row" style="justify-content:space-between;align-items:baseline"><span><b>${esc(mg)}</b> mg sodium</span><span class="slabel">${words}</span></div>
      <div class="smeter" aria-hidden="true"><span style="width:${Math.min(100, mg / LIMIT * 100)}%"></span><i style="left:${IDEAL / LIMIT * 100}%"></i></div>
      <p class="status">About ${share}% of the 1,500 mg daily ideal (the line); the bar runs to the 2,300 mg daily limit.${note ? ' ' + esc(note) : ''}</p>
    </div>`;
  }

  // ---------- one night ----------
  function checkKey(id, kind, j){ return plan.weekOf + ':' + id + ':' + kind + ':' + j; }
  function nightChecks(id){
    const out = {ing:[], steps:[]};
    ['ing','steps'].forEach(kind=>{
      const n = plan.nights.find(x=>x.id===id), len = n ? (n[kind==='ing'?'ingredients':'steps']||[]).length : 0;
      for(let j=0;j<len;j++){ const c = checks[checkKey(id,kind,j)]; if(c && c.v) out[kind].push(j); }
    });
    return out;
  }
  function setCheck(id, kind, j, v){
    checks[checkKey(id,kind,j)] = {v:!!v, t:new Date().toISOString()};
    persist(); markDirty();
  }
  function renderNight(id){
    const i = plan.nights.findIndex(n=>n.id===id);
    const n = plan.nights[i];
    const st = nightChecks(id);
    const date = fmtDate(weekDate(i), {weekday:'long', month:'long', day:'numeric'});
    const r = ratingFor(n);
    return `
      <section>
        <div class="eyebrow">${esc(date)}</div>
        <h2>${esc(n.title)}</h2>
        <div class="meta">
          <span class="chip">${esc(n.activeMin)} min active</span>
          <span class="chip">${esc(n.totalMin)} min total</span>
          ${(n.gear||[]).map(g=>`<span class="chip">${esc(g)}</span>`).join('')}
          ${n.meatless?'<span class="chip green">Meatless</span>':''}
          ${n.cuisine?`<span class="chip">${esc(n.cuisine)}</span>`:''}
          ${n.newTechnique?`<span class="chip warm">New technique</span>`:''}
          ${r && r.ratedWeek!==plan.weekOf ? ratingSummary(r) : ''}
        </div>
        <p class="lead" style="margin-top:6px">${esc(n.why)}</p>
      </section>
      <div class="card">${plateHTML(n.plate)}</div>
      ${n.portions?`<div class="note green"><b>Portions</b><p>${esc(n.portions)}</p></div>`:''}
      ${nutritionHTML(n.nutrition)}
      <section>
        <div class="row" style="justify-content:space-between"><h3 style="margin:0">Ingredients</h3><span class="status">Serves ${esc(plan.household||'2 adults + toddler')}</span></div>
        <div class="card" style="padding-block:6px"><ul class="check">
          ${(n.ingredients||[]).map((x,j)=>`<li><label><input type="checkbox" id="ing-${esc(id)}-${j}" data-ing="${j}" ${st.ing.includes(j)?'checked':''}><span>${esc(x)}</span></label></li>`).join('')}
        </ul></div>
      </section>
      <section>
        <div class="row" style="justify-content:space-between"><h3 style="margin:0">Steps</h3>${'wakeLock' in navigator?`<button class="btn" id="wake" aria-pressed="${!!wake}">${wake?'Screen stays on':'Keep screen on'}</button>`:''}</div>
        <p class="status">Tap a step to mark it done.</p>
        <ol class="steps">${(n.steps||[]).map((s,j)=>`<li class="${st.steps.includes(j)?'done':''}"><button data-step="${j}" aria-pressed="${st.steps.includes(j)}"><p>${esc(s)}</p></button></li>`).join('')}</ol>
      </section>
      <div class="note green"><b>Toddler plate</b><p>${esc(n.toddler)}</p></div>
      <div class="note"><b>Prep-ahead &amp; leftovers</b><p>${esc(n.prep)}</p></div>
      ${n.technique?`<div class="note green"><b>Technique${n.newTechnique?' · new':''}</b><p>${esc(n.technique)}</p></div>`:''}
      ${ratingCard(n)}
      <div class="row">
        ${i>0?`<button class="btn" data-go="${esc(plan.nights[i-1].id)}">← ${esc(plan.nights[i-1].day)}</button>`:`<button class="btn" data-go="week">← Week</button>`}
        <span style="flex:1"></span>
        ${i<plan.nights.length-1?`<button class="btn" data-go="${esc(plan.nights[i+1].id)}">${esc(plan.nights[i+1].day)} →</button>`:`<button class="btn" data-go="groceries">Groceries →</button>`}
      </div>`;
  }

  // ---------- groceries ----------
  function enabledStores(){
    const ids = (plan.grocery.stores||[]).map(s=>s.id);
    // a store that shows up in a plan for the first time starts switched on
    const fresh = ids.filter(id=>!seenStores.includes(id));
    if(fresh.length){
      seenStores = [...seenStores, ...fresh];
      if(enabled) enabled = [...enabled, ...fresh];
      persist();
    }
    const on = enabled || ids;
    return ids.filter(id=>on.includes(id));
  }
  function storeName(id){ const s=(plan.grocery.stores||[]).find(s=>s.id===id); return s?s.name:id; }
  function allItems(){ const out=[]; (plan.grocery.groups||[]).forEach(g=>g.items.forEach(it=>out.push([it,g]))); return out; }
  function levelFor(item, grp){
    const d = inv[item.key];
    if(d && (item.staple || grp.pantry || d.weekOf === plan.weekOf)) return d.level;
    return grp.pantry ? 4 : 0;
  }
  function pick(it, stores){
    const pr = it.prices||{};
    let best = null;
    stores.forEach(id=>{ const p=pr[id]; if(p && (best===null || p.cost < best.cost)) best = {store:id, cost:p.cost, p}; });
    return best || {store:null, cost:it.price||0, p:null};
  }
  function totals(){
    const on = enabledStores();
    let full=0, left=0; const route={};
    allItems().forEach(([it,g])=>{
      const lv = levelFor(it,g), pk = pick(it,on), owe = pk.cost*(1-lv/4);
      if(!g.pantry) full += pk.cost;
      left += owe;
      if(owe>0.004){ const k=pk.store||'any'; route[k]=route[k]||{cost:0,n:0}; route[k].cost+=owe; route[k].n++; }
    });
    return {full,left,route};
  }
  function oneStore(id){
    let total=0, priced=0, n=0;
    allItems().forEach(([it,g])=>{ if(g.pantry) return; n++; const p=(it.prices||{})[id]; if(p){ total+=p.cost; priced++; } else total+=it.price||0; });
    return {total,priced,n};
  }
  function itemPriceText(it, grp, on){
    const lv = levelFor(it, grp), pk = pick(it,on);
    return money(pk.cost*(1-lv/4));
  }

  function renderGroceries(){
    const g = plan.grocery, on = enabledStores(), t = totals();
    const stores = g.stores||[];
    const toggles = stores.map(s=>`<button class="storechip" data-store="${esc(s.id)}" aria-pressed="${on.includes(s.id)}"><span class="sn">${esc(s.name)}</span><small>${esc(s.note||'')}</small></button>`).join('');
    const routeRows = Object.entries(t.route).sort((a,b)=>b[1].cost-a[1].cost).map(([k,v])=>`<tr><td>${k==='any'?'Any store (typical price)':esc(storeName(k))}</td><td class="num">${v.n}</td><td class="num">${money(v.cost)}</td></tr>`).join('');
    const compRows = stores.map(s=>{ const o=oneStore(s.id); return `<tr class="${on.includes(s.id)?'':'off'}"><td>${esc(s.name)}</td><td class="num">${money(o.total)}</td><td class="num">${o.priced} of ${o.n}</td></tr>`; }).join('');
    const itemHTML = (it, grp, label) => {
          const lv = levelFor(it, grp), pk = pick(it,on), pr = it.prices||{};
          const strip = Object.keys(pr).length ? `<div class="strip" style="grid-template-columns:repeat(${stores.length > 4 ? 3 : Math.max(stores.length,1)},minmax(0,1fr))">${stores.map(s=>{
            const p = pr[s.id]; const best = pk.store===s.id; const off = !on.includes(s.id);
            return `<div class="cell${best?' best':''}${off?' off':''}"><span class="st">${esc(s.name.replace('-Osco',''))}</span>${p?`<b>${money(p.cost)}</b><small>${esc(p.unit)}${p.sale?' · sale':''}${p.bulk?' · bulk':''}${p.approx?' · approx.':''}</small>`:'<b class="na">—</b><small>no price</small>'}</div>`;
          }).join('')}</div>` : '';
          const notes = [it.note, pk.p && pk.p.note].filter(Boolean);
          // items you have enough of are collapsed to name + slider at the bottom
          const full = lv < 4;
          return `<div class="item${lv===4?' have':''}">
            <div><div class="nm">${esc(it.name)}</div><div class="am">${esc(it.amount)}${it.for?' · '+esc(it.for):''}${label?' · '+esc(label):''}</div></div>
            <div class="pr"><span class="owe">${itemPriceText(it,grp,on)}</span><small>${pk.store?'at '+esc(storeName(pk.store)):'typical price'}</small></div>
            ${full ? strip : ''}
            ${full && notes.length?`<div class="tip">${notes.map(esc).join(' ')}</div>`:''}
            <div class="slider"><input type="range" min="0" max="4" step="1" value="${lv}" id="inv-${esc(it.key)}" data-inv="${esc(it.key)}" aria-label="How much ${esc(it.name)} you already have" aria-valuetext="${LEVELS[lv]}"><output class="${lv===4?'full':''}" for="inv-${esc(it.key)}">${LEVELS[lv]}</output></div>
            <div class="scale"><span>None on hand</span><span>Have enough</span></div>
          </div>`;
    };
    const have = [];
    const groups = (g.groups||[]).map(grp=>{
      const need = grp.items.filter(it=>levelFor(it,grp) < 4);
      grp.items.forEach(it=>{ if(levelFor(it,grp) === 4) have.push([it,grp]); });
      if(!need.length) return '';
      return `
      <div class="card store">
        <div class="storehead"><h3>${esc(grp.name)}</h3>${grp.pantry?'<small>Running low on these; slide back to "Have it" when restocked</small>':''}</div>
        ${need.map(it=>itemHTML(it, grp)).join('')}
      </div>`;
    }).join('');
    const haveOpen = store.get('fdp:haveOpen') !== false;
    const haveSection = have.length ? `
      <details class="card store havelist" id="haveList" ${haveOpen?'open':''}>
        <summary class="storehead"><h3>Already have <span class="count">${have.length}</span></h3><small>Slide one down if you need it after all</small></summary>
        ${have.map(([it,grp])=>itemHTML(it, grp, grp.name)).join('')}
      </details>` : '';
    return `
      <section><h2>Grocery list &amp; best prices</h2><p class="lead">${esc(g.estimate)}</p></section>
      <div class="card totals">
        <div class="total"><b id="tLeft">${money(t.left)}</b><span>Left to buy at your stores</span></div>
        <div class="total"><b>${money(t.full)}</b><span>Full list, before what's on hand</span></div>
      </div>
      <section>
        <h3>My stores</h3>
        <p class="status" style="margin-top:-6px">Turn off stores you won't visit. Each item's pick and the totals update.</p>
        <div class="storechips">${toggles}</div>
      </section>
      <section>
        <h3>Your trip</h3>
        <div class="card tablewrap"><table><thead><tr><th>Store</th><th class="num">Items</th><th class="num">Spend</th></tr></thead><tbody id="route">${routeRows||'<tr><td colspan="3">Everything is on hand.</td></tr>'}</tbody></table></div>
      </section>
      <section>
        <h3>If you shopped at one store</h3>
        <div class="card tablewrap"><table><thead><tr><th>Store</th><th class="num">Whole list</th><th class="num">Items priced</th></tr></thead><tbody>${compRows}</tbody></table></div>
        <p class="status">Items a store has no price for are counted at their typical price. Costco totals use whole bulk packs.</p>
      </section>
      <div class="note"><b>Shopping</b><p>${esc(plan.shopNote||'')}</p></div>
      <p class="status">Slide each item to show how much you already have. Items you have enough of move to Already have at the bottom. Fresh items reset with each new plan; pantry, frozen and dry goods stay where you leave them.</p>
      ${groups || '<div class="card"><p>Nothing left to buy. Everything is in Already have.</p></div>'}
      ${haveSection}
      <p class="status">${esc(g.skipped||'')}</p>
      <div class="sources">Prices from: ${(g.sources||[]).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('')}</div>
      <div class="row"><button class="btn" id="resetInv">Reset all sliders</button></div>`;
  }

  // ---------- sync between phones (GitHub) ----------
  // Ratings go to family-dinner/ratings.json (the Saturday plan task reads it); grocery sliders and
  // recipe checklists go to family-dinner/shared.json. Both live on a data branch of the repo so
  // saves don't redeploy the site.
  const SYNC_KEY = 'fdp:sync', DATA_BRANCH = 'family-dinner-data', RATINGS_PATH = 'family-dinner/ratings.json', SHARED_PATH = 'family-dinner/shared.json';
  const RATE_FIELDS = ['a','b','ease'], META_FIELDS = ['mealId','title','cuisine','technique','ratedWeek'];
  let sync = Object.assign({owner:'', repo:'', token:'', lastSync:null, error:'', dirty:false}, store.get(SYNC_KEY) || {});
  if(!sync.owner || !sync.repo){ const g = guessRepo(); sync.owner = sync.owner || g.owner; sync.repo = sync.repo || g.repo; }
  let syncing = false, syncAgain = false, syncTimer = null;
  function guessRepo(){
    const m = location.hostname.match(/^([^.]+)\.github\.io$/i);
    const seg = location.pathname.split('/').filter(Boolean)[0] || '';
    return m && seg ? {owner:m[1], repo:seg} : {owner:'', repo:''};
  }
  function saveSync(){ store.set(SYNC_KEY, sync); }
  function syncOn(){ return !!(sync.token && sync.owner && sync.repo); }
  function markDirty(){
    if(!syncOn()) return;
    sync.dirty = true; saveSync();
    clearTimeout(syncTimer); syncTimer = setTimeout(syncAll, 2500);
  }
  async function gh(method, path, body){
    const res = await fetch('https://api.github.com/repos/' + encodeURIComponent(sync.owner) + '/' + encodeURIComponent(sync.repo) + path, {
      method, cache:'no-store',
      headers: Object.assign({'Authorization':'Bearer ' + sync.token, 'Accept':'application/vnd.github+json', 'X-GitHub-Api-Version':'2022-11-28'}, body ? {'Content-Type':'application/json'} : {}),
      body: body ? JSON.stringify(body) : undefined
    });
    const data = res.status === 204 ? null : await res.json().catch(()=>null);
    if(!res.ok){ const e = new Error((data && data.message) || ('HTTP ' + res.status)); e.status = res.status; throw e; }
    return data;
  }
  const b64encode = s => { const bytes = new TextEncoder().encode(s); let bin = ''; bytes.forEach(b=>{ bin += String.fromCharCode(b); }); return btoa(bin); };
  const b64decode = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,'')), c=>c.charCodeAt(0)));
  let branchReady = false;
  async function ensureBranch(){
    if(branchReady) return;
    branchReady = await createBranchIfMissing();
  }
  async function createBranchIfMissing(){
    try{ await gh('GET', '/git/ref/heads/' + DATA_BRANCH); return true; }
    catch(e){ if(e.status !== 404) throw e; }
    const repo = await gh('GET', '');
    const base = await gh('GET', '/git/ref/heads/' + encodeURIComponent(repo.default_branch || 'main'));
    try{ await gh('POST', '/git/refs', {ref:'refs/heads/' + DATA_BRANCH, sha:base.object.sha}); }
    catch(e){ if(e.status !== 422) throw e; } // 422: another phone created it first
    return true;
  }
  async function readFile(path){
    try{
      const f = await gh('GET', '/contents/' + path + '?ref=' + DATA_BRANCH);
      return {sha:f.sha, doc:obj(JSON.parse(b64decode(f.content || '')))};
    }catch(e){ if(e.status === 404) return {sha:null, doc:{}}; throw e; }
  }
  // newest entry wins per key (entries carry t = time last set); ties keep x
  function mergeLatest(x, y){
    const out = Object.assign({}, x);
    Object.entries(y).forEach(([k,v])=>{ if(!out[k] || String((v&&v.t)||'') > String(out[k].t||'')) out[k] = v; });
    return out;
  }
  // drop checklist entries more than five weeks older than this week's plan
  function pruneChecks(c){
    if(!plan) return c;
    const d = new Date(plan.weekOf + 'T12:00:00'); d.setDate(d.getDate() - 35);
    const cutoff = d.toISOString().slice(0,10), out = {};
    Object.entries(c).forEach(([k,v])=>{ if(k.slice(0,10) >= cutoff) out[k] = v; });
    return out;
  }
  // records with per-field times use them; older records (made in Claude, or from a backup) use updatedAt
  function fieldTime(r, f){ if(!r) return ''; if(r.t && typeof r.t === 'object') return r.t[f] || ''; return r.updatedAt || ''; }
  function mergeRatings(x, y){ // newest value wins per field; ties keep x
    const out = {};
    new Set([...Object.keys(x), ...Object.keys(y)]).forEach(id=>{
      const a = x[id], b = y[id];
      if(!a || !b){ out[id] = Object.assign({}, a || b); return; }
      const newer = String(b.updatedAt||'') > String(a.updatedAt||'') ? b : a;
      const r = {t:{}};
      META_FIELDS.forEach(f=>{ r[f] = newer[f] !== undefined ? newer[f] : (a[f] !== undefined ? a[f] : b[f]); });
      RATE_FIELDS.forEach(f=>{
        const ta = fieldTime(a,f), tb = fieldTime(b,f);
        const src = tb > ta ? b : a;
        r[f] = src[f] === undefined ? null : src[f];
        r.t[f] = tb > ta ? tb : ta;
      });
      r.updatedAt = String(b.updatedAt||'') > String(a.updatedAt||'') ? b.updatedAt : a.updatedAt;
      out[id] = r;
    });
    return out;
  }
  const sameRatings = (x, y) => JSON.stringify(sortKeys(x)) === JSON.stringify(sortKeys(y));
  function sortKeys(v){ if(Array.isArray(v)) return v.map(sortKeys); if(v && typeof v === 'object'){ const o = {}; Object.keys(v).sort().forEach(k=>{ o[k] = sortKeys(v[k]); }); return o; } return v; }

  // Read the file, merge with this phone, write it back if the merge added anything, retrying
  // when another phone saved in between. Returns true if this phone's data changed.
  async function syncFile(f){
    for(let attempt = 0; ; attempt++){
      const remote = await readFile(f.path);
      const theirs = f.fromDoc(remote.doc), mine = f.local();
      const merged = f.merge(mine, theirs);
      if(!sameRatings(merged, theirs)){
        try{
          await gh('PUT', '/contents/' + f.path, {
            message: f.message,
            content: b64encode(JSON.stringify(Object.assign({updatedAt:new Date().toISOString()}, f.toDoc(merged)), null, 1) + '\n'),
            branch: DATA_BRANCH,
            ...(remote.sha ? {sha:remote.sha} : {})
          });
        }catch(e){
          if((e.status === 409 || e.status === 422) && attempt < 3) continue; // another phone saved first; merge again
          throw e;
        }
      }
      // merge again with what's on the phone now, in case something was tapped while saving
      const latest = f.merge(f.local(), merged);
      const changed = !sameRatings(latest, mine);
      f.apply(latest);
      return changed;
    }
  }
  const SYNC_FILES = [
    { path: RATINGS_PATH,
      fromDoc: d => obj(d.ratings), local: () => ratings,
      merge: mergeRatings, apply: m => { ratings = m; },
      toDoc: m => ({ratings: sortKeys(m)}),
      get message(){ return 'Dinner ratings from ' + names.join(' & ') + ' (' + new Date().toISOString().slice(0,10) + ')'; } },
    { path: SHARED_PATH,
      fromDoc: d => ({inv: obj(d.inv), checks: obj(d.checks)}), local: () => ({inv, checks}),
      merge: (x, y) => ({inv: mergeLatest(x.inv, y.inv), checks: pruneChecks(mergeLatest(x.checks, y.checks))}),
      apply: m => { inv = m.inv; checks = m.checks; },
      toDoc: m => ({inv: sortKeys(m.inv), checks: sortKeys(m.checks)}),
      get message(){ return 'Grocery sliders and checklists (' + new Date().toISOString().slice(0,10) + ')'; } }
  ];
  async function syncAll(opts){
    opts = opts || {};
    if(!syncOn()) return;
    if(syncing){ syncAgain = true; return; }
    syncing = true; clearTimeout(syncTimer);
    if(!opts.quiet) paintSync('Syncing…');
    const wasDirty = sync.dirty; sync.dirty = false;
    try{
      await ensureBranch();
      let changed = false;
      for(const f of SYNC_FILES) changed = (await syncFile(f)) || changed;
      persist();
      if(changed) safeRender();
      sync.error = ''; sync.lastSync = new Date().toISOString(); saveSync();
      paintSync();
      if(opts.manual) toast('Synced');
    }catch(e){
      sync.dirty = sync.dirty || wasDirty;
      sync.error = e.status === 401 ? 'GitHub rejected the token. It may have expired; paste a new one.'
        : (e.status === 403 || e.status === 404) ? "The token can't write to " + sync.owner + '/' + sync.repo + '. Check its repository access and that Contents is set to Read and write.'
        : (e instanceof TypeError) ? "Couldn't reach GitHub. Changes will sync when you're back online."
        : 'Sync failed: ' + e.message;
      saveSync(); paintSync();
      if(opts.manual) toast(sync.error);
    }finally{
      syncing = false;
      if(syncAgain){ syncAgain = false; syncAll(); }
    }
  }
  function syncStatusText(){
    if(!syncOn()) return 'Not connected. Ratings, sliders and checklists stay on this phone.';
    if(sync.error) return sync.error;
    const when = sync.lastSync ? new Date(sync.lastSync).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}) : 'not yet';
    return (sync.dirty ? 'Waiting to sync. ' : '') + 'Last synced ' + when + '.';
  }
  function paintSync(text){ const el = $('syncStatus'); if(el) el.textContent = text || syncStatusText(); }
  function syncSection(){
    const head = `<h3>Sync between phones</h3>
      <p class="status" style="margin-top:-6px">Ratings, grocery sliders and recipe checklists sync through your GitHub repo, so both phones match. The Saturday plan also reads the ratings, along with ratings made in Claude. Connect each phone once.</p>`;
    if(syncOn()) return `<section>${head}
      <p><b>Connected to ${esc(sync.owner)}/${esc(sync.repo)}</b></p>
      <p class="status" id="syncStatus">${esc(syncStatusText())}</p>
      <div class="row"><button class="btn primary" id="syncNow">Sync now</button><button class="btn" id="syncOff">Disconnect</button></div>
    </section>`;
    return `<section>${head}
      <div class="names">
        <label for="syncOwner">GitHub owner<input id="syncOwner" value="${esc(sync.owner)}" autocapitalize="off" autocorrect="off" spellcheck="false"></label>
        <label for="syncRepo">Repository<input id="syncRepo" value="${esc(sync.repo)}" autocapitalize="off" autocorrect="off" spellcheck="false"></label>
      </div>
      <div class="names" style="grid-template-columns:1fr"><label for="syncToken">Access token<input id="syncToken" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="github_pat_…"></label></div>
      <p class="status">Make a fine-grained token for this one repository with Contents set to Read and write. <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener" style="color:var(--accent)">Create a token</a> · the app's README has step-by-step instructions. The token is stored only on this phone.</p>
      <div class="row"><button class="btn primary" id="syncConnect">Connect &amp; sync</button></div>
      <p class="status" id="syncStatus">${esc(sync.error || '')}</p>
    </section>`;
  }
  function connectSync(){
    const owner = ($('syncOwner').value || '').trim(), repo = ($('syncRepo').value || '').trim(), token = ($('syncToken').value || '').trim();
    if(!owner || !repo || !token){ paintSync('Fill in the owner, repository and token.'); return; }
    sync = Object.assign(sync, {owner, repo, token, error:'', dirty:true}); saveSync();
    render(); syncAll({manual:true});
  }
  function disconnectSync(){
    if(!confirm('Disconnect? The token is removed from this phone. What already synced stays in the repo.')) return;
    sync = Object.assign(sync, {token:'', error:'', lastSync:null, dirty:false}); saveSync(); render();
  }
  let pendingRender = false;
  function safeRender(){
    const a = document.activeElement;
    // don't redraw under someone typing or dragging a slider; redraw when they're done
    if(a && a.tagName === 'INPUT' && a.type !== 'checkbox'){ pendingRender = true; return; }
    const y = scrollY; render(); scrollTo(0, y);
  }
  document.addEventListener('focusout', ()=>{ if(pendingRender){ pendingRender = false; setTimeout(safeRender, 0); } });

  // ---------- render ----------
  function render(){
    if(!plan){
      renderTabs('');
      $main.innerHTML = loadNote
        ? `<div class="empty"><h2>Plan not reachable yet</h2><p>${esc(loadNote)}</p><p style="margin-top:16px"><button class="btn" id="import">Import a plan file</button></p></div>`
        : `<div class="empty"><h2>Loading this week's plan</h2><p>Pulling up the dinners and grocery list.</p></div>`;
      return;
    }
    header();
    const id = current();
    renderTabs(id);
    if(id !== cookingFor) dropWake();
    let html = id==='week' ? renderWeek() : id==='groceries' ? renderGroceries() : renderNight(id);
    if(loadNote) html = `<div class="banner">${esc(loadNote)}</div>` + html;
    $main.innerHTML = html;
  }

  // ---------- interactions ----------
  document.addEventListener('click', e=>{
    const g = e.target.closest('[data-go]');
    if(g){ go(g.dataset.go); return; }
    if(!e.target.closest('button')) return;
    const b = e.target.closest('button');
    if(b.id === 'export') return exportData();
    if(b.id === 'import') return $('importfile').click();
    if(b.id === 'refresh'){ loadPlan().then(()=>toast('Plan is up to date')); return; }
    if(b.id === 'syncConnect') return connectSync();
    if(b.id === 'syncNow') return syncAll({manual:true});
    if(b.id === 'syncOff') return disconnectSync();
    if(!plan) return;
    if(b.id === 'wake'){ wake ? dropWake() : holdWake(current()); return; }
    if(b.id === 'resetInv') return resetInventory();
    if(b.dataset.step !== undefined){
      const id = current(), j = +b.dataset.step;
      const on = !nightChecks(id).steps.includes(j);
      setCheck(id, 'steps', j, on);
      b.parentElement.classList.toggle('done', on); b.setAttribute('aria-pressed', on);
      return;
    }
    const n = plan.nights.find(x=>x.id===current());
    if(b.dataset.rate && n){ const k=b.dataset.rate; const cur=(ratings[n.mealId]||{})[k]; saveRating(n, {[k]: cur===b.dataset.val ? null : b.dataset.val}); return; }
    if(b.dataset.ease && n){ const cur=(ratings[n.mealId]||{}).ease; saveRating(n, {ease: cur===b.dataset.ease ? null : b.dataset.ease}); return; }
    if(b.dataset.store){
      const cur = enabledStores(), id = b.dataset.store;
      enabled = cur.includes(id) ? cur.filter(x=>x!==id) : [...cur, id];
      persist(); render(); return;
    }
  });
  document.addEventListener('change', e=>{
    const t = e.target;
    if(t.dataset.ing !== undefined && plan) setCheck(current(), 'ing', +t.dataset.ing, t.checked);
    if(t.dataset.inv){ persist(); markDirty(); }
    if(t.dataset.name !== undefined){
      const i = +t.dataset.name;
      names[i] = t.value.trim() || ('Adult '+(i+1));
      persist();
    }
  });
  document.addEventListener('input', e=>{
    const t = e.target;
    if(!t.dataset.inv || !plan) return;
    const lv = +t.value, row = t.closest('.item');
    const out = row.querySelector('output');
    out.textContent = LEVELS[lv]; out.classList.toggle('full', lv===4);
    t.setAttribute('aria-valuetext', LEVELS[lv]);
    row.classList.toggle('have', lv===4);
    inv[t.dataset.inv] = {level:lv, weekOf:plan.weekOf, t:new Date().toISOString()};
    const hit = allItems().find(([it])=>it.key===t.dataset.inv);
    if(hit) row.querySelector('.owe').textContent = itemPriceText(hit[0], hit[1], enabledStores());
    const tl = $('tLeft'); if(tl) tl.textContent = money(totals().left);
  });
  // when a slide finishes, redraw: the item moves to or from Already have
  const slideStart = {};
  document.addEventListener('input', e=>{ const k = e.target.dataset.inv; if(k && !(k in slideStart)) slideStart[k] = +e.target.defaultValue; }, true);
  document.addEventListener('change', e=>{
    const k = e.target.dataset.inv; if(!k) return;
    const from = k in slideStart ? slideStart[k] : null, to = +e.target.value; delete slideStart[k];
    const y = scrollY; render(); scrollTo(0,y);
    const hit = allItems().find(([it])=>it.key===k); if(!hit || from === null) return;
    const undo = ()=>{ inv[k] = {level:from, weekOf:plan.weekOf, t:new Date().toISOString()}; persist(); markDirty(); const y2 = scrollY; render(); scrollTo(0,y2); };
    if(to === 4 && from < 4) toast(hit[0].name + ' moved to Already have', 'Undo', undo, 5000);
    else if(from === 4 && to < 4) toast(hit[0].name + ' moved back to the list', 'Undo', undo, 5000);
  });
  document.addEventListener('toggle', e=>{ if(e.target.id === 'haveList') store.set('fdp:haveOpen', e.target.open); }, true);

  function resetInventory(){
    const now = new Date().toISOString();
    allItems().forEach(([it,grp])=>{ inv[it.key] = {level: grp.pantry ? 4 : 0, weekOf: plan.weekOf, t: now}; });
    persist(); render(); markDirty(); toast('Sliders reset');
  }

  window.addEventListener('hashchange', render);

  // ---------- backup & plan import ----------
  function exportData(){
    const data = {app:'family-dinner', version:1, exported:new Date().toISOString(), ratings, inv, enabled, seenStores, names, checks};
    const blob = new Blob([JSON.stringify(data, null, 1)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'family-dinner-' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
    toast('Backup exported');
  }
  async function importFile(file){
    let c;
    try{ c = JSON.parse(await file.text()); }catch(e){ toast("That file isn't a backup or a plan"); return; }
    if(validPlan(c)){
      const prev = plan && {plan, source:planSource};
      usePlan(c, 'imported'); loadNote = ''; render();
      toast('Plan for week of ' + c.weekOf + ' loaded', prev ? 'Undo' : null, ()=>{ usePlan(prev.plan, prev.source); render(); }, 8000);
      return;
    }
    if(!c || c.app !== 'family-dinner'){ toast("That file isn't a backup or a plan"); return; }
    if(!confirm('Replace the ratings, sliders and checklists on this device with the backup?')) return;
    const prev = {ratings, inv, enabled, seenStores, names, checks};
    ratings = obj(c.ratings); inv = obj(c.inv);
    enabled = Array.isArray(c.enabled) ? c.enabled : null;
    seenStores = Array.isArray(c.seenStores) ? c.seenStores : ORIGINAL_STORES.slice();
    names = Array.isArray(c.names) && c.names.length ? [String(c.names[0]||'Adult 1'), String(c.names[1]||'Adult 2')] : names;
    checks = {};
    Object.entries(obj(c.checks)).forEach(([k,v])=>{ if(/^\d{4}-\d{2}-\d{2}:[^:]+:(ing|steps):\d+$/.test(k) && v && typeof v === 'object') checks[k] = {v:!!v.v, t:String(v.t||'')}; });
    Object.entries(obj(c.checklists)).forEach(([k,v])=>legacyChecklist(k, v)); // backups from the first version
    persist(); render(); markDirty();
    toast('Backup imported', 'Undo', ()=>{ ({ratings, inv, enabled, seenStores, names, checks} = prev); persist(); render(); markDirty(); }, 8000);
  }
  $('importfile').addEventListener('change', e=>{ const f = e.target.files[0]; e.target.value = ''; if(f) importFile(f); });

  // ---------- keep screen on while cooking ----------
  let wake = null, cookingFor = null;
  async function holdWake(id){
    try{
      if(!wake && navigator.wakeLock && !document.hidden){
        wake = await navigator.wakeLock.request('screen'); cookingFor = id;
        wake.addEventListener('release', ()=>{ wake = null; paintWake(); });
      }
    }catch(e){ toast("This device won't keep the screen on"); }
    paintWake();
  }
  function dropWake(){ cookingFor = null; try{ wake && wake.release(); }catch(e){} wake = null; paintWake(); }
  function paintWake(){ const b = $('wake'); if(b){ b.setAttribute('aria-pressed', !!wake); b.textContent = wake ? 'Screen stays on' : 'Keep screen on'; } }
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden && cookingFor && cookingFor === current()) { const id = cookingFor; cookingFor = null; holdWake(id); } });

  // ---------- toast ----------
  let toastT = null;
  function toast(msg, btn, fn, ms=4000){
    $('toastmsg').textContent = msg; const b = $('toastbtn');
    if(btn){ b.textContent = btn; b.hidden = false; b.onclick = ()=>{ $('toast').hidden = true; fn(); }; } else b.hidden = true;
    $('toast').hidden = false; clearTimeout(toastT);
    if(ms) toastT = setTimeout(()=>{ $('toast').hidden = true; }, ms);
  }

  // ---------- app shell ----------
  if('serviceWorker' in navigator && location.protocol !== 'file:'){
    addEventListener('load', ()=>{
      navigator.serviceWorker.register('sw.js').then(reg=>{
        const offer = w => toast('A new version is ready', 'Reload', ()=>w.postMessage('skipWaiting'), 0);
        if(reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
        reg.addEventListener('updatefound', ()=>{ const w = reg.installing; w && w.addEventListener('statechange', ()=>{ if(w.state === 'installed' && navigator.serviceWorker.controller) offer(w); }); });
      }).catch(()=>{});
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', ()=>{ if(reloaded) return; reloaded = true; location.reload(); });
    });
  }
  // a new plan may have been published while the app sat in the background
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden) return;
    if(plan) loadPlan();
    if(syncOn()) syncAll({quiet:true});
  });
  // while the app is open, pick up the other phone's changes every 30 seconds
  setInterval(()=>{ if(syncOn() && !document.hidden && !syncing) syncAll({quiet:true}); }, 30000);
  addEventListener('online', ()=>{ if(syncOn() && sync.dirty) syncAll(); });

  render();
  loadPlan();
  if(syncOn()) syncAll();
})();
