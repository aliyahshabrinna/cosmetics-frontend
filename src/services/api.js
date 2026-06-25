import axios from 'axios'

const getBaseURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000/api'
  }
  return 'https://cosmetics-api-production-05ca.up.railway.app/api' // WAJIB ADA /api DI UJUNGNYA
}

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: false, // Samakan dengan config/cors.php backend yang supports_credentials => false
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