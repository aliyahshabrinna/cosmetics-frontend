import { useEffect, useState } from 'react'
import api from '../../services/api'
import NavbarPelanggan from '../../components/NavbarPelanggan'
import BottomNavigation from '../../components/BottomNavigation'

export default function Wishlist() {
  const [wishItems, setWishItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      try {
        const response = await api.get('/wishlist', { headers })

        const payload = response.data.data ?? response.data ?? response.data.wishlist ?? []
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.items)
          ? payload.items
          : []

        const normalized = list.map((entry, index) => {
          const produk = entry.produk ?? entry.product ?? {}
          return {
            ...entry,
            id: entry.id ?? entry.wishlist_id ?? entry.id_wishlist ?? index,
            id_produk: entry.id_produk ?? entry.produk_id ?? produk.id_produk ?? produk.id,
            nama: entry.nama || entry.nama_produk || entry.name || produk.nama_produk || produk.nama || 'Produk Favorit',
            kategori: entry.kategori || entry.category || (produk.kategori && typeof produk.kategori === 'object' ? produk.kategori.nama_kategori : produk.kategori) || 'Perawatan Kulit',
            harga: entry.harga ?? entry.price ?? produk.harga ?? produk.price ?? 0,
            // === PERBAIKAN: Membaca properti .gambar dari table seeder ===
            image: produk.gambar || entry.gambar || entry.image || entry.image_url || produk.image || produk.image_url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
          }
        })

        setWishItems(normalized)
      } catch (err) {
        console.error('Wishlist fetch error:', err.response || err)
        setWishItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [])

  return (
    <div className="min-vh-100 bg-soft-pink">
      <NavbarPelanggan />
      <div className="container py-5">
        <div className="text-center mb-4">
          <p className="text-uppercase text-muted mb-1">Wishlist</p>
          <h2 className="fw-bold text-pink">Produk Favoritmu</h2>
          <p className="text-secondary">Simpan produk yang paling kamu sukai untuk dibeli nanti.</p>
        </div>
        
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-danger mb-2" role="status"></div>
            <div>Memuat wishlist...</div>
          </div>
        ) : wishItems.length === 0 ? (
          <div className="alert alert-info text-center rounded-4">Wishlist masih kosong. Tambahkan produk favoritmu dari Beranda.</div>
        ) : (
          <div className="row g-4">
            {wishItems.map((item) => (
              <div key={item.id} className="col-12 col-md-6 col-xl-4">
                <div className="card h-100 shadow-sm rounded-4 border-0 bg-white">
                  <img
                    src={item.image}
                    className="card-img-top rounded-top-4"
                    alt={item.nama}
                    style={{ height: '240px', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'; }}
                  />
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="card-title fw-bold text-dark mb-1">{item.nama}</h5>
                      <p className="text-secondary mb-2 small text-uppercase">{item.kategori}</p>
                      <p className="fw-semibold text-danger mb-3">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.harga)}
                      </p>
                    </div>
                    <button className="btn btn-pink w-100 rounded-3 py-2 mt-auto fw-semibold">Beli Sekarang</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  )
}