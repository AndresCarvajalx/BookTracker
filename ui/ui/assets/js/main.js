// Main UI logic for BookTracker (frontend-only, uses localStorage)
const STORAGE_KEY = 'bt_books_v1';
const USER_KEY = 'bt_user_v1';

function uid(){ return Date.now() + Math.floor(Math.random()*999); }

function getBooks(){ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
function saveBooks(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
function getUser(){ const raw = localStorage.getItem(USER_KEY); return raw? JSON.parse(raw): {name:'Usuario', email:''}; }

function showToast(msg, success=true){
  const toastEl = document.getElementById('liveToast');
  const body = document.getElementById('toastBody');
  body.textContent = msg;
  toastEl.classList.remove('bg-success','bg-danger','bg-info');
  toastEl.classList.add(success? 'bg-success':'bg-danger');
  const t = new bootstrap.Toast(toastEl);
  t.show();
}

// Render books grid (dashboard)
function renderBooks(list){
  const grid = document.getElementById('booksGrid');
  if(!grid) return;
  grid.innerHTML = '';
  if(list.length === 0){
    grid.innerHTML = '<div class="col-12"><div class="alert alert-light text-center">No hay libros. Añade tu primer libro.</div></div>';
    return;
  }
  list.forEach(b=>{
    const col = document.createElement('div'); col.className='col-sm-6 col-md-4';
    const card = document.createElement('div'); card.className='card book-card h-100';
    card.innerHTML = `
      <div class="card-body d-flex flex-column">
        <div class="d-flex gap-3 mb-3">
          <div style="width:86px">
            <img src="${b.cover||'assets/img/placeholder.png'}" style="width:86px; height:120px; object-fit:cover; border-radius:6px;">
          </div>
          <div>
            <h6 class="mb-1">${b.title}</h6>
            <p class="mb-1 text-brown-muted small">${b.author||''}</p>
            <div class="kicker small">${b.genre||'—'} • ${b.date||''}</div>
          </div>
        </div>
        <div class="mt-auto d-flex justify-content-between align-items-center">
          <div>
            <button class="btn btn-sm btn-outline-brown me-1" onclick="openEdit(${b.id})" title="Editar"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-outline-danger me-1" onclick="removeBook(${b.id})" title="Eliminar"><i class="fas fa-trash"></i></button>
            <button class="btn btn-sm btn-outline-brown me-1" onclick="toggleFavorite(${b.id})" title="Favorito">${b.favorite?'<i class="fas fa-heart"></i>':'<i class="far fa-heart"></i>'}</button>
          </div>
          <div style="width:55%">
            <div class="progress" style="height:8px; border-radius:8px; overflow:hidden;">
              <div class="progress-bar" role="progressbar" style="width:${b.progress||0}%"></div>
            </div>
            <small class="text-brown-muted">Progreso: ${b.progress||0}%</small>
          </div>
        </div>
      </div>
    `;
    col.appendChild(card); grid.appendChild(col);
  });
}

// Add or update book
function saveBookFromForm(){
  const id = Number(document.getElementById('bookId').value || 0);
  const title = document.getElementById('bookTitle').value.trim();
  if(!title) return showToast('El título es obligatorio', false);
  const author = document.getElementById('bookAuthor').value.trim();
  const date = document.getElementById('bookDate').value;
  const genre = document.getElementById('bookGenre').value.trim();
  const progress = Number(document.getElementById('bookProgress').value||0);
  const synopsis = document.getElementById('bookSynopsis').value.trim();
  const cover = document.getElementById('bookCover').value.trim();

  const books = getBooks();
  if(id){
    const idx = books.findIndex(x=>x.id===id);
    if(idx>=0){
      books[idx] = {...books[idx], title, author, date, genre, progress, synopsis, cover};
      saveBooks(books);
      showToast('Libro actualizado');
    }
  }else{
    const book = {id: uid(), title, author, date, genre, progress, synopsis, cover, favorite:false};
    books.unshift(book);
    saveBooks(books);
    showToast('Libro agregado');
  }
  renderBooks( applyFilters() );
  const modal = bootstrap.Modal.getInstance(document.getElementById('addBookModal'));
  if(modal) modal.hide();
  document.getElementById('bookForm').reset();
}

// Remove
function removeBook(id){
  if(!confirm('Eliminar libro?')) return;
  const books = getBooks().filter(b=>b.id!==id);
  saveBooks(books);
  renderBooks( applyFilters() );
  showToast('Libro eliminado');
}

// Edit
function openEdit(id){
  const b = getBooks().find(x=>x.id===id);
  if(!b) return;
  document.getElementById('bookId').value = b.id;
  document.getElementById('bookTitle').value = b.title;
  document.getElementById('bookAuthor').value = b.author;
  document.getElementById('bookDate').value = b.date;
  document.getElementById('bookGenre').value = b.genre;
  document.getElementById('bookProgress').value = b.progress||0;
  document.getElementById('bookSynopsis').value = b.synopsis||'';
  document.getElementById('bookCover').value = b.cover||'';
  const modal = new bootstrap.Modal(document.getElementById('addBookModal'));
  modal.show();
}

// Favorite
function toggleFavorite(id){
  const books = getBooks();
  const idx = books.findIndex(b=>b.id===id);
  if(idx<0) return;
  books[idx].favorite = !books[idx].favorite;
  saveBooks(books);
  renderBooks( applyFilters() );
}

// Search + filters
function applyFilters(){
  const q = (document.getElementById('searchInput')?.value||'').toLowerCase();
  const status = document.getElementById('filterStatus')?.value || 'all';
  const favOnly = window._favOnly === true;
  let list = getBooks();
  if(favOnly) list = list.filter(b=>b.favorite);
  if(status !== 'all'){
    if(status==='to-read') list = list.filter(b=> (b.progress||0)===0 );
    if(status==='reading') list = list.filter(b=> (b.progress||0)>0 && (b.progress||0)<100 );
    if(status==='finished') list = list.filter(b=> (b.progress||0)===100 );
  }
  if(q){
    list = list.filter(b => (b.title||'').toLowerCase().includes(q) || (b.author||'').toLowerCase().includes(q) || (b.genre||'').toLowerCase().includes(q) );
  }
  return list;
}

// Export CSV
function exportCsv(){
  const books = getBooks();
  if(books.length===0) return showToast('No hay libros para exportar', false);
  const rows = books.map(b=> ({id:b.id, title:b.title, author:b.author, genre:b.genre, date:b.date, progress:b.progress}) );
  exportToCsv('booktracker_books.csv', rows);
  showToast('Exportado CSV');
}

// Load detail page (book-detail.html)
function storeDetail(id){
  const book = getBooks().find(b=>b.id===id);
  if(book) localStorage.setItem('bt_current_book', JSON.stringify(book));
  window.location.href = 'book-detail.html';
}

// Load detail content when on detail page
function loadDetailPage(){
  const raw = localStorage.getItem('bt_current_book');
  if(!raw) return;
  const b = JSON.parse(raw);
  document.getElementById('detailTitle').textContent = b.title;
  document.getElementById('detailAuthor').textContent = (b.author||'') + ' — ' + (b.date||'');
  document.getElementById('detailSynopsis').textContent = b.synopsis||'';
  document.getElementById('detailGenre').textContent = b.genre||'';
  document.getElementById('detailDate').textContent = b.date||'';
  document.getElementById('detailCover').src = b.cover|| 'assets/img/placeholder.png';
  document.getElementById('detailProgress').style.width = (b.progress||0)+'%';
}

// Initialize sample data if empty
function seedIfEmpty(){
  if(getBooks().length===0){
    const sample = [
      {id:uid(), title:'Cien años de soledad', author:'G. G. Márquez', genre:'Realismo', date:'1967-05-30', progress:45, synopsis:'Saga familiar en Macondo...', cover:'', favorite:false},
      {id:uid(), title:'Sapiens', author:'Yuval Noah Harari', genre:'Divulgación', date:'2011-01-01', progress:70, synopsis:'Breve historia de la humanidad...', cover:'', favorite:true}
    ];
    saveBooks(sample);
  }
}

// Charts (stats page)
function renderCharts(){
  const books = getBooks();
  // monthly - example aggregation: random or based on dates; use simple counts per month name in sample
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const monthlyCounts = months.map(()=>0);
  books.forEach((b,i)=>{ monthlyCounts[i%12] += 1; });
  // genres
  const genreMap = {};
  books.forEach(b=> genreMap[b.genre || 'Sin género'] = (genreMap[b.genre || 'Sin género']||0)+1);
  const ctx1 = document.getElementById('chartMensual');
  if(ctx1){
    new Chart(ctx1, { type:'bar', data:{ labels:months.slice(0,10), datasets:[{ label:'Libros leídos', data: monthlyCounts.slice(0,10), backgroundColor:'rgba(182,106,80,0.85)' }] }, options:{ scales:{ y:{ beginAtZero:true }}, plugins:{ legend:{ display:false } } } });
  }
  const ctx2 = document.getElementById('chartGeneros');
  if(ctx2){
    new Chart(ctx2, { type:'doughnut', data:{ labels:Object.keys(genreMap), datasets:[{ data:Object.values(genreMap), backgroundColor:['#b66a50','#8b5a3c','#a25f37','#6e4433','#3b2f2f'] }] }, options:{ plugins:{ legend:{ labels:{ color: getComputedStyle(document.body).getPropertyValue('--cream') || '#fff' } } } } });
  }
  // summary
  document.getElementById('statTotal').textContent = books.length;
  document.getElementById('statReading').textContent = books.filter(b=>b.progress>0 && b.progress<100).length;
  document.getElementById('statFinished').textContent = books.filter(b=>b.progress===100).length;
}

// Event bindings
document.addEventListener('DOMContentLoaded', ()=>{
  seedIfEmpty();
  // Dashboard page elements
  if(document.getElementById('booksGrid')){
    renderBooks(getBooks());
    document.getElementById('searchInput').addEventListener('input', ()=> renderBooks(applyFilters()) );
    document.getElementById('filterStatus').addEventListener('change', ()=> renderBooks(applyFilters()) );
    document.getElementById('favFilterBtn').addEventListener('click', ()=> { window._favOnly = !window._favOnly; renderBooks(applyFilters()); });
    document.getElementById('saveBookBtn').addEventListener('click', saveBookFromForm);
    document.getElementById('exportCsv').addEventListener('click', exportCsv);
    document.getElementById('fetchGoogle').addEventListener('click', async ()=>{
      const title = document.getElementById('bookTitle').value;
      const items = await GoogleBooks.searchByTitle(title);
      if(items && items.length>0){
        const info = items[0].volumeInfo;
        document.getElementById('bookAuthor').value = (info.authors||[]).join(', ');
        document.getElementById('bookSynopsis').value = info.description || document.getElementById('bookSynopsis').value;
        document.getElementById('bookCover').value = (info.imageLinks && (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail)) || '';
        showToast('Datos sugeridos desde Google Books');
      } else showToast('No se encontraron datos', false);
    });
  }
  // Detail page
  if(document.getElementById('detailTitle')) loadDetailPage();
  // Stats page
  if(document.getElementById('chartMensual')) renderCharts();

  // Forms animation and fake submit for auth pages
  document.querySelectorAll('form').forEach(form=>{
    form.addEventListener('submit', (e)=>{
      if(form.id==='loginForm'){
        e.preventDefault();
        const user = {name: document.getElementById('loginEmail').value.split('@')[0]||'Usuario', email: document.getElementById('loginEmail').value};
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        showToast('Inicio de sesión simulado');
        setTimeout(()=> window.location.href = 'dashboard.html', 800);
        return;
      }
      if(form.id==='registerForm'){
        e.preventDefault();
        const user = {name: document.getElementById('regName').value, email: document.getElementById('regEmail').value};
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        showToast('Cuenta creada (simulado)');
        setTimeout(()=> window.location.href = 'dashboard.html', 800);
        return;
      }
    });
  });

  // Profile info
  const u = getUser();
  if(document.getElementById('profileName')) document.getElementById('profileName').textContent = u.name || 'Usuario';
  if(document.getElementById('profileEmail')) document.getElementById('profileEmail').textContent = u.email || '';

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      document.body.classList.toggle('light-mode');
      const icon = themeToggle.querySelector('i');
      if(document.body.classList.contains('light-mode')) icon.classList.replace('fa-moon','fa-sun'); else icon.classList.replace('fa-sun','fa-moon');
      localStorage.setItem('bt_theme', document.body.classList.contains('light-mode') ? 'light':'dark');
    });
    const saved = localStorage.getItem('bt_theme');
    if(saved === 'light') { document.body.classList.add('light-mode'); themeToggle.querySelector('i').classList.replace('fa-moon','fa-sun'); }
  }

  // Register click for profile button
  const profileBtn = document.getElementById('profileBtn');
  if(profileBtn) profileBtn.addEventListener('click', ()=> window.location.href = 'profile.html');

  // PWA register
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=> console.warn('SW registration failed'));
  }
});

// Simple placeholder image
const placeholder = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='260'><rect width='100%' height='100%' fill='%23efe6e0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%233b2f2f' font-size='18'>Portada</text></svg>`;
