import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import KeycapDesigner from './pages/KeycapDesigner'
import NotFound from './pages/NotFound'

import AccountLayout from './pages/account/AccountLayout'
import Profile from './pages/account/Profile'
import Orders from './pages/account/Orders'
import OrderDetail from './pages/account/OrderDetail'
import Designs from './pages/account/Designs'

import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/productos" element={<Catalog />} />
        <Route path="/productos/:slug" element={<ProductDetail />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/personalizar" element={<KeycapDesigner />} />
        <Route path="/personalizar/:id" element={<KeycapDesigner />} />

        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/pedido/:number" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

        <Route path="/cuenta" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
          <Route index element={<Profile />} />
          <Route path="pedidos" element={<Orders />} />
          <Route path="pedidos/:number" element={<OrderDetail />} />
          <Route path="disenos" element={<Designs />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="productos" element={<AdminProducts />} />
        <Route path="pedidos" element={<AdminOrders />} />
        <Route path="usuarios" element={<AdminUsers />} />
      </Route>
    </Routes>
  )
}
