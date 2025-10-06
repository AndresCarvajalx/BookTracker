// Simple API helpers (uses Google Books to fetch metadata)
const GoogleBooks = {
  async searchByTitle(title){
    if(!title) return null;
    try{
      const q = encodeURIComponent(title);
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=5`);
      const json = await res.json();
      return json.items || [];
    }catch(e){
      console.error('Google Books error', e);
      return [];
    }
  }
};

// CSV export
function exportToCsv(filename, rows){
  const processRow = (row) => {
    return Object.values(row).map(val => {
      if(val === null || val === undefined) return '';
      return '"'+String(val).replace(/"/g,'""')+'"';
    }).join(',');
  };
  const csv = rows.map(r => processRow(r)).join('\n');
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
