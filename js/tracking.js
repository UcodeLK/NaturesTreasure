// Natures Wealth - Order Tracking Logic (for track-result.html)
document.addEventListener('DOMContentLoaded', async () => {
  // Only run on the results page
  if (!document.getElementById('resultBody')) return;

  const params = new URLSearchParams(window.location.search);
  const invoiceNumber = params.get('invoice');

  const resultBody = document.getElementById('resultBody');
  const errorState = document.getElementById('errorState');
  const resultHeaderInfo = document.getElementById('resultHeaderInfo');
  const loadingState = document.getElementById('loadingState');

  if (!invoiceNumber) {
    window.location.href = 'track-order.html';
    return;
  }

  // Update page title
  document.title = `Tracking ${invoiceNumber} | Natures Wealth`;

  // Check that supabaseClient is available
  if (typeof supabaseClient === 'undefined') {
    console.error('supabaseClient is not defined. Check supabase-config.js and CDN script.');
    hideLoading();
    resultHeaderInfo.innerHTML = `<div class="result-header-loading" style="color:#ff8a8a;"><i class="fas fa-exclamation-circle"></i> Configuration error. Please contact support.</div>`;
    errorState.style.display = 'block';
    return;
  }

  try {
    console.log('Fetching order:', invoiceNumber);

    // 1. Fetch Order by invoice number
    const { data: order, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('invoice_number', invoiceNumber)
      .single();

    console.log('Supabase response:', { order, error });

    if (error || !order) {
      hideLoading();
      resultHeaderInfo.innerHTML = `<div class="result-header-loading" style="color:#ff8a8a;"><i class="fas fa-exclamation-circle"></i> Order not found</div>`;
      errorState.style.display = 'block';
      return;
    }

    // 2. Fetch Items
    const { data: items } = await supabaseClient
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    // 3. Render everything
    renderHeader(order);
    renderOrderInfo(order);
    renderItems(items || [], order.currency);
    updateAgarwoodTimeline(order.agarwood_stage);
    updateOrderTimeline(order.status);
    applyOrderTypeLayout(order.order_type || 'Mixed');

    // Show results with smooth transition
    hideLoading();
    resultBody.style.display = 'block';
    resultBody.classList.add('fade-in');

  } catch (err) {
    console.error('Tracking error:', err);
    hideLoading();
    resultHeaderInfo.innerHTML = `<div class="result-header-loading" style="color:#ff8a8a;"><i class="fas fa-exclamation-circle"></i> Connection error. Please try again.</div>`;
    errorState.style.display = 'block';
  }
});

function hideLoading() {
  const loadingState = document.getElementById('loadingState');
  if (loadingState) {
    loadingState.classList.add('fade-out');
    setTimeout(() => { loadingState.style.display = 'none'; }, 400);
  }
}

function applyOrderTypeLayout(orderType) {
  const agarwoodJourneyCard = document.getElementById('agarwoodJourneyCard');
  const orderDeliveryCard = document.getElementById('orderDeliveryCard');
  const agarwoodDetails = document.getElementById('agarwoodDetails');
  const estDeliveryWrap = document.getElementById('estDeliveryWrap');

  if (orderType === 'Trees Only') {
    if (orderDeliveryCard) orderDeliveryCard.style.display = 'none';
    if (estDeliveryWrap) estDeliveryWrap.style.display = 'none';
  } else if (orderType === 'Products Only') {
    if (agarwoodJourneyCard) agarwoodJourneyCard.style.display = 'none';
    if (agarwoodDetails) agarwoodDetails.style.display = 'none';
  }
  // If 'Mixed', do nothing (leave everything visible as default)
}

function renderHeader(order) {
  const el = document.getElementById('resultHeaderInfo');
  el.innerHTML = `
    <div class="result-header-invoice">
      Tracking <span class="invoice-badge">${order.invoice_number}</span>
      &nbsp;&mdash;&nbsp; ${order.customer_name}
    </div>
  `;
}

function renderOrderInfo(order) {
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency || 'LKR' });

  document.getElementById('resInvoice').textContent = order.invoice_number;
  document.getElementById('resName').textContent = order.customer_name;
  document.getElementById('resDate').textContent = new Date(order.order_date).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  document.getElementById('resPayment').textContent = order.payment_status;
  document.getElementById('resTotal').textContent = fmt.format(order.total_amount);

  if (order.estimated_delivery) {
    document.getElementById('resEstDelivery').textContent = new Date(order.estimated_delivery).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
    document.getElementById('estDeliveryWrap').style.display = 'flex';
  }

  // Source info block
  if (order.plantation_name || order.tree_id || order.batch_id) {
    document.getElementById('agarwoodDetails').style.display = 'block';
    document.getElementById('resPlantation').textContent = order.plantation_name || '—';
    document.getElementById('resTree').textContent = order.tree_id || order.batch_id || '—';
  }
}

function renderItems(items, currency) {
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'LKR' });
  const tbody = document.getElementById('resItemsBody');

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:2rem;">No items listed for this order.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(item => `
    <tr>
      <td class="item-name">${item.product_name}</td>
      <td>${item.quantity}</td>
      <td>${fmt.format(item.unit_price)}</td>
      <td><strong>${fmt.format(item.total_price)}</strong></td>
    </tr>
  `).join('');
}

function updateAgarwoodTimeline(currentStage) {
  if (!currentStage) currentStage = 'Plantation';
  
  const subtitle = document.getElementById('agarwoodStageSubtitle');
  if (subtitle) subtitle.innerHTML = `Currently in the <strong style="color:var(--accent-gold);">${currentStage}</strong> stage`;

  const items = document.querySelectorAll('#agarwoodTimeline li');
  let reachedCurrent = false;
  items.forEach(item => {
    item.classList.remove('completed', 'current');
    if (!reachedCurrent) {
      if (item.getAttribute('data-stage') === currentStage) {
        item.classList.add('current');
        reachedCurrent = true;
      } else {
        item.classList.add('completed');
      }
    }
  });
}

function updateOrderTimeline(currentStatus) {
  if (!currentStatus) return;

  const subtitle = document.getElementById('orderStatusSubtitle');
  if (subtitle) subtitle.innerHTML = `Status: <strong style="color:var(--primary-green);">${currentStatus}</strong>`;

  const isCancelled = currentStatus.toLowerCase() === 'cancelled';
  const items = document.querySelectorAll('#orderTimeline li');
  let reachedCurrent = false;

  items.forEach(item => {
    item.classList.remove('completed', 'current', 'cancelled');
    if (isCancelled) {
      item.classList.add('cancelled');
    } else if (!reachedCurrent) {
      if (item.getAttribute('data-status') === currentStatus) {
        item.classList.add('current');
        reachedCurrent = true;
      } else {
        item.classList.add('completed');
      }
    }
  });
}
