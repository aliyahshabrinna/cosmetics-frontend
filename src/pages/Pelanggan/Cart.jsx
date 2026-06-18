import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import NavbarPelanggan from '../../components/NavbarPelanggan'
import BottomNavigation from '../../components/BottomNavigation'

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0)

export default function Cart() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token')
      try {
        const response = await api.get('/cart', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const payload = response.data.data ?? response.data ?? []
        const cartList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.items)
          ? payload.items
          : []
        setItems(cartList)
      } catch (err) {
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  const showAlert = (type, message) => {
    setAlert({ type, message })
    setTimeout(() => setAlert({ type: '', message: '' }), 3000)
  }

  const handleQuantityChange = async (item, delta) => {
    const currentQty = item.qty || item.jumlah || 1
    const nextQty = currentQty + delta
    if (nextQty < 1) return

    const token = localStorage.getItem('token')
    const targetId = item.id_cart || item.id_keranjang || item.id

    try {
      setUpdatingId(targetId)
      await api.put(`/cart/${targetId}`, { qty: nextQty }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setItems((prev) => 
        prev.map((row) => {
          const rowId = row.id_cart || row.id_keranjang || row.id
          return rowId === targetId ? { ...row, qty: nextQty, jumlah: nextQty } : row
        })
      )
      showAlert('success', 'Jumlah produk berhasil diperbarui.')
    } catch (err) {
      console.error('Update qty error:', err.response?.data || err.message)
      showAlert('danger', 'Gagal memperbarui jumlah produk.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (item) => {
    const targetId = item.id_cart || item.id_keranjang || item.id
    if (!targetId) {
      showAlert('danger', 'ID keranjang tidak valid.')
      return
    }

    const confirmed = window.confirm('Yakin ingin menghapus produk dari keranjang?')
    if (!confirmed) return

    const token = localStorage.getItem('token')
    try {
      await api.delete(`/cart/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setItems((prev) => prev.filter((row) => {
        const rowId = row.id_cart || row.id_keranjang || row.id
        return rowId !== targetId
      }))
      showAlert('success', 'Produk berhasil dihapus dari keranjang.')
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message)
      showAlert('danger', 'Gagal menghapus produk dari keranjang.')
    }
  }

  const total = items.reduce((sum, item) => {
    const price = item.harga || item.price || item.produk?.harga || item.product?.harga || 0
    const qty = item.qty || item.jumlah || 1
    return sum + price * qty
  }, 0)

  return (
    <div className="min-vh-100 bg-soft-pink pb-5">
      <NavbarPelanggan />
      <div className="container py-5">
        <div className="mb-4">
          <p className="text-uppercase text-soft-muted mb-1">Shopping Bag</p>
          <h1 className="page-title">Review your selections before proceeding to payment.</h1>
        </div>
        {alert.message && (
          <div className={`alert alert-${alert.type} rounded-4 shadow-sm`} role="alert">
            {alert.message}
          </div>
        )}
        {loading ? (
          <div className="text-center py-5 text-muted">Memuat keranjang...</div>
        ) : items.length === 0 ? (
          <div className="alert alert-info">Keranjang masih kosong.</div>
        ) : (
          <div className="card shadow-soft rounded-4 border-0 p-4 mb-4 bg-surface">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>No</th>
                    <th>Product</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const name = item.nama_produk || item.nama || item.produk?.nama_produk || item.product?.nama || 'Produk Kosmetik'
                    const price = item.harga || item.price || item.produk?.harga || item.product?.harga || 0
                    
                    // === PERBAIKAN: Membaca properti .gambar dari relasi table produk ===
                    const imageUrl = item.produk?.gambar || item.image_url || item.image || item.produk?.image_url || item.product?.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
                    const currentId = item.id || item.id_cart || item.id_keranjang

                    return (
                      <tr key={currentId || index}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={imageUrl}
                              alt={name}
                              className="rounded-3"
                              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'; }}
                            />
                            <div>
                              <h6 className="fw-bold mb-1">{name}</h6>
                              <div className="d-flex align-items-center gap-2">
                                <button 
                                  className="btn btn-sm btn-outline-secondary py-0 px-2" 
                                  onClick={() => handleQuantityChange(item, -1)}
                                  disabled={updatingId === currentId}
                                >
                                  -
                                </button>
                                <span className="text-dark small font-monospace">{item.qty || item.jumlah || 1}</span>
                                <button 
                                  className="btn btn-sm btn-outline-secondary py-0 px-2" 
                                  onClick={() => handleQuantityChange(item, 1)}
                                  disabled={updatingId === currentId}
                                >
                                  +
                                </button>
                                <button 
                                  className="btn btn-sm btn-link text-danger ms-3 text-decoration-none py-0" 
                                  onClick={() => handleRemove(item)}
                                >
                                  Hapus
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="fw-semibold text-plum">{formatRupiah(price)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card card-section shadow-soft rounded-4 p-4">
              <p className="text-uppercase text-soft-muted mb-2">Estimated Shipping</p>
              <h4 className="fw-bold">Free</h4>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card card-section shadow-soft rounded-4 p-4">
              <p className="text-uppercase text-soft-muted mb-2">Total</p>
              <h4 className="fw-bold text-plum">{formatRupiah(total)}</h4>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button className="btn btn-primary-plum btn-lg rounded-4 px-5 py-3" onClick={() => navigate('/alamat')}>
            Lanjutkan Pembayaran
          </button>
        </div>
      </div>
      <BottomNavigation />
    </div>
  )
}