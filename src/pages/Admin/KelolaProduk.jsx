import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import SidebarAdmin from '../../components/SidebarAdmin'

export default function KelolaProduk() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Fungsi Scan Otomatis untuk mencari array di dalam data Laravel berlapis
  const autoExtractArray = (obj) => {
    if (!obj) return []
    if (Array.isArray(obj)) return obj
    
    // Jika objek memiliki properti langsung berjenis array (misal: obj.produk atau obj.data)
    for (const key in obj) {
      if (Array.isArray(obj[key])) return obj[key]
    }
    
    // Pencarian tingkat kedua jika dibungkus nested object (misal: obj.data.data)
    if (obj.data && typeof obj.data === 'object') {
      if (Array.isArray(obj.data)) return obj.data
      for (const key in obj.data) {
        if (Array.isArray(obj.data[key])) return obj.data[key]
      }
    }
    return []
  }

  useEffect(() => {
    let mounted = true

    const fetchProduk = async () => {
      const token = localStorage.getItem('token')
      const config = { headers: { Authorization: `Bearer ${token}` } }

      try {
        setLoading(true)
        setError('')

        let res
        try {
          res = await api.get('/produk', config)
        } catch {
          try {
            res = await api.get('/api/admin/produk', config)
          } catch {
            res = await api.get('/admin/produk', config)
          }
        }

        // Cetak log ke console untuk melacak struktur asli database Laravel Anda
        console.log("RESPONS API PRODUK ASLI:", res?.data)

        // Mengekstrak langsung dari res.data (bukan rawData yang dipotong)
        const cleanList = autoExtractArray(res?.data)

        if (mounted) {
          setProducts(cleanList)
          setFilteredProducts(cleanList)
        }
      } catch (err) {
        console.error('Gagal memuat endpoint produk:', err.message)
        if (mounted) {
          setError('Gagal menyinkronkan daftar produk dari database (404/Network Error).')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProduk()
    return () => { mounted = false }
  }, [])

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    if (!query) {
      setFilteredProducts(products)
      return
    }
    const filtered = products.filter((p) => {
      const name = p.nama_produk ?? p.nama ?? ''
      return name.toLowerCase().includes(query.toLowerCase())
    })
    setFilteredProducts(filtered)
  }

  return (
    <div className="min-vh-100 bg-soft-pink">
      <div className="d-flex">
        <SidebarAdmin />
        <main className="flex-fill p-4">
          <div className="container-fluid">
            
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <p className="text-uppercase text-soft-muted small mb-1">Kelola Produk</p>
                <h2 className="fw-bold text-plum mb-0">Katalog Kosmetik</h2>
              </div>
              <div className="d-flex gap-2">
                <input 
                  type="text" 
                  className="form-control rounded-pill px-3" 
                  placeholder="Cari produk..." 
                  value={searchQuery}
                  onChange={handleSearch}
                  style={{ maxWidth: 250 }}
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-warning rounded-4 shadow-sm mb-4" role="alert">
                <strong>⚠️ Sinkronisasi Gagal:</strong> {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border text-plum mb-2" role="status"></div>
                <div>Sinkronisasi katalog produk dari database...</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="alert alert-light text-center border rounded-4 py-4 text-muted">
                Tidak ada data produk yang ditemukan di dalam sistem database.
              </div>
            ) : (
              <div className="card shadow-soft rounded-4 border-0 bg-white p-2">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="px-3">Nama Produk</th>
                        <th>Kategori</th>
                        <th>Harga</th>
                        <th>Stok</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product, index) => {
                        const id = product.id ?? product.id_produk ?? index
                        const nama = product.nama_produk ?? product.nama ?? '-'
                        const harga = product.harga ?? 0
                        const stok = product.stok ?? product.stock ?? 0

                        let kategoriText = 'Kosmetik'
                        if (product.kategori) {
                          kategoriText = typeof product.kategori === 'object' 
                            ? (product.kategori.nama_kategori ?? product.kategori.nama ?? 'Umum')
                            : product.kategori
                        }

                        return (
                          <tr key={id}>
                            <td className="px-3 fw-semibold text-dark">{nama}</td>
                            <td>
                              <span className="badge bg-soft-pink text-plum px-3 py-1.5 rounded-pill small fw-medium">
                                {kategoriText}
                              </span>
                            </td>
                            <td className="fw-medium text-secondary">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(harga)}
                            </td>
                            <td>
                              <span className={`fw-bold ${stok <= 5 ? 'text-danger' : 'text-success'}`}>
                                {stok} pcs
                              </span>
                            </td>
                          </tr>
                        )
                      })}
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