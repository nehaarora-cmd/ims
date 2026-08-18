import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API, { categoryAPI } from '../api/api';

function CreateProduct() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll();
            setCategories(response.data);
        } catch (err) {
            console.error('Failed to fetch categories');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await API.post('/products', {
                name,
                description,
                quantity: parseInt(quantity),
                price: parseFloat(price),
                category_id: categoryId || null,
            });
            navigate('/products');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create product');
        }
    };

    // Variants for staggered form entrance
    const formVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.3 }}
            style={styles.container}
        >
            <h1 style={styles.title}>Add Product</h1>
            {error && <p style={styles.error}>{error}</p>}
            
            <motion.form 
                onSubmit={handleSubmit} 
                style={styles.form}
                variants={formVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.input
                    variants={itemVariants}
                    type="text"
                    placeholder="Product Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                    required
                />
                <motion.textarea
                    variants={itemVariants}
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.textarea}
                />
                <motion.select
                    variants={itemVariants}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    style={styles.input}
                >
                    <option value="">No Category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </motion.select>
                <motion.input
                    variants={itemVariants}
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={styles.input}
                    required
                />
                <motion.input
                    variants={itemVariants}
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={styles.input}
                    required
                />
                <motion.div variants={itemVariants} style={styles.actions}>
                    <motion.button 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.95 }}
                        type="submit" 
                        style={styles.submitButton}
                    >
                        Create Product
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.95 }}
                        type="button" 
                        onClick={() => navigate('/products')} 
                        style={styles.cancelButton}
                    >
                        Cancel
                    </motion.button>
                </motion.div>
            </motion.form>
        </motion.div>
    );
}

const styles = {
    container: {
        maxWidth: '600px',
        margin: '40px auto',
        padding: '0 20px',
    },
    title: {
        color: '#fff',
        marginBottom: '30px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    input: {
        padding: '12px',
        borderRadius: '5px',
        border: '1px solid #333',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        fontSize: '16px',
    },
    textarea: {
        padding: '12px',
        borderRadius: '5px',
        border: '1px solid #333',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        fontSize: '16px',
        minHeight: '100px',
        fontFamily: 'inherit',
    },
    actions: {
        display: 'flex',
        gap: '15px',
    },
    submitButton: {
        backgroundColor: '#4facfe',
        color: '#fff',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        flex: 1,
    },
    cancelButton: {
        backgroundColor: '#ff4757',
        color: '#fff',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    error: {
        color: '#ff4757',
        marginBottom: '15px',
    },
};

export default CreateProduct;