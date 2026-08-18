import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!token) return null;

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>
                <Link to="/dashboard" style={styles.logo}>IMS</Link>
                <div style={styles.links}>
                    <Link to="/dashboard" style={styles.link}>Dashboard</Link>
                    <Link to="/products" style={styles.link}>Products</Link>
                    <Link to="/categories" style={styles.link}>Categories</Link>
                    <Link to="/products/new" style={styles.link}>Add Product</Link>
                    <button onClick={handleLogout} style={styles.logout}>Logout</button>
                </div>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        backgroundColor: '#1a1a2e',
        padding: '15px 0',
        borderBottom: '2px solid #4facfe',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
    },
    logo: {
        color: '#fff',
        fontSize: '24px',
        fontWeight: 'bold',
        textDecoration: 'none',
    },
    links: {
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    link: {
        color: '#ccc',
        textDecoration: 'none',
        fontSize: '16px',
    },
    logout: {
        backgroundColor: '#ff4757',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};

export default Navbar;