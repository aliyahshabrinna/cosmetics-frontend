import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ admin_code: '', password: '' })
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
      const payload = {
        username: 'admin_utama',
        password: form.password,
        kode_unik: form.admin_code,
      }
      const response = await api.post('/login', payload)
      const token = response.data.token || response.data.access_token || ''
      const role = response.data.user?.role || response.data.role || ''
      localStorage.setItem('token', token)
      localStorage.setItem('user_role', role)
      if (role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/login')
      }
    } catch (err) {
      setError('Login admin gagal. Periksa kode dan password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-soft-pink auth-page">
      <div className="auth-card shadow-sm rounded-4">
        <div className="text-center mb-4">
          <div className="auth-logo mb-4">A</div>
          <h1 className="auth-heading mb-1">Admin Access</h1>
          <p className="auth-subtitle">Secure portal for Aurélie internal staff.</p>
        </div>

        {error && <div className="alert alert-danger rounded-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3 auth-field">
            <label className="form-label text-uppercase fw-semibold">Admin Code</label>
            <input
              type="text"
              name="admin_code"
              className="form-control form-control-lg rounded-4"
              value={form.admin_code}
              onChange={handleChange}
              placeholder="Enter your unique ID"
              required
            />
          </div>
          <div className="mb-3 auth-field">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label text-uppercase fw-semibold">Password</label>
              <Link to="/forgot-password" className="text-soft-muted text-decoration-none small">
                Forgot?
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
            {loading ? 'Memproses...' : 'Login as Admin'}
          </button>
        </form>

        <div className="text-center text-soft-muted">Not an admin?</div>
        <div className="text-center mt-2">
          <Link to="/login" className="text-pink text-decoration-none fw-semibold">
            ← Return to Customer Login
          </Link>
        </div>
      </div>
    </div>
  )
}
