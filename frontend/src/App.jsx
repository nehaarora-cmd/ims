import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import CreateProduct from './pages/CreateProduct';
import EditProduct from './pages/EditProduct';
import Categories from './pages/Categories';
import './index.css';

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/products" element={
                    <ProtectedRoute>
                        <Products />
                    </ProtectedRoute>
                } />
                <Route path="/products/new" element={
                    <ProtectedRoute>
                        <CreateProduct />
                    </ProtectedRoute>
                } />
                <Route path="/products/:id/edit" element={
                    <ProtectedRoute>
                        <EditProduct />
                    </ProtectedRoute>
                } />
                <Route path="/categories" element={
                    <ProtectedRoute>
                        <Categories />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;