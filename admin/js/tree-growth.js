document.addEventListener('DOMContentLoaded', () => {
  let allOrders = [];
  let stageBarChartInstance = null;
  let stagePieChartInstance = null;

  async function fetchOrders() {
    // Fetch orders to get tree/batch information and current stage
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .neq('status', 'Cancelled') // Only consider active orders
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      document.getElementById('treeUpdatesTableBody').innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Failed to load data.</td></tr>`;
      return;
    }

    // Filter to only orders that likely have trees associated with them
    // (At least a stage or plantation/tree ID set)
    allOrders = data.filter(o => o.agarwood_stage || o.tree_id || o.plantation_name);
    
    updateStats();
    renderCharts();
    renderTable();
  }

  function updateStats() {
    document.getElementById('statTotalTrees').textContent = allOrders.length;
    
    let plantation = 0, inoculation = 0, resin = 0, harvested = 0;

    allOrders.forEach(o => {
      const stage = o.agarwood_stage || 'Plantation';
      if (stage === 'Plantation' || stage === 'Tree Growth') plantation++;
      else if (stage === 'Inoculation') inoculation++;
      else if (stage === 'Resin Development') resin++;
      else if (stage === 'Harvesting' || stage === 'Steam Distillation' || stage === 'Luxury Wood Products') harvested++;
    });

    document.getElementById('statPlantation').textContent = plantation;
    document.getElementById('statInoculation').textContent = inoculation;
    document.getElementById('statResin').textContent = resin;
    document.getElementById('statHarvested').textContent = harvested;
  }

  function renderCharts() {
    const stageCounts = {
      'Plantation': 0,
      'Tree Growth': 0,
      'Inoculation': 0,
      'Resin Development': 0,
      'Harvesting': 0,
      'Steam Distillation': 0,
      'Luxury Wood Products': 0
    };

    allOrders.forEach(o => {
      const stage = o.agarwood_stage || 'Plantation';
      if (stageCounts[stage] !== undefined) {
        stageCounts[stage]++;
      } else {
        stageCounts['Plantation']++;
      }
    });

    const labels = Object.keys(stageCounts);
    const data = Object.values(stageCounts);
    const bgColors = [
      '#8BC34A', // Plantation
      '#4CAF50', // Tree Growth
      '#FFC107', // Inoculation
      '#FF9800', // Resin
      '#F44336', // Harvesting
      '#03A9F4', // Distillation
      '#9C27B0'  // Products
    ];

    // Bar Chart
    if (stageBarChartInstance) stageBarChartInstance.destroy();
    const ctxBar = document.getElementById('stageBarChart');
    if (ctxBar) {
      stageBarChartInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Number of Trees/Orders',
            data: data,
            backgroundColor: bgColors,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // Pie Chart
    if (stagePieChartInstance) stagePieChartInstance.destroy();
    const ctxPie = document.getElementById('stagePieChart');
    if (ctxPie) {
      stagePieChartInstance = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: bgColors,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { boxWidth: 12 } }
          },
          cutout: '60%'
        }
      });
    }
  }

  function renderTable() {
    const tbody = document.getElementById('treeUpdatesTableBody');
    if (allOrders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No tree data found.</td></tr>`;
      return;
    }

    // Take top 20 recently updated
    const recentOrders = allOrders.slice(0, 20);

    tbody.innerHTML = recentOrders.map(o => `
      <tr onclick="window.location.href='order-details.html?id=${o.id}'" style="cursor:pointer;">
        <td><strong>${o.invoice_number}</strong></td>
        <td>${o.customer_name}</td>
        <td><span style="font-family:monospace;">${o.tree_id || o.batch_id || 'N/A'}</span></td>
        <td><span class="badge badge-default" style="background:#f0ece4; color:#6E4935;">${o.agarwood_stage || 'Plantation'}</span></td>
        <td>${new Date(o.updated_at || o.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }

  fetchOrders();
});
