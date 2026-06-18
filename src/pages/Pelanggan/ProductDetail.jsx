import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

export default function ProductDetail() {
  const params = useParams()
  const id_produk = params.id_produk ?? params.id

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  // State untuk melacak proses loading aksi tombol
  const [cartLoading, setCartLoading] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchProduct = async () => {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      
      try {
        setLoading(true)
        setError(false)
        
        const res = await api.get(`/produk/${id_produk}`, { headers })
        const rawData = res.data.data ?? res.data ?? res.data.produk ?? null
        
        if (mounted && rawData) {
          const normalized = {
            id_produk: rawData.id_produk ?? rawData.id,
            nama_produk: rawData.nama_produk ?? rawData.nama ?? rawData.name ?? 'Nama Produk',
            harga: rawData.harga ?? rawData.price ?? 0,
            deskripsi: rawData.deskripsi ?? rawData.description ?? 'Tidak ada deskripsi tersedia.',
            image_url: rawData.image_url ?? rawData.image ?? 'https://via.placeholder.com/400',
            kategori: typeof rawData.kategori === 'object' 
              ? rawData.kategori?.nama_kategori 
              : rawData.kategori ?? 'Kategori'
          }
          setProduct(normalized)
        } else {
          if (mounted) setError(true)
        }
      } catch (err) {
        console.error("Gagal memuat produk detail:", err)
        if (mounted) setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (id_produk) {
      fetchProduct()
    }
    
    return () => {
      mounted = false
    }
  }, [id_produk])

  // ==================== 1. FUNGSI TAMBAH KE KERANJANG ====================
  const handleAddToCart = async () => {
    try {
      setCartLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        window.alert('Silakan login terlebih dahulu untuk menambah item ke keranjang.')
        return
      }

      // Payload disesuaikan dengan isi database Anda (produk_id dan qty)
      const payload = {
        produk_id: product.id_produk,
        qty: 1
      }

      const response = await api.post('/cart', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success || response.status === 200 || response.status === 201) {
        window.alert(`Sukses! ${product.nama_produk} berhasil dimasukkan ke keranjang belanja.`);
      }
    } catch (err) {
      console.error("Gagal menambah keranjang:", err.response?.data || err)
      const msg = err.response?.data?.message || 'Gagal menambahkan produk ke keranjang.'
      window.alert(`Error: ${msg}`)
    } finally {
      setCartLoading(false)
    }
  }

  // ==================== 2. FUNGSI TAMBAH KE WISHLIST ====================
  const handleAddToWishlist = async () => {
    try {
      setWishlistLoading(true)
      const token = localStorage.getItem('token')

      if (!token) {
        window.alert('Silakan login terlebih dahulu untuk menyukai produk.')
        return
      }

      // Sesuaikan payload ID produk sesuai validasi WishlistController Anda
      const payload = {
        produk_id: product.id_produk,
        id_produk: product.id_produk
      }

      const response = await api.post('/wishlist', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success || response.status === 200 || response.status === 201) {
        window.alert(`Sukses! ${product.nama_produk} telah ditambahkan ke daftar Wishlist Favorit Anda.`);
      }
    } catch (err) {
      console.error("Gagal menambah wishlist:", err.response?.data || err)
      const msg = err.response?.data?.message || 'Produk sudah ada di wishlist atau gagal ditambahkan.'
      window.alert(`Info: ${msg}`)
    } finally {
      setWishlistLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        <div className="spinner-border text-danger mb-2" role="status"></div>
        <div>Memuat produk...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning rounded-4 mb-4">
          Produk tidak ditemukan atau gagal dimuat.
        </div>
        <Link to="/home" className="btn btn-outline-plum rounded-pill">Kembali ke Beranda</Link>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="mb-4">
        <Link to="/home" className="text-decoration-none text-plum">← Kembali ke Beranda</Link>
      </div>
      <div className="card rounded-4 p-4 shadow-sm border-0 bg-white">
        <div className="row g-4">
          <div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
            <img 
              src={product.image_url} 
              alt={product.nama_produk} 
              className="img-fluid rounded-4 shadow-sm"
              style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'cover' }} 
            />
          </div>
          <div className="col-12 col-md-6 d-flex flex-column justify-content-center">
            <span className="badge bg-light text-plum align-self-start mb-2 px-3 py-2 rounded-pill text-uppercase">
              {product.kategori}
            </span>
            <h1 className="h2 fw-bold text-dark mb-3">{product.nama_produk}</h1>
            <div className="mb-4 text-danger fw-bold fs-3">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.harga)}
            </div>
            
            <hr />
            
            <h5 className="fw-semibold text-secondary mb-2">Deskripsi Produk</h5>
            <p className="text-muted lh-base">{product.deskripsi}</p>
            
            <div className="d-flex gap-3 mt-4">
              {/* TOMBOL KERANJANG DENGAN ONCLICK */}
              <button 
                className="btn btn-pink rounded-4 px-4 py-3 fw-semibold flex-grow-1"
                onClick={handleAddToCart}
                disabled={cartLoading}
              >
                {cartLoading ? 'Memproses...' : 'Tambah ke Keranjang'}
              </button>

              {/* TOMBOL WISHLIST DENGAN ONCLICK */}
              <button 
                className="btn btn-outline-plum rounded-4 px-4"
                onClick={handleAddToWishlist}
                disabled={wishlistLoading}
              >
                {wishlistLoading ? '...' : '♥ Favorit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}