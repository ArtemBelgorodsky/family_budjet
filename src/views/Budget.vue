<template>
  <div class="budget">
    <header>
      <h1>Семейный бюджет</h1>
      <div class="user-info">
        <span>Пользователь: {{ this.name }}</span>
        <button @click="logout" class="logout-button">Выйти</button>
      </div>
    </header>

    <div class="content">
      <!-- Форма для добавления доходов -->
      <div class="add-form">
        <h2>Добавить доход</h2>
        <form @submit.prevent="addIncome">
          <input
            v-model="newIncome.name"
            type="text"
            placeholder="Название"
            required
          />
          <input
            v-model="newIncome.price"
            type="number"
            placeholder="Сумма"
            required
          />
          <select v-model="newIncome.category" required>
            <option value="" disabled>Выберите категорию</option>
            <option
              v-for="category in incomeCategories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
          <input
            v-model="newIncome.date"
            type="date"
            placeholder="Дата"
            required
          />
          <button type="submit">Добавить доход</button>
        </form>
      </div>

      <!-- Форма для добавления расходов -->
      <div class="add-form">
        <h2>Добавить расход</h2>
        <form @submit.prevent="addExpense">
          <input
            v-model="newExpense.name"
            type="text"
            placeholder="Название"
            required
          />
          <input
            v-model="newExpense.price"
            type="number"
            placeholder="Сумма"
            required
          />
          <select v-model="newExpense.category" required>
            <option value="" disabled>Выберите категорию</option>
            <option
              v-for="category in expenseCategories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
          <input
            v-model="newExpense.date"
            type="date"
            placeholder="Дата"
            required
          />
          <button type="submit">Добавить расход</button>
        </form>
      </div>

      <div class="filters">
        <div class="filter-group">
          <label>Фильтр доходов:</label>
          <select v-model="selectedIncomeCategory" @change="handleFilter">
            <option value="Все">Все</option>
            <option
              v-for="category in incomeCategories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Фильтр расходов:</label>
          <select v-model="selectedExpenseCategory" @change="handleFilter">
            <option value="Все">Все</option>
            <option
              v-for="category in expenseCategories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>
      </div>

      <div class="split-view">
        <div class="income">
          <h2>Доходы</h2>
          <ul v-if="!loading">
            <li v-for="item in filteredIncomeItems" :key="item.id">
              <span class="mr-10">{{ item.category }}:</span>
              <span
                >{{ Intl.NumberFormat('ru-RU').format(item.price) }} руб.</span
              >
              <button @click="deleteIncome(item.id)" class="delete-button date">
                Удалить
              </button>
              <span class="date">{{ formatDate(item.date) }}</span>
            </li>
            <li>
              <strong
                >Итого:
                {{ Intl.NumberFormat('ru-RU').format(filteredIncomeSumm) }}
                руб.</strong
              >
            </li>
          </ul>
          <ul v-else>
            <li>Загрузка...</li>
          </ul>
        </div>
        <div class="expense">
          <h2>Расходы</h2>
          <ul v-if="!loading">
            <li v-for="item in filteredExpensesItems" :key="item.id">
              <span class="mr-10">{{ item.category }}:</span>
              <span
                >{{ Intl.NumberFormat('ru-RU').format(item.price) }} руб.</span
              >
              <button
                @click="deleteExpense(item.id)"
                class="delete-button date"
              >
                Удалить
              </button>
              <span class="date">{{ formatDate(item.date) }}</span>
            </li>
            <li>
              <strong
                >Итого:
                {{ Intl.NumberFormat('ru-RU').format(filteredExpensesSumm) }}
                руб.</strong
              >
            </li>
          </ul>
          <ul v-else>
            <li>Загрузка...</li>
          </ul>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-wrapper">
          <canvas ref="incomeChart"></canvas>
        </div>
        <div class="chart-wrapper">
          <canvas ref="expensesChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
Chart.register(...registerables);

