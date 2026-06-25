import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', nama: '', email: '', hp: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

 const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.confirmPassword) {
      setError('Password dan konfirmasi password harus sama.')
      return
    }

    setLoading(true)

    try {
      await api.post('/register', {
        username: form.username,
        password: form.password,
        nama: form.nama,
        email: form.email,
        hp: form.hp,
        role: 'pelanggan',
      })
      setSuccess('Pendaftaran berhasil! Mengalihkan ke halaman masuk...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      // ANTIGRAVITY: Membaca detail pesan error asli dari validasi Laravel (Error 422)
      if (err.response && err.response.data) {
        const backendMessage = err.response.data.message || err.response.data.error
        
        // Jika Laravel mengirimkan detail array validasi, kita gabungkan teksnya
        if (err.response.data.errors) {
          const validationErrors = Object.values(err.response.data.errors).flat().join(' ')
          setError(validationErrors)
        } else if (backendMessage) {
          setError(backendMessage)
        } else {
          setError('Pendaftaran ditolak oleh server. Periksa kembali data Anda.')
        }
      } else {
        setError('Tidak dapat terhubung ke server. Pastikan koneksi internet aktif.')
      }
    } finally {
      setLoading(false)
    }
  }
    
  

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-soft-pink auth-page">
      <div className="auth-card shadow-sm rounded-4" style={{ maxWidth: '540px' }}>
        <div className="text-center mb-4">
          <div className="auth-logo mb-4">A</div>
          <h1 className="auth-heading mb-1">Create Account</h1>
          <p className="auth-subtitle">Join our exclusive beauty community.</p>
        </div>

        {error && <div className="alert alert-danger rounded-4">{error}</div>}
        {success && <div className="alert alert-success rounded-4">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label text-uppercase fw-semibold">Full Name</label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                className="form-control form-control-lg rounded-4"
                placeholder="Grace Kelly"
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label text-uppercase fw-semibold">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="form-control form-control-lg rounded-4"
                placeholder="grace@aurelie.com"
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label text-uppercase fw-semibold">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="form-control form-control-lg rounded-4"
                placeholder="grace_aurelie"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-uppercase fw-semibold">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="form-control form-control-lg rounded-4"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-uppercase fw-semibold">Confirm</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="form-control form-control-lg rounded-4"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label text-uppercase fw-semibold">Phone</label>
              <input
                type="tel"
                name="hp"
                value={form.hp}
                onChange={handleChange}
                className="form-control form-control-lg rounded-4"
                placeholder="0812xxxxxxx"
                required
              />
            </div>
          </div>

          <div className="form-check form-check-inline mt-4 mb-4">
            <input className="form-check-input" type="checkbox" id="terms" required />
            <label className="form-check-label text-soft-muted" htmlFor="terms">
              I agree to the <span className="text-pink">Terms of Service</span> and <span className="text-pink">Privacy Policy</span>
            </label>
          </div>

          <button className="btn btn-primary-plum w-100 py-3 rounded-4" type="submit" disabled={loading}>
            {loading ? 'Mendaftarkan...' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-4 text-soft-muted">Already have an account?</div>
        <div className="text-center mt-2">
          <Link to="/login" className="text-pink text-decoration-none fw-semibold">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
