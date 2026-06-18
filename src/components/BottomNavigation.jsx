import { NavLink } from 'react-router-dom'

export default function BottomNavigation() {
  return (
    <nav className="bottom-nav py-3 shadow-sm d-flex d-md-none justify-content-center">
      <div className="d-flex gap-3 bg-white rounded-5 px-3 py-2 shadow-sm">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `nav-link text-center px-3 py-2 rounded-4 ${isActive ? 'active text-plum' : 'text-soft-muted'}`
          }
        >
          <div className="fs-5">🏠</div>
          <div className="small">Home</div>
        </NavLink>
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `nav-link text-center px-3 py-2 rounded-4 ${isActive ? 'active text-plum' : 'text-soft-muted'}`
          }
        >
          <div className="fs-5">🛍️</div>
          <div className="small">Cart</div>
        </NavLink>
        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            `nav-link text-center px-3 py-2 rounded-4 ${isActive ? 'active text-plum' : 'text-soft-muted'}`
          }
        >
          <div className="fs-5">❤️</div>
          <div className="small">Wishlist</div>
        </NavLink>
        <NavLink
          to="/alamat"
          className={({ isActive }) =>
            `nav-link text-center px-3 py-2 rounded-4 ${isActive ? 'active text-plum' : 'text-soft-muted'}`
          }
        >
          <div className="fs-5">📍</div>
          <div className="small">Alamat</div>
        </NavLink>
      </div>
    </nav>
  )
}
