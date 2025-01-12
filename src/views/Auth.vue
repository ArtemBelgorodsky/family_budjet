<template>
  <div class="auth">
    <h2>{{ isLogin ? 'Вход' : 'Регистрация' }}</h2>
    <form @submit.prevent="handleSubmit">
      <div v-if="!isLogin">
        <label for="name">Имя:</label>
        <input type="text" id="name" v-model="name" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Пароль:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">
        {{ isLogin ? 'Войти' : 'Зарегистрироваться' }}
      </button>
    </form>
    <p>
      {{ isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?' }}
      <a href="#" @click="toggleMode">{{
        isLogin ? 'Зарегистрироваться' : 'Войти'
      }}</a>
    </p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
export default {
  mounted() {
    if (localStorage.getItem('authToken')) {
      this.$router.push('/budget');
    }
  },
  data() {
    return {
      isLogin: true,
      name: '',
      email: '',
      password: '',
      error: '',
    };
  },
  methods: {
    async handleSubmit() {
      try {
        if (this.isLogin) {
          const response = await fetch(
            'https://34e1653559fac7c6.mokky.dev/auth',
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: this.email,
                password: this.password,
              }),
            }
          );
          const token = await response.json();
          if (token.token) {
            localStorage.setItem('authToken', token.token);
            localStorage.setItem('userId', token.data.id);
            localStorage.setItem('name', token.data.fullName);
          } else {
            this.error = 'Такого пользователя не существует';
          }
        } else {
          const response = await fetch(
            'https://34e1653559fac7c6.mokky.dev/register',
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fullName: this.name,
                email: this.email,
                password: this.password,
              }),
            }
          );
          const token = await response.json();
          if (token.token) {
            localStorage.setItem('authToken', token.token);
            localStorage.setItem('userId', token.data.id);
            localStorage.setItem('name', token.data.fullName);
            console.log(token);
          } else {
            this.error = 'Такой email уже зарегистрирован';
          }
        }
        this.$router.push('/budget'); // Перенаправляем на страницу бюджета
      } catch (err) {
        this.error = err.response?.data?.message || 'Ошибка авторизации';
      }
    },
    toggleMode() {
      this.isLogin = !this.isLogin;
      this.error = '';
    },
  },
};
</script>

<style scoped>
.auth {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

form div {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #369f6e;
}

a {
  color: #42b983;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
