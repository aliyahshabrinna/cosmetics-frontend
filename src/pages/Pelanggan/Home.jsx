import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import { Link } from 'react-router-dom'
import NavbarPelanggan from '../../components/NavbarPelanggan'
import BottomNavigation from '../../components/BottomNavigation'

// Gambar cadangan bertema kosmetik kecantikan jika ada produk yang lupa dikasih gambar
const placeholderImage = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0)

export default function Home() {
  const [produkTerbaru, setProdukTerbaru] = useState([])
  const [produkTerlaris, setProdukTerlaris] = useState([]) 
  const [categories, setCategories] = useState(['All Products']) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [selectedAction, setSelectedAction] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All Products')
  const [wishlistIds, setWishlistIds] = useState([]) 

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true)
        const response = await api.get('/home-data')
        const result = response.data

        if (result.success && result.data) {
          const terbaruList = result.data.produk_terbaru || result.data.produk || []
          const normalizedTerbaru = terbaruList.map((item) => ({
            ...item,
            id_produk: item.id_produk ?? item.id,
            image_url: item.gambar ?? item.image_url ?? placeholderImage,
            nama_merk: item.nama_merk || 'Original Brand',
            nama_kategori: item.nama_kategori || 'Uncategorized'
          }))
          setProdukTerbaru(normalizedTerbaru)

          const terlarisList = result.data.produk_terlaris || []
          const normalizedTerlaris = terlarisList.map((item) => ({
            ...item,
            id_produk: item.id_produk ?? item.id,
            image_url: item.gambar ?? item.image_url ?? placeholderImage,
            nama_merk: item.nama_merk || 'Original Brand',
            nama_kategori: item.nama_kategori || 'Uncategorized',
            total_terjual: item.total_terjual ?? 0
          }))
          setProdukTerlaris(normalizedTerlaris)

          if (result.data.kategori && result.data.kategori.length > 0) {
            const dynamicCategories = ['All Products', ...result.data.kategori.map(cat => cat.nama_kategori)]
            setCategories(dynamicCategories)
          } else {
            const extractedCategories = ['All Products', ...new Set(normalizedTerbaru.map(item => item.nama_kategori))]
            setCategories(extractedCategories)
          }
        }
        setError('')
      } catch (err) {
        console.error('API Error:', err.message)
        setError(`Gagal memuat katalog produk (Status 500/Database Corrupt).`)
      } finally {
        setLoading(false)
      }
    }

    const fetchInitialWishlist = async () => {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const response = await api.get('/wishlist', { headers: { Authorization: `Bearer ${token}` } })
        if (response.data && Array.isArray(response.data.data)) {
          // Normalisasi id_produk atau produk_id dari database wishlist Anda
          setWishlistIds(response.data.data.map(item => item.produk_id ?? item.id_produk))
        }
      } catch (wErr) {
        console.warn('Gagal memuat status awal wishlist:', wErr.message)
      }
    }

    fetchHomeData()
    fetchInitialWishlist()
  }, [])

  const showAlert = (type, text) => {
    setAlert({ type, message: text })
    setTimeout(() => setAlert({ type: '', message: '' }), 3000)
  }

  const addToCart = async (produkAsli) => {
    const token = localStorage.getItem('token')
    if (!token) {
      showAlert('danger', 'Silakan login terlebih dahulu untuk menambah keranjang.')
      return
    }

    try {
      setSelectedAction(produkAsli.id_produk)
      
      await api.post('/cart', {
        produk_id: produkAsli.id_produk, // Disamakan menjadi produk_id jika cart menggunakan format yang sama
        qty: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const currentCart = JSON.parse(localStorage.getItem('cart')) || []
      const existingItem = currentCart.find(item => item.id_produk === produkAsli.id_produk)
      
      if (existingItem) {
        existingItem.jumlah += 1
      } else {
        currentCart.push({
          id_produk: produkAsli.id_produk,
          nama_produk: produkAsli.nama_produk,
          harga: produkAsli.harga,
          gambar: produkAsli.image_url,
          jumlah: 1
        })
      }
      localStorage.setItem('cart', JSON.stringify(currentCart))
      showAlert('success', 'Produk berhasil dimasukkan ke keranjang!')

    } catch (err) {
      console.error('Add to cart error:', err)
      showAlert('danger', 'Gagal menambahkan produk ke keranjang.')
    } finally {
      setSelectedAction(null)
    }
  }

  const handleWishlist = async (product) => {
    const idProduk = product.id_produk
    const token = localStorage.getItem('token')
    
    if (!token) {
      showAlert('danger', 'Silakan login terlebih dahulu untuk menambah wishlist.')
      return
    }

    try {
      setSelectedAction(`wishlist-${idProduk}`)
      
      // PERBAIKAN UTAMA: Mengirimkan key 'produk_id' sesuai keinginan validator Laravel Anda
      const response = await api.post('/wishlist', 
        { produk_id: idProduk }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data) {
        setWishlistIds(prev => 
          prev.includes(idProduk) ? prev.filter(id => id !== idProduk) : [...prev, idProduk]
        )
        showAlert('success', response.data.message || 'Wishlist berhasil diperbarui!')
      }
    } catch (err) {
      console.error('Wishlist error:', err.response?.data || err.message)
      const errorMsg = err.response?.data?.message || 'Gagal menambahkan ke wishlist.'
      showAlert('danger', errorMsg)
    } finally {
      setSelectedAction(null)
    }
  }

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All Products') return produkTerbaru
    return produkTerbaru.filter((item) => item.nama_kategori === activeCategory)
  }, [activeCategory, produkTerbaru])

  return (
    <div className="min-vh-100 bg-soft-pink">
      <NavbarPelanggan />
      <div className="container py-5">
        
        {/* HERO BANNER */}
        <section className="hero-banner mb-5">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <span className="badge bg-white text-plum mb-3 px-3 py-2 rounded-pill shadow-sm">Glow Collection 2026</span>
              <h1 className="display-5 fw-bold mb-3 text-dark">Radiance in Every Application</h1>
              <p className="text-soft-muted mb-4">Temukan pilihan produk kecantikan terbaik dan aman untuk memancarkan kilau alami kulit wajah Anda.</p>
              <button className="btn btn-outline-plum px-4 py-2 rounded-pill">Explore Collection</button>
            </div>
            <div className="col-lg-5">
              <div className="card bg-surface border-0 shadow-soft rounded-4 p-4 text-center">
                <img src={placeholderImage} alt="Beauty Cosmetics" className="rounded-4 mb-3 img-fluid" style={{ maxHeight: '200px', objectFit: 'cover' }} />
                <p className="mb-0 text-soft-muted">Formula terbaik untuk kecantikan abadi Anda.</p>
              </div>
            </div>
          </div>
        </section>

        {alert.message && (
          <div className={`alert alert-${alert.type} rounded-4 shadow-sm mb-4`}>
            {alert.message}
          </div>
        )}

        {error && (
          <div className="alert alert-warning rounded-4 mb-4">
            <strong>⚠️ Masalah Sinkronisasi Data:</strong> {error}
            <div className="small mt-1 text-dark">Tips: Silakan jalankan ulang/perbaiki sql seeder data dummy produk Anda di HeidiSQL.</div>
          </div>
        )}

        {/* ================= SEKSI 1: 🔥 PRODUK TERLARIS ================= */}
        {produkTerlaris.length > 0 && activeCategory === 'All Products' && (
          <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
              <h2 className="fw-bold text-dark my-0">🔥 Produk Terlaris</h2>
              <span className="badge bg-danger ms-2 rounded-pill">Must Have</span>
            </div>
            <div className="row g-4">
              {produkTerlaris.map((item) => {
                const isFavorite = wishlistIds.includes(item.id_produk)
                return (
                  <div key={`laris-${item.id_produk}`} className="col-12 col-md-6 col-lg-3">
                    <div className="card border-0 rounded-4 shadow-sm h-100 bg-white position-relative overflow-hidden">
                      <span className="position-absolute top-0 start-0 bg-warning text-dark fw-bold px-3 py-1 rounded-br-4 small z-3 shadow-sm">
                        Terjual {item.total_terjual} pcs
                      </span>
                      <div className="position-relative">
                        <Link to={`/product/${item.id_produk}`}>
                          <img 
                            src={item.image_url} 
                            alt={item.nama_produk} 
                            className="img-fluid rounded-top-4 w-100" 
                            style={{ height: '200px', objectFit: 'cover' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
                          />
                        </Link>
                        <button
                          type="button"
                          className="position-absolute top-0 end-0 m-3 rounded-circle bg-white shadow-sm border-0"
                          onClick={() => handleWishlist(item)}
                          disabled={selectedAction === `wishlist-${item.id_produk}`}
                          style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? "#d4395f" : "none"} stroke="#d4395f" strokeWidth="2" style={{ width: 18, height: 18 }}>
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </button>
                      </div>
                      <div className="card-body d-flex flex-column justify-content-between">
                        <div>
                          <span className="text-muted small fw-bold text-uppercase d-block mb-1">{item.nama_merk}</span>
                          <h6 className="fw-bold mb-1 text-truncate">
                            <Link to={`/product/${item.id_produk}`} className="text-decoration-none text-dark">{item.nama_produk || 'Produk Kecantikan'}</Link>
                          </h6>
                          <p className="fw-semibold text-danger small mb-0">{formatRupiah(item.harga)}</p>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-dark btn-sm w-100 rounded-3 mt-2 fw-semibold" 
                          onClick={() => addToCart(item)}
                          disabled={selectedAction === item.id_produk || item.stok <= 0}
                        >
                          + Keranjang
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <hr className="my-5 text-muted opacity-25" />
          </div>
        )}

        {/* DINAMIS KATEGORI BUTTONS */}
        <h3 className="fw-bold text-dark mb-3"> Jelajahi Katalog</h3>
        <div className="d-flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`btn rounded-pill px-4 py-2 ${activeCategory === category ? 'btn-pink text-white' : 'btn-outline-plum'}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* ================= SEKSI 2: 🛍️ GRID KATALOG UTAMA ================= */}
        {loading ? (
          <div className="text-center py-5 text-muted">Memuat produk kecantikan...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="alert alert-light border border-dashed rounded-4 text-center py-5 text-muted">
             Tidak ada produk tersedia untuk kategori "{activeCategory}".
          </div>
        ) : (
          <div className="row g-4">
            {filteredProducts.map((item, index) => {
              const imageUrl = item.image_url || placeholderImage
              const name = item.nama_produk || 'Produk Kecantikan'
              const price = item.harga || 0
              const stock = item.stok ?? 0
              const itemId = item.id_produk ?? index
              const isFavorite = wishlistIds.includes(itemId)

              return (
                <div key={`katalog-${itemId}`} className="col-12 col-md-6 col-lg-4">
                  <div className="card border-0 rounded-4 shadow-sm h-100 bg-white">
                    <div className="position-relative">
                      <Link to={`/product/${itemId}`}>
                        <img 
                          src={imageUrl} 
                          alt={name} 
                          className="img-fluid rounded-top-4 w-100" 
                          style={{ height: '250px', objectFit: 'cover' }} 
                          onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
                        />
                      </Link>
                      <button
                        type="button"
                        className="position-absolute top-0 end-0 m-3 rounded-circle bg-white shadow-sm border-0"
                        onClick={() => handleWishlist(item)}
                        disabled={selectedAction === `wishlist-${itemId}`}
                        style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? "#d4395f" : "none"} stroke="#d4395f" strokeWidth="2" style={{ width: 20, height: 20 }}>
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                    </div>
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div>
                        <span className="text-muted small fw-bold text-uppercase d-block mb-1">{item.nama_merk}</span>
                        <h5 className="fw-bold mb-1 text-truncate">
                          <Link to={`/product/${itemId}`} className="text-decoration-none text-dark">{name}</Link>
                        </h5>
                        <p className="fw-semibold text-danger mb-2">{formatRupiah(price)}</p>
                        <p className="text-muted small">Stok: {stock} item</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-pink w-100 rounded-3 py-2 mt-3 fw-semibold"
                        onClick={() => addToCart(item)}
                        disabled={selectedAction === itemId || stock <= 0}
                      >
                        {stock <= 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  )
}