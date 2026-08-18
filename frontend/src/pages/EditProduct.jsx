import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/api';

function EditProduct() {
    const { id } = useParams();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await API.get(`/products/${id}`);
            const product = response.data;
            setName(product.name);
            setDescription(product.description);
            setQuantity(product.quantity.toString());
            setPrice(product.price.toString());
        } catch (err) {
            setError('Failed to fetch product');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await API.patch(`/products/${id}`, {
                name,
                description,
                quantity: parseInt(quantity),
                price: parseFloat(price),
            });
            navigate('/products');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update product');
        }
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Edit Product</h1>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="text"
                    placeholder="Product Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                    required
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.textarea}
                />
                <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={styles.input}
                    required
                />
                <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={styles.input}
                    required
                />
                <div style={styles.actions}>
                    <button type="submit" style={styles.submitButton}>Update Product</button>
                    <button type="button" onClick={() => navigate('/products')} style={styles.cancelButton}>Cancel</button>
                </div>
            </form>
        </div>
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
    loading: {
        color: '#fff',
        textAlign: 'center',
        marginTop: '50px',
    },
};

export default EditProduct;