export default {
  data() {
    return {
      userName: 'Иван Иванов',
      incomeItems: [],
      expensesItems: [],
      incomeCategories: ['Долг', 'Зарплата', 'Банк', 'Остальное'],
      expenseCategories: ['Вещи', 'Продукты', 'Одежда', 'Авто'],
      selectedIncomeCategory: 'Все',
      selectedExpenseCategory: 'Все',
      chart: null,
      token: localStorage.getItem('authToken'),
      userId: +localStorage.getItem('userId'), // userId из localStorage
      name: localStorage.getItem('name'),
      loading: true,
      newIncome: {
        name: '',
        price: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        userId: +localStorage.getItem('userId'), // userId для новой записи
      },
      newExpense: {
        name: '',
        price: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        userId: +localStorage.getItem('userId'), // userId для новой записи
      },
    };
  },
  computed: {
    // Фильтрация доходов по userId и категории
    filteredIncomeItems() {
      let items = this.incomeItems.filter(
        (item) => item.userId === this.userId
      );
      if (this.selectedIncomeCategory !== 'Все') {
        items = items.filter(
          (item) => item.category === this.selectedIncomeCategory
        );
      }
      return items;
    },
    // Фильтрация расходов по userId и категории
    filteredExpensesItems() {
      let items = this.expensesItems.filter(
        (item) => item.userId === this.userId
      );
      if (this.selectedExpenseCategory !== 'Все') {
        items = items.filter(
          (item) => item.category === this.selectedExpenseCategory
        );
      }
      return items;
    },
    // Сумма отфильтрованных доходов
    filteredIncomeSumm() {
      return this.filteredIncomeItems.reduce(
        (sum, item) => sum + Number(item.price),
        0
      );
    },
    // Сумма отфильтрованных расходов
    filteredExpensesSumm() {
      return this.filteredExpensesItems.reduce(
        (sum, item) => sum + Number(item.price),
        0
      );
    },
  },
  methods: {
    handleFilter() {
      this.renderCharts();
    },
    // Загрузка доходов
    async fetchDataIncome() {
      try {
        const response = await fetch(
          'https://34e1653559fac7c6.mokky.dev/income',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных о доходах');
        }

        const data = await response.json();
        this.incomeItems = Array.isArray(data) ? data : [];
      } catch (err) {
        console.error(err.message);
      } finally {
        this.loading = false;
      }
    },
    // Загрузка расходов
    async fetchDataExpenses() {
      try {
        const response = await fetch(
          'https://34e1653559fac7c6.mokky.dev/expenses',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных о расходах');
        }

        const data = await response.json();
        this.expensesItems = Array.isArray(data) ? data : [];
      } catch (err) {
        console.error(err.message);
      } finally {
        this.loading = false;
      }
    },
    // Выход из системы
    logout() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId'); // Удаляем userId при выходе
      localStorage.removeItem('name');
      this.$router.push('/auth');
    },
    // Преобразование строки даты в объект Date
    parseDate(dateString) {
      const cleanedDateString = dateString.replace('GM', '').trim();
      return new Date(cleanedDateString);
    },
    // Форматирование даты
    formatDate(dateString) {
      const date = this.parseDate(dateString);
      if (isNaN(date)) {
        console.error('Invalid date:', dateString);
        return 'Неверная дата';
      }
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
    // Отрисовка графиков
    renderCharts() {
      if (this.incomeChart) {
        this.incomeChart.destroy();
      }
      if (this.expensesChart) {
        this.expensesChart.destroy();
      }

      // График для доходов
      const incomeCtx = this.$refs.incomeChart.getContext('2d');
      this.incomeChart = new Chart(incomeCtx, {
        type: 'bar',
        data: {
          labels: this.filteredIncomeItems.map((item) =>
            this.parseDate(item.date)
          ),
          datasets: [
            {
              label: 'Доходы',
              data: this.filteredIncomeItems.map((item) => item.price),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day',
                tooltipFormat: 'dd MMM yyyy',
              },
              title: {
                display: true,
                text: 'Дата',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Сумма (руб.)',
              },
            },
          },
        },
      });

      // График для расходов
      const expensesCtx = this.$refs.expensesChart.getContext('2d');
      this.expensesChart = new Chart(expensesCtx, {
        type: 'bar',
        data: {
          labels: this.filteredExpensesItems.map((item) =>
            this.parseDate(item.date)
          ),
          datasets: [
            {
              label: 'Расходы',
              data: this.filteredExpensesItems.map((item) => item.price),
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day',
                tooltipFormat: 'dd MMM yyyy',
              },
              title: {
                display: true,
                text: 'Дата',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Сумма (руб.)',
              },
            },
          },
        },
      });
    },
    // Добавление дохода
    async addIncome() {
      try {
        const response = await fetch(
          'https://34e1653559fac7c6.mokky.dev/income',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.token}`,
            },
            body: JSON.stringify(this.newIncome),
          }
        );

        if (!response.ok) {
          throw new Error('Ошибка при добавлении дохода');
        }

        const data = await response.json();
        this.incomeItems.push(data); // Добавляем новый доход в список
        this.newIncome = {
          name: '',
          price: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          userId: this.userId,
        }; // Сбрасываем форму
        this.renderCharts(); // Обновляем графики
      } catch (err) {
        console.error(err.message);
      }
    },
    // Добавление расхода
    async addExpense() {
      try {
        const response = await fetch(
          'https://34e1653559fac7c6.mokky.dev/expenses',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.token}`,
            },
            body: JSON.stringify(this.newExpense),
          }
        );

        if (!response.ok) {
          throw new Error('Ошибка при добавлении расхода');
        }

        const data = await response.json();
        this.expensesItems.push(data); // Добавляем новый расход в список
        this.newExpense = {
          name: '',
          price: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          userId: this.userId,
        }; // Сбрасываем форму
        this.renderCharts(); // Обновляем графики
      } catch (err) {
        console.error(err.message);
      }
    },
    // Удаление дохода
    async deleteIncome(id) {
      try {
        const response = await fetch(
          `https://34e1653559fac7c6.mokky.dev/income/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Ошибка при удалении дохода');
        }

        this.incomeItems = this.incomeItems.filter((item) => item.id !== id); // Удаляем доход из списка
        this.renderCharts(); // Обновляем графики
      } catch (err) {
        console.error(err.message);
      }
    },
    // Удаление расхода
    async deleteExpense(id) {
      try {
        const response = await fetch(
          `https://34e1653559fac7c6.mokky.dev/expenses/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Ошибка при удалении расхода');
        }

        this.expensesItems = this.expensesItems.filter(
          (item) => item.id !== id
        ); // Удаляем расход из списка
        this.renderCharts(); // Обновляем графики
      } catch (err) {
        console.error(err.message);
      }
    },
  },
  mounted() {
    this.fetchDataIncome();
    this.fetchDataExpenses().then(() => {
      this.renderCharts();
    });
  },
};
</script>

<style scoped>
.budget {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  overflow: hidden; /* Убираем выезжание */
  transition: none; /* Убираем переходы */
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
}

.logout-button {
  margin-left: 20px;
  padding: 10px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #cc0000;
}

.add-form {
  margin-bottom: 20px;
}

.add-form h2 {
  margin-bottom: 10px;
}

.add-form form {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.add-form input,
.add-form select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex: 1;
}

.add-form button {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-form button:hover {
  background-color: #45a049;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: bold;
}

.split-view {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.income,
.expense {
  width: 48%;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0; /* Убираем отступы */
}

li {
  padding: 8px;
  margin-top: 5px;
  background-color: #f0f0f0;
  border-radius: 4px;
  transition: none; /* Убираем переходы */
}

.chart-container {
  margin-top: 40px;
}

.chart-wrapper {
  height: 400px;
  margin-bottom: 40px;
}

.chart-wrapper canvas {
  width: 100% !important;
  height: 100% !important;
}

.date {
  position: relative;
  float: right;
}

.mr-10 {
  margin-right: 10px;
}
</style>
