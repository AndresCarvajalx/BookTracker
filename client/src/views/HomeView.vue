<template>
  <div class="flex font-figtree bg-cream text-ink min-h-screen">
    <aside class="w-[260px] bg-sidebar p-6 flex flex-col border-r border-border-color flex-shrink-0">
      <div class="flex items-center gap-3 text-2xl font-bold pb-6">
        <i class="fas fa-book-open"></i>
        <h2>BookTracker</h2>
      </div>
      
      <div class="pb-6 mb-6 border-b border-border-color">
        <button @click="showAddBookModal = true" class="w-full flex items-center justify-center gap-2 bg-terracotta text-white p-3 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-terracotta-hover">
          <i class="fas fa-plus"></i>
          <span>Añadir Nuevo Libro</span>
        </button>
      </div>

      <nav class="flex-grow">
        <p class="text-xs font-medium text-muted-ink uppercase mb-4 px-2">Categorías</p>
        <ul>
          <li @click="filterStatus = 'all'" :class="filterStatus === 'all' ? activeNavItemClass : navItemClass">
            <i class="w-[30px] text-center fas fa-layer-group"></i>
            <span>Todos</span>
            <span :class="filterStatus === 'all' ? activeBookCountClass : bookCountClass">{{ books.length }}</span>
          </li>
          <li @click="filterStatus = 'reading'" :class="filterStatus === 'reading' ? activeNavItemClass : navItemClass">
            <i class="w-[30px] text-center fas fa-bookmark"></i>
            <span>Leyendo</span>
            <span :class="filterStatus === 'reading' ? activeBookCountClass : bookCountClass">{{ stats.reading }}</span>
          </li>
          <li @click="filterStatus = 'to_read'" :class="filterStatus === 'to_read' ? activeNavItemClass : navItemClass">
            <i class="w-[30px] text-center fas fa-book"></i>
            <span>Por Leer</span>
            <span :class="filterStatus === 'to_read' ? activeBookCountClass : bookCountClass">{{ stats.to_read }}</span>
          </li>
          <li @click="filterStatus = 'read'" :class="filterStatus === 'read' ? activeNavItemClass : navItemClass">
            <i class="w-[30px] text-center fas fa-check-circle"></i>
            <span>Leídos</span>
            <span :class="filterStatus === 'read' ? activeBookCountClass : bookCountClass">{{ stats.read }}</span>
          </li>
        </ul>
      </nav>

      <div class="flex justify-between items-center pt-4 border-t border-border-color text-sm text-muted-ink">
        <span>Hola, {{ username }}</span>
        <button @click="logout" title="Cerrar Sesión" class="bg-transparent border-none text-muted-ink text-xl cursor-pointer p-1 rounded hover:text-ink hover:bg-black/5">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </aside>

    <div class="flex-grow p-10 xl:p-16 overflow-y-auto">
      <header class="flex justify-between items-center mb-10">
        <h1 class="text-4xl font-bold">{{ currentCategoryTitle }}</h1>
      </header>

      <main>
        <div v-if="loading" class="text-lg text-muted-ink text-center py-16">Cargando tus libros...</div>
        <div v-else-if="filteredBooks.length === 0" class="text-lg text-muted-ink text-center py-16">No tienes libros en esta categoría.</div>
        
        <div v-else class="books-grid">
          <BookCard
            v-for="book in filteredBooks"
            :key="book.id"
            :book="book"
            :user-id="userId"
            @deleted="onBookDeleted"
            @click="openModal(book.id)"
          />
        </div>
      </main>
    </div>

    <AddBook v-if="showAddBookModal" :user-id="userId" @close="showAddBookModal = false" @book-added="onBookAdded" />
    <BookModal v-if="showModal" :book-id="selectedBookId" :user-id="userId" :visible="showModal" @close="showModal = false" @updated="onBookUpdated" />
  </div>
</template>

<script setup>

import BookCard from '../components/BookCard.vue';
import BookModal from '../components/BookModal.vue';
import AddBook from '../components/AddBook.vue';


import { useHomeViewLogic } from '../components/useHomeViewLogic.js';


const {
  navItemClass, activeNavItemClass, bookCountClass, activeBookCountClass,
  books, loading, username, userId, selectedBookId, showModal, showAddBookModal,
  filterStatus, filteredBooks, currentCategoryTitle, stats,
  logout, openModal, onBookDeleted, onBookAdded, onBookUpdated
} = useHomeViewLogic();
</script>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 2rem;
}
</style>