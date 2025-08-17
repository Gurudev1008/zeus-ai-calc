/* Minimal ES-module wrapper around the React component */
import React, { useMemo, useState } from "https://esm.sh/react@18.2.0";

const neon = { bg: "#0c1630", panel: "#0f1d3f", text: "#d7eaff", cyan: "#38e8ff", orange: "#ff8a2a", pink: "#ff5bbd", lime: "#9cff70" };
const field = { wrap:{display:'grid',gap:'6px'}, label:{color:neon.text,fontSize:13,letterSpacing:.5,opacity:.9},
  input:{background:'rgba(255,255,255,0.02)',border:`1px solid ${neon.cyan}30`,color:neon.text,padding:'12px 14px',borderRadius:12,outline:'none',fontSize:16},
  select:{background:'rgba(255,255,255,0.02)',border:`1px solid ${neon.cyan}30`,color:neon.text,padding:'12px 14px',borderRadius:12,outline:'none',fontSize:16}};
const lcm=(a,b)=>{const g=(x,y)=>y===0?x:g(y,x%y);return a*b/g(a,b)};
const fmt=(s,n)=> `${s} ${n.toLocaleString(undefined,{maximumFractionDigits:2})}`;

function Stat({label,value,accent}){ return React.createElement('div',{style:{display:'grid',gap:6}},[
  React.createElement('div',{style:{color:'#9fb7ff',fontSize:13,letterSpacing:.5}},label),
  React.createElement('div',{style:{color:accent||neon.cyan,fontSize:26,fontWeight:800}},value)
]);}

function Card({title,children,right}){ return React.createElement('div',{style:{background:`linear-gradient(180deg, ${neon.panel}, #0b1836)`,border:`1px solid ${neon.cyan}33`,borderRadius:18,padding:18,boxShadow:'0 0 0 1px rgba(56,232,255,0.08) inset, 0 20px 40px -20px rgba(0,0,0,.6)'}},
  [React.createElement('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}},[
    React.createElement('h3',{style:{color:neon.cyan,margin:0,fontWeight:700,letterSpacing:.6}},title), right]), children]);}

export default function ZeusAIReactComponent(){
  const [initial,setInitial]=useState(400000), [currency,setCurrency]=useState('₽'), [contrib,setContrib]=useState(10000),
        [contribFreq,setContribFreq]=useState(12), [rate,setRate]=useState(5), [compound,setCompound]=useState(12), [years,setYears]=useState(4);

  const {finalBalance,totalContrib,interest} = useMemo(()=>{
    const n=Math.max(1,Math.floor(compound)), m=Math.max(1,Math.floor(contribFreq)); const steps=(m? (n*m)/((x=>{const g=(a,b)=>b===0?a:g(b,a%b);return g})(n,m)(n,m)) : n); // quick calc
    const gcd=(a,b)=>b===0?a:gcd(b,a%b); const lcm=(a,b)=>a*b/gcd(a,b);
    const stepsPerYear = m? lcm(n,m) : n;
    const ce=stepsPerYear/n, me=m? stepsPerYear/m : Number.POSITIVE_INFINITY;
    let bal=+initial||0, tc=0;
    for(let y=0;y<years;y++){ for(let s=1;s<=stepsPerYear;s++){ if(s%ce===0) bal*=1+(rate/100)/n; if(s%me===0&&contrib>0){ bal+=+contrib; tc+=+contrib; } } }
    return {finalBalance:bal,totalContrib:tc,interest:bal-(+initial+tc)};
  },[initial,contrib,contribFreq,rate,compound,years]);

  return React.createElement('div',{style:{minHeight:'100vh',background:'radial-gradient(1200px 600px at 10% 0%, #13214a 0%, #0b1330 55%, #081027 100%)',color:neon.text,padding:24,fontFamily:'Inter, ui-sans-serif, system-ui'}},
  [React.createElement('div',{style:{display:'flex',alignItems:'center',gap:14,marginBottom:24}},[
    React.createElement('svg',{width:28,height:28,viewBox:'0 0 24 24'},React.createElement('path',{fill:neon.cyan,d:'M13 2L3 14h6l-2 8 10-12h-6z'})),
    React.createElement('div',null,[React.createElement('div',{style:{fontSize:13,letterSpacing:1.5,color:'#9bdfff'}},'ZEUS AI'),
      React.createElement('h1',{style:{margin:0,fontSize:24,color:neon.cyan}},'Compound Interest Calculator (React)')])]),
   React.createElement('div',{style:{display:'grid',gridTemplateColumns:'minmax(320px, 520px) minmax(320px, 1fr)',gap:20}},[
     React.createElement(Card,{title:'Parameters'}, React.createElement('div',{style:{display:'grid',gap:14}},[
       React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr auto',gap:10}},[
         React.createElement('div',{style:field.wrap},[React.createElement('label',{style:field.label},'Initial amount'),
           React.createElement('input',{style:field.input,type:'number',min:0,value:initial,onChange:e=>setInitial(+e.target.value)})]),
         React.createElement('div',{style:field.wrap},[React.createElement('label',{style:field.label},'Currency'),
           React.createElement('select',{style:field.select,value:currency,onChange:e=>setCurrency(e.target.value)},[
             '₽','$','€','Rp','₹','₿'].map(s=>React.createElement('option',{value:s,key:s},s)) )])]),
       React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}},[
         React.createElement('div',{style:field.wrap},[React.createElement('label',{style:field.label},'Periodic contribution'),
           React.createElement('input',{style:field.input,type:'number',min:0,value:contrib,onChange:e=>setContrib(+e.target.value)})]),
         React.createElement('div',{style:field.wrap},[React.createElement('label',{style:field.label},'Contribution frequency'),
           React.createElement('select',{style:field.select,value:contribFreq,onChange:e=>setContribFreq(+e.target.value)},[
             React.createElement('option',{value:0},'None'),React.createElement('option',{value:12},'Monthly (12)'),
             React.createElement('option',{value:4},'Quarterly (4)'),React.createElement('option',{value:1},'Yearly (1)')])])]),
       React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}},[
         React.createElement('div',{style:field.wrap},[React.createElement('label',{style:field.label},'Annual interest rate (%)'),
           React.createElement('input',{style:field.input,type:'number',step:'0.01',value:rate,onChange:e=>setRate(+e.target.value)})]),
         React.createElement('div',{style:field.wrap},[React.createElement('label',{style:field.label},'Compounding frequency'),
           React.createElement('select',{style:field.select,value:compound,onChange:e=>setCompound(+e.target.value)},[
             React.createElement('option',{value:12},'Monthly (12)'),React.createElement('option',{value:4},'Quarterly (4)'),React.createElement('option',{value:1},'Yearly (1)')])])]),
       React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr auto',gap:10,alignItems:'end'}},[
         React.createElement('div',{style:field.wrap},[React.createElement('label',{style:field.label},'Years'),
           React.createElement('input',{style:field.input,type:'number',min:1,value:years,onChange:e=>setYears(+e.target.value)})]),
         React.createElement('div',{style:{textAlign:'right',opacity:.7,fontSize:12}},'Contributions at period end. Interest compounds per selected frequency.')])])),
     React.createElement(Card,{title:'Results', right:React.createElement('div',{style:{color:neon.pink,fontWeight:700}},'ZEUS AI')},[
       React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}},[
         React.createElement(Stat,{label:'Final balance',value:fmt(currency,finalBalance)}),
         React.createElement(Stat,{label:'Total contributions',value:fmt(currency,totalContrib),accent:neon.orange}),
         React.createElement(Stat,{label:'Total interest',value:fmt(currency,interest),accent:neon.lime})])])])]);}
