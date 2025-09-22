// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
});

// Global state
let products = [];
let editingProduct = null;
let currentOrder = [];
let currentCustomer = {
    name: '',
    age: '',
    mobile: '',
    address: '',
    notes: ''
};

// Load data from localStorage
function loadData() {
    const savedProducts = localStorage.getItem('grocery-products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
    updateDashboardStats();
    renderProductsTable();
    updateProductSelect();
    renderLowStockAlert();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('grocery-products', JSON.stringify(products));
}

// Update dashboard statistics
function updateDashboardStats() {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.qty), 0);
    const lowStockCount = products.filter(p => p.qty <= 5).length;
    const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('total-value').textContent = `₹${totalValue.toLocaleString()}`;
    document.getElementById('low-stock-count').textContent = lowStockCount;
    document.getElementById('categories-count').textContent = categories.length;
}

// Render low stock alert
function renderLowStockAlert() {
    const lowStockProducts = products.filter(p => p.qty <= 5);
    const alertElement = document.getElementById('low-stock-alert');
    
    if (lowStockProducts.length > 0) {
        alertElement.classList.remove('hidden');
        document.getElementById('alert-message').textContent = 
            `${lowStockProducts.length} product(s) are running low on stock:`;
        
        const badgesContainer = document.getElementById('alert-badges');
        badgesContainer.innerHTML = lowStockProducts.map(product => 
            `<span class="alert-badge">${product.name} (${product.qty} ${product.unit})</span>`
        ).join('');
    } else {
        alertElement.classList.add('hidden');
    }
}

// Render products table
function renderProductsTable() {
    const tbody = document.getElementById('products-table-body');
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="no-products">
                    No products found. Add your first product to get started.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td style="font-weight: 600; color: #1e293b;">${product.name}</td>
            <td>
                <span class="badge badge-category">${product.category}</span>
            </td>
            <td>
                <span class="badge ${product.qty <= 5 ? 'badge-qty-low' : 'badge-qty-good'}">
                    ${product.qty}
                </span>
            </td>
            <td style="color: #64748b;">${product.unit}</td>
            <td style="font-weight: 600; color: #059669;">₹${product.price}</td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #64748b;">
                ${product.notes || '-'}
            </td>
            <td class="text-right">
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn btn-outline btn-edit" onclick="editProduct('${product.id}')">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="btn btn-outline btn-delete" onclick="deleteProduct('${product.id}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();
}

// Update product select dropdown
function updateProductSelect() {
    const select = document.getElementById('product-select');
    select.innerHTML = '<option value="">Choose a product</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.innerHTML = `
            <div>
                ${product.name} - ₹${product.price} • ${product.qty} ${product.unit} in stock
            </div>
        `;
        option.textContent = `${product.name} - ₹${product.price} • ${product.qty} ${product.unit} in stock`;
        select.appendChild(option);
    });
}

// Update category select
function updateCategorySelect() {
    const select = document.getElementById('product-category');
    const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
    
    select.innerHTML = '<option value="">Select category</option>';
    
    if (categories.length === 0) {
        // Default categories
        const defaultCategories = ['Fruits', 'Vegetables', 'Dairy', 'Grains'];
        defaultCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    } else {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }
}

// Tab switching
document.querySelectorAll('.tab-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
        const tabId = trigger.dataset.tab;
        
        // Update active tab trigger
        document.querySelectorAll('.tab-trigger').forEach(t => t.classList.remove('active'));
        trigger.classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabId}-tab`).classList.add('active');
        
        // Update category select when switching to add tab
        if (tabId === 'add') {
            updateCategorySelect();
        }
    });
});

// Category toggle functionality
document.getElementById('toggle-category').addEventListener('click', () => {
    const select = document.getElementById('product-category');
    const input = document.getElementById('new-category');
    const isShowingInput = !input.classList.contains('hidden');
    
    if (isShowingInput) {
        // Switch back to select
        input.classList.add('hidden');
        select.classList.remove('hidden');
    } else {
        // Switch to input
        select.classList.add('hidden');
        input.classList.remove('hidden');
        input.focus();
    }
});

