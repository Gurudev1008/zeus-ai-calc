
let chart, partnerChart;

function calculate() {
  const deposit = parseFloat(document.getElementById('deposit').value);
  const monthlyProfit = parseFloat(document.getElementById('monthlyProfit').value);
  const commission = parseFloat(document.getElementById('commission').value)/100;
  const years = parseInt(document.getElementById('years').value);
  const months = years*12;

  let data = [];
  let balance = deposit;

  for (let m=1; m<=months; m++) {
    balance += balance * (monthlyProfit/100);
    balance -= balance * commission;
    data.push(balance.toFixed(2));
  }

  const ctx = document.getElementById('mainChart').getContext('2d');
  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type:'line',
    data:{ labels: Array.from({length:months}, (_,i)=>i+1), datasets:[{ label:'Баланс', data }]},
    options:{ responsive:true }
  });

  const pctx = document.getElementById('partnerChart').getContext('2d');
  if(partnerChart) partnerChart.destroy();
  partnerChart = new Chart(pctx, {
    type:'bar',
    data:{ labels:['1 год','2 года','3 года'], datasets:[{label:'Партнёрская прибыль', data:[1000,3000,7000]}] },
    options:{ responsive:true }
  });

  document.getElementById('report').innerHTML = `<p>Через ${years} лет баланс составит: ${balance.toFixed(2)}$</p>`;
}

function exportPDF(){ alert('PDF экспорт'); }
function exportPNG(){ alert('PNG экспорт'); }
function exportCSV(){ alert('CSV экспорт'); }
