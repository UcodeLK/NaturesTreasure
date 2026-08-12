document.addEventListener('DOMContentLoaded', () => {
  const ordersTableBody = document.getElementById('ordersTableBody');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const agarwoodFilter = document.getElementById('agarwoodFilter');

  const statTotal = document.getElementById('statTotal');
  const statProcessing = document.getElementById('statProcessing');
  const statShipped = document.getElementById('statShipped');
  const statDelivered = document.getElementById('statDelivered');
  const statRevenue = document.getElementById('statRevenue');
  const revenueRange = document.getElementById('revenueRange');

  let revenueChartInstance = null;
  let statusChartInstance = null;

  let allOrders = [];

  // Fetch orders from Supabase
  async function fetchOrders() {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      ordersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Failed to load orders.</td></tr>`;
      return;
    }

    allOrders = data;
    updateStats();
    renderCharts();
    renderTable();
  }

  // Update statistics cards
  function updateStats() {
    statTotal.textContent = allOrders.length;
    statProcessing.textContent = allOrders.filter(o => o.status === 'Processing').length;
    statShipped.textContent = allOrders.filter(o => o.status === 'Shipped').length;
    statDelivered.textContent = allOrders.filter(o => o.status === 'Delivered').length;

    const totalRev = allOrders.reduce((sum, order) => {
      // Only count if not cancelled
      if(order.status !== 'Cancelled') {
         return sum + Number(order.total_amount || 0);
      }
      return sum;
    }, 0);
    
    let formattedRev = '';
    if (totalRev >= 1000000) {
      formattedRev = (totalRev / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (totalRev >= 1000) {
      formattedRev = (totalRev / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else {
      formattedRev = totalRev.toLocaleString();
    }
    
    statRevenue.innerHTML = `<span style="font-size: 0.55em; opacity: 0.85; font-weight: 600; margin-right: 4px; vertical-align: middle;">LKR</span>${formattedRev}`;
  }

  function renderCharts() {
    const range = revenueRange ? revenueRange.value : '12';
    let monthsToSubtract = range === 'all' ? 100 : parseInt(range);
    
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsToSubtract);

    // Filter for chart (exclude cancelled if desired, let's keep all for now or exclude cancelled)
    const validOrders = allOrders.filter(o => o.status !== 'Cancelled');

    // Group by month for revenue chart
    const monthlyRev = {};
    validOrders.forEach(o => {
      const date = new Date(o.order_date);
      if (date >= cutoffDate) {
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyRev[monthYear] = (monthlyRev[monthYear] || 0) + Number(o.total_amount);
      }
    });

    // Sort chronologically
    const sortedLabels = Object.keys(monthlyRev).sort((a, b) => new Date(a) - new Date(b));
    const sortedData = sortedLabels.map(label => monthlyRev[label]);

    if (revenueChartInstance) revenueChartInstance.destroy();
    
    const ctxRev = document.getElementById('revenueChart');
    if(ctxRev) {
      revenueChartInstance = new Chart(ctxRev, {
        type: 'line',
        data: {
          labels: sortedLabels,
          datasets: [{
            label: 'Revenue (LKR)',
            data: sortedData,
            borderColor: '#C99648',
            backgroundColor: 'rgba(201,150,72,0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(110,73,53,0.1)' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }

    // Status Doughnut Chart
    const statusCounts = {
      'Placed/Processing': 0,
      'Shipped/Delivery': 0,
      'Delivered': 0,
      'Cancelled': 0
    };

    allOrders.forEach(o => {
      const s = o.status;
      if (s === 'Order Placed' || s === 'Processing' || s === 'Packed') statusCounts['Placed/Processing']++;
      else if (s === 'Shipped' || s === 'Out for Delivery') statusCounts['Shipped/Delivery']++;
      else if (s === 'Delivered') statusCounts['Delivered']++;
      else if (s === 'Cancelled') statusCounts['Cancelled']++;
    });

    if (statusChartInstance) statusChartInstance.destroy();
    
    const ctxStat = document.getElementById('statusChart');
    if(ctxStat) {
      statusChartInstance = new Chart(ctxStat, {
        type: 'doughnut',
        data: {
          labels: Object.keys(statusCounts),
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: ['#1565C0', '#2E7D32', '#3F523E', '#C62828'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          },
          cutout: '70%'
        }
      });
    }
  }

  // Get badge class for order status
  function getStatusBadgeClass(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('pending') || s.includes('placed')) return 'badge-pending';
    if (s.includes('processing')) return 'badge-processing';
    if (s.includes('shipped') || s.includes('out for delivery')) return 'badge-shipped';
    if (s.includes('delivered')) return 'badge-delivered';
    if (s.includes('cancelled')) return 'badge-cancelled';
    return 'badge-default';
  }

  // Render Table
  function renderTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusVal = statusFilter.value;
    const agarwoodVal = agarwoodFilter.value;

    const filtered = allOrders.filter(order => {
      const matchSearch = 
        (order.invoice_number || '').toLowerCase().includes(searchTerm) ||
        (order.customer_name || '').toLowerCase().includes(searchTerm) ||
        (order.customer_phone || '').toLowerCase().includes(searchTerm);
      
      const matchStatus = (statusVal === 'All') || (order.status === statusVal);
      const matchAgarwood = (agarwoodVal === 'All') || (order.agarwood_stage === agarwoodVal);

      return matchSearch && matchStatus && matchAgarwood;
    });

    if (filtered.length === 0) {
      ordersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No orders found.</td></tr>`;
      return;
    }

    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' });

    ordersTableBody.innerHTML = filtered.map(order => `
      <tr onclick="window.location.href='order-details.html?id=${order.id}'">
        <td><strong>${order.invoice_number}</strong></td>
        <td>
          <div>${order.customer_name}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${order.customer_phone || ''}</div>
        </td>
        <td>${new Date(order.order_date).toLocaleDateString()}</td>
        <td>${formatter.format(order.total_amount)}</td>
        <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
        <td><span class="badge badge-default">${order.agarwood_stage || '-'}</span></td>
      </tr>
    `).join('');
  }

  // Event Listeners for Filters
  searchInput.addEventListener('input', renderTable);
  statusFilter.addEventListener('change', renderTable);
  agarwoodFilter.addEventListener('change', renderTable);
  if(revenueRange) {
    revenueRange.addEventListener('change', renderCharts);
  }

  // Initial Fetch
  fetchOrders();
});
