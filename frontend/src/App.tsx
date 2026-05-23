import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Header } from './widgets/header/Header'
import { Footer } from './widgets/footer/Footer'
import { AdminLayout } from './widgets/admin-layout/AdminLayout'
import CatalogPage from './pages/catalog'
import ProductPage from './pages/product'
import CartPage from './pages/cart'
import CheckoutPage from './pages/checkout'
import ConfirmationPage from './pages/confirmation'
import AdminLoginPage from './pages/admin/login'
import AdminProductsPage from './pages/admin/products'
import AdminOrdersPage from './pages/admin/orders'
import { RequireAdmin } from './pages/admin/RequireAdmin'

function CustomerLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Navigate to="/catalog" replace />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/confirmation/:orderNumber" element={<ConfirmationPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="/admin/products" replace />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/catalog" replace />} />
    </Routes>
  )
}
