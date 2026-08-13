document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');
  const isEditMode = !!orderId;

  // DOM Elements
  const pageTitle = document.getElementById('pageTitle');
  const orderForm = document.getElementById('orderForm');
  const deleteBtn = document.getElementById('deleteBtn');
  const saveOrderBtn = document.getElementById('saveOrderBtn');
  const downloadInvoiceBtn = document.getElementById('downloadInvoiceBtn');
  const formMsg = document.getElementById('formMsg');
  
  // Fields
  const fOrderType = document.getElementById('orderType');
  const fInvoice = document.getElementById('invoiceNumber');
  const fName = document.getElementById('customerName');
  const fEmail = document.getElementById('customerEmail');
  const fPhone = document.getElementById('customerPhone');
  const fAddress = document.getElementById('shippingAddress');
  const fStatus = document.getElementById('status');
  const fPayment = document.getElementById('paymentStatus');
  const fDelivery = document.getElementById('estDelivery');
  const fTotal = document.getElementById('totalAmount');
  const fAgarwoodStage = document.getElementById('agarwoodStage');
  const fPlantation = document.getElementById('plantationName');
  const fTree = document.getElementById('treeId');
  const fStageDate = document.getElementById('stageDate');

  const historyContainer = document.getElementById('historyContainer');
  const itemsTableBody = document.getElementById('itemsTableBody');
  const addItemBtn = document.getElementById('addItemBtn');

  let orderItems = [];
  let originalStatus = '';
  let originalAgarwoodStage = '';

  if (isEditMode) {
    pageTitle.textContent = 'Edit Order';
    deleteBtn.style.display = 'inline-flex';
    downloadInvoiceBtn.style.display = 'inline-flex';
    fInvoice.disabled = true;
    loadOrderDetails();
  } else {
    fInvoice.value = `NT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    renderItemsTable();
  }

  async function loadOrderDetails() {
    const { data: order, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      alert('Error loading order.');
      window.location.href = 'dashboard.html';
      return;
    }

    fOrderType.value = order.order_type || 'Mixed';
    fInvoice.value = order.invoice_number;
    fName.value = order.customer_name;
    fEmail.value = order.customer_email || '';
    fPhone.value = order.customer_phone || '';
    fAddress.value = order.shipping_address || '';
    fStatus.value = order.status;
    fPayment.value = order.payment_status;
    fDelivery.value = order.estimated_delivery ? order.estimated_delivery.split('T')[0] : '';
    fTotal.value = order.total_amount;
    
    fAgarwoodStage.value = order.agarwood_stage || 'Plantation';
    fPlantation.value = order.plantation_name || '';
    fTree.value = order.tree_id || order.batch_id || '';

    originalStatus = order.status;
    originalAgarwoodStage = order.agarwood_stage || 'Plantation';

    const { data: items } = await supabaseClient
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    
    orderItems = items || [];
    renderItemsTable();

    fetchHistory();
  }

  async function fetchHistory() {
    const { data: statusHist } = await supabaseClient.from('order_status_history').select('*').eq('order_id', orderId).order('created_at', { ascending: false });
    const { data: agarwoodHist } = await supabaseClient.from('agarwood_stage_history').select('*').eq('order_id', orderId).order('created_at', { ascending: false });
    
    let html = '<ul style="list-style:none; padding:0; margin:0;">';
    
    if (statusHist && statusHist.length > 0) {
      html += `<li style="font-weight:bold; margin-bottom:0.5rem;">Order Status History</li>`;
      statusHist.forEach(h => {
        html += `<li style="margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);">
          <span class="badge badge-default">${h.status}</span> <small>${new Date(h.created_at).toLocaleString()}</small>
        </li>`;
      });
    }

    if (agarwoodHist && agarwoodHist.length > 0) {
      html += `<li style="margin-top:1rem; font-weight:bold;">Agarwood Stage History</li>`;
      agarwoodHist.forEach(h => {
        html += `<li style="margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);">
          <span class="badge badge-default">${h.stage}</span> <small>${new Date(h.created_at).toLocaleString()}</small>
        </li>`;
      });
    }

    if (!statusHist?.length && !agarwoodHist?.length) {
      html += '<li style="color: var(--text-muted);">No history yet.</li>';
    }

    html += '</ul>';
    historyContainer.innerHTML = html;
  }

  // --- Items Management ---
  addItemBtn.addEventListener('click', () => {
    orderItems.push({ product_name: '', quantity: 1, unit_price: 0, total_price: 0 });
    renderItemsTable();
  });

  window.removeItem = (index) => {
    orderItems.splice(index, 1);
    renderItemsTable();
  };

  window.updateItem = (index, field, value) => {
    orderItems[index][field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      orderItems[index].total_price = orderItems[index].quantity * orderItems[index].unit_price;
      updateTotalAmount();
    }
    renderItemsTable();
  };

  function updateTotalAmount() {
    const total = orderItems.reduce((sum, item) => sum + Number(item.total_price), 0);
    fTotal.value = total.toFixed(2);
  }

  function renderItemsTable() {
    itemsTableBody.innerHTML = '';
    if (orderItems.length === 0) {
      itemsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No items added.</td></tr>`;
      return;
    }

    orderItems.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" class="form-control" value="${item.product_name}" onchange="updateItem(${index}, 'product_name', this.value)" placeholder="Product Name"></td>
        <td><input type="number" class="form-control" value="${item.quantity}" min="1" onchange="updateItem(${index}, 'quantity', this.value)"></td>
        <td><input type="number" class="form-control" value="${item.unit_price}" step="0.01" onchange="updateItem(${index}, 'unit_price', this.value)"></td>
        <td>${Number(item.total_price).toFixed(2)}</td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="removeItem(${index})"><i class="fas fa-times"></i></button></td>
      `;
      itemsTableBody.appendChild(tr);
    });
  }

  // --- Save / Delete Logic ---
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveOrderBtn.disabled = true;
    saveOrderBtn.innerHTML = 'Saving...';
    formMsg.textContent = '';
    formMsg.style.color = '';

    const orderData = {
      order_type: fOrderType.value,
      invoice_number: fInvoice.value,
      customer_name: fName.value,
      customer_email: fEmail.value,
      customer_phone: fPhone.value,
      shipping_address: fAddress.value,
      status: fStatus.value,
      payment_status: fPayment.value,
      estimated_delivery: fDelivery.value || null,
      total_amount: parseFloat(fTotal.value) || 0,
      agarwood_stage: fAgarwoodStage.value,
      plantation_name: fPlantation.value,
      tree_id: fTree.value,
      batch_id: fTree.value,
    };

    try {
      let currentOrderId = orderId;

      if (isEditMode) {
        const { error } = await supabaseClient.from('orders').update(orderData).eq('id', orderId);
        if (error) throw error;
      } else {
        const { data, error } = await supabaseClient.from('orders').insert([orderData]).select().single();
        if (error) throw error;
        currentOrderId = data.id;
      }

      if (isEditMode) {
        await supabaseClient.from('order_items').delete().eq('order_id', currentOrderId);
      }
      
      if (orderItems.length > 0) {
        const itemsToInsert = orderItems.map(item => ({
          order_id: currentOrderId,
          product_name: item.product_name || 'Item',
          quantity: parseInt(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          total_price: parseFloat(item.total_price) || 0
        }));
        await supabaseClient.from('order_items').insert(itemsToInsert);
      }

      if (!isEditMode || originalStatus !== orderData.status) {
        await supabaseClient.from('order_status_history').insert([{
          order_id: currentOrderId,
          status: orderData.status,
          description: `Status updated by Admin`
        }]);
      }

      if (!isEditMode || originalAgarwoodStage !== orderData.agarwood_stage) {
        await supabaseClient.from('agarwood_stage_history').insert([{
          order_id: currentOrderId,
          stage: orderData.agarwood_stage,
          description: `Agarwood stage updated by Admin`,
          stage_date: fStageDate.value || null
        }]);
      }

      formMsg.textContent = 'Order saved successfully!';
      formMsg.style.color = 'green';
      
      setTimeout(() => {
        if (!isEditMode) window.location.href = 'dashboard.html';
        else {
          saveOrderBtn.disabled = false;
          saveOrderBtn.innerHTML = '<i class="fas fa-save"></i> Save Order';
          loadOrderDetails();
        }
      }, 1500);

    } catch (err) {
      console.error(err);
      formMsg.textContent = 'Error saving order: ' + err.message;
      formMsg.style.color = 'red';
      saveOrderBtn.disabled = false;
      saveOrderBtn.innerHTML = '<i class="fas fa-save"></i> Save Order';
    }
  });

  // Handle Delete
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const confirmDelete = confirm('Are you sure you want to delete this order? This action cannot be undone.');
      if (confirmDelete) {
        const { error } = await supabaseClient.from('orders').delete().eq('id', orderId);
        if (error) {
          alert('Error deleting order: ' + error.message);
        } else {
          window.location.href = 'dashboard.html';
        }
      }
    });
  }

  // Handle PDF Generation
  if (downloadInvoiceBtn) {
    downloadInvoiceBtn.addEventListener('click', () => {
      // Setup the hidden template data
      document.getElementById('invDate').textContent = new Date().toLocaleDateString();
      document.getElementById('invNumber').textContent = fInvoice.value;
      
      document.getElementById('invCustomerName').textContent = fName.value || 'Customer';
      document.getElementById('invCustomerEmail').textContent = fEmail.value || '';
      document.getElementById('invCustomerPhone').textContent = fPhone.value || '';
      document.getElementById('invCustomerAddress').textContent = fAddress.value || '';
      
      document.getElementById('invPaymentStatus').textContent = fPayment.value;
      
      const invItemsBody = document.getElementById('invItemsBody');
      invItemsBody.innerHTML = '';
      
      let subtotal = 0;
      orderItems.forEach(item => {
        const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
        subtotal += itemTotal;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="padding: 10px 12px; border: 1px solid #eee; font-size: 14px;">${item.product_name}</td>
          <td style="padding: 10px 12px; border: 1px solid #eee; font-size: 14px; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 12px; border: 1px solid #eee; font-size: 14px; text-align: right;">${Number(item.unit_price).toFixed(2)}</td>
          <td style="padding: 10px 12px; border: 1px solid #eee; font-size: 14px; text-align: right; font-weight: 600;">${itemTotal.toFixed(2)}</td>
        `;
        invItemsBody.appendChild(tr);
      });
      
      const totalStr = Number(fTotal.value || subtotal).toFixed(2);
      document.getElementById('invSubtotal').textContent = subtotal.toFixed(2);
      document.getElementById('invTotal').textContent = totalStr;

      // Make the template visible temporarily so html2pdf can render it
      const template = document.getElementById('invoiceTemplate');
      template.parentElement.style.display = 'block';

      const opt = {
        margin:       0,
        filename:     `NaturesTreasure_Invoice_${fInvoice.value}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      downloadInvoiceBtn.disabled = true;
      downloadInvoiceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

      html2pdf().set(opt).from(template).save().then(() => {
        template.parentElement.style.display = 'none';
        downloadInvoiceBtn.disabled = false;
        downloadInvoiceBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Download Invoice';
      });
    });
  }
});
