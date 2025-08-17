function calculate() {
  let deposit = parseFloat(document.getElementById('deposit').value);
  let monthlyRate = parseFloat(document.getElementById('monthlyRate').value) / 100;
  let months = parseInt(document.getElementById('months').value);

  let balance = deposit;
  for (let i = 0; i < months; i++) {
    balance *= (1 + monthlyRate);
  }

  let annualRate = (Math.pow(1 + monthlyRate, 12) - 1) * 100;

  document.getElementById('results').innerHTML = `
    <p>Итоговый баланс: $${balance.toFixed(2)}</p>
    <p>Годовая ставка (из месячной): ${annualRate.toFixed(2)}%</p>
  `;
}