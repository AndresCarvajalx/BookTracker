import { ref, onMounted, computed } from 'vue';


export function useHomeViewLogic() {
  
  
  const navItemClass = 'flex items-center py-3 px-2 rounded-lg cursor-pointer transition-colors duration-200 mb-1 hover:bg-black/5';
  const activeNavItemClass = 'flex items-center py-3 px-2 rounded-lg cursor-pointer transition-colors duration-200 mb-1 bg-terracotta text-white font-medium';
  const bookCountClass = 'ml-auto text-xs bg-black/10 py-0.5 px-1.5 rounded';
  const activeBookCountClass = 'ml-auto text-xs bg-white/20 py-0.5 px-1.5 rounded';

  // --- Lógica de estado y datos ---
  const books = ref([]);
  const loading = ref(true);
  const username = ref(localStorage.getItem('username') || 'Usuario');
  const userId = Number(localStorage.getItem('userId'));
  const selectedBookId = ref(null);
  const showModal = ref(false);
  const showAddBookModal = ref(false);
  const filterStatus = ref('all');

  const filteredBooks = computed(() => {
    if (filterStatus.value === 'all') return books.value;
    return books.value.filter(book => book.status === filterStatus.value);
  });

  const currentCategoryTitle = computed(() => {
    const titles = { all: 'Toda tu Estantería', reading: 'Actualmente Leyendo', to_read: 'Libros por Leer', read: 'Libros Leídos' };
    return titles[filterStatus.value];
  });

  const stats = computed(() => ({
    read: books.value.filter(b => b.status === 'read').length,
    to_read: books.value.filter(b => b.status === 'to_read').length,
    reading: books.value.filter(b => b.status === 'reading').length,
  }));

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login'; 
  };

  const loadBooks = async () => {
    if (!userId) return;
    loading.value = true;
    try {
      const res = await fetch(`http://localhost:8000/users/${userId}/books/`);
      if (!res.ok) throw new Error('Error');
      books.value = await res.json();
    } catch (err) {
      console.error(err);
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(loadBooks);
  
  const openModal = (bookId) => {
    selectedBookId.value = bookId;
    showModal.value = true;
  };
  
  const onBookDeleted = (bookId) => {
    books.value = books.value.filter(b => b.id !== bookId);
  };
  
  const onBookAdded = () => loadBooks();
  const onBookUpdated = () => loadBooks();

  
  return {
    navItemClass, activeNavItemClass, bookCountClass, activeBookCountClass,
    books, loading, username, userId, selectedBookId, showModal, showAddBookModal,
    filterStatus, filteredBooks, currentCategoryTitle, stats,
    logout, openModal, onBookDeleted, onBookAdded, onBookUpdated
  };
}