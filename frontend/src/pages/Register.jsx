import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Register</h1>
                {error && <p style={styles.error}>{error}</p>}
                {success && <p style={styles.success}>{success}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <button type="submit" style={styles.button}>Register</button>
                </form>
                <p style={styles.footer}>
                    Already have an account? <Link to="/login" style={styles.link}>Login</Link>
                </p>
            </div>
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