// Product form submission
document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('product-name').value.trim();
    const categorySelect = document.getElementById('product-category').value;
    const newCategory = document.getElementById('new-category').value.trim();
    const qty = parseInt(document.getElementById('product-qty').value);
    const unit = document.getElementById('product-unit').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const notes = document.getElementById('product-notes').value.trim();
    
    const category = newCategory || categorySelect;
    
    if (!name || !category || qty < 0 || price < 0) {
        alert('Please fill in all required fields with valid values');
        return;
    }
    
    const productData = {
        name,
        category,
        qty,
        unit: unit || 'pcs',
        price,
        notes
    };
    
    if (editingProduct) {
        // Update existing product
        const index = products.findIndex(p => p.id === editingProduct.id);
        products[index] = { ...productData, id: editingProduct.id };
        editingProduct = null;
        updateFormMode();
    } else {
        // Add new product
        const newProduct = { ...productData, id: Date.now().toString() };
        products.push(newProduct);
    }
    
    saveData();
    updateDashboardStats();
    renderProductsTable();
    updateProductSelect();
    renderLowStockAlert();
    resetProductForm();
    
    // Switch to stock tab
    document.querySelector('[data-tab="stock"]').click();
});

// Reset product form
function resetProductForm() {
    document.getElementById('product-form').reset();
    document.getElementById('product-unit').value = 'pcs';
    document.getElementById('new-category').classList.add('hidden');
    document.getElementById('product-category').classList.remove('hidden');
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    editingProduct = product;
    
    // Fill form with product data
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-qty').value = product.qty;
    document.getElementById('product-unit').value = product.unit;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-notes').value = product.notes;
    
    updateFormMode();
    
    // Switch to add tab
    document.querySelector('[data-tab="add"]').click();
}

// Update form mode
function updateFormMode() {
    const isEditing = editingProduct !== null;
    
    document.getElementById('form-title').textContent = isEditing ? 'Edit Product' : 'Add New Product';
    document.getElementById('save-button-text').textContent = isEditing ? 'Update Product' : 'Save Product';
    document.getElementById('cancel-edit').classList.toggle('hidden', !isEditing);
    document.querySelector('.add-tab-text').textContent = isEditing ? 'Edit Product' : 'Add Product';
    
    // Update icon
    const icon = document.getElementById('form-icon');
    icon.setAttribute('data-lucide', isEditing ? 'save' : 'plus');
    lucide.createIcons();
}

// Cancel edit
document.getElementById('cancel-edit').addEventListener('click', () => {
    editingProduct = null;
    updateFormMode();
    resetProductForm();
    document.querySelector('[data-tab="stock"]').click();
});

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        saveData();
        updateDashboardStats();
        renderProductsTable();
        updateProductSelect();
        renderLowStockAlert();
    }
}

// Billing system functionality

// Enable/disable add to order button
document.getElementById('product-select').addEventListener('change', (e) => {
    const addButton = document.getElementById('add-to-order');
    addButton.disabled = !e.target.value;
});

// Add to order
document.getElementById('add-to-order').addEventListener('click', () => {
    const selectedProductId = document.getElementById('product-select').value;
    if (!selectedProductId) return;
    
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    const qtyInput = prompt(`Enter quantity for ${product.name} (available: ${product.qty} ${product.unit})`, '1');
    if (!qtyInput) return;
    
    const qty = parseInt(qtyInput);
    if (isNaN(qty) || qty <= 0) {
        alert('Please enter a valid quantity');
        return;
    }
    
    const existingItem = currentOrder.find(item => item.productId === selectedProductId);
    const totalQtyNeeded = existingItem ? existingItem.qty + qty : qty;
    
    if (totalQtyNeeded > product.qty) {
        alert('Not enough stock available');
        return;
    }
    
    if (existingItem) {
        existingItem.qty += qty;
    } else {
        currentOrder.push({
            productId: selectedProductId,
            name: product.name,
            price: product.price,
            qty: qty
        });
    }
    
    renderOrderTable();
    updateOrderTotal();
});

// Remove from order
function removeFromOrder(productId) {
    currentOrder = currentOrder.filter(item => item.productId !== productId);
    renderOrderTable();
    updateOrderTotal();
}

