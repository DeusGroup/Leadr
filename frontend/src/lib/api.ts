import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error.message)
  }
)

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (userData: any) =>
    api.post('/auth/register', userData),

  getCurrentUser: () =>
    api.get('/auth/me'),

  updateProfile: (profileData: any) =>
    api.put('/auth/profile', profileData),

  changePassword: (passwordData: any) =>
    api.put('/auth/password', passwordData),
}

// Users API
export const usersApi = {
  getUsers: (params?: any) =>
    api.get('/users', { params }),

  getUserById: (id: number) =>
    api.get(`/users/${id}`),

  createUser: (userData: any) =>
    api.post('/users', userData),

  updateUser: (id: number, userData: any) =>
    api.put(`/users/${id}`, userData),

  deleteUser: (id: number) =>
    api.delete(`/users/${id}`),
}

// Leaderboards API
export const leaderboardsApi = {
  getLeaderboards: (params?: any) =>
    api.get('/leaderboards', { params }),

  getLeaderboardById: (id: number) =>
    api.get(`/leaderboards/${id}`),

  getLeaderboardRankings: (id: number, params?: any) =>
    api.get(`/leaderboards/${id}/rankings`, { params }),

  getUserRanking: (leaderboardId: number, userId: number) =>
    api.get(`/leaderboards/${leaderboardId}/user/${userId}`),

  createLeaderboard: (leaderboardData: any) =>
    api.post('/leaderboards', leaderboardData),

  updateLeaderboard: (id: number, leaderboardData: any) =>
    api.put(`/leaderboards/${id}`, leaderboardData),

  calculateRankings: (id: number) =>
    api.post(`/leaderboards/${id}/calculate`),
}

// Metrics API
export const metricsApi = {
  getMetrics: (params?: any) =>
    api.get('/metrics', { params }),

  getUserMetrics: (userId: number, params?: any) =>
    api.get(`/metrics/user/${userId}`, { params }),

  addMetric: (metricData: any) =>
    api.post('/metrics', metricData),

  updateMetric: (id: number, metricData: any) =>
    api.put(`/metrics/${id}`, metricData),

  addBulkMetrics: (metricsData: any[]) =>
    api.post('/metrics/bulk', { metrics: metricsData }),
}

// Sales API
export const salesApi = {
  getSalesPerformance: (params?: any) =>
    api.get('/sales/performance', { params }),

  getUserSalesPerformance: (userId: number, params?: any) =>
    api.get(`/sales/performance/${userId}`, { params }),

  getSalesGoals: (params?: any) =>
    api.get('/sales/goals', { params }),

  createSalesGoal: (goalData: any) =>
    api.post('/sales/goals', goalData),

  updateSalesGoal: (id: number, goalData: any) =>
    api.put(`/sales/goals/${id}`, goalData),

  getSalesAnalytics: (params?: any) =>
    api.get('/sales/analytics', { params }),
}

// Achievements API
export const achievementsApi = {
  getAchievements: (params?: any) =>
    api.get('/achievements', { params }),

  getAchievementById: (id: number) =>
    api.get(`/achievements/${id}`),

  getUserAchievements: (userId: number) =>
    api.get(`/achievements/user/${userId}`),

  createAchievement: (achievementData: any) =>
    api.post('/achievements', achievementData),

  updateAchievement: (id: number, achievementData: any) =>
    api.put(`/achievements/${id}`, achievementData),

  awardAchievement: (achievementId: number, userId: number) =>
    api.post(`/achievements/${achievementId}/award/${userId}`),
}
