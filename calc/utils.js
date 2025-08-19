
window.Utils = {
  line: (el, points, minY, maxY) => {
    const W = Math.max(320, el.clientWidth||el.parentElement.clientWidth||800), H = el.clientHeight||320;
    el.setAttribute("viewBox", `0 0 ${W} ${H}`);
    el.innerHTML = "";
    const pad = 24;
    const xs = points.map((p,i)=>[pad + (points.length>1? i*(W-2*pad)/(points.length-1):0), p]);
    const min = (minY !== undefined) ? minY : Math.min(...points);
    const max = (maxY !== undefined) ? maxY : Math.max(...points);
    const mapY = v => H-pad - ( (v-min)/(max-min||1) )*(H-2*pad);
    const grid = document.createElementNS("http://www.w3.org/2000/svg","g");
    for(let i=0;i<=4;i++){
      const y = pad + i*(H-2*pad)/4;
      const l = document.createElementNS("http://www.w3.org/2000/svg","line");
      l.setAttribute("x1", pad); l.setAttribute("x2", W-pad);
      l.setAttribute("y1", y); l.setAttribute("y2", y);
      l.setAttribute("stroke", getComputedStyle(document.body).getPropertyValue("--border"));
      l.setAttribute("stroke-width","1");
      grid.appendChild(l);
    }
    el.appendChild(grid);
    const path = xs.map((p,i)=>`${i?"L":"M"}${p[0]},${mapY(p[1])}`).join(" ");
    const pth = document.createElementNS("http://www.w3.org/2000/svg","path");
    pth.setAttribute("d", path);
    pth.setAttribute("fill","none");
    pth.setAttribute("stroke","url(#gradLine)");
    pth.setAttribute("stroke-width","3");
    const defs = document.createElementNS("http://www.w3.org/2000/svg","defs");
    const grad = document.createElementNS("http://www.w3.org/2000/svg","linearGradient");
    grad.setAttribute("id","gradLine");
    grad.innerHTML = `<stop offset="0%" stop-color="var(--accent)"/><stop offset="100%" stop-color="var(--accent2)"/>`;
    defs.appendChild(grad);
    el.appendChild(defs);
    el.appendChild(pth);
  },
  pie: (el, values) => {
    const total = values.reduce((a,b)=>a+b,0)||1;
    const W = Math.max(320, el.clientWidth||el.parentElement.clientWidth||800), H = el.clientHeight||320;
    const r = Math.min(W,H)/2 - 16;
    const cx = W/2, cy = H/2;
    el.setAttribute("viewBox", `0 0 ${W} ${H}`);
    el.innerHTML = "";
    let ang = -Math.PI/2;
    const colors = ["var(--accent)","var(--accent2)","var(--good)","var(--warn)"];
    values.forEach((v,i)=>{
      const slice = v/total*Math.PI*2;
      const x1 = cx + r*Math.cos(ang);
      const y1 = cy + r*Math.sin(ang);
      const x2 = cx + r*Math.cos(ang+slice);
      const y2 = cy + r*Math.sin(ang+slice);
      const large = slice>Math.PI?1:0;
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
      const path = document.createElementNS("http://www.w3.org/2000/svg","path");
      path.setAttribute("d", d);
      path.setAttribute("fill", colors[i%colors.length]);
      el.appendChild(path);
      ang += slice;
    });
  },
  irr: (cashflows, guess=0.1) => {
    let rate = guess;
    for(let i=0;i<60;i++){
      let npv=0, d=0;
      cashflows.forEach((c,t)=>{
        const df = Math.pow(1+rate, t);
        npv += c/df;
        d   -= t*c/(df*(1+rate));
      });
      const denom = (d===0)?1e-9:d;
      const newRate = rate - npv/denom;
      if(!isFinite(newRate)) break;
      if(Math.abs(newRate-rate)<1e-7) return rate;
      rate = newRate;
    }
    return rate;
  },
  cagr: (start, end, years) => {
    if(start<=0 || years<=0) return 0;
    return Math.pow(end/start, 1/years)-1;
  },
  roi: (gain, cost) => {
    if(cost<=0) return 0;
    return gain/cost;
  },
  fmt: (v, cur) => {
    if (typeof v!=="number" || isNaN(v)) return "—";
    const s = v>=1e6 ? (v/1e6).toFixed(2)+"M" : v>=1e3 ? (v/1e3).toFixed(2)+"k" : v.toFixed(2);
    return cur+s;
  },
  pct: v => (v*100).toFixed(2)+"%",
  animateBar: (el, val) => { requestAnimationFrame(()=>{ el.style.width = Math.max(0, Math.min(100, val*100))+"%"; }); },
  downloadJSON: (name, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  },
  readJSON: () => new Promise(res=>{
    const inp = document.createElement("input"); inp.type="file"; inp.accept=".json,application/json";
    inp.onchange = () => { const f = inp.files[0]; const r = new FileReader(); r.onload = ()=>res(JSON.parse(r.result)); r.readAsText(f); };
    inp.click();
  })
};
