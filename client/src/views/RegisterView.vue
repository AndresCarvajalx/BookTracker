<template>
  <div class="register-wrapper">
    <div class="register-box">
      <h1>Regístrate para acceder a tu biblioteca personal</h1>
      <p class="subtitle">Crea una cuenta para iniciar sesión y continuar</p>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <input
            type="text"
            v-model="form.username"
            placeholder="Nombre de usuario"
            required
          />
        </div>

        <div class="form-group">
          <input
            type="email"
            v-model="form.email"
            placeholder="Correo electrónico"
            required
          />
        </div>

        <div class="form-group">
          <input
            type="password"
            v-model="form.password"
            placeholder="Contraseña"
            required
          />
        </div>

        <button type="submit" class="btn-register">Registrarse</button>
      </form>

      <p class="login-text">
        ¿Ya tienes cuenta?
        <router-link to="/login">Inicia sesión aquí</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const form = ref({
  username: '',
  email: '',
  password: ''
})

const router = useRouter()

const handleRegister = async () => {
  try {
    const res = await fetch('http://localhost:8000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(errorText)
    }

    const data = await res.json()
    console.log('Registro exitoso:', data)

    router.push('/login')
  } catch (err) {
    alert('Error al registrar: ' + err.message)
    console.error(err)
  }
}
</script>

<style scoped>

.register-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f4f8, #d9e2ec);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.register-box {
  width: 80%;
  max-width: 500px;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.register-box h1 {
  margin-bottom: 10px;
  color: #1e3a8a;
}

.register-box .subtitle {
  margin-bottom: 30px;
  color: #555;
  font-size: 14px;
}

/* Formulario */
.register-form .form-group {
  margin-bottom: 20px;
}

.register-form input {
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
  transition: all 0.3s ease;
}

.register-form input:focus {
  border-color: #1e3a8a;
  outline: none;
  box-shadow: 0 0 5px rgba(30, 58, 138, 0.5);
}

/* Botón */
.btn-register {
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

.btn-register:hover {
  background-color: #162f6b;
}

/* Texto de registro */
.login-text {
  margin-top: 20px;
  font-size: 14px;
  color: #555;
}

.login-text a {
  color: #1e3a8a;
  text-decoration: none;
  font-weight: bold;
}

.login-text a:hover {
  text-decoration: underline;
}
</style>
