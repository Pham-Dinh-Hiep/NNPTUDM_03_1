const API_URL = 'https://api.escuelajs.co/api/v1/products'

let allProducts = []
let filtered = []
let currentPage = 1
let perPage = 5
let sortState = { field: null, dir: 1 }

// getAll: fetches all products from API and returns array
async function getAll(){
  try{
    const res = await fetch(API_URL)
    if(!res.ok) throw new Error('Fetch failed')
    const data = await res.json()
    allProducts = Array.isArray(data) ? data : []
    filtered = allProducts.slice()
    currentPage = 1
    // DEBUG: log first product images
    if(allProducts.length > 0){
      console.log('Product 0 images:', allProducts[0].images)
    }
    render()
    return allProducts
  }catch(err){
    console.error(err)
    document.getElementById('tableBody').innerHTML = '<tr><td colspan="4">Lỗi khi tải dữ liệu</td></tr>'
    return []
  }
}

function render(){
  const tbody = document.getElementById('tableBody')
  if(!filtered.length){
    tbody.innerHTML = '<tr><td colspan="4">Không có sản phẩm</td></tr>'
    updatePager()
    return
  }

  // apply sorting
  let list = filtered.slice()
  if(sortState.field){
    list.sort((a,b)=>{
      let A = a[sortState.field]
      let B = b[sortState.field]
      if(sortState.field === 'title'){
        A = (A||'').toString().toLowerCase()
        B = (B||'').toString().toLowerCase()
        if(A < B) return -1*sortState.dir
        if(A > B) return 1*sortState.dir
        return 0
      }
      // price
      return (Number(A) - Number(B)) * sortState.dir
    })
  }

  const start = (currentPage-1)*perPage
  const pageItems = list.slice(start, start+perPage)

  tbody.innerHTML = pageItems.map(p=>{
    const title = escapeHtml(p.title || '')
    const price = (p.price!=null)? (Number(p.price).toLocaleString() + ' đ') : ''
    const category = p.category && p.category.name ? escapeHtml(p.category.name) : ''
    const imgUrl = p.images && p.images[0] ? p.images[0] : ''
    const imgHtml = imgUrl
      ? `<div class="imgCell"><img src="${imgUrl}" alt="${title}" crossOrigin="anonymous" loading="lazy" onerror="this.parentNode.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:%23e8e8e8;color:%23999;font-size:12px;\\'>No Image</div>';"></div>`
      : `<div class="imgCell noimg">—</div>`

    return `<tr>
      <td>${imgHtml}</td>
      <td>${title}</td>
      <td>${price}</td>
      <td>${category}</td>
    </tr>`
  }).join('\n')

  updatePager(list.length)
}

function escapeHtml(str){
  return str.replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))
}

function onSearchChange(e){
  const q = (e.target.value || '').trim().toLowerCase()
  if(!q){ filtered = allProducts.slice() }
  else{
    filtered = allProducts.filter(p => (p.title||'').toLowerCase().includes(q))
  }
  currentPage = 1
  render()
}

function onPerPageChange(e){
  perPage = Number(e.target.value) || 5
  currentPage = 1
  render()
}

function updatePager(totalItems = filtered.length){
  const pageInfo = document.getElementById('pageInfo')
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
  if(currentPage > totalPages) currentPage = totalPages
  pageInfo.textContent = `Page ${currentPage} / ${totalPages}`
  document.getElementById('prevBtn').disabled = currentPage <= 1
  document.getElementById('nextBtn').disabled = currentPage >= totalPages
}

function prevPage(){ if(currentPage>1){ currentPage--; render() } }
function nextPage(){ const totalPages = Math.max(1, Math.ceil(filtered.length/perPage)); if(currentPage<totalPages){ currentPage++; render() } }

function sortByPrice(dir){
  sortState.field = 'price'
  sortState.dir = dir === 'asc' ? 1 : -1
  render()
}

function sortByName(mode){
  sortState.field = 'title'
  sortState.dir = mode === 'az' ? 1 : -1
  render()
}

// Auto-load on page open
window.addEventListener('DOMContentLoaded', ()=>{
  // set default perPage select value
  const sel = document.getElementById('perPageSelect')
  sel.value = String(perPage)
  getAll()
})
