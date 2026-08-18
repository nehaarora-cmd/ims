import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import CreateProduct from './pages/CreateProduct';
import EditProduct from './pages/EditProduct';
import Categories from './pages/Categories';
import BulkOperations from './pages/BulkOperations';
import './index.css';

// Separate component to handle animations safely inside the Router
function AnimatedRoutes() {
    const location = useLocation(); // Safe to use here!

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                        <Login />
                    </motion.div>
                } />
                <Route path="/register" element={
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                        <Register />
                    </motion.div>
                } />
                <Route path="/" element={
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    </motion.div>
                } />
                <Route path="/dashboard" element={
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    </motion.div>
                } />
                <Route path="/products" element={
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                        <ProtectedRoute>
                            <Products />
                        </ProtectedRoute>
                    </motion.div>
                } />
                <Route path="/products/new" element={
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                        <ProtectedRoute>
                            <CreateProduct />
                        </ProtectedRoute>
                    </motion.div>
                } />
                <Route path="/products/:id/edit" element={
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                        <ProtectedRoute>
                            <EditProduct />
                        </ProtectedRoute>
                    </motion.div>
                } />
                <Route path="/products/bulk" element={
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                        <ProtectedRoute>
                            <BulkOperations />
                        </ProtectedRoute>
                    </motion.div>
                } />
                <Route path="/categories" element={
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                        <ProtectedRoute>
                            <Categories />
                        </ProtectedRoute>
                    </motion.div>
                } />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <AnimatedRoutes />
        </BrowserRouter>
    );
}

export default App;