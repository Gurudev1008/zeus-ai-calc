document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  app.innerHTML = '<canvas id="chart"></canvas>';
  const ctx = document.getElementById('chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {labels: [1,2,3,4], datasets: [{label: 'Demo', data:[3,2,5,4]}]},
  });
});