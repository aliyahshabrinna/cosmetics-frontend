import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function NotificationsAdmin() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchAdminNotifications = async () => {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      try {
        setLoading(true)
        let response
        try {
          // Mencoba rute API admin standard
          response = await api.get('/api/admin/notifications', { headers })
        } catch {
          // Fallback jika rutenya digabung atau tanpa prefix /admin
          response = await api.get('/api/notifications', { headers })
        }

        const payload = response.data?.data ?? response.data ?? []
        const list = Array.isArray(payload) ? payload : []

        // Menormalisasi data database agar properti aman dibaca oleh React mapping
        const normalized = list.map((notif, index) => ({
          id: notif.id ?? notif.id_notifikasi ?? index,
          type: notif.type ?? notif.kategori ?? 'System',
          title: notif.title ?? notif.judul ?? 'System Alert',
          desc: notif.desc ?? notif.description ?? notif.pesan ?? notif.isi ?? '',
          time: notif.time ?? notif.created_at ?? ''
        }))

        if (mounted) setNotifications(normalized)
      } catch (err) {
        console.error('Gagal memuat notifikasi admin:', err)
        if (mounted) setNotifications([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchAdminNotifications()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card rounded-4 shadow-soft p-4 border-0 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h2 className="mb-1 text-plum fw-bold">Admin Notifications</h2>
                <p className="text-soft-muted mb-0">Latest system alerts and customer updates.</p>
              </div>
              <Link to="/admin/dashboard" className="btn btn-outline-plum rounded-pill px-4">Dashboard</Link>
            </div>

            {loading ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border text-plum mb-2" role="status"></div>
                <div>Sinkronisasi log sistem database...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="alert alert-light text-center border rounded-4 py-4 text-muted">
                ✨ Semua aman! Belum ada notifikasi atau aktivitas sistem baru saat ini.
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {notifications.map((notif, index) => (
                  <li 
                    key={notif.id} 
                    className={`list-group-item py-4 ${index !== notifications.length - 1 ? 'border-bottom' : ''}`}
                  >
                    <div className="d-flex align-items-start gap-3">
                      <div className="badge rounded-pill bg-soft-pink text-plum py-2 px-3 text-uppercase">
                        {notif.type}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <h6 className="mb-0 fw-semibold text-dark">{notif.title}</h6>
                          {notif.time && <small className="text-muted small">{notif.time}</small>}
                        </div>
                        <p className="text-soft-muted mb-0 small">{notif.desc}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}