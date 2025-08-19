
window.Utils = {
  lcm:(a,b)=>!a||!b?0:Math.abs(a*b)/Utils.gcd(a,b),
  gcd:(a,b)=>b?Utils.gcd(b,a%b):a,
  fmtMoney:(v,curr="$")=>{
    if(!isFinite(v)) return "—";
    const s = v>=1e6 ? (v/1e6).toFixed(2)+"M" : v>=1e3 ? (v/1e3).toFixed(2)+"k" : v.toFixed(2);
    return curr+s;
  },
  line:(el,points,minY,maxY)=>{
    const W = el.clientWidth, H = el.clientHeight, pad=28;
    el.setAttribute("viewBox",`0 0 ${W} ${H}`); el.innerHTML="";
    if(points.length<2) return;
    const min = minY ?? Math.min(...points), max = maxY ?? Math.max(...points);
    const mapY=v=>H-pad - ((v-min)/(max-min||1))*(H-2*pad);
    const g=document.createElementNS("http://www.w3.org/2000/svg","g");
    for(let i=0;i<=4;i++){
      const y=pad+i*(H-2*pad)/4;
      const l=document.createElementNS("http://www.w3.org/2000/svg","line");
      l.setAttribute("x1",pad); l.setAttribute("x2",W-pad); l.setAttribute("y1",y); l.setAttribute("y2",y);
      l.setAttribute("stroke","var(--border)"); l.setAttribute("stroke-width","1"); g.appendChild(l);
    }
    el.appendChild(g);
    const path = points.map((p,i)=>`${i?"L":"M"}${pad+i*(W-2*pad)/(points.length-1)},${mapY(p)}`).join(" ");
    const defs=document.createElementNS("http://www.w3.org/2000/svg","defs");
    const grad=document.createElementNS("http://www.w3.org/2000/svg","linearGradient");
    grad.setAttribute("id","gl"); grad.innerHTML=`<stop offset="0%" stop-color="var(--accent)"/><stop offset="100%" stop-color="var(--accent2)"/>`;
    defs.appendChild(grad); el.appendChild(defs);
    const p=document.createElementNS("http://www.w3.org/2000/svg","path");
    p.setAttribute("d",path); p.setAttribute("fill","none"); p.setAttribute("stroke","url(#gl)"); p.setAttribute("stroke-width","3"); el.appendChild(p);
  },
  pie:(el,values)=>{
    const total = values.reduce((a,b)=>a+b,0)||1;
    const W=el.clientWidth,H=el.clientHeight,r=Math.min(W,H)/2-18,cx=W/2,cy=H/2;
    el.setAttribute("viewBox",`0 0 ${W} ${H}`); el.innerHTML="";
    let ang=-Math.PI/2; const colors=["var(--accent)","var(--accent2)","var(--good)"];
    values.forEach((v,i)=>{
      const slice=v/total*Math.PI*2; const x1=cx+r*Math.cos(ang), y1=cy+r*Math.sin(ang);
      const x2=cx+r*Math.cos(ang+slice), y2=cy+r*Math.sin(ang+slice);
      const large=slice>Math.PI?1:0; const d=`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
      const path=document.createElementNS("http://www.w3.org/2000/svg","path"); path.setAttribute("d",d); path.setAttribute("fill",colors[i%colors.length]); el.appendChild(path);
      ang+=slice;
    });
  },
  bars:(el,groups,series,values)=>{
    const W=el.clientWidth,H=el.clientHeight,pad=32;
    el.setAttribute("viewBox",`0 0 ${W} ${H}`); el.innerHTML="";
    const g=document.createElementNS("http://www.w3.org/2000/svg","g");
    for(let i=0;i<=4;i++){ const y=pad+i*(H-2*pad)/4; const l=document.createElementNS("http://www.w3.org/2000/svg","line");
      l.setAttribute("x1",pad); l.setAttribute("x2",W-pad); l.setAttribute("y1",y); l.setAttribute("y2",y);
      l.setAttribute("stroke","var(--border)"); l.setAttribute("stroke-width","1"); g.appendChild(l); }
    el.appendChild(g);
    const colors=["var(--accent)","var(--accent2)","var(--good)","var(--warn)","var(--bad)"];
    const maxVal = Math.max(...values.flat(),1);
    const groupWidth = (W-2*pad)/groups.length;
    const barWidth = (groupWidth*0.7)/series.length;
    groups.forEach((gg,gi)=>{
      series.forEach((s,si)=>{
        const v = (values[si] && values[si][gi]) ? values[si][gi] : 0;
        const x = pad + gi*groupWidth + groupWidth*0.15 + si*barWidth;
        const h = (v/maxVal) * (H-2*pad);
        const y = H-pad - h;
        const rect=document.createElementNS("http://www.w3.org/2000/svg","rect");
        rect.setAttribute("x",x); rect.setAttribute("y",y); rect.setAttribute("width",barWidth-4); rect.setAttribute("height",Math.max(0,h));
        rect.setAttribute("rx","6"); rect.setAttribute("fill",colors[si%colors.length]); el.appendChild(rect);
        const lbl=document.createElementNS("http://www.w3.org/2000/svg","text");
        lbl.setAttribute("x", x + (barWidth-4)/2); lbl.setAttribute("y", y-4);
        lbl.setAttribute("text-anchor","middle"); lbl.setAttribute("font-size","10"); lbl.setAttribute("fill","var(--muted)");
        lbl.textContent = Math.round(v); el.appendChild(lbl);
      });
      const gl=document.createElementNS("http://www.w3.org/2000/svg","text");
      gl.setAttribute("x", pad + gi*groupWidth + groupWidth/2);
      gl.setAttribute("y", H-8); gl.setAttribute("text-anchor","middle"); gl.setAttribute("font-size","11"); gl.setAttribute("fill","var(--muted)");
      gl.textContent = groups[gi]; el.appendChild(gl);
    });
    series.forEach((s,si)=>{
      const sx = pad + si*120, sy = 14;
      const r=document.createElementNS("http://www.w3.org/2000/svg","rect");
      r.setAttribute("x",sx); r.setAttribute("y",sy-10); r.setAttribute("width",16); r.setAttribute("height",8); r.setAttribute("rx","4"); r.setAttribute("fill",colors[si%colors.length]); el.appendChild(r);
      const t=document.createElementNS("http://www.w3.org/2000/svg","text");
      t.setAttribute("x",sx+22); t.setAttribute("y",sy); t.setAttribute("fill","var(--muted)"); t.setAttribute("font-size","11"); t.textContent=s; el.appendChild(t);
    });
  }
};
