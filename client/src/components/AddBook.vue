<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h2>Agregar un nuevo libro 📚</h2>

      <form @submit.prevent="handleAddBook" class="add-book-form">

        <!-- Título -->
        <div class="form-group">
          <input
            type="text"
            v-model="form.title"
            placeholder="Título"
            required
          />
        </div>

        <!-- Autor -->
        <div class="form-group">
          <input
            type="text"
            v-model="form.author"
            placeholder="Autor"
            required
          />
        </div>

        <!-- Estado -->
        <div class="form-group">
          <select v-model="form.status" required>
            <option disabled value="">Selecciona estado</option>
            <option value="to_read">Por leer</option>
            <option value="reading">Leyendo</option>
            <option value="read">Leído</option>
          </select>
        </div>

        <!-- Reseña -->
        <div class="form-group">
          <textarea
            v-model="form.review"
            placeholder="Reseña (opcional)"
          ></textarea>
        </div>

        <!-- Portada -->
        <div class="form-group">
          <label>Portada del libro</label>
          <input type="file" accept="image/*" @change="onCoverChange" />
          <img v-if="previewCover" :src="previewCover" class="preview-image" />
        </div>

        <!-- PDF -->
        <div class="form-group">
          <label>Archivo PDF (opcional)</label>
          <input type="file" accept="application/pdf" @change="onPdfChange" />
        </div>

        <div class="modal-buttons">
          <button type="submit" class="btn-add">Agregar</button>
          <button type="button" class="btn-cancel" @click="$emit('close')">Cancelar</button>
        </div>

      </form>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'

const props = defineProps({ userId: Number })
const emit = defineEmits(['close', 'book-added'])

const form = ref({
  title: '',
  author: '',
  status: '',
  review: '',
  cover_image: '',
  pdf_path: ''
})

const previewCover = ref('')

// Convertir imagen a base64 puro
const onCoverChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    // quitar el prefijo data:image/…;base64,
    form.value.cover_image = reader.result.split(',')[1]
  }
  reader.readAsDataURL(file)

  // Preview local
  previewCover.value = URL.createObjectURL(file)
}
const onPdfChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    // reader.result = "data:application/pdf;base64,..."
    const base64String = reader.result.split(',')[1] // eliminar el prefijo
    form.value.pdf_path = base64String
  }
  reader.readAsDataURL(file)
}


const handleAddBook = async () => {
  if (!form.value.title || !form.value.author) {
    alert('El título y autor son obligatorios')
    return
  }

  try {
    const res = await fetch(`http://localhost:8000/users/${props.userId}/books/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(errText)
    }

    const data = await res.json()
    alert(`Libro "${data.title}" agregado correctamente!`)

    // Limpiar formulario
    form.value = { title: '', author: '', status: '', review: '', cover_image: '', pdf_path: '' }
    previewCover.value = ''

    // Notificar al HomeView que se agregó un libro
    emit('book-added')
    emit('close')
  } catch (err) {
    console.error(err)
    alert('Error al agregar libro: ' + err.message)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.add-book-form .form-group {
  margin-bottom: 1rem;
}

.add-book-form input,
.add-book-form select,
.add-book-form textarea {
  width: 100%;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.preview-image {
  margin-top: 0.5rem;
  width: 100px;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.btn-add {
  background: #1e3a8a;
  color: #fff;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
}

.btn-add:hover {
  background-color: #162f6b;
}

.btn-cancel {
  background: #ccc;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
}
</style>

