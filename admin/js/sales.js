document.addEventListener('DOMContentLoaded', () => {
  const month1Input = document.getElementById('month1');
  const month2Input = document.getElementById('month2');
  const compareBtn = document.getElementById('compareBtn');
  const comparisonStats = document.getElementById('comparisonStats');

  let allOrders = [];
  let salesChartInstance = null;

  // Set default months (Current month vs Previous month)
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const prevMonthDate = new Date();
  prevMonthDate.setMonth(now.getMonth() - 1);
  const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  month1Input.value = prevMonth;
  month2Input.value = currentMonth;

  async function fetchOrders() {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .neq('status', 'Cancelled'); // Exclude cancelled orders for sales

    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }

    allOrders = data;
    renderTrendChart(); // Show overall trend on load
    handleCompare();    // Do initial comparison
  }

  function handleCompare() {
    const m1 = month1Input.value; // YYYY-MM
    const m2 = month2Input.value;

    if(!m1 || !m2) return;

    // Filter orders for m1
    const orders1 = allOrders.filter(o => o.order_date.startsWith(m1));
    const orders2 = allOrders.filter(o => o.order_date.startsWith(m2));

    const rev1 = orders1.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const rev2 = orders2.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' });

    // Update labels
    document.getElementById('lblMonth1').textContent = formatMonthLabel(m1);
    document.getElementById('lblMonth2').textContent = formatMonthLabel(m2);
    document.getElementById('lblOrdMonth1').textContent = formatMonthLabel(m1);
    document.getElementById('lblOrdMonth2').textContent = formatMonthLabel(m2);

    // Update values
    document.getElementById('valRev1').textContent = formatter.format(rev1);
    document.getElementById('valRev2').textContent = formatter.format(rev2);
    document.getElementById('valOrd1').textContent = orders1.length;
    document.getElementById('valOrd2').textContent = orders2.length;

    // Calculate diffs
    const revDiffEl = document.getElementById('revDiff');
    if (rev1 === 0) {
      revDiffEl.textContent = rev2 > 0 ? '100% Increase' : 'No Change';
      revDiffEl.style.color = rev2 > 0 ? 'var(--primary-green)' : 'var(--text-muted)';
    } else {
      const p = ((rev2 - rev1) / rev1) * 100;
      revDiffEl.textContent = `${Math.abs(p).toFixed(1)}% ${p >= 0 ? 'Increase ↑' : 'Decrease ↓'}`;
      revDiffEl.style.color = p >= 0 ? 'var(--primary-green)' : '#d32f2f';
    }

    const ordDiffEl = document.getElementById('ordDiff');
    if (orders1.length === 0) {
      ordDiffEl.textContent = orders2.length > 0 ? '100% Increase' : 'No Change';
      ordDiffEl.style.color = orders2.length > 0 ? 'var(--primary-green)' : 'var(--text-muted)';
    } else {
      const op = ((orders2.length - orders1.length) / orders1.length) * 100;
      ordDiffEl.textContent = `${Math.abs(op).toFixed(1)}% ${op >= 0 ? 'Increase ↑' : 'Decrease ↓'}`;
      ordDiffEl.style.color = op >= 0 ? 'var(--primary-green)' : '#d32f2f';
    }

    comparisonStats.style.display = 'grid';
  }

  function renderTrendChart() {
    // Group by month
    const monthlyRev = {};
    allOrders.forEach(o => {
      const monthYear = o.order_date.substring(0, 7); // YYYY-MM
      monthlyRev[monthYear] = (monthlyRev[monthYear] || 0) + Number(o.total_amount);
    });

    const sortedLabels = Object.keys(monthlyRev).sort();
    const sortedData = sortedLabels.map(label => monthlyRev[label]);
    const displayLabels = sortedLabels.map(l => formatMonthLabel(l));

    if (salesChartInstance) salesChartInstance.destroy();
    
    const ctx = document.getElementById('salesComparisonChart');
    if(ctx) {
      salesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: displayLabels,
          datasets: [{
            label: 'Monthly Revenue (LKR)',
            data: sortedData,
            backgroundColor: 'rgba(63,82,62,0.8)', // primary-green
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
  }

  function formatMonthLabel(yyyyMM) {
    const [y, m] = yyyMM.split('-');
    const d = new Date(y, parseInt(m)-1);
    return d.toLocaleString('default', { month: 'short', year: 'numeric' });
  }

  compareBtn.addEventListener('click', handleCompare);

  fetchOrders();
});
