
(() => {
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const i18n = window.I18N;
  let lang = localStorage.getItem("lang") || "ru";

  const ids = ["apr","fee","principal","contrib","years","infl","currency","affAvg","affMonths","l1","l2","l3","l4"];
  const state = Object.fromEntries(ids.map(id=>[id, null]));
  const scenario = { base: {apr:+($("#apr").value), infl:+($("#infl").value)},
                     opt:  {apr:+($("#apr").value)+6, infl: Math.max(0,+($("#infl").value)-2)},
                     pes:  {apr:Math.max(0,+($("#apr").value)-6), infl:+($("#infl").value)+3} };
  let currentScenario = "base";

  function applyLang() {
    document.documentElement.lang = lang;
    const dict = i18n[lang];
    $$("[data-i]").forEach(el => el.textContent = dict[el.getAttribute("data-i")]);
    $("#langBtn").textContent = lang === "ru" ? "RU / EN" : "EN / RU";
  }
  applyLang();

  // Theme
  const themeToggle = $("#theme");
  const savedTheme = localStorage.getItem("theme");
  if(savedTheme === "light") document.documentElement.classList.add("light");
  themeToggle.checked = !document.documentElement.classList.contains("light");
  themeToggle.onchange = () => {
    document.documentElement.classList.toggle("light", !themeToggle.checked);
    localStorage.setItem("theme", document.documentElement.classList.contains("light")?"light":"dark");
  };

  // Tabs scenarios
  $$("#scTabs .tab").forEach(tab=>{
    tab.onclick = () => {
      $$("#scTabs .tab").forEach(t=>t.classList.remove("active"));
      tab.classList.add("active");
      currentScenario = tab.dataset.scenario;
      recalc();
    };
  });

  // Load handlers
  ids.forEach(id => {
    const el = $("#"+id);
    state[id] = (el.type==="number") ? +el.value : el.value;
    el.addEventListener("input", recalc);
  });
  $("#useAff").addEventListener("change", recalc);

  function effRate(apr, fee){
    const net = Math.max(0, apr/100*(1-fee/100));
    const m = net/12;
    return ((1+m)**12 - 1)*100;
  }

  function recalc(){
    // apply scenario deltas on APR/Inflation
    const baseAPR = +($("#apr").value);
    const baseInfl = +($("#infl").value);
    const sc = scenario[currentScenario];
    const apr = sc ? sc.apr : baseAPR;
    const infl = sc ? sc.infl : baseInfl;
    // write back to EAR display
    const ear = effRate(apr, +$("#fee").value);
    $("#earOut").textContent = ear.toFixed(2)+"%";
    // big deposit tile highlight
    const bigTile = $("#bigDepositTile");
    const pr = +$("#principal").value;
    bigTile.classList.toggle("hl-good", pr>=10000);

    // monthly simulation
    const months = Math.max(1, +$("#years").value*12|0);
    const contrib = +$("#contrib").value;
    let bal = +$("#principal").value;
    const netMonthly = ( (apr/100)*(1- +$("#fee").value/100) )/12;
    let invested = bal;
    const series = [bal];
    const cashflows = [-bal];
    const currency = $("#currency").value;
    for(let t=1;t<=months;t++){
      // contribution at end of month
      bal = bal*(1+netMonthly) + contrib;
      series.push(bal);
      invested += contrib;
      cashflows.push(-contrib);
    }
    const end = series[series.length-1];
    const gain = Math.max(0, end - invested);

    // Partner income
    let partner = 0;
    if($("#useAff").checked){
      const avg = +$("#affAvg").value; const m = +$("#affMonths").value;
      const pcts = [+$("#l1").value,+$("#l2").value,+$("#l3").value,+$("#l4").value].map(v=>Math.max(0,v)/100);
      // simple model: monthly partner income = avg * (L1+...)
      for(let t=1;t<=m;t++){ partner += avg*(pcts.reduce((a,b)=>a+b,0)); cashflows.push(avg*(pcts.reduce((a,b)=>a+b,0))); }
    }

    // KPI
    const roi = Utils.roi(gain+partner, invested);
    const cagr = Utils.cagr(invested, end+partner, months/12);
    const irr = (function(){
      try { return Utils.irr(cashflows); } catch(e){ return 0; }
    })();

    $("#roi").textContent = Utils.pct(roi);
    $("#cagr").textContent = Utils.pct(cagr);
    $("#irr").textContent = Utils.pct(irr);

    Utils.animateBar($("#roiBar"), Math.min(roi,2));
    Utils.animateBar($("#cagrBar"), Math.min(Math.abs(cagr),1));
    Utils.animateBar($("#irrBar"), Math.min(Math.abs(irr),1));

    // Charts
    Utils.line($("#lineChart"), series, Math.min(...series)*0.98, Math.max(...series)*1.02);
    Utils.pie($("#pieChart"), [gain, Math.max(0, partner), invested]);

    // Report badges
    $("#invested").textContent = (lang==="ru"?"Внесено: ":"Invested: ")+Utils.fmt(invested, currency);
    $("#earned").textContent = (lang==="ru"?"Проценты: ":"Interest: ")+Utils.fmt(gain, currency);
    $("#partnerIncome").textContent = (lang==="ru"?"Партнёрка: ":"Affiliate: ")+Utils.fmt(partner, currency);
    $("#totalOut").textContent = (lang==="ru"?"Итого: ":"Total: ")+Utils.fmt(end+partner, currency);
    $("#avgMonth").textContent = (lang==="ru"?"В месяц: ":"Per month: ")+Utils.fmt((end+partner - invested)/months, currency);

    // Breakdown per level display (rough per-level split)
    const pcts = [+$("#l1").value,+$("#l2").value,+$("#l3").value,+$("#l4").value];
    const sum = pcts.reduce((a,b)=>a+b,0)||1;
    const avg = +$("#affAvg").value;
    const m = +$("#affMonths").value;
    $("#affBreakdown").innerHTML = pcts.map((p,i)=>{
      const perMonth = avg*(p/100);
      return `<div class="badge">L${i+1}: ${Utils.fmt(perMonth, currency)} / мес · ${Utils.fmt(perMonth*m, currency)} / период</div>`;
    }).join("");
  }

  // Save/Load
  $("#saveBtn").onclick = () => {
    const data = { ts: Date.now(), lang, theme: document.documentElement.classList.contains("light")?"light":"dark",
      scenario: currentScenario
    };
    ids.forEach(id=> data[id] = $("#"+id).value);
    Utils.downloadJSON("zeus-calc-scenario.json", data);
  };
  $("#loadBtn").onclick = async () => {
    const data = await Utils.readJSON();
    if(!data) return;
    lang = data.lang || lang;
    localStorage.setItem("theme", data.theme||"dark");
    document.documentElement.classList.toggle("light", (data.theme||"dark")==="light");
    currentScenario = data.scenario || "base";
    for(const id of ids){ if(data[id]!==undefined){ $("#"+id).value = data[id]; } }
    $$("#scTabs .tab").forEach(t=> t.classList.toggle("active", t.dataset.scenario===currentScenario));
    applyLang();
    recalc();
  };

  // Reset
  $("#resetBtn").onclick = () => { location.reload(); };

  // Language
  $("#langBtn").onclick = () => {
    lang = (lang==="ru") ? "en" : "ru";
    localStorage.setItem("lang", lang);
    applyLang(); recalc();
  };

  // PDF via print styles (user saves as PDF)
  $("#pdfBtn").onclick = () => { window.print(); };

  // Initial
  window.addEventListener("load", recalc);
  window.addEventListener("resize", recalc);
})();
