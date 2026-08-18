import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api/api';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await API.post('/auth/register', { email, password });
            setSuccess('Registration successful! Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
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
                <h1 style={styles.title}>Register</h1>
                
                {error && (
                    <motion.p 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={styles.error}
                    >
                        {error}
                    </motion.p>
                )}
                
                {success && (
                    <motion.p 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={styles.success}
                    >
                        {success}
                    </motion.p>
                )}
                
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
                        Register
                    </motion.button>
                </motion.form>
                
                <p style={styles.footer}>
                    Already have an account?{' '}
                    <motion.span
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ display: 'inline-block' }}
                    >
                        <Link to="/login" style={styles.link}>Login</Link>
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
    success: {
        color: '#00d4aa',
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

export default Register;