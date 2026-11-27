// Customer and purchasing workflows share the existing local demo state.
state.addresses??=[];state.returns??=[];state.purchases??=[];
const accountButton=document.createElement('button');accountButton.id='accountBtn';accountButton.textContent='My account';document.querySelector('.header-actions').insertBefore(accountButton,$('#wishBtn'));accountButton.onclick=()=>account('Orders');
function account(tabName){const points=Math.floor(state.orders.filter(o=>o.status!=='Cancelled').reduce((s,o)=>s+o.total,0)/100)*5;modal(`<p class="eyebrow">YOUR RETAIL COMPANION</p><h2>My account</h2><p class="notice">Demo account on this device. No sign-in required. Use sample information.</p><div class="account-tabs">${['Orders','Addresses','Rewards','Returns'].map(t=>`<button data-account-tab="${t}" class="${t===tabName?'selected':''}">${t}</button>`).join('')}</div><div id="accountBody"></div>`);document.querySelectorAll('[data-account-tab]').forEach(b=>b.onclick=()=>account(b.dataset.accountTab));const body=$('#accountBody');
if(tabName==='Orders'){body.innerHTML=state.orders.length?state.orders.map((o,i)=>`<article class="account-card"><div class="order-top"><b>${o.id}</b><span class="badge">${esc(o.status)}</span></div><p>${o.date} · ${money(o.total)}</p><p>${o.items.reduce((s,x)=>s+x.qty,0)} items · ${esc(o.method)}</p><div class="account-actions"><button class="btn dark" data-reorder="${i}">Buy again</button><button data-customer-track="${i}">Track</button><button data-customer-invoice="${i}">Invoice</button>${o.status==='Delivered'?`<button data-return="${i}">Request return</button>`:''}</div></article>`).join(''):'<div class="account-card"><h3>Your next favourite is waiting.</h3><p>Complete a demo checkout to see your orders here.</p></div>';document.querySelectorAll('[data-reorder]').forEach(b=>b.onclick=()=>{state.orders[+b.dataset.reorder].items.forEach(i=>{for(let n=0;n<i.qty;n++)add(i.id,i.variant)});toast('Available items added to your bag')});document.querySelectorAll('[data-customer-track]').forEach(b=>b.onclick=()=>track(state.orders[+b.dataset.customerTrack].id));document.querySelectorAll('[data-customer-invoice]').forEach(b=>b.onclick=()=>invoice(state.orders[+b.dataset.customerInvoice]));document.querySelectorAll('[data-return]').forEach(b=>b.onclick=()=>returnForm(+b.dataset.return))}
if(tabName==='Addresses'){body.innerHTML=`${state.addresses.map((a,i)=>`<article class="account-card"><b>${esc(a.label)}</b><p>${esc(a.address)}</p><button data-delete-address="${i}">Remove address</button></article>`).join('')}<form id="addressForm" class="account-card"><h3>Add a saved address</h3><label>Label<input name="label" required maxlength="40" placeholder="Home (sample)"></label><label>Address<textarea name="address" required maxlength="300" placeholder="Sample street, city, postcode"></textarea></label><button class="btn dark">Save address</button></form>`;$('#addressForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.addresses.push({label:f.get('label'),address:f.get('address')});persist();account('Addresses');toast('Address saved on this device')};document.querySelectorAll('[data-delete-address]').forEach(b=>b.onclick=()=>{state.addresses.splice(+b.dataset.deleteAddress,1);persist();account('Addresses')})}
if(tabName==='Rewards'){body.innerHTML=`<article class="rewards-card"><p class="eyebrow">EXPLORER MEMBERSHIP</p><strong>${points.toLocaleString('en-IN')}</strong><p>demo points earned</p><div class="reward-track"><div style="width:${Math.min(100,points/5)}%"></div></div><p>${points>=500?'You reached the 500-point milestone.':`${500-points} points to your next milestone.`}</p></article><article class="account-card"><h3>Make every find count.</h3><p>Earn 5 points for every ₹100 across non-cancelled demo orders. Points are illustrative and cannot be redeemed for real value.</p><p><b>WELCOME10</b> · Get 10% off your next demo bag.</p></article>`}
if(tabName==='Returns'){body.innerHTML=`<p>Return requests are available for delivered demo orders. Set an order to Delivered in the dashboard to try the flow.</p>${state.returns.length?state.returns.map(r=>`<article class="account-card"><div class="order-top"><b>${r.id}</b><span class="badge">${esc(r.status)}</span></div><p>Order ${r.orderId}</p><p>${esc(r.reason)} · ${r.date}</p></article>`).join(''):'<div class="account-card">No return requests yet.</div>'}`}}
function returnForm(i){const o=state.orders[i];if(state.returns.some(r=>r.orderId===o.id))return toast('A return request already exists for this order');modal(`<p class="eyebrow">LET’S MAKE IT RIGHT</p><h2>Request a return</h2><p>${o.id} · ${money(o.total)}</p><p class="notice">Whole-order return simulation. No courier booking or refund occurs.</p><form id="returnForm"><label>Reason<select name="reason"><option>Item damaged</option><option>Incorrect item</option><option>Size or fit</option><option>Changed my mind</option></select></label><label>Additional details<textarea name="note" maxlength="300" placeholder="Optional sample details"></textarea></label><button class="btn dark">Submit demo return</button></form>`);$('#returnForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.returns.push({id:'RT-'+Date.now().toString().slice(-7),orderId:o.id,reason:f.get('reason'),note:f.get('note'),status:'Requested',date:new Date().toLocaleDateString('en-IN')});persist();account('Returns');toast('Demo return request created')}}
const baseCheckout=checkout;checkout=function(){baseCheckout();const address=$('#checkout input[name=address]');if(state.addresses.length){const label=document.createElement('label');label.innerHTML=`Use a saved address<select id="savedAddress"><option value="">Choose an address</option>${state.addresses.map((a,i)=>`<option value="${i}">${esc(a.label)}</option>`).join('')}</select>`;address.parentElement.before(label);$('#savedAddress').onchange=e=>{if(e.target.value!=='')address.value=state.addresses[+e.target.value].address}}const submit=$('#checkout').onsubmit;$('#checkout').onsubmit=e=>{const missing=state.cart.find(i=>state.cart.filter(x=>x.id===i.id).reduce((s,x)=>s+x.qty,0)>products.find(p=>p.id===i.id).stock);if(missing){e.preventDefault();toast('Stock has changed. Please adjust your bag before checkout.');return}submit(e)}};
const baseAdmin=adminRender;adminRender=function(){if(!['Purchasing','Returns'].includes(activeTab)){baseAdmin()}else{$('#adminTabs').innerHTML=['Overview','Orders','Inventory','Customers','Point of sale','Reports','Promotions','Settings'].map(t=>`<button data-tab="${t}">${t}</button>`).join('');renderOperations()}const tabs=$('#adminTabs');['Purchasing','Returns'].forEach(t=>{const b=document.createElement('button');b.textContent=t;b.dataset.tab=t;b.classList.toggle('active',activeTab===t);tabs.append(b)})};
function renderOperations(){if(activeTab==='Purchasing'){$('#adminContent').innerHTML=`<div class="section-heading"><div><p class="eyebrow">KEEP YOUR SHELVES READY</p><h2>Supplier purchasing</h2></div><button class="btn dark" id="newPurchase">Create purchase order</button></div><p>Receive demo deliveries to increase local stock. No order is sent to a supplier.</p><div class="metrics"><div class="metric"><p>Open purchases</p><strong>${state.purchases.filter(p=>p.status==='Ordered').length}</strong></div><div class="metric"><p>Low-stock items</p><strong>${products.filter(p=>p.stock<10).length}</strong></div><div class="metric"><p>Purchase value</p><strong>${money(state.purchases.reduce((s,p)=>s+p.qty*p.cost,0))}</strong></div></div><div class="workspace-card"><table><thead><tr><th>PO reference</th><th>Supplier</th><th>Product</th><th>Quantity</th><th>Cost</th><th>Status</th><th>Action</th></tr></thead><tbody>${state.purchases.map((p,i)=>`<tr><td>${p.id}</td><td>${esc(p.supplier)}</td><td>${products.find(x=>x.id===p.productId).name}</td><td>${p.qty}</td><td>${money(p.qty*p.cost)}</td><td><span class="badge">${p.status}</span></td><td>${p.status==='Ordered'?`<button class="btn dark" data-receive="${i}">Receive stock</button>`:'Received into inventory'}</td></tr>`).join('')||'<tr><td colspan="7">No purchase orders. Create one to try supplier receiving.</td></tr>'}</tbody></table></div>`;$('#newPurchase').onclick=purchaseForm;document.querySelectorAll('[data-receive]').forEach(b=>b.onclick=()=>{const p=state.purchases[+b.dataset.receive];if(p.status!=='Ordered')return;p.status='Received';products.find(x=>x.id===p.productId).stock+=p.qty;localStorage.setItem('starwalt-stock',JSON.stringify(products.map(p=>p.stock)));persist();render();adminRender();toast('Stock received into demo inventory')})}
if(activeTab==='Returns'){$('#adminContent').innerHTML=`<h2>Returns desk</h2><p>Review customer demo requests. Status changes do not issue payments or restock inventory.</p><div class="workspace-card"><table><thead><tr><th>Request</th><th>Order</th><th>Reason</th><th>Details</th><th>Resolution</th></tr></thead><tbody>${state.returns.map((r,i)=>`<tr><td>${r.id}</td><td>${r.orderId}</td><td>${esc(r.reason)}</td><td style="white-space:normal;max-width:250px">${esc(r.note||'—')}</td><td><select data-return-status="${i}" aria-label="Return resolution">${['Requested','Approved','Rejected','Completed'].map(s=>`<option ${s===r.status?'selected':''}>${s}</option>`).join('')}</select></td></tr>`).join('')||'<tr><td colspan="5">No return requests. Use My account to request a return on a delivered order.</td></tr>'}</tbody></table></div>`;document.querySelectorAll('[data-return-status]').forEach(s=>s.onchange=()=>{state.returns[+s.dataset.returnStatus].status=s.value;persist();toast('Return resolution updated')})}}
function purchaseForm(){modal(`<p class="eyebrow">SUPPLIER WORKSPACE</p><h2>New purchase order</h2><p class="notice">Demo only. This does not contact a supplier or commit spending.</p><form id="purchaseForm"><label>Supplier<input name="supplier" required maxlength="80" placeholder="Sample supplier"></label><label>Product<select name="product">${products.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></label><label>Quantity<input name="qty" type="number" min="1" max="10000" step="1" required value="10"></label><label>Unit cost (₹)<input name="cost" type="number" min="1" max="1000000" step="0.01" required value="300"></label><button class="btn dark">Create demo purchase</button></form>`);$('#purchaseForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.purchases.push({id:'PO-'+Date.now().toString().slice(-7),supplier:f.get('supplier'),productId:+f.get('product'),qty:+f.get('qty'),cost:+f.get('cost'),status:'Ordered'});persist();close();adminRender();toast('Demo purchase order created')}}

// Discovery, reviews, and business enquiry demos.
(() => {
  const ensure = () => { state.reviews ??= []; state.recent ??= []; state.enquiries ??= []; };
  ensure();
  const styles = document.createElement('style');
  styles.textContent = '.retail-discovery{margin:0 5% 50px;padding:32px;background:#edf1e6;border-radius:8px}.retail-discovery h2{font-size:30px;margin:0 0 12px}.discovery-actions{display:flex;gap:12px;flex-wrap:wrap;margin:22px 0}.mini-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px}.mini-find{border:1px solid #dce2dc;border-radius:7px;padding:15px;background:white;text-align:left}.mini-find img{width:100%;height:130px;object-fit:cover;border-radius:5px}.mini-find span{display:block;margin-top:10px;font-size:14px}.review-entry{border-bottom:1px solid #dce2dc;padding:18px 0}.review-entry p{line-height:1.7;overflow-wrap:anywhere}.review-score{font-size:26px;color:#244d40}.quote-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px}.quote-card{padding:22px;background:white;border:1px solid #dce2dc;border-radius:8px}.quote-card p{overflow-wrap:anywhere;line-height:1.6}.quote-card label{display:grid;gap:8px;margin-top:15px}.quote-card strong{font-size:24px}';
  document.head.append(styles);
  const discovery = document.createElement('section');
  discovery.className = 'retail-discovery';
  discovery.innerHTML = '<p class="eyebrow">A LITTLE MORE TO DISCOVER</p><h2>Find it. Love it. Make it yours.</h2><p>Pick up where you left off, or plan a bigger order for your business.</p><div class="discovery-actions"><button class="btn dark" id="recentFinds">Recently viewed</button><button class="btn dark" id="bulkEnquiry">Bulk & business orders</button></div><p style="font-size:14px;color:#65736b">Local demonstration · Enquiries and reviews stay on this device.</p>';
  document.querySelector('#experience').before(discovery);
  function showRecent() {
    ensure();
    modal('<p class="eyebrow">PICK UP WHERE YOU LEFT OFF</p><h2>Recently viewed</h2>' + (state.recent.length ? '<div class="mini-grid">' + state.recent.map(id => {
      const p = products.find(p => p.id === id);
      return p ? '<button class="mini-find" data-detail="' + p.id + '"><img src="' + img(p) + '" alt="' + p.name + '"><span>' + p.name + '</span><span>' + money(p.price) + '</span></button>' : '';
    }).join('') + '</div>' : '<p>Open a product from the collection to start your list.</p>') + '<p class="notice">Your last six product views are saved on this device.</p>');
  }
  document.querySelector('#recentFinds').onclick = showRecent;
  document.querySelector('#bulkEnquiry').onclick = () => enquiryForm();
  const previousDetail = detail;
  detail = function(id) {
    ensure();
    state.recent = [id, ...state.recent.filter(x => x !== id)].slice(0, 6);
    persist();
    previousDetail(id);
    const p = products.find(p => p.id === id);
    const reviews = state.reviews.filter(r => r.productId === id);
    const avg = reviews.length ? (reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
    const section = document.createElement('section');
    section.innerHTML = '<hr style="border:0;border-top:1px solid #dce2dc;margin:28px 0"><h3>Customer reviews</h3><p>' + (avg ? '<span class="review-score">' + avg + ' / 5</span> · ' + reviews.length + ' local demo reviews' : 'No local reviews yet. Be the first to try the review demo.') + '</p>' + reviews.map(r => '<article class="review-entry"><b>' + esc(r.name) + '</b><p>' + '★'.repeat(r.rating) + ' · ' + esc(r.date) + '</p><p>' + esc(r.comment) + '</p><small>Unverified demo review</small></article>').join('') + '<form id="retailReview"><label>Display name<input name="name" required maxlength="50" placeholder="Demo shopper"></label><label>Rating<select name="rating"><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Average</option><option value="2">2 — Below expectations</option><option value="1">1 — Poor</option></select></label><label>Your review<textarea name="comment" required maxlength="600" placeholder="Use sample feedback for this demo"></textarea></label><button class="btn dark">Save demo review</button></form><p class="notice">Reviews are unverified and saved on this device only.</p><button class="btn dark full" id="productQuote">Request a bulk quote for this product</button>';
    document.querySelector('#panelContent').append(section);
    document.querySelector('#retailReview').onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target);
      state.reviews.push({ productId: id, name: f.get('name').trim(), rating: Number(f.get('rating')), comment: f.get('comment').trim(), date: new Date().toLocaleDateString('en-IN') });
      persist(); detail(id); toast('Demo review saved');
    };
    document.querySelector('#productQuote').onclick = () => enquiryForm(id);
  };
  function enquiryForm(productId) {
    ensure();
    modal('<p class="eyebrow">BIGGER PLANS. THOUGHTFUL FINDS.</p><h2>Bulk & business orders</h2><p class="notice">Demonstration only. Use sample contact information. This request is saved on your device and is not sent to a business.</p><form id="bulkForm"><label>Business name<input name="business" required maxlength="80" placeholder="Demo business"></label><label>Contact email<input name="email" type="email" required maxlength="120" placeholder="demo@example.com"></label><label>Product<select name="product">' + products.map(p => '<option value="' + p.id + '" ' + (p.id === productId ? 'selected' : '') + '>' + p.name + '</option>').join('') + '</select></label><label>Quantity<input name="quantity" required type="number" min="10" max="10000" step="1" value="10"></label><label>Requirements<textarea name="requirements" maxlength="500" placeholder="Packaging, branding, or delivery requirements"></textarea></label><div class="notice" id="bulkEstimate"></div><button class="btn dark">Save demo enquiry</button></form>');
    const form = document.querySelector('#bulkForm');
    const estimate = () => {
      const p = products.find(p => p.id === Number(form.elements.product.value));
      const qty = Number(form.elements.quantity.value);
      document.querySelector('#bulkEstimate').textContent = 'Catalog estimate: ' + money(p.price * (Number.isFinite(qty) ? qty : 0)) + '. Final pricing, tax, shipping, and stock require confirmation. No bulk discount is automatically applied.';
    };
    form.elements.product.onchange = estimate;
    form.elements.quantity.oninput = estimate;
    estimate();
    form.onsubmit = e => {
      e.preventDefault();
      const f = new FormData(form);
      const p = products.find(p => p.id === Number(f.get('product')));
      const q = { id: 'BQ-' + Date.now().toString().slice(-8), business: f.get('business').trim(), email: f.get('email').trim(), productId: p.id, quantity: Number(f.get('quantity')), requirements: f.get('requirements').trim(), estimate: p.price * Number(f.get('quantity')), status: 'New', date: new Date().toLocaleDateString('en-IN') };
      state.enquiries.unshift(q); persist();
      modal('<p class="eyebrow">READY FOR REVIEW</p><h2>Demo enquiry saved.</h2><p>Reference: <b>' + q.id + '</b></p><p>' + esc(p.name) + ' × ' + q.quantity + '</p><p>Catalog estimate: ' + money(q.estimate) + '</p><p class="notice">No enquiry was sent. Explore Business enquiries in the retail dashboard to manage this local request.</p><button id="downloadEnquiry" class="btn dark">Download enquiry summary</button>');
      document.querySelector('#downloadEnquiry').onclick = () => download(q.id + '.txt', 'STARWALT RETAIL — DEMO ENQUIRY\nReference: ' + q.id + '\nBusiness: ' + q.business + '\nProduct: ' + p.name + '\nQuantity: ' + q.quantity + '\nCatalog estimate: ' + money(q.estimate) + '\nRequirements: ' + q.requirements + '\nNot a confirmed quote or order. No request sent.');
    };
  }
  const previousAdmin = adminRender;
  adminRender = function() {
    ensure();
    if (activeTab === 'Business enquiries') {
      const tabs = ['Overview','Orders','Inventory','Customers','Point of sale','Reports','Promotions','Settings','Purchasing','Returns'];
      document.querySelector('#adminTabs').innerHTML = tabs.map(t => '<button data-tab="' + t + '">' + t + '</button>').join('');
      document.querySelector('#adminContent').innerHTML = '<p class="eyebrow">TURN INTEREST INTO OPPORTUNITY</p><h2>Business enquiries</h2><p>Local enquiry pipeline. Status updates do not send messages, reserve stock, or create orders.</p><div class="metrics"><div class="metric"><p>Total enquiries</p><strong>' + state.enquiries.length + '</strong></div><div class="metric"><p>Open enquiries</p><strong>' + state.enquiries.filter(q => !['Won','Closed'].includes(q.status)).length + '</strong></div><div class="metric"><p>Catalog opportunity value</p><strong>' + money(state.enquiries.filter(q => q.status !== 'Closed').reduce((s,q) => s + q.estimate, 0)) + '</strong></div></div><div class="quote-grid">' + (state.enquiries.length ? state.enquiries.map((q,i) => {
        const p = products.find(p => p.id === q.productId);
        return '<article class="quote-card"><p class="eyebrow">' + q.id + '</p><h3>' + esc(q.business) + '</h3><p>' + esc(q.email) + '</p><p>' + esc(p.name) + ' × ' + q.quantity + '</p><strong>' + money(q.estimate) + '</strong><p>' + esc(q.requirements || 'No extra requirements') + '</p><p>' + q.date + '</p><label>Pipeline stage<select data-enquiry-stage="' + i + '">' + ['New','Contacted','Quoted','Won','Closed'].map(s => '<option ' + (q.status === s ? 'selected' : '') + '>' + s + '</option>').join('') + '</select></label></article>';
      }).join('') : '<article class="quote-card"><h3>Your pipeline starts here.</h3><p>Use Bulk & business orders in the storefront to create a sample enquiry.</p></article>') + '</div>';
      document.querySelectorAll('[data-enquiry-stage]').forEach(s => s.onchange = () => { state.enquiries[Number(s.dataset.enquiryStage)].status = s.value; persist(); adminRender(); toast('Demo enquiry stage updated'); });
    } else previousAdmin();
    const b = document.createElement('button'); b.textContent = 'Business enquiries'; b.dataset.tab = 'Business enquiries'; b.classList.toggle('active', activeTab === 'Business enquiries'); document.querySelector('#adminTabs').append(b);
  };
})();

// Fulfilment and stock interest are simulated, device-local workflows.
(() => {
  const setup = () => { state.stockAlerts ??= []; state.deliveryZones ??= [{prefix:'600',name:'Chennai demo zone',days:'2–4 business days'},{prefix:'632',name:'Vellore demo zone',days:'1–3 business days'}]; };
  setup();
  const detailBeforeFulfilment = detail;
  detail = function(id) {
    setup(); detailBeforeFulfilment(id);
    const p = products.find(p => p.id === id);
    const block = document.createElement('section');
    block.className = 'account-card';
    block.innerHTML = '<h3>Delivery & availability</h3><p>Available stock: <b>'+p.stock+'</b></p><form id="deliveryCheck"><label>Delivery PIN code<input name="pin" inputmode="numeric" pattern="[1-9][0-9]{5}" maxlength="6" required placeholder="Try 600001 or 632001"></label><button class="btn dark">Check demo delivery</button></form><p id="deliveryResult" role="status"></p><button class="text-btn" id="stockInterest">Request a stock update</button><p style="font-size:14px">Sample delivery areas only. No courier lookup or email is performed.</p>';
    document.querySelector('#panelContent').append(block);
    document.querySelector('#deliveryCheck').onsubmit = e => {
      e.preventDefault();
      const pin = new FormData(e.target).get('pin').trim();
      const zone = state.deliveryZones.find(z => pin.startsWith(z.prefix));
      document.querySelector('#deliveryResult').textContent = zone ? (p.stock > 0 ? zone.name+': estimated '+zone.days+'. Estimate only; shipping cost is calculated in your bag.' : 'This demo area is supported, but the item is out of stock. Request a stock update below.') : 'This PIN is outside the configured demo areas. Try store pickup or request a stock update.';
    };
    document.querySelector('#stockInterest').onclick = () => interestForm(id);
  };
  function interestForm(id) {
    setup(); const p = products.find(p=>p.id===id);
    modal('<p class="eyebrow">DON’T MISS YOUR NEXT FIND</p><h2>Stock updates</h2><h3>'+p.name+'</h3><p class="notice">Local demo only. Use a sample email address. No email is sent and no stock is reserved.</p><form id="stockForm"><label>Email<input name="email" type="email" required maxlength="120" placeholder="demo@example.com"></label><label>Quantity wanted<input name="qty" type="number" min="1" max="1000" step="1" required value="1"></label><button class="btn dark">Save demo stock request</button></form>');
    document.querySelector('#stockForm').onsubmit = e => {
      e.preventDefault(); const f = new FormData(e.target); const email=f.get('email').trim().toLowerCase();
      if(state.stockAlerts.some(a=>a.productId===id&&a.email===email&&a.status==='Waiting')) { toast('You already have a waiting request for this product'); return; }
      const request={id:'SA-'+Date.now().toString().slice(-8),productId:id,email,qty:Number(f.get('qty')),status:'Waiting',date:new Date().toLocaleDateString('en-IN')};
      state.stockAlerts.unshift(request);persist();
      modal('<p class="eyebrow">REQUEST SAVED</p><h2>We’ve saved your interest.</h2><p>Reference: <b>'+request.id+'</b></p><p>'+p.name+' × '+request.qty+'</p><p class="notice">Saved on this device only. Staff can review it under Stock alerts. No email will be sent automatically.</p>');
    };
  }
  const adminBeforeFulfilment=adminRender;
  adminRender=function(){
    setup();
    if(activeTab==='Stock alerts'){
      document.querySelector('#adminTabs').innerHTML=['Overview','Orders','Inventory','Customers','Point of sale','Reports','Promotions','Settings','Purchasing','Returns','Business enquiries'].map(t=>'<button data-tab="'+t+'">'+t+'</button>').join('');
      const waiting=state.stockAlerts.filter(a=>a.status==='Waiting');
      document.querySelector('#adminContent').innerHTML='<p class="eyebrow">PLAN YOUR NEXT RESTOCK</p><h2>Stock alerts</h2><p>Review device-local customer interest. Completing a request does not send a notification.</p><div class="metrics"><div class="metric"><p>Waiting requests</p><strong>'+waiting.length+'</strong></div><div class="metric"><p>Units requested</p><strong>'+waiting.reduce((s,a)=>s+a.qty,0)+'</strong></div><div class="metric"><p>Ready to review</p><strong>'+waiting.filter(a=>products.find(p=>p.id===a.productId).stock>=a.qty).length+'</strong></div></div><div class="workspace-card"><table><thead><tr><th>Reference</th><th>Product</th><th>Email</th><th>Wanted</th><th>Available</th><th>Status</th></tr></thead><tbody>'+(state.stockAlerts.map((a,i)=>{const p=products.find(p=>p.id===a.productId);return '<tr><td>'+a.id+'</td><td>'+p.name+'</td><td>'+esc(a.email)+'</td><td>'+a.qty+'</td><td>'+p.stock+'</td><td><select aria-label="Stock request status" data-stock-stage="'+i+'">'+['Waiting','Reviewed','Completed','Cancelled'].map(s=>'<option '+(s===a.status?'selected':'')+'>'+s+'</option>').join('')+'</select></td></tr>';}).join('')||'<tr><td colspan="6">No requests yet. Open a product and choose Request a stock update.</td></tr>')+'</tbody></table></div><div class="workspace-card"><h3>Demo delivery areas</h3><p>PIN prefixes shown below are illustrative configuration, not a claim about actual courier service.</p><div id="zones">'+state.deliveryZones.map((z,i)=>'<p>'+esc(z.prefix)+' · '+esc(z.name)+' · '+esc(z.days)+' <button data-remove-zone="'+i+'">Remove demo zone</button></p>').join('')+'</div><form id="zoneForm" class="shop-tools"><label>PIN prefix<input name="prefix" required pattern="[1-9][0-9]{2}" maxlength="3" placeholder="600"></label><label>Area name<input name="name" required maxlength="60" placeholder="Sample service area"></label><label>Delivery estimate<input name="days" required maxlength="60" placeholder="2–4 business days"></label><button class="btn dark">Add demo area</button></form><p id="zoneError" role="status"></p></div>';
      document.querySelectorAll('[data-stock-stage]').forEach(s=>s.onchange=()=>{state.stockAlerts[Number(s.dataset.stockStage)].status=s.value;persist();adminRender();toast('Demo request updated; no email sent')});
      document.querySelectorAll('[data-remove-zone]').forEach(b=>b.onclick=()=>{state.deliveryZones.splice(Number(b.dataset.removeZone),1);persist();adminRender()});
      document.querySelector('#zoneForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);if(state.deliveryZones.some(z=>z.prefix===f.get('prefix'))){document.querySelector('#zoneError').textContent='This PIN prefix is already configured.';return;}state.deliveryZones.push({prefix:f.get('prefix'),name:f.get('name').trim(),days:f.get('days').trim()});persist();adminRender();toast('Demo delivery area added')};
    }else adminBeforeFulfilment();
    const b=document.createElement('button');b.textContent='Stock alerts';b.dataset.tab='Stock alerts';b.classList.toggle('active',activeTab==='Stock alerts');document.querySelector('#adminTabs').append(b);
  };
})();


// Gift discovery and a local operating-expense register.
(() => {
  const init = () => { state.expenses ??= []; };
  init();
  const actions=document.querySelector('.discovery-actions');
  for(const [label,run] of [['Gift finder',giftFinder],['Curated bundles',bundles]]){
    const b=document.createElement('button'); b.className='btn dark'; b.textContent=label; b.onclick=run; actions.append(b);
  }
  function giftFinder(){
    modal('<p class="eyebrow">A THOUGHTFUL LITTLE SOMETHING</p><h2>Find the right gift.</h2><form id="giftForm"><label>Maximum product budget (₹)<input name="budget" type="number" min="1" max="100000" required value="1500"></label><label>Collection<select name="category"><option>All</option>'+[...new Set(products.map(p=>p.cat))].map(c=>'<option>'+c+'</option>').join('')+'</select></label><button class="btn dark">Find gifts</button></form><p class="notice">Product prices only. Shipping is calculated in your bag.</p><div id="giftMatches" class="mini-grid" style="margin-top:20px"></div>');
    document.querySelector('#giftForm').onsubmit=e=>{
      e.preventDefault(); const f=new FormData(e.target);
      const matches=products.filter(p=>p.price<=Number(f.get('budget'))&&p.stock>0&&(f.get('category')==='All'||p.cat===f.get('category'))).sort((a,b)=>a.price-b.price);
      document.querySelector('#giftMatches').innerHTML=matches.length?matches.map(p=>'<button class="mini-find" data-detail="'+p.id+'"><img src="'+img(p)+'" alt="'+p.name+'"><span>'+p.name+'</span><span>'+money(p.price)+'</span></button>').join(''):'<p>No in-stock gifts match. Increase your budget or try another collection.</p>';
    };document.querySelector('#giftForm').requestSubmit();
  }
  const sets=[{name:'Slow morning set',ids:[4,7],note:'A little greenery and a favourite morning ritual.'},{name:'On the go set',ids:[1,6],note:'An everyday carryall with a considered finishing touch.'},{name:'Weekend essentials',ids:[5,8],note:'Easygoing pieces for a relaxed weekend.'}];
  function bundles(){
    modal('<p class="eyebrow">GOOD THINGS GO TOGETHER</p><h2>Curated bundles</h2><p>Two complementary finds, one easy add. Catalog prices apply; no extra bundle discount.</p>'+sets.map((set,i)=>{
      const list=set.ids.map(id=>products.find(p=>p.id===id)); const ready=list.every(p=>remaining(p.id)>0);
      return '<article class="account-card"><h3>'+set.name+'</h3><p>'+set.note+'</p><p>'+list.map(p=>p.name+' · '+money(p.price)).join('<br>')+'</p><h3>'+money(list.reduce((s,p)=>s+p.price,0))+'</h3><button class="btn dark" data-bundle="'+i+'" '+(ready?'':'disabled')+'>'+(ready?'Add bundle to bag':'Not enough stock')+'</button></article>';
    }).join(''));
    document.querySelectorAll('[data-bundle]').forEach(b=>b.onclick=()=>{
      const set=sets[Number(b.dataset.bundle)];if(set.ids.some(id=>remaining(id)<1)){toast('Stock changed. Please review this bundle.');bundles();return;}
      set.ids.forEach(id=>add(id));toast('Both bundle items added to your bag');bundles();
    });
  }
  function remaining(id){return products.find(p=>p.id===id).stock-state.cart.filter(i=>i.id===id).reduce((s,i)=>s+i.qty,0)}
  const beforeExpenses=adminRender;
  let expenseMonth=new Date().toISOString().slice(0,7);
  adminRender=function(){
    init();
    if(activeTab==='Expenses'){
      document.querySelector('#adminTabs').innerHTML=['Overview','Orders','Inventory','Customers','Point of sale','Reports','Promotions','Settings','Purchasing','Returns','Business enquiries','Stock alerts'].map(t=>'<button data-tab="'+t+'">'+t+'</button>').join('');
      const rows=state.expenses.filter(x=>!expenseMonth||x.date.startsWith(expenseMonth));
      const active=rows.filter(x=>!x.voided);const sum=active.reduce((s,x)=>s+x.amount,0);
      document.querySelector('#adminContent').innerHTML='<div class="section-heading"><div><p class="eyebrow">UNDERSTAND YOUR STORE COSTS</p><h2>Operating expenses</h2></div><button class="btn dark" id="newExpense">Record expense</button></div><p class="notice">Local demonstration register. Entries do not move money or calculate tax. This is an expense total, not profit.</p><div class="shop-tools"><label>Filter month<input id="expenseMonth" type="month" value="'+expenseMonth+'"></label><button class="btn dark" id="exportExpenses">Download expenses CSV</button></div><div class="metrics"><div class="metric"><p>Active expenses</p><strong>'+active.length+'</strong></div><div class="metric"><p>Total recorded</p><strong>'+money(sum)+'</strong></div><div class="metric"><p>Voided entries</p><strong>'+rows.filter(x=>x.voided).length+'</strong></div></div><div class="workspace-card"><table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>'+(rows.map(x=>'<tr><td>'+esc(x.date)+'</td><td>'+esc(x.category)+'</td><td style="white-space:normal;max-width:250px">'+esc(x.description)+'</td><td>'+money(x.amount)+'</td><td>'+(x.voided?'Voided':'Recorded')+'</td><td><button data-expense-toggle="'+x.id+'">'+(x.voided?'Restore entry':'Void entry')+'</button></td></tr>').join('')||'<tr><td colspan="6">No expenses in this month. Record a sample store cost to start.</td></tr>')+'</tbody></table></div><div class="workspace-card"><h3>Category breakdown</h3>'+[...new Set(active.map(x=>x.category))].map(c=>'<p>'+esc(c)+' <b>'+money(active.filter(x=>x.category===c).reduce((s,x)=>s+x.amount,0))+'</b></p>').join('')+'</div>';
      document.querySelector('#expenseMonth').onchange=e=>{expenseMonth=e.target.value;adminRender()};
      document.querySelector('#newExpense').onclick=expenseForm;
      document.querySelectorAll('[data-expense-toggle]').forEach(b=>b.onclick=()=>{const x=state.expenses.find(x=>x.id===b.dataset.expenseToggle);x.voided=!x.voided;persist();adminRender()});
      document.querySelector('#exportExpenses').onclick=()=>{
        const cell=v=>'"'+String(v).replace(/^[=+@\-]/,"'$&").replaceAll('"','""')+'"';
        download('starwalt-expenses-'+(expenseMonth||'all')+'.csv',['Date,Category,Description,Amount INR,Status',...rows.map(x=>[x.date,x.category,x.description,x.amount,x.voided?'Voided':'Recorded'].map(cell).join(','))].join('\r\n'),'text/csv');
      };
    }else beforeExpenses();
    const b=document.createElement('button');b.textContent='Expenses';b.dataset.tab='Expenses';b.classList.toggle('active',activeTab==='Expenses');document.querySelector('#adminTabs').append(b);
  };
  function expenseForm(){
    modal('<p class="eyebrow">KEEP A CLEAR RECORD</p><h2>Record a store expense</h2><p class="notice">Use sample details. Saved only on this device; no payment occurs.</p><form id="expenseForm"><label>Date<input name="date" type="date" required value="'+new Date().toISOString().slice(0,10)+'"></label><label>Category<select name="category">'+['Rent','Utilities','Staff','Marketing','Packaging','Transport','Maintenance','Other'].map(c=>'<option>'+c+'</option>').join('')+'</select></label><label>Description<input name="description" required maxlength="160" placeholder="Sample monthly rent"></label><label>Amount (₹)<input name="amount" type="number" min="0.01" max="10000000" step="0.01" required></label><button class="btn dark">Save demo expense</button></form>');
    document.querySelector('#expenseForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.expenses.unshift({id:crypto.randomUUID(),date:f.get('date'),category:f.get('category'),description:f.get('description').trim(),amount:Number(f.get('amount')),voided:false});expenseMonth=f.get('date').slice(0,7);persist();close();adminRender();toast('Demo expense recorded')};
  }
})();
