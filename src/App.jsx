import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import AdminLogin from './pages/Auth/AdminLogin'
import ForgotPassword from './pages/Auth/ForgotPassword'
import Home from './pages/Pelanggan/Home'
import Cart from './pages/Pelanggan/Cart'
import Wishlist from './pages/Pelanggan/Wishlist'
import Alamat from './pages/Pelanggan/Alamat'
import ProductDetail from './pages/Pelanggan/ProductDetail'
import SearchResults from './pages/Pelanggan/SearchResults'
import Profile from './pages/Pelanggan/Profile'
import Notifications from './pages/Pelanggan/Notifications'
import Dashboard from './pages/Admin/Dashboard'
import NotificationsAdmin from './pages/Admin/Notifications'
import KelolaProduk from './pages/Admin/KelolaProduk'
import KelolaPelanggan from './pages/Admin/KelolaPelanggan'

const getToken = () => localStorage.getItem('token')
const getRole = () => localStorage.getItem('user_role')

function RequireAuth({ children }) {
  if (!getToken() || !getRole()) {
    return <Navigate to="/login" replace />
  }
  return children
}

function RequireRole({ role, children }) {
  if (getRole() !== role) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Pelanggan / Customer Routes */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <RequireRole role="pelanggan">
                <Home />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/cart"
          element={
            <RequireAuth>
              <RequireRole role="pelanggan">
                <Cart />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/wishlist"
          element={
            <RequireAuth>
              <RequireRole role="pelanggan">
                <Wishlist />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <RequireRole role="pelanggan">
                <Profile />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/search"
          element={
            <RequireAuth>
              <RequireRole role="pelanggan">
                <SearchResults />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <RequireRole role="pelanggan">
                <Notifications />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/alamat"
          element={
            <RequireAuth>
              <RequireRole role="pelanggan">
                <Alamat />
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Detail Produk - Menggunakan Parameter Database Asli (:id_produk) */}
        <Route
          path="/product/:id_produk"
          element={
            <RequireAuth>
              <RequireRole role="pelanggan">
                <ProductDetail />
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth>
              <RequireRole role="admin">
                <Dashboard />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/kelola-produk"
          element={
            <RequireAuth>
              <RequireRole role="admin">
                <KelolaProduk />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/kelola-pelanggan"
          element={
            <RequireAuth>
              <RequireRole role="admin">
                <KelolaPelanggan />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <RequireAuth>
              <RequireRole role="admin">
                <NotificationsAdmin />
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Default and Fallback Routes */}
        <Route 
          path="/" 
          element={
            <Navigate to={getToken() ? (getRole() === 'admin' ? '/admin/dashboard' : '/home') : '/login'} replace />
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App