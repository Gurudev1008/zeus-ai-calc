
(() => {
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const i18n = window.I18N;
  let lang = localStorage.getItem("lang") || "ru";

  const ids = ["apr","fee","principal","contrib","years","infl","currency","affAvg","affMonths","l1","l2","l3","l4"];
  const scenario = { base: {}, opt: {}, pes: {} };
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

  // Scenario tabs
  $$("#scTabs .tab").forEach(tab=>{
    tab.onclick = () => {
      $$("#scTabs .tab").forEach(t=>t.classList.remove("active"));
      tab.classList.add("active");
      currentScenario = tab.dataset.scenario;
      recalc();
    };
  });

  // Inputs
  const idsAll = [...ids];
  idsAll.forEach(id => {
    const el = $("#"+id);
    el.addEventListener("input", recalc);
  });
  $("#useAff").addEventListener("change", recalc);

  function effRate(apr, fee){
    const net = Math.max(0, apr/100*(1-fee/100));
    const m = net/12;
    return ((1+m)**12 - 1)*100;
  }

  function recalc(){
    const aprBase = +($("#apr").value||0);
    const inflBase = +($("#infl").value||0);
    const fee = +($("#fee").value||0);
    const contrib = +($("#contrib").value||0);
    const years = +($("#years").value||0);
    const principal = +($("#principal").value||0);
    const currency = $("#currency").value;

    // scenario deltas
    let apr = aprBase, infl = inflBase;
    if(currentScenario==="opt"){ apr = aprBase+6; infl = Math.max(0, inflBase-2); }
    if(currentScenario==="pes"){ apr = Math.max(0, aprBase-6); infl = inflBase+3; }

    // EAR
    const ear = effRate(apr, fee);
    $("#earOut").textContent = ear.toFixed(2)+"%";

    // highlight deposit
    $("#bigDepositTile").classList.toggle("hl-good", principal>=10000);

    // simulate monthly
    const months = Math.max(1, Math.round(years*12));
    const netMonthly = ((apr/100)*(1-fee/100))/12;
    let bal = principal;
    let invested = principal;
    const series = [bal];
    const cashflows = [-principal];
    for(let t=1;t<=months;t++){
      bal = bal*(1+netMonthly) + contrib;
      series.push(bal);
      invested += contrib;
      cashflows.push(-contrib);
    }
    const end = series[series.length-1];
    const interest = Math.max(0, end - invested);

    // partner
    let partner = 0;
    if($("#useAff").checked){
      const avg = +($("#affAvg").value||0);
      const m = +($("#affMonths").value||0);
      const pcts = [+$("#l1").value,+$("#l2").value,+$("#l3").value,+$("#l4").value].map(v=>Math.max(0, +v)/100);
      const sumPct = pcts.reduce((a,b)=>a+b,0);
      for(let t=1;t<=m;t++){ const inc = avg*sumPct; partner += inc; cashflows.push(inc); }
    }

    // KPI
    const roi = Utils.roi(interest+partner, invested);
    const cagr = Utils.cagr(invested, end+partner, months/12);
    const irr = (function(){ try { return Utils.irr(cashflows); } catch(e){ return 0; } })();

    $("#roi").textContent = Utils.pct(roi);
    $("#cagr").textContent = Utils.pct(cagr);
    $("#irr").textContent = Utils.pct(irr);

    Utils.animateBar($("#roiBar"), Math.min(roi,2));
    Utils.animateBar($("#cagrBar"), Math.min(Math.abs(cagr),1));
    Utils.animateBar($("#irrBar"), Math.min(Math.abs(irr),1));

    // charts
    Utils.line($("#lineChart"), series, Math.min(...series)*0.98, Math.max(...series)*1.02);
    Utils.pie($("#pieChart"), [interest, Math.max(0, partner), invested]);

    // report badges
    $("#invested").textContent = (lang==="ru"?"Внесено: ":"Invested: ")+Utils.fmt(invested, currency);
    $("#earned").textContent = (lang==="ru"?"Проценты: ":"Interest: ")+Utils.fmt(interest, currency);
    $("#partnerIncome").textContent = (lang==="ru"?"Партнёрка: ":"Affiliate: ")+Utils.fmt(partner, currency);
    $("#totalOut").textContent = (lang==="ru"?"Итого: ":"Total: ")+Utils.fmt(end+partner, currency);
    $("#avgMonth").textContent = (lang==="ru"?"В месяц: ":"Per month: ")+Utils.fmt((end+partner - invested)/months, currency);

    // per-level breakdown
    const pcts = [+$("#l1").value,+$("#l2").value,+$("#l3").value,+$("#l4").value];
    const avg = +($("#affAvg").value||0);
    const m = +($("#affMonths").value||0);
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
    ["apr","fee","principal","contrib","years","infl","currency","affAvg","affMonths","l1","l2","l3","l4"].forEach(id=> data[id] = $("#"+id).value);
    Utils.downloadJSON("zeus-calc-scenario.json", data);
  };
  $("#loadBtn").onclick = async () => {
    const data = await Utils.readJSON();
    if(!data) return;
    lang = data.lang || lang;
    localStorage.setItem("theme", data.theme||"dark");
    document.documentElement.classList.toggle("light", (data.theme||"dark")==="light");
    currentScenario = data.scenario || "base";
    ["apr","fee","principal","contrib","years","infl","currency","affAvg","affMonths","l1","l2","l3","l4"].forEach(id=> { if(data[id]!==undefined){ $("#"+id).value = data[id]; } });
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

  // PDF
  $("#pdfBtn").onclick = () => { window.print(); };

  // Initial
  window.addEventListener("load", recalc);
  window.addEventListener("resize", recalc);
})();
