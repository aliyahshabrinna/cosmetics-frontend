import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function Profile() {
  const [profile, setProfile] = useState({
    nama: '',
    email: '',
    no_hp: '',
    alamat: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsError(true)
        setMessage('Sesi login tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      try {
        const response = await api.get('/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        const data = response.data.data || response.data || {}
        
        setProfile({
          nama: data.nama || data.name || '',
          email: data.email || '',
          no_hp: data.no_hp || data.telepon || data.phone || '',
          alamat: data.alamat || data.address || '',
        })
      } catch (err) {
        console.error('Fetch profile error:', err.response || err)
        setIsError(true)
        setMessage('Gagal memuat data profil dari server.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setIsError(false)

    const token = localStorage.getItem('token')
    
    //Payload ditambahkan data email untuk dikirim ke ProfileController update
    const payload = {
      nama: profile.nama,
      email: profile.email,
      no_hp: profile.no_hp,
      alamat: profile.alamat,
    }

    try {
      const response = await api.put('/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = response.data.data ?? response.data ?? {}
      
      setProfile({
        nama: data.nama || profile.nama,
        email: data.email || profile.email,
        no_hp: data.no_hp || profile.no_hp,
        alamat: data.alamat || profile.alamat,
      })
      
      setIsError(false)
      setMessage('Profil berhasil diperbarui.')
    } catch (err) {
      console.error('Update profile error:', err.response || err)
      setIsError(true)
      setMessage(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card rounded-4 p-4 border-0 shadow-sm bg-white">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h2 className="mb-1 text-dark fw-bold">Profile</h2>
                <p className="text-muted mb-0">Manage your account details and settings in one elegant view.</p>
              </div>
              <Link to="/home" className="btn btn-outline-plum rounded-pill">Home</Link>
            </div>

            {message && (
              <div className={`alert ${isError ? 'alert-danger' : 'alert-success'} rounded-4`}>
                {message}
              </div>
            )}

            {loading ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border text-danger mb-2" role="status"></div>
                <div>Memuat profil...</div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="row g-4">
                <div className="col-12 col-md-4">
                  <div className="rounded-4 bg-light border p-4 text-center">
                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 96, height: 96, backgroundColor: '#fff0f3' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#d90429" strokeWidth="2" style={{ width: 40, height: 40 }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <h5 className="mb-1 fw-bold text-dark">{profile.nama || 'Aurélie User'}</h5>
                    <p className="text-muted small">{profile.email || 'customer@example.com'}</p>
                  </div>
                </div>
                <div className="col-12 col-md-8">
                  <div className="card rounded-4 border p-4 h-100 bg-white">
                    <h5 className="mb-3 fw-semibold text-secondary">Account details</h5>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small">Full name</label>
                        <input type="text" name="nama" className="form-control rounded-4" value={profile.nama} onChange={handleChange} required />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small">Email Address</label>
                        {/* PERBAIKAN: Input sekarang aktif dan bisa diubah sepuasnya */}
                        <input type="email" name="email" className="form-control rounded-4" value={profile.email} onChange={handleChange} required />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small">Phone (no_hp)</label>
                        <input type="text" name="no_hp" className="form-control rounded-4" value={profile.no_hp} onChange={handleChange} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small">Member since</label>
                        <div className="form-control bg-light text-muted">June 2026</div>
                      </div>
                      <div className="col-12">
                        <label className="form-label text-muted small">Address (alamat)</label>
                        <input type="text" name="alamat" className="form-control rounded-4" value={profile.alamat} onChange={handleChange} placeholder="Street address" />
                      </div>
                    </div>
                    <div className="mt-4 text-end">
                      <button type="submit" className="btn btn-pink rounded-4 px-4 py-3 fw-semibold text-white" style={{ backgroundColor: '#d90429', border: 'none' }} disabled={saving}>
                        {saving ? 'Menyimpan...' : 'Simpan Profil'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}