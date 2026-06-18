import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import NavbarPelanggan from '../../components/NavbarPelanggan'
import BottomNavigation from '../../components/BottomNavigation'

export default function Alamat() {
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState({ nama_penerima: '', no_hp: '', alamat: '', kota: '', provinsi: '', kode_pos: '' })
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(null)
  const [message, setMessage] = useState('')
  const [showModal, setShowModal] = useState(false)

  const fetchAlamat = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get('/alamat', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const payload = response.data.data ?? response.data ?? []
      const addressList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.alamat)
        ? payload.alamat
        : []
      setAddresses(addressList)
    } catch (err) {
      setMessage('Tidak dapat memuat alamat. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlamat()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await api.post('/alamat', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('Alamat berhasil ditambahkan.')
      setForm({ nama_penerima: '', no_hp: '', alamat: '', kota: '', provinsi: '', kode_pos: '' })
      setShowModal(false)
      fetchAlamat()
    } catch (err) {
      setMessage('Gagal menambah alamat baru. Pastikan data sudah lengkap.')
    }
  }

  // === FIX: SEKARANG BERJALAN AMAN TANPA PERLU id_pelanggan DARI LOCALSTORAGE ===
  // === SINKRONISASI TOTAL CHECKOUT DENGAN BACKEND LARAVEL ===
 const handleCheckout = async (idAlamat) => {
    try {
      setCheckoutLoading(idAlamat)
      const token = localStorage.getItem('token')

      if (!token) {
        window.alert('Sesi Anda habis atau belum login. Silakan login kembali.')
        return
      }

      // 1. Ambil data keranjang dari database server
      const cartResponse = await api.get('/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const rawItems = cartResponse.data?.data || cartResponse.data || []
      
      if (!Array.isArray(rawItems) || rawItems.length === 0) {
        window.alert('Keranjang belanja Anda kosong!')
        return
      }

      // 2. MAPPING SESUAI STRUKTUR DATABASE NYATA (produk_id & qty)
      const formattedItems = rawItems.map(item => {
        return {
          id_produk: item.produk_id, // mengambil dari produk_id di database, dikirim sebagai id_produk untuk backend
          jumlah: parseInt(item.qty || 1, 10) // mengambil dari qty di database
        };
      }).filter(item => item.id_produk);

      if (formattedItems.length === 0) {
        window.alert('Format item keranjang tidak valid.');
        return
      }

      // 3. Susun payload final
      const payload = { 
        id_alamat: idAlamat,
        items: formattedItems
      }

      console.log("Payload siap dikirim:", payload)

      // 4. Kirim request POST ke transaksi
      const response = await api.post('/transaksi', payload, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.success || response.data) {
        window.alert('Transaksi/Pesanan berhasil dibuat!')
        navigate('/notifications') 
      }

    } catch (err) {
      console.error("Detail Error saat Checkout:", err.response?.data || err)
      const errorServer = err.response?.data?.message || 'Gagal memproses transaksi.'
      window.alert(`Error: ${errorServer}`)
    } finally {
      setCheckoutLoading(null)
    }
  }
  return (
    <div className="min-vh-100 bg-soft-pink pb-5">
      <NavbarPelanggan />
      <div className="container py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
          <div>
            <p className="text-uppercase text-soft-muted mb-1">My Addresses</p>
            <h1 className="h3 fw-bold text-dark">Manage your delivery locations for a seamless checkout experience.</h1>
          </div>
          <button className="btn btn-outline-danger rounded-4 px-4 py-3 fw-semibold" onClick={() => setShowModal(true)}>
            ➕ Tambah Alamat Baru
          </button>
        </div>

        {message && <div className="alert alert-info rounded-4 shadow-sm">{message}</div>}

        <div className="row g-4">
          {loading ? (
            <div className="text-center py-5 text-muted">Memuat alamat...</div>
          ) : addresses.length === 0 ? (
            <div className="alert alert-info text-center rounded-4">Belum ada alamat tersimpan.</div>
          ) : (
            addresses.map((item) => {
              const isDefault = item.is_default || item.default || false
              const currentId = item.id ?? item.id_alamat
              
              return (
                <div key={currentId} className="col-12 col-md-6">
                  <div className="card rounded-4 shadow-sm border-0 p-4 position-relative bg-white">
                    {isDefault && <span className="badge bg-danger position-absolute top-0 end-0 m-3">DEFAULT</span>}
                    <div className="mb-3">
                      <h5 className="fw-bold mb-1 text-dark">{item.nama_penerima || item.nama || 'Penerima'}</h5>
                      <p className="text-muted mb-0">{item.no_hp || item.hp || '-'}</p>
                    </div>
                    <div className="mb-3">
                      <p className="mb-2 text-secondary">{item.alamat}</p>
                      <p className="mb-0 text-muted small">
                        {item.kota}, {item.provinsi} {item.kode_pos}
                      </p>
                    </div>
                    
                    <button 
                      className="btn btn-danger w-100 rounded-3 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                      onClick={() => handleCheckout(currentId)}
                      disabled={checkoutLoading !== null}
                    >
                      {checkoutLoading === currentId ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Memproses...
                        </>
                      ) : (
                        <>Shipping Destination ➜</>
                      )}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-4 border-0">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h4 className="fw-bold mb-1">Tambah Alamat Baru</h4>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Nama Penerima</label>
                  <input name="nama_penerima" value={form.nama_penerima} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Nomor HP</label>
                  <input name="no_hp" value={form.no_hp} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Alamat Lengkap</label>
                  <textarea name="alamat" value={form.alamat} onChange={handleChange} className="form-control" rows="3" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Kota</label>
                  <input name="kota" value={form.kota} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Provinsi</label>
                  <input name="provinsi" value={form.provinsi} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Kode Pos</label>
                  <input name="kode_pos" value={form.kode_pos} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-12 text-end mt-4">
                  <button type="submit" className="btn btn-danger rounded-3 px-4 py-2 fw-semibold">
                    Simpan Alamat
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  )
}