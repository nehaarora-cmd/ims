import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Dashboard</h1>
            <div style={styles.cards}>
                <div style={styles.card}>
                    <h3>Total Products</h3>
                    <p style={styles.number}>{stats.total}</p>
                </div>
                <div style={{...styles.card, borderColor: '#ff4757'}}>
                    <h3>Low Stock</h3>
                    <p style={{...styles.number, color: '#ff4757'}}>{stats.lowStock}</p>
                </div>
                <div style={{...styles.card, borderColor: '#00d4aa'}}>
                    <h3>Categories</h3>
                    <p style={{...styles.number, color: '#00d4aa'}}>{stats.categories}</p>
                </div>
            </div>
            <div style={styles.actions}>
                <Link to="/products" style={styles.button}>View All Products</Link>
                <Link to="/products/new" style={{...styles.button, backgroundColor: '#00d4aa'}}>Add New Product</Link>
                <Link to="/categories" style={{...styles.button, backgroundColor: '#ff6b6b'}}>Manage Categories</Link>
            </div>
        </div>
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
    },
    loading: {
        color: '#fff',
        textAlign: 'center',
        marginTop: '50px',
    },
};

export default Dashboard;