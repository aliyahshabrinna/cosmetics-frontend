import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/login', {
        username: form.username,
        password: form.password,
        kode_unik: form.username,
      })
      const token = response.data.token || response.data.access_token || ''
      const role = response.data.user?.role || response.data.role || 'pelanggan'
      localStorage.setItem('token', token)
      localStorage.setItem('user_role', role)
      if (role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/home')
      }
    } catch (err) {
      setError('Login gagal. Periksa username/kode unik dan password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-soft-pink auth-page">
      <div className="auth-card shadow-sm rounded-4">
        <div className="text-center mb-4">
          <div className="auth-logo mb-4">A</div>
          <h1 className="auth-heading mb-1">Login</h1>
          <p className="auth-subtitle">Access your Aurélie account for premium beauty selections.</p>
        </div>

        {error && <div className="alert alert-danger rounded-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3 auth-field">
            <label className="form-label text-uppercase fw-semibold">Username</label>
            <input
              type="text"
              name="username"
              className="form-control form-control-lg rounded-4"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="mb-3 auth-field">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label text-uppercase fw-semibold">Password</label>
              <Link to="/forgot-password" className="text-soft-muted text-decoration-none small">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              className="form-control form-control-lg rounded-4"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button className="btn btn-primary-plum w-100 py-3 rounded-4 mb-4" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <div className="text-center mb-3 text-soft-muted">Don't have an account?</div>
        <div className="d-grid gap-3">
          <Link to="/register" className="btn btn-soft-pink rounded-4 py-3 text-dark fw-semibold">
            Register
          </Link>
          <Link to="/admin-login" className="btn btn-outline-plum rounded-4 py-3 fw-semibold">
            Login as Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
