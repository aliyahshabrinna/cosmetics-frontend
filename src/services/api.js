import axios from 'axios'

// ANTIGRAVITY: Deteksi otomatis lokasi jalan (Local Laragon vs Online Vercel)
const getBaseURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000/api' // Digunakan saat kamu coding di laptop sendiri
  }
  return 'https://cosmetics-api-production-05ca.up.railway.app/api' // Otomatis dipakai saat online di Vercel
}

const api = axios.create({
  baseURL: getBaseURL(), // Memanggil fungsi dinamis di atas
  withCredentials: true,  // Wajib aktif agar sinkron dengan supports_credentials => true di Laravel
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // Memberitahu Laravel untuk merespons dengan format JSON murni
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