import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import aurelieLogo from '../assets/aurelie-logo.svg'

export default function NavbarPelanggan() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const storedCount = Number(localStorage.getItem('cart_count') || 0)
    setCartCount(Number.isNaN(storedCount) ? 0 : storedCount)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_role')
    navigate('/login')
  }

  const handleSearch = (event) => {
    event.preventDefault()
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <nav className="navbar px-4 py-3 bg-white border-bottom border-soft-muted shadow-sm">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <img src={aurelieLogo} alt="Aurélie" style={{ height: 40 }} />
          <Link to="/home" className="navbar-brand mb-0 brand-title text-plum text-decoration-none" style={{ fontSize: 24 }}>
            Aurélie
          </Link>
        </div>

        <form className="input-group w-50 mx-auto" onSubmit={handleSearch}>
          <input
            type="search"
            className="form-control rounded-start-4"
            placeholder="Search premium beauty"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit" className="btn btn-pink rounded-end-4">
            Search
          </button>
        </form>

        <div className="d-flex align-items-center gap-3">
          <Link to="/home" className="btn btn-link p-0 text-plum" aria-label="Home" style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
              <path d="M3 12l9-9 9 9"></path>
              <path d="M9 21V12h6v9"></path>
            </svg>
          </Link>
          <Link to="/search" className="btn btn-link p-0 text-plum" aria-label="Search" style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </Link>
          <Link to="/notifications" className="btn btn-link p-0 text-plum position-relative" aria-label="Notifications" style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle badge-soft-pink" style={{ fontSize: 10 }}>3</span>
          </Link>
          <Link to="/cart" className="btn btn-link p-0 text-plum position-relative" aria-label="Cart" style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
              <path d="M6 6h15l-1.5 9h-12z"></path>
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
            </svg>
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger text-white" style={{ fontSize: 10, width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            )}
          </Link>
          <Link to="/wishlist" className="btn btn-link p-0 text-plum position-relative" aria-label="Wishlist" style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </Link>
          <Link to="/profile" className="btn btn-link p-0 text-plum" aria-label="Profile" style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
          <button className="btn btn-sm btn-outline-plum rounded-pill px-3 py-2" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
