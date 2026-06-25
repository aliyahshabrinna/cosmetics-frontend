import axios from 'axios'

const getBaseURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000/api'
  }
  // WAJIB tambahkan /api di akhir URL Railway agar masuk ke routes/api.php
  return 'https://cosmetics-api-production-05ca.up.railway.app/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Interceptor otomatis menyisipkan token jika user sudah login
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

export default api