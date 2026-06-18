import { NavLink, useNavigate } from 'react-router-dom'
import aurelieLogo from '../assets/aurelie-logo.svg'

export default function SidebarAdmin() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_role')
    navigate('/login')
  }

  return (
    <div className="d-flex flex-column vh-100 bg-light border-end p-3 sidebar-admin" style={{ minWidth: '220px' }}>
      <div className="mb-4 d-flex align-items-center gap-3">
        <img src={aurelieLogo} alt="logo" style={{ width: 48, height: 48, borderRadius: 12 }} />
        <div>
          <h6 className="text-pink fw-bold mb-0">Aurélie Admin</h6>
          <p className="text-muted small mb-0">Panel kontrol</p>
        </div>
      </div>
      <nav className="nav flex-column gap-2">
        <NavLink className={({ isActive }) => `nav-link rounded-pill px-3 py-2 ${isActive ? 'bg-pink text-white' : 'text-dark'}`} to="/admin/dashboard">
          Dashboard
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link rounded-pill px-3 py-2 ${isActive ? 'bg-pink text-white' : 'text-dark'}`} to="/admin/kelola-produk">
          Kelola Produk
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link rounded-pill px-3 py-2 ${isActive ? 'bg-pink text-white' : 'text-dark'}`} to="/admin/kelola-pelanggan">
          Daftar Pelanggan
        </NavLink>
        <button className="btn btn-outline-danger rounded-pill mt-4" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </div>
  )
}
