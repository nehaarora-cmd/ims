import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productAPI, categoryAPI } from '../api/api';

function Dashboard() {
    const [stats, setStats] = useState({ total: 0, lowStock: 0, categories: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                productAPI.getAll(),
                categoryAPI.getAll()
            ]);

            const products = productsRes.data;
            const total = products.length;
            const lowStock = products.filter(p => p.quantity < 10).length;

            setStats({
                total,
                lowStock,
                categories: categoriesRes.data.length,
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    // Animation variants for staggered card entrance
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1, 
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.3 }}
            style={styles.container}
        >
            <h1 style={styles.title}>Dashboard</h1>
            
            <motion.div 
                style={styles.cards}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} style={styles.card}>
                    <h3>Total Products</h3>
                    <p style={styles.number}>{stats.total}</p>
                </motion.div>
                <motion.div variants={itemVariants} style={{...styles.card, borderColor: '#ff4757'}}>
                    <h3>Low Stock</h3>
                    <p style={{...styles.number, color: '#ff4757'}}>{stats.lowStock}</p>
                </motion.div>
                <motion.div variants={itemVariants} style={{...styles.card, borderColor: '#00d4aa'}}>
                    <h3>Categories</h3>
                    <p style={{...styles.number, color: '#00d4aa'}}>{stats.categories}</p>
                </motion.div>
            </motion.div>

            <motion.div 
                style={styles.actions}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
            >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/products" style={styles.button}>View All Products</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/products/new" style={{...styles.button, backgroundColor: '#00d4aa'}}>Add New Product</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/categories" style={{...styles.button, backgroundColor: '#ff6b6b'}}>Manage Categories</Link>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 20px',
    },
    title: {
        color: '#fff',
        marginBottom: '30px',
    },
    cards: {
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        flexWrap: 'wrap',
    },
    card: {
        backgroundColor: '#1a1a2e',
        padding: '20px',
        borderRadius: '10px',
        flex: 1,
        minWidth: '200px',
        borderLeft: '4px solid #4facfe',
    },
    number: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#4facfe',
        marginTop: '10px',
    },
    actions: {
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
    },
    button: {
        backgroundColor: '#4facfe',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '5px',
        textDecoration: 'none',
        display: 'inline-block',
        cursor: 'pointer',
    },
    loading: {
        color: '#fff',
        textAlign: 'center',
        marginTop: '50px',
    },
};

export default Dashboard;