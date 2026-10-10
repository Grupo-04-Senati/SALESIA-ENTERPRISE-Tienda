import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { PrankProvider } from './prank/PrankContext'
import PrankOverlay from './prank/PrankOverlay'
import Header from './components/Header'
import Footer from './components/Footer'
import CartSidebar from './components/CartSidebar'
import WhatsAppButton from './components/WhatsAppButton'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Contact from './pages/Contact'
import Ingresar from './pages/Ingresar'
import Registro from './pages/Registro'
import Cuenta from './pages/Cuenta'
import Pago from './pages/Pago'
import NotFound from './pages/NotFound'

function App() {
  return (
    <PrankProvider defaultArmed>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-[var(--color-primary)] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:outline-none"
            >
              Saltar al contenido principal
            </a>
            <ScrollToTop />
            <Header />
            <CartSidebar />
            <WhatsAppButton />
            <main id="main-content" className="flex-1" role="main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/contacto" element={<Contact />} />
                <Route path="/ingresar" element={<Ingresar />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/cuenta" element={<Cuenta />} />
                <Route path="/pago/:saleId" element={<Pago />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
      <PrankOverlay />
    </PrankProvider>
  )
}

export default App
