<template>
  <div class="home-wrapper">
    <!-- Header -->
    <header class="home-header">
      <h1>Hola, {{ username }}!</h1>
      <p>Tus libros en la biblioteca</p>
    </header>

    <!-- Estadísticas -->
    <section class="stats-section">
      <div class="stat-card">📖 Leídos: {{ stats.read }}</div>
      <div class="stat-card">📚 Por leer: {{ stats.to_read }}</div>
      <div class="stat-card">🔖 Leyendo: {{ stats.reading }}</div>
    </section>

    <!-- Agregar libro -->
    <section class="add-book-section">
      <h2>Agregar un nuevo libro 📚</h2>
      <section class="add-book-button-section">
        <button class="btn-add-book" @click="showAddBookModal = true">➕ Agregar libro</button>
      </section>
      <AddBook
        v-if="showAddBookModal"
        :user-id="userId"
        @close="showAddBookModal = false"
        @book-added="onBookAdded"
      />
    </section>

    <!-- Grid de libros -->
    <main class="books-container">
      <div v-if="loading" class="loading">Cargando libros...</div>
      <div v-else-if="books.length === 0" class="no-books">No tienes libros agregados.</div>

      <div class="books-grid">
        <BookCard
          v-for="book in books"
          :key="book.id"
          :book="book"
          :user-id="userId"
          @deleted="onBookDeleted"
          @click="openModal(book.id)"
        />
      </div>
    </main>

    <!-- Modal de libro -->
    <BookModal
      v-if="showModal"
      :book-id="selectedBookId"
      :user-id="userId"
      :visible="showModal"
      @close="showModal = false"
      @updated="onBookUpdated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import BookCard from '../components/BookCard.vue'
import BookModal from '../components/BookModal.vue'
import AddBook from '../components/AddBook.vue'

const books = ref([])
const loading = ref(true)
const username = ref(localStorage.getItem('username') || '')
const userId = Number(localStorage.getItem('userId'))

const selectedBookId = ref(null)
const showModal = ref(false)
const showAddBookModal = ref(false)

// Cargar libros desde la API
const loadBooks = async () => {
  if (!userId) return
  loading.value = true
  try {
    const res = await fetch(`http://localhost:8000/users/${userId}/books/`)
    if (!res.ok) throw new Error('Error al obtener los libros')
    books.value = await res.json()
  } catch (err) {
    console.error(err)
    alert('No se pudieron cargar los libros.')
  } finally {
    loading.value = false
  }
}

onMounted(loadBooks)

// Abrir modal de libro
const openModal = (bookId) => {
  selectedBookId.value = bookId
  showModal.value = true
}

// Eliminar libro
const onBookDeleted = (bookId) => {
  books.value = books.value.filter(b => b.id !== bookId)
}

// Refrescar lista cuando se agrega un libro
const onBookAdded = () => {
  loadBooks()
}

// Actualizar libro desde el modal
const onBookUpdated = () => {
  loadBooks()
}

// Estadísticas por estado
const stats = computed(() => {
  return {
    read: books.value.filter(b => b.status === 'read').length,
    to_read: books.value.filter(b => b.status === 'to_read').length,
    reading: books.value.filter(b => b.status === 'reading').length
  }
})
</script>

<style scoped>
.home-wrapper {
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f0f4f8, #d9e2ec);
  min-height: 100vh;
}

.home-header {
  text-align: center;
  margin-bottom: 2rem;
}

.home-header h1 {
  color: #1e3a8a;
  margin-bottom: 0.5rem;
}

.home-header p {
  color: #555;
}

.stats-section {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.stat-card {
  background: #ffffff;
  padding: 1rem 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-weight: bold;
  font-size: 1rem;
  color: #1e3a8a;
}

.add-book-section {
  max-width: 500px;
  margin: 0 auto 2rem;
  text-align: center;
}

.books-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: 1fr;
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
}

.loading,
.no-books {
  font-size: 1.2rem;
  color: #555;
  margin-top: 2rem;
}

.btn-add-book {
  background: #1e3a8a;
  color: white;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-book:hover {
  background-color: #162f6b;
}
</style>
