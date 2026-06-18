import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import SidebarAdmin from '../../components/SidebarAdmin'
import aurelieLogo from '../../assets/aurelie-logo.svg'

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0)

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  // Pemindai Array Mendalam (Deep Scanner) untuk membongkar objek bungkus dari Laravel
  const normalizeResponse = (payload) => {
    if (!payload) return []
    if (Array.isArray(payload)) return payload
    
    // Cari properti berjenis array di tingkat pertama (data, produk, pelanggan, dll)
    const values = Object.values(payload)
    const foundArray = values.find(val => Array.isArray(val))
    if (foundArray) return foundArray

    // Bongkar jika ada pembungkusan bersarang (nested object data.data)
    if (payload.data && typeof payload.data === 'object') {
      if (Array.isArray(payload.data)) return payload.data
      const nestedValues = Object.values(payload.data)
      const foundNestedArray = nestedValues.find(val => Array.isArray(val))
      if (foundNestedArray) return foundNestedArray
    }
    return []
  }

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      const token = localStorage.getItem('token')
      const config = { headers: { Authorization: `Bearer ${token}` } }

      try {
        setLoading(true)
        setError('')

        // Memperbaiki rantai penanganan rute agar fallback berjalan mulus tanpa memicu unhandled rejection
        const [produkRes, pelangganRes, ordersRes] = await Promise.allSettled([
          api.get('/produk', config)
            .catch(() => api.get('/products', config))
            .catch(() => api.get('/product', config)),
            
          api.get('/pelanggan', config)
            .catch(() => api.get('/customers', config))
            .catch(() => api.get('/customer', config)),
            
          api.get('/orders', config)
            .catch(() => api.get('/transaksi', config))
            .catch(() => api.get('/order', config))
        ])

        if (!mounted) return

        // Ekstraksi Data Produk
        if (produkRes.status === 'fulfilled' && produkRes.value?.data) {
          setProducts(normalizeResponse(produkRes.value.data))
        } else {
          console.error('Gagal memuat rute produk:', produkRes.reason)
        }

        // Ekstraksi Data Pelanggan
        if (pelangganRes.status === 'fulfilled' && pelangganRes.value?.data) {
          setCustomers(normalizeResponse(pelangganRes.value.data))
        } else {
          console.error('Gagal memuat rute pelanggan:', pelangganRes.reason)
        }

        // Ekstraksi Data Transaksi/Orders
        if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
          setOrders(normalizeResponse(ordersRes.value.data))
        } else {
          console.warn('Seluruh rute transaksi alternatif tidak merespon data valid.')
          setOrders([])
        }

      } catch (err) {
        console.error('Dashboard fatal fetch error:', err.message)
        setError('Terjadi kendala saat menghubungkan ke sistem database.')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    return () => {
      mounted = false
    }
  }, [])

  // Mengambil produk dengan stok paling menipis (<= 5)
  const lowStockProducts = useMemo(() => {
    return products
      .filter((item) => {
        const stokValue = item.stok ?? item.stock ?? 0
        return Number(stokValue) <= 5
      })
      .map((item) => ({
        ...item,
        id: item.id_produk ?? item.id,
      }))
  }, [products])

  // Membaca 5 transaksi terbaru
  const recentOrdersList = useMemo(() => {
    return orders.slice(0, 5).map((order, index) => {
      const user = order.pelanggan ?? order.user ?? {}
      const statusText = order.status ?? 'Pending'
      return {
        id: order.id_transaksi ?? order.id_order ?? order.invoice ?? order.id ?? `ORD-${1000 + index}`,
        customer: user.nama_pelanggan ?? user.name ?? order.nama_penerima ?? 'Pelanggan',
        total: order.total_harga ?? order.total ?? order.grand_total ?? 0,
        status: typeof statusText === 'string' ? statusText : 'Selesai',
      }
    })
  }, [orders])

  return (
    <div className="min-vh-100 bg-soft-pink">
      <div className="d-flex">
        <SidebarAdmin />
        <main className="flex-fill">
          
          {/* Top bar */}
          <div className="bg-white border-bottom border-soft-muted px-4 py-3">
            <div className="container-fluid d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <img src={aurelieLogo} alt="Aurélie" style={{ height: 48 }} />
                <div>
                  <h6 className="mb-0 fw-bold text-plum" style={{ fontSize: 16 }}>Admin Panel</h6>
                  <small className="text-soft-muted">Aurélie</small>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                {/* Search button */}
                <div className="position-relative">
                  <button 
                    className="btn btn-outline-plum rounded-pill px-3 py-2"
                    onClick={() => setSearchOpen((s) => !s)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    Cari
                  </button>
                  {searchOpen && (
                    <div className="card shadow-soft position-absolute p-3" style={{ right: 0, top: '3rem', minWidth: 360, zIndex: 1200 }}>
                      <div className="input-group">
                        <input 
                          value={searchQuery} 
                          onChange={(e) => setSearchQuery(e.target.value)} 
                          className="form-control rounded-4" 
                          placeholder="Cari produk, pelanggan, order..."
                        />
                        <button className="btn btn-primary-plum">Cari</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications button */}
                <div className="position-relative">
                  <button 
                    className="btn btn-link text-plum p-0" 
                    onClick={() => setNotificationsOpen((s) => !s)}
                    style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger text-white" style={{ fontSize: 10, padding: 4 }}>
                      {lowStockProducts.length}
                    </span>
                  </button>
                  {notificationsOpen && (
                    <div className="card shadow-soft position-absolute p-3" style={{ right: 0, top: '3rem', minWidth: 320, zIndex: 1200 }}>
                      <h6 className="mb-2 fw-bold">System Alerts</h6>
                      <ul className="list-unstyled mb-0 text-sm">
                        {lowStockProducts.slice(0, 3).map((p) => (
                          <li key={p.id} className="py-2 border-bottom text-muted small">
                            <strong>Stok menipis:</strong> {p.nama_produk || p.nama} sisa {p.stok ?? p.stock} item.
                          </li>
                        ))}
                        {lowStockProducts.length === 0 && <li className="py-2 text-muted small">Semua sistem berjalan normal.</li>}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Profile button */}
                <button 
                  className="btn btn-outline-plum rounded-circle p-2"
                  onClick={() => setProfileOpen(true)}
                  style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Modal */}
          {profileOpen && (
            <div className="modal-overlay" onClick={() => setProfileOpen(false)}>
              <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h4 className="mb-1">Admin Profile</h4>
                    <p className="text-soft-muted mb-0">Kelola akun dan pengaturan Anda.</p>
                  </div>
                  <button className="btn btn-link text-plum fs-5 p-0" onClick={() => setProfileOpen(false)}>✕</button>
                </div>
                <div className="d-grid gap-2 mt-4">
                  <button 
                    className="btn btn-pink rounded-4"
                    onClick={() => {
                      localStorage.clear()
                      window.location.href = '/login'
                    }}
                  >
                    Logout Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Dashboard Panel */}
          <div className="p-4">
            <div className="container-fluid">
              <div className="mb-4">
                <p className="text-uppercase text-soft-muted mb-1">Admin Dashboard</p>
                <h1 className="page-title">Business insights with a refined beauty experience.</h1>
                <p className="text-soft-muted">Monitor product performance, customer growth, and the latest order trends.</p>
              </div>

              {error && (
                <div className="alert alert-warning rounded-4 shadow-sm mb-4" role="alert">
                  <strong>⚠️ Sinkronisasi Gagal:</strong> {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-plum mb-3" role="status"></div>
                  <p className="text-muted">Sinkronisasi data database terbaru...</p>
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="row g-4 mb-4">
                    <div className="col-12 col-md-4">
                      <div className="card card-section shadow-soft rounded-4 p-4 bg-white border-0">
                        <p className="text-uppercase small text-soft-muted mb-2">Total Produk</p>
                        <h2 className="fw-bold mb-2 text-dark">{products.length}</h2>
                        <p className="mb-0 text-soft-muted small">Jumlah item aktif di katalog.</p>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="card card-section shadow-soft rounded-4 p-4 bg-white border-0">
                        <p className="text-uppercase small text-soft-muted mb-2">Total Pelanggan</p>
                        <h2 className="fw-bold mb-2 text-dark">{customers.length}</h2>
                        <p className="mb-0 text-soft-muted small">Pengguna terdaftar di database.</p>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="card card-section shadow-soft rounded-4 p-4 bg-white border-0">
                        <p className="text-uppercase small text-soft-muted mb-2">Total Transaksi</p>
                        <h2 className="fw-bold mb-2 text-dark">{orders.length}</h2>
                        <p className="mb-0 text-soft-muted small">Keseluruhan log penjualan masuk.</p>
                      </div>
                    </div>
                  </div>

                  {/* Tables & Inventory Alert sections */}
                  <div className="row g-4">
                    <div className="col-12 col-xl-7">
                      <div className="card card-section rounded-4 shadow-soft p-4 h-100 bg-white border-0">
                        <div className="d-flex justify-content-between align-items-start mb-4">
                          <div>
                            <h3 className="mb-1 fw-bold text-dark">Recent Orders</h3>
                            <p className="text-soft-muted mb-0 small">Pesanan masuk real-time dari database.</p>
                          </div>
                          <span className="badge bg-plum text-white px-3 py-2 rounded-pill">Live Data</span>
                        </div>
                        <div className="table-responsive">
                          <table className="table align-middle mb-0">
                            <thead>
                              <tr>
                                <th>ID Order</th>
                                <th>Pelanggan</th>
                                <th>Total</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentOrdersList.map((order) => (
                                <tr key={order.id}>
                                  <td className="fw-semibold text-plum">{order.id}</td>
                                  <td>{order.customer}</td>
                                  <td className="fw-medium">{formatRupiah(order.total)}</td>
                                  <td>
                                    <span className={`badge px-2.5 py-1.5 rounded-3 ${
                                      order.status.toLowerCase() === 'paid' || order.status.toLowerCase() === 'selesai' || order.status.toLowerCase() === 'success'
                                        ? 'bg-success text-white' 
                                        : 'bg-warning text-dark'
                                    }`}>
                                      {order.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {recentOrdersList.length === 0 && (
                                <tr>
                                  <td colSpan="4" className="text-center py-4 text-muted small">Belum ada riwayat transaksi masuk.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-xl-5">
                      <div className="card card-section rounded-4 shadow-soft p-4 h-100 bg-white border-0">
                        <div className="d-flex justify-content-between align-items-start mb-4">
                          <div>
                            <h3 className="mb-1 fw-bold text-dark">Low Stock Alerts</h3>
                            <p className="text-soft-muted mb-0 small">Produk kritis wajib restock.</p>
                          </div>
                          <span className="badge bg-soft-pink text-plum px-3 py-2 rounded-pill">Inventory</span>
                        </div>
                        {lowStockProducts.length === 0 ? (
                          <div className="text-center py-5">
                            <p className="text-success fw-medium mb-0">✨ Aman! Semua produk memiliki stok cukup.</p>
                          </div>
                        ) : (
                          <ul className="list-group list-group-flush">
                            {lowStockProducts.map((product) => (
                              <li key={product.id} className="list-group-item bg-transparent px-0 py-3 border-bottom d-flex justify-content-between align-items-center">
                                <div>
                                  <div className="fw-semibold text-dark">
                                    <Link to={`/admin/kelola-produk`} className="text-decoration-none text-dark hover-plum">
                                      {product.nama_produk || product.nama}
                                    </Link>
                                  </div>
                                  <small className="text-danger fw-medium">Sisa Stok: {product.stok ?? product.stock ?? 0}</small>
                                </div>
                                <span className="badge bg-dark text-white rounded-3 px-3 py-2">Restock</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}