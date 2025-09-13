const API_URL = "http://inbloom.work.gd";
 
const state = {
    transactions: [],
    filterType: 'all',
    sortBy: 'date_desc',
    search: '',
    nextId: 1,
}

//Get transactions from backend
async function loadTransactions(){
    try {
        const res = await fetch(`${API_URL}/api/transactions`)
        const data = await res.json();
        state.transactions = Array.isArray(data) ? data.map((tx) => ({ ...tx, date: tx.created_at || tx.date })) : []
        render()
    } catch (err) {
        console.error("Faild to fetch transactions:", err)
        toast("Could not load data from server")
    }
   
}


//popup message
function toast(msg){
    const el = document.getElementById('toast')
    el.textContent = msg
    el.classList.add('show')
    clearTimeout(el._t)
    el._t = setTimeout(() => el.classList.remove('show'), 2200)
}

function formatMoney(n){
    const v = Number(n || 0)
    return v.toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 2
    })
}

function recalcHeader() {
  const income = state.transactions
    .filter(t => t.type === 'credit')
    .reduce((a, b) => a + Number(b.amount), 0);

  const expenses = state.transactions
    .filter(t => t.type === 'debit')
    .reduce((a, b) => a + Number(b.amount), 0);

  const total = income - expenses;

  document.getElementById('totalBalance').textContent = formatMoney(total);
  document.getElementById('incomeChip').textContent = `+${formatMoney(income)}`;
  document.getElementById('expenseChip').textContent = `-${formatMoney(expenses)}`;
}



async function addTx({type, category, description, amount, date}){
    const tx = {
        type, category, description,
        amount: Number(amount),
        created_at: date || new Date().toISOString().slice(0,10)
    }

    try {
        const res = await  fetch(`${API_URL}/api/transactions`, {
            method: "POST",
            headers: {"content-Type": "application/json"},
            body: JSON.stringify(tx),
        })
        const savedTx = await res.json()
        state.transactions.unshift({...savedTx,  date: savedTx.created_at || savedTx.date || new Date().toISOString().slice(0,10)})
        state.nextId++
        render()
        return savedTx 
    } catch (err){
        console.error("faild to add transaction:", err)
        toast("could not connect to backend")
    }
    
}

const tx = { 
    type, category, description,
    amount: Number(amount),
    date: date || new Date().toISOString().slice(0,10)
}


function deleteTx(id){
    const ix = state.transactions.findIndex(t => t.id === id)
    if (ix >= 0){
        state.transactions.splice(ix,1)
        toast('Transaction deleted')
        render()
    }
}

function render(){
    recalcHeader()

    let rows = [...state.transactions]

    if(state.filterType !== 'all')
    rows = rows.filter(r => r.type === state.filterType)
    const q = state.search.trim().toLowerCase()
    if(q) rows = rows.filter(r => 
        (r.description|| '').toLowerCase().includes(q) || (r.category|| '').toLowerCase().includes(q)
    )

    switch(state.sortBy){
        case 'date_asc': 
        rows.sort((a,b) => new Date(a.date) - new Date(b.date))
        break
        case 'amount_desc': rows.sort((a,b) => b.amount - a.amount)
        break
        case 'amount_asc': rows.sort((a,b) => a.amount - b.amount)
        break
        default:
            rows.sort((a,b) => new Date(b.date) - new Date(a.date))
    }

    const body = document.getElementById('txBody')
    body.innerHTML = ''

    if (rows.length === 0){
        document.getElementById('emptyState').hidden = false
    } else {
        document.getElementById('emptyState').hidden = true
    }

    for (const r of rows){
        const tr = document.createElement('tr')
        tr.innerHTML = `
        <td><span class="pill ${r.type}">${r.type}</span></td>
        <td>${r.category ? escapeHtml(r.category) : "-"}</td>
        <td>${escapeHtml(r.description || '')}</td>
        <td>${formatMoney(r.amount || '')}</td>
        <td>${r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
        <td><button class="btn small" data-del="${r.id}" title= "Delete">Delete</button></td>
        `
        body.appendChild(tr)
    }
}

function escapeHtml(str){
    return String(str).replace(/[&<>"]+/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

document.getElementById('txForm').addEventListener('submit', e => {
    e.preventDefault();
    const amount = Number(document.getElementById('amount').value)
    const type = document.getElementById('type').value
    const category = document.getElementById('category').value
    const date = document.getElementById('date').value || new Date().toISOString().slice(0,10)
    const description = document.getElementById('description').value.trim()

    if (!amount || amount <= 0){
        toast('Enter a valid amount')
        return
    }
    if (!['credit','debit'].includes(type)){
        toast('Choose a type')
        return
    }

    recalcHeader();
    addTx({ type, category, description, amount, date });
    (e.target).reset();
    toast('Transaction saved');
    render();
})

document.getElementById('txBody').addEventListener('click', e => {
    const btn = e.target.closest('button[data-del]')
    if(!btn) 
        return
    const id = Number(btn.getAttribute('data-del'))
    deleteTx(id)
})

document.getElementById('filterType').addEventListener('change', e => {
    state.filterType = e.target.value
    render()
})

document.getElementById('sortBy').addEventListener('change', e => {
    state.sortBy = e.target.value
    render()
})

document.getElementById('search').addEventListener('input', e => {
    state.search = e.target.value
    render()
})

document.getElementById('demo_history').addEventListener('click', async () => {
   await loadTransactions();
   toast('Transaction history updated')
   render()
}) 

document.getElementById('exportCsvBtn').addEventListener('click', () => {
    const rows = [['id','type','category','description','amount','date']]
        .concat(state.transactions.map(t => [t.id, t.type, t.category || '', t.description || '', t.amount, t.date]));
    const csv = rows.map(r => r.map(x => String(x).replaceAll('"','""')).map(x => /[,\n\"]/.test(x) ? `"${x}"` : x).join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
    URL.revokeObjectURL(url);
    toast('CSV exported');
});


function iso(offsetDays){
const d = new Date(); d.setDate(d.getDate()+offsetDays); return d.toISOString().slice(0,10);
}

loadTransactions()
render()




