import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setMessage('Permintaan reset password telah dikirim. Periksa email Anda.')
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-soft-pink auth-page">
      <div className="auth-card shadow-sm rounded-4">
        <div className="text-center mb-4">
          <div className="auth-logo mb-4">A</div>
          <h1 className="auth-heading mb-1">Forgot Password</h1>
          <p className="auth-subtitle">Enter your email and we will send instructions to reset your password.</p>
        </div>

        {message && <div className="alert alert-success rounded-4">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 auth-field">
            <label className="form-label text-uppercase fw-semibold">Email Address</label>
            <input
              type="email"
              className="form-control form-control-lg rounded-4"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <button className="btn btn-primary-plum w-100 py-3 rounded-4" type="submit">
            Send Reset Link
          </button>
        </form>

        <div className="text-center mt-4 text-soft-muted">Remembered your password?</div>
        <div className="text-center mt-2">
          <Link to="/login" className="text-pink text-decoration-none fw-semibold">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
