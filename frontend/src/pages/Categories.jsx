import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../api/api';

function Categories() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll();
            setCategories(response.data);
        } catch (err) {
            setError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        try {
            const response = await categoryAPI.create({ name: newCategory });
            setCategories([...categories, response.data]);
            setNewCategory('');
        } catch (err) {
            alert('Failed to create category');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category?')) return;
        try {
            await categoryAPI.delete(id);
            setCategories(categories.filter(c => c.id !== id));
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Categories</h1>

            <form onSubmit={handleCreate} style={styles.form}>
                <input
                    type="text"
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Add Category</button>
            </form>

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.list}>
                {categories.length === 0 ? (
                    <p style={styles.empty}>No categories yet. Create one!</p>
                ) : (
                    categories.map(cat => (
                        <div key={cat.id} style={styles.item}>
                            <span>{cat.name}</span>
                            <button onClick={() => handleDelete(cat.id)} style={styles.deleteBtn}>Delete</button>
                        </div>
                    ))
                )}
            </div>
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
        gap: '10px',
        marginBottom: '30px',
    },
    input: {
        flex: 1,
        padding: '12px',
        borderRadius: '5px',
        border: '1px solid #333',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        fontSize: '16px',
    },
    button: {
        padding: '12px 24px',
        backgroundColor: '#4facfe',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        backgroundColor: '#1a1a2e',
        borderRadius: '5px',
        border: '1px solid #333',
        color: '#fff',
    },
    deleteBtn: {
        backgroundColor: '#ff4757',
        color: '#fff',
        border: 'none',
        padding: '5px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    error: {
        color: '#ff4757',
        marginBottom: '15px',
    },
    empty: {
        color: '#aaa',
        textAlign: 'center',
        marginTop: '30px',
    },
    loading: {
        color: '#fff',
        textAlign: 'center',
        marginTop: '50px',
    },
};

export default Categories;