// Render order table
function renderOrderTable() {
    const tbody = document.getElementById('order-table-body');
    
    if (currentOrder.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="no-products">
                    No items in order. Add products to get started.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = currentOrder.map(item => `
        <tr>
            <td style="font-weight: 600; color: #1e293b;">${item.name}</td>
            <td style="font-weight: 500; color: #64748b;">${item.qty}</td>
            <td style="font-weight: 600; color: #059669;">₹${item.price}</td>
            <td style="font-weight: 700; color: #2563eb;">₹${item.price * item.qty}</td>
            <td class="text-right">
                <button class="btn btn-outline btn-delete" onclick="removeFromOrder('${item.productId}')">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();
}

// Update order total
function updateOrderTotal() {
    const totalSection = document.getElementById('order-total-section');
    const subtotalElement = document.getElementById('order-subtotal');
    
    if (currentOrder.length > 0) {
        const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.qty), 0);
        subtotalElement.textContent = subtotal.toLocaleString();
        totalSection.classList.remove('hidden');
    } else {
        totalSection.classList.add('hidden');
    }
}

// Generate bill
document.getElementById('generate-bill').addEventListener('click', () => {
    if (currentOrder.length === 0) {
        alert('Please add items to the order');
        return;
    }
    
    const customerName = document.getElementById('customer-name').value.trim();
    const customerMobile = document.getElementById('customer-mobile').value.trim();
    
    if (!customerName || !customerMobile) {
        alert('Please enter customer name and mobile number');
        return;
    }
    
    // Collect customer data
    currentCustomer = {
        name: customerName,
        age: document.getElementById('customer-age').value.trim(),
        mobile: customerMobile,
        address: document.getElementById('customer-address').value.trim(),
        notes: document.getElementById('customer-notes').value.trim()
    };
    
    // Update stock
    currentOrder.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.qty -= item.qty;
        }
    });
    
    saveData();
    updateDashboardStats();
    renderProductsTable();
    updateProductSelect();
    renderLowStockAlert();
    
    // Generate invoice
    generateInvoice();
    
    // Reset billing form
    resetBillingForm();
});

// Reset billing form
function resetBillingForm() {
    document.getElementById('customer-form').reset();
    document.getElementById('product-select').value = '';
    document.getElementById('add-to-order').disabled = true;
    currentOrder = [];
    renderOrderTable();
    updateOrderTotal();
}

// Generate invoice
function generateInvoice() {
    const modal = document.getElementById('invoice-modal');
    const invoiceDate = new Date().toLocaleString('en-IN');
    const invoiceNumber = 'INV-' + Date.now().toString().slice(-6);
    const total = currentOrder.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Update invoice details
    document.getElementById('invoice-date').textContent = invoiceDate;
    document.getElementById('invoice-number').textContent = invoiceNumber;
    
    // Update customer info
    const customerInfo = document.getElementById('invoice-customer-info');
    customerInfo.innerHTML = `
        <p><strong>Name:</strong> ${currentCustomer.name}</p>
        ${currentCustomer.age ? `<p><strong>Age:</strong> ${currentCustomer.age}</p>` : ''}
        <p><strong>Mobile:</strong> ${currentCustomer.mobile}</p>
        ${currentCustomer.address ? `<p><strong>Address:</strong> ${currentCustomer.address}</p>` : ''}
        ${currentCustomer.notes ? `<p><strong>Notes:</strong> ${currentCustomer.notes}</p>` : ''}
    `;
    
    // Update items table
    const itemsBody = document.getElementById('invoice-items-body');
    const itemsHTML = currentOrder.map(item => `
        <tr>
            <td style="font-weight: 600; color: #1e293b;">${item.name}</td>
            <td class="text-center" style="font-weight: 500; color: #64748b;">${item.qty}</td>
            <td class="text-right" style="font-weight: 600; color: #059669;">₹${item.price}</td>
            <td class="text-right" style="font-weight: 700; color: #2563eb;">₹${item.price * item.qty}</td>
        </tr>
    `).join('');
    
    const totalRow = `
        <tr class="invoice-total-row">
            <td colspan="3" class="text-right" style="font-weight: 700; color: #475569;">Total Amount:</td>
            <td class="text-right invoice-total-amount">₹${total.toLocaleString()}</td>
        </tr>
    `;
    
    itemsBody.innerHTML = itemsHTML + totalRow;
    
    // Show modal
    modal.classList.remove('hidden');
}

// Close invoice
document.getElementById('close-invoice').addEventListener('click', () => {
    document.getElementById('invoice-modal').classList.add('hidden');
});

// Print invoice
document.getElementById('print-invoice').addEventListener('click', () => {
    window.print();
});

// Close modal when clicking outside
document.getElementById('invoice-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        document.getElementById('invoice-modal').classList.add('hidden');
    }
});

// Initialize the app
loadData();