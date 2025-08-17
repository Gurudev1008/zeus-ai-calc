
function fmt(curr, n){return curr + ' ' + Number(n||0).toLocaleString(undefined,{maximumFractionDigits:2});}

function syncAnnual(){
  const m = parseFloat(document.getElementById('monthlyRate').value||0)/100;
  const annual = (Math.pow(1+m, 12) - 1) * 100;
  document.getElementById('annualRate').value = annual.toFixed(2);
}

function calcCompound(){
  const dep = parseFloat(document.getElementById('deposit').value||0);
  const mRate = parseFloat(document.getElementById('monthlyRate').value||0)/100;
  const months = parseInt(document.getElementById('months').value||0);
  const contrib = parseFloat(document.getElementById('contrib').value||0);
  const curr = document.getElementById('currency').value;

  let balance = dep;
  let totalContrib = 0;

  for(let i=0;i<months;i++){
    balance = balance*(1+mRate) + contrib;
    totalContrib += contrib;
  }
  const interest = balance - dep - totalContrib;

  document.getElementById('balance').textContent = fmt(curr, balance);
  document.getElementById('totalContrib').textContent = fmt(curr, totalContrib);
  document.getElementById('interest').textContent = fmt(curr, interest);
}

function calcAffiliate(){
  const curr = document.getElementById('currency').value;

  // Deposits mix
  const depA = Math.max(3000, parseFloat(document.getElementById('depA').value||3000));
  const depB = Math.max(3000, parseFloat(document.getElementById('depB').value||10000));
  const depC = Math.max(3000, parseFloat(document.getElementById('depC').value||20000));
  let wA = parseFloat(document.getElementById('wA').value||0);
  let wB = parseFloat(document.getElementById('wB').value||0);
  let wC = parseFloat(document.getElementById('wC').value||0);
  const wSum = (wA+wB+wC)||1; wA/=wSum; wB/=wSum; wC/=wSum;

  // Monthly profitability for partners
  const netM = parseFloat(document.getElementById('netMonthlyRate').value||0)/100;
  const avgProfit = depA*wA*netM + depB*wB*netM + depC*wC*netM;
  document.getElementById('avgPartnerProfit').value = fmt(curr, avgProfit);

  // Counts
  const L1 = parseInt(document.getElementById('l1count').value||0);
  const L2 = parseInt(document.getElementById('l2count').value||0);
  const L3 = parseInt(document.getElementById('l3count').value||0);
  const L4 = parseInt(document.getElementById('l4count').value||0);

  // Fixed percents: 5%, 8%, 10%, 2%
  const l1m = avgProfit * 0.05 * L1;
  const l2m = avgProfit * 0.08 * L2;
  const l3m = avgProfit * 0.10 * L3;
  const l4m = avgProfit * 0.02 * L4;

  document.getElementById('l1m').textContent = fmt(curr, l1m);
  document.getElementById('l2m').textContent = fmt(curr, l2m);
  document.getElementById('l3m').textContent = fmt(curr, l3m);
  document.getElementById('l4m').textContent = fmt(curr, l4m);

  const months = parseInt(document.getElementById('affMonths').value||1);
  const monthSum = l1m + l2m + l3m + l4m;
  const total = monthSum * months;

  document.getElementById('affSumMonth').textContent = fmt(curr, monthSum);
  document.getElementById('affTotal').textContent = fmt(curr, total);
  document.getElementById('affPerMonth').textContent = fmt(curr, total/Math.max(1, months));
}

function recalcAll(){
  syncAnnual();
  calcCompound();
  calcAffiliate();
}

document.getElementById('calcBtn').addEventListener('click', recalcAll);

// live updates
['deposit','monthlyRate','months','contrib','currency','depA','depB','depC','wA','wB','wC','netMonthlyRate','l1count','l2count','l3count','l4count','affMonths']
  .forEach(id => document.getElementById(id).addEventListener('input', recalcAll));

// init
recalcAll();
