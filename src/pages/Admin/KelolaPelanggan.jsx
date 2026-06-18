import { useEffect, useState } from 'react'
import api from '../../services/api'
import SidebarAdmin from '../../components/SidebarAdmin'

export default function KelolaPelanggan() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const fetchCustomers = async () => {
      const token = localStorage.getItem('token')
      const config = { headers: { Authorization: `Bearer ${token}` } }

      try {
        setLoading(true)
        setError('')
        
        // Panggilan langsung ke endpoint tunggal yang bersih
        const res = await api.get('/pelanggan', config)

        // Laravel Pagination meletakkan array data di dalam objek `.data.data`
        const cleanList = res?.data?.data?.data || res?.data?.data || []

        if (mounted) {
          setCustomers(cleanList)
        }
      } catch (err) {
        console.error('Gagal memuat data pelanggan:', err)
        if (mounted) {
          setError('Gagal menyinkronkan data pelanggan dari database.')
          setCustomers([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchCustomers()
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-vh-100 bg-soft-pink">
      <div className="d-flex">
        <SidebarAdmin />
        <main className="flex-fill p-4">
          <div className="container-fluid">
            <div className="mb-4">
              <p className="text-uppercase text-soft-muted mb-1">Daftar Pelanggan</p>
              <h2 className="fw-bold text-plum">Pelanggan Terdaftar</h2>
              <p className="text-soft-muted">Kelola data pelanggan langsung dari tabel pengguna.</p>
            </div>

            {error && (
              <div className="alert alert-warning rounded-4 shadow-sm mb-4" role="alert">
                <strong>⚠️ Sinkronisasi Gagal:</strong> {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border text-plum mb-2" role="status"></div>
                <div className="small">Memuat akun pelanggan...</div>
              </div>
            ) : customers.length === 0 ? (
              <div className="alert alert-light border text-center rounded-4 py-4 text-muted">
                Belum ada pelanggan dengan hak akses 'pelanggan' di database.
              </div>
            ) : (
              <div className="card shadow-soft rounded-4 border-0 bg-white p-2">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="px-3">Nama</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>No. Handphone</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id}>
                          <td className="px-3 fw-semibold text-dark">{customer.nama || '-'}</td>
                          <td className="text-muted">{customer.username || '-'}</td>
                          <td>{customer.email || '-'}</td>
                          <td>{customer.hp || '-'}</td>
                          <td>
                            <span className="badge bg-soft-pink text-plum px-3 py-1.5 rounded-pill small fw-medium">
                              Pelanggan Aktif
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}