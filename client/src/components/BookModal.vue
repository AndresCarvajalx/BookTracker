<template>
  <div v-if="visible" class="modal-backdrop" @click.self="close">
    <div class="modal">
      <h2>{{ book.title }}</h2>
      <p><strong>Autor:</strong> {{ book.author }}</p>
      <p><strong>Estado:</strong> {{ book.status }}</p>
      <p v-if="book.review"><strong>Review:</strong> {{ book.review }}</p>

      <!-- Imagen de portada desde uploads -->
      <div v-if="book.cover_image" class="cover-image">
        <img :src="`http://localhost:8000/${book.cover_image}`" alt="Cover Image" />
      </div>

      <!-- PDF Viewer -->
      <div v-if="pdfUrl" class="pdf-viewer">
        <iframe :src="pdfUrl" frameborder="0"></iframe>
      </div>

      <div class="modal-actions">
        <button @click="close">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  bookId: Number,
  visible: Boolean,
  userId: [String, Number]
})

const emits = defineEmits(['close'])

const book = ref({})
const pdfUrl = ref('')

// Convertir base64 a Blob
function base64ToBlob(base64, type='application/pdf') {
  const binary = atob(base64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type })
}

watch(() => props.bookId, async (id) => {
  if (!id) return

  pdfUrl.value && URL.revokeObjectURL(pdfUrl.value)
  pdfUrl.value = ''

  try {
    const res = await fetch(`http://localhost:8000/users/${props.userId}/books/pdf/${id}`)
    if (!res.ok) throw new Error('Error cargando el libro')
    const data = await res.json()

    book.value = data

    // PDF desde base64
    if (data.pdf_base64) {
      const blobPdf = base64ToBlob(data.pdf_base64)
      pdfUrl.value = URL.createObjectURL(blobPdf)
    }
  } catch (err) {
    console.error(err)
  }
}, { immediate: true })

const close = () => {
  emits('close')
  pdfUrl.value && URL.revokeObjectURL(pdfUrl.value)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}
.cover-image img {
  width: 500px;
  max-width: 100%;
  height: auto;
  margin-top: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.pdf-viewer iframe {
  width: 100%;
  height: 400px;
  margin-top: 1rem;
}
.modal-actions {
  margin-top: 1rem;
  text-align: right;
}
.modal-actions button {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #1e3a8a;
  color: #fff;
}
.modal-actions button:hover {
  background: #162f6b;
}
</style>
