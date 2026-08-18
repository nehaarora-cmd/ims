import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api/api';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await API.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const formVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1, 
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div style={styles.container}>
            <motion.div 
                style={styles.card}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
            >
                <h1 style={styles.title}>Login</h1>
                {error && <p style={styles.error}>{error}</p>}
                
                <motion.form 
                    onSubmit={handleSubmit}
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.input
                        variants={itemVariants}
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <motion.input
                        variants={itemVariants}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <motion.button 
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit" 
                        style={styles.button}
                    >
                        Login
                    </motion.button>
                </motion.form>
                
                <p style={styles.footer}>
                    Don't have an account?{' '}
                    <motion.span
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ display: 'inline-block' }}
                    >
                        <Link to="/register" style={styles.link}>Register</Link>
                    </motion.span>
                </p>
            </motion.div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#16213e',
    },
    card: {
        backgroundColor: '#1a1a2e',
        padding: '40px',
        borderRadius: '10px',
        width: '400px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    },
    title: {
        color: '#fff',
        textAlign: 'center',
        marginBottom: '30px',
    },
    input: {
        width: '100%',
        padding: '12px',
        marginBottom: '15px',
        borderRadius: '5px',
        border: '1px solid #333',
        backgroundColor: '#2a2a4e',
        color: '#fff',
        fontSize: '16px',
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#4facfe',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer',
    },
    error: {
        color: '#ff4757',
        textAlign: 'center',
        marginBottom: '15px',
    },
    footer: {
        color: '#ccc',
        textAlign: 'center',
        marginTop: '20px',
    },
    link: {
        color: '#4facfe',
        textDecoration: 'none',
    },
};

export default Login;