import axios from 'axios'

const getBaseURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000/api'
  }
  // PASTIKAN ADA STRUKTUR '/api' DI AKHIR URL RAILWAY KAMU
  return 'https://cosmetics-api-production-05ca.up.railway.app/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: false, // Matikan kredensial agar cocok dengan wildcard CORS bintang (*)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

export default api