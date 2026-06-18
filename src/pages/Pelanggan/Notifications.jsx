import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      try {
        const response = await api.get('/notifications', { headers })

        const payload = response.data.data ?? response.data ?? []
        const list = Array.isArray(payload) ? payload : []

        // MAPPING: Mengubah data transaksi backend menjadi tampilan aktivitas pesanan
        const normalized = list.map((trans, index) => ({
          id: trans.id_transaksi ?? trans.id ?? index,
          type: 'ORDER',
          title: `Pesanan #${trans.id_transaksi ?? trans.id} Berhasil Dibuat`,
          desc: `Status pembayaran saat ini adalah: ${trans.status?.toUpperCase() ?? 'PENDING'}. Pesanan Anda sedang diproses oleh sistem.`,
          time: trans.tanggal_transaksi ?? trans.created_at ?? 'Baru saja'
        }))

        if (mounted) setNotifications(normalized)
      } catch (err) {
        console.error('Gagal mengambil data notifikasi:', err)
        if (mounted) setNotifications([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchNotifications()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card rounded-4 shadow-soft p-4 border-0 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h2 className="mb-1 text-plum fw-bold">Notifications</h2>
                <p className="text-soft-muted mb-0">Review your latest order activity, delivery tracking, and exclusive beauty alerts.</p>
              </div>
              <Link to="/home" className="btn btn-outline-plum rounded-pill px-4">Home</Link>
            </div>

            {loading ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border text-danger mb-2" role="status"></div>
                <div>Memuat notifikasi...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="alert alert-info text-center rounded-4 py-4">
                Tidak ada notifikasi terbaru untuk akunmu saat ini.
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {notifications.map((notif, index) => (
                  <li 
                    key={notif.id} 
                    className={`list-group-item py-4 ${index !== notifications.length - 1 ? 'border-bottom' : ''}`}
                  >
                    <div className="d-flex align-items-start gap-3">
                      <div className="badge rounded-pill bg-danger text-white py-2 px-3 text-uppercase">
                        {notif.type}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <h6 className="mb-0 fw-semibold text-dark">{notif.title}</h6>
                          <small className="text-muted small">{notif.time}</small>
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