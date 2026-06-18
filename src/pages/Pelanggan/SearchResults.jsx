import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/produk')
        const payload = response.data.data ?? response.data ?? response.data.produk ?? []
        const productList = Array.isArray(payload) ? payload : payload.data || []
        
        // Menormalisasi data produk dan mengamankan properti ID
        const normalized = productList.map((item, index) => ({
          ...item,
          id_produk: item.id_produk ?? item.id ?? index
        }))

        setProducts(normalized)
      } catch (err) {
        console.error("Gagal memuat produk:", err)
        setProducts([])
      } finally { // SUDAH DIPERBAIKI: Sebelumnya tertulis 'empty' yang memicu error
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    if (!query) return []
    return products.filter((item) => {
      const name = item.nama_produk || item.nama || ''
      const category = item.kategori?.nama_kategori || item.kategori?.name || item.kategori || item.category || ''
      return [name, category].some((value) => value.toLowerCase().includes(query.toLowerCase()))
    })
  }, [products, query])

  const handleSearch = (event) => {
    event.preventDefault()
    setSearchParams({ q: query })
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card rounded-4 shadow-soft p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h2 className="mb-1">Search Results</h2>
                <p className="text-soft-muted mb-0">Search the Aurélie catalog by product name, category, or keyword.</p>
              </div>
              <Link to="/home" className="btn btn-outline-plum rounded-pill">Home</Link>
            </div>

            <form onSubmit={handleSearch} className="mb-4">
              <div className="input-group">
                <input
                  type="search"
                  className="form-control form-control-lg rounded-start-4"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-pink rounded-end-4">Search</button>
              </div>
            </form>

            {loading ? (
              <div className="text-center py-5 text-muted">Memuat hasil pencarian...</div>
            ) : !query ? (
              <div className="alert alert-info">Masukkan kata kunci untuk mencari produk di katalog.</div>
            ) : filteredProducts.length === 0 ? (
              <div className="alert alert-warning">Tidak ada produk untuk kata kunci "{query}".</div>
            ) : (
              <div className="row g-4">
                {filteredProducts.map((item, index) => {
                  const id = item.id_produk
                  const name = item.nama_produk || item.nama || 'Produk'
                  const category = item.kategori?.nama_kategori || item.kategori?.name || item.kategori || item.category || 'Kategori'
                  
                  return (
                    // DIPERBAIKI: Menggabungkan id dan index agar key dijamin 100% unik dan tidak memicu warning lagi
                    <div key={`${id}-${index}`} className="col-12 col-md-6">
                      <Link to={`/product/${id}`} className="text-decoration-none text-dark">
                        <div className="card rounded-4 border border-soft-muted p-3 h-100">
                          <h5>{name}</h5>
                          <p className="text-soft-muted mb-0">{category}</p>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}