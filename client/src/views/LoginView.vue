<!-- <template>
  <div class="login-wrapper">
    <div class="login-box">
      <h1>Bienvenido a tu Biblioteca</h1>
      <p class="subtitle">Inicia sesión para continuar</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <input type="email" v-model="form.email" placeholder="Correo electrónico" required />
        </div>

        <div class="form-group">
          <input type="password" v-model="form.password" placeholder="Contraseña" required />
        </div>

        <button type="submit" class="btn-login">Iniciar sesión</button>
      </form>

      <p class="register-text">
        ¿No tienes cuenta?
        <router-link to="/register">Regístrate aquí</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Creamos un objeto ref para todo el formulario
const form = ref({
  email: '',
  password: ''
})

const router = useRouter()

const handleLogin = async () => {
  try {
    // Solo stringify los datos planos
    const res = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(errorText)
    }

    const data = await res.json()
    console.log('Login exitoso:', data)


    localStorage.setItem('userId', data.user.id)
    localStorage.setItem('username', data.user.username)

    router.push('/')
  } catch (err) {
    alert('Credenciales inválidas o error del servidor: ' + err.message)
    console.error(err)
  }
}
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f4f8, #d9e2ec);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-box {
  width: 80%;
  max-width: 500px;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.login-box h1 {
  margin-bottom: 10px;
  color: #1e3a8a;
}

.login-box .subtitle {
  margin-bottom: 30px;
  color: #555;
  font-size: 14px;
}

.login-form .form-group {
  margin-bottom: 20px;
}

.login-form input {
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
  transition: all 0.3s ease;
}

.login-form input:focus {
  border-color: #1e3a8a;
  outline: none;
  box-shadow: 0 0 5px rgba(30, 58, 138, 0.5);
}

.btn-login {
  width: 100%;
  padding: 12px;
  background-color: #1e3a8a;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-login:hover {
  background-color: #162f6b;
}

.register-text {
  margin-top: 20px;
  font-size: 14px;
  color: #555;
}

.register-text a {
  color: #1e3a8a;
  text-decoration: none;
  font-weight: bold;
}

.register-text a:hover {
  text-decoration: underline;
}
</style> -->


<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-stone-700 to-stone-900">
    <div class="w-full max-w-md mx-auto">
      <div class="p-8 bg-white rounded-2xl shadow-xl">
        <h3 class="text-3xl font-bold text-center text-stone-800">
          BookTracker
        </h3>
        <p class="text-center text-gray-500 mb-6">Administra tu colección con elegancia</p>
        
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-700">Correo</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i class="fas fa-envelope text-gray-400"></i>
              </div>
              <input
                v-model="form.email"
                type="email"
                class="block w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-stone-500 focus:border-stone-500"
                placeholder="tu@correo.com"
                required
              />
            </div>
          </div>
          
          <div class="mb-6">
            <label class="block mb-2 text-sm font-medium text-gray-700">Contraseña</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i class="fas fa-lock text-gray-400"></i>
              </div>
              <input
                v-model="form.password"
                type="password"
                class="block w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-stone-500 focus:border-stone-500"
                placeholder="********"
                required
              />
            </div>
          </div>
          
          <div class="grid">
            <button
              type="submit"
              class="w-full p-3 text-white bg-stone-700 rounded-lg font-semibold hover:bg-stone-800 transition-colors duration-300"
            >
              Iniciar sesión
            </button>
          </div>
        </form>
        
        <div class="mt-4 text-center">
          <router-link to="/register" class="text-sm font-medium text-stone-600 hover:underline">
            Crear cuenta
          </router-link>
        </div>
      </div>
      <p class="mt-4 text-xs text-center text-gray-400">© BookTracker</p>
    </div>
  </div>
</template>

<script setup>
// --- LA LÓGICA NO HA CAMBIADO ---
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const form = ref({
  email: '',
  password: ''
})

const router = useRouter()

const handleLogin = async () => {
  try {
    const res = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(errorText)
    }

    const data = await res.json()
    console.log('Login exitoso:', data)

    localStorage.setItem('userId', data.user.id)
    localStorage.setItem('username', data.user.username)

    router.push('/')
  } catch (err) {
    alert('Credenciales inválidas o error del servidor: ' + err.message)
    console.error(err)
  }
}
</script>

<style scoped>

</style>