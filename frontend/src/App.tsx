import { Navigate, Route, Routes } from 'react-router-dom'
import { Header } from './widgets/header/Header'
import { Footer } from './widgets/footer/Footer'
import CatalogPage from './pages/catalog'
import ProductPage from './pages/product'
import CartPage from './pages/cart'
import CheckoutPage from './pages/checkout'
import ConfirmationPage from './pages/confirmation'

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/catalog" replace />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route
          path="/confirmation/:orderNumber"
          element={<ConfirmationPage />}
        />
        <Route path="*" element={<Navigate to="/catalog" replace />} />
      </Routes>
      <Footer />
    </>
  )
}
