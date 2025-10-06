<template>
  <div class="book-card" @click="handleClick">
    <div class="book-info">
      <h3>{{ book.title }}</h3>
      <p class="author">{{ book.author }}</p>
      <p class="status">Estado: <strong>{{ book.status }}</strong></p>
    </div>

    
    <div class="actions">
      <button class="btn-delete" @click.stop="deleteBook">🗑️ Eliminar</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  book: Object,
  userId: Number
})

const emits = defineEmits(['deleted'])

const deleteBook = async () => {
  if (!confirm(`¿Eliminar "${props.book.title}"?`)) return

  try {
    const res = await fetch(`http://localhost:8000/users/${props.userId}/books/${props.book.id}`, {
      method: 'DELETE'
    })

    if (!res.ok) throw new Error('Error eliminando el libro')
    alert('Libro eliminado correctamente')
    emits('deleted', props.book.id)
  } catch (err) {
    console.error(err)
    alert('No se pudo eliminar el libro.')
  }
}
</script>

<style scoped>
.book-card {
  background: linear-gradient(135deg, #fefefe, #e0e7ff);
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-info h3 {
  color: #1e3a8a;
  margin-bottom: 0.3rem;
}

.book-info .author {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 0.5rem;
}

.book-info .status {
  font-size: 0.8rem;
  color: #777;
  margin-bottom: 0.5rem;
}

.actions {
  text-align: right;
}

.btn-delete {
  background: #e11d48;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.3s;
}

.btn-delete:hover {
  background: #b91c1c;
}
</style>
