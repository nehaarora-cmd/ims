import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../api/api';

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productAPI.getAll();
            setProducts(response.data);
        } catch (err) {
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll();
            setCategories(response.data);
        } catch (err) {
            console.error('Failed to fetch categories');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await productAPI.delete(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    const handleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === products.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.map(p => p.id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Delete ${selectedIds.length} products?`)) return;

        try {
            await productAPI.bulkDelete(selectedIds);
            setProducts(products.filter(p => !selectedIds.includes(p.id)));
            setSelectedIds([]);
        } catch (err) {
            alert('Failed to delete products');
        }
    };

    const getCategoryName = (categoryId) => {
        if (!categoryId) return 'Uncategorized';
        const cat = categories.find(c => c.id === categoryId);
        return cat ? cat.name : 'Uncategorized';
    };

    const getLowStockClass = (quantity) => {
        if (quantity < 5) return 'critical';
        if (quantity < 10) return 'warning';
        return '';
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;
    if (error) return <div style={styles.error}>{error}</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Products</h1>
                <div style={styles.actions}>
                    <Link to="/products/new" style={styles.addButton}>Add Product</Link>
                    <Link to="/products/bulk" style={styles.bulkButton}>Bulk Operations</Link>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div style={styles.bulkActions}>
                    <span>{selectedIds.length} selected</span>
                    <button onClick={handleBulkDelete} style={styles.bulkDeleteButton}>
                        Delete Selected
                    </button>
                </div>
            )}

            {products.length === 0 ? (
                <p style={styles.empty}>No products yet. Create your first product.</p>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === products.length && products.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Description</th>
                                <th style={styles.th}>Category</th>
                                <th style={styles.th}>Quantity</th>
                                <th style={styles.th}>Price</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => {
                                const stockClass = getLowStockClass(product.quantity);
                                return (
                                    <tr key={product.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(product.id)}
                                                onChange={() => handleSelect(product.id)}
                                            />
                                        </td>
                                        <td style={{...styles.td, ...styles.idCell}}>{product.id}</td>
                                        <td style={styles.td}>{product.name}</td>
                                        <td style={styles.td}>{product.description || '-'}</td>
                                        <td style={styles.td}>{getCategoryName(product.category_id)}</td>
                                        <td style={{
                                            ...styles.td,
                                            ...styles.quantity,
                                            ...(stockClass === 'critical' ? styles.critical : {}),
                                            ...(stockClass === 'warning' ? styles.warning : {})
                                        }}>
                                            {product.quantity}
                                            {stockClass === 'critical' && ' (Critical)'}
                                            {stockClass === 'warning' && ' (Low)'}
                                        </td>
                                        <td style={styles.td}>₹{parseFloat(product.price).toFixed(2)}</td>
                                        <td style={styles.td}>
                                            <Link to={`/products/${product.id}/edit`} style={styles.editButton}>Edit</Link>
                                            <button onClick={() => handleDelete(product.id)} style={styles.deleteButton}>Delete</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 20px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '10px',
    },
    title: {
        color: '#ffffff',
        fontSize: '24px',
        fontWeight: '600',
        margin: 0,
    },
    actions: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
    },
    addButton: {
        backgroundColor: '#00d4aa',
        color: '#ffffff',
        padding: '10px 20px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    bulkButton: {
        backgroundColor: '#4facfe',
        color: '#ffffff',
        padding: '10px 20px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    bulkActions: {
        backgroundColor: '#1a1a2e',
        padding: '15px 20px',
        borderRadius: '6px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#ffffff',
        border: '1px solid #333',
    },
    bulkDeleteButton: {
        backgroundColor: '#ff4757',
        color: '#ffffff',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    tableContainer: {
        overflowX: 'auto',
        borderRadius: '8px',
        border: '1px solid #2a2a4e',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: '#1a1a2e',
    },
    th: {
        padding: '14px 16px',
        textAlign: 'left',
        color: '#aaa',
        fontSize: '13px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '2px solid #2a2a4e',
        backgroundColor: '#0f0f1a',
    },
    tr: {
        borderBottom: '1px solid #2a2a4e',
    },
    td: {
        padding: '12px 16px',
        color: '#e0e0e0',
        fontSize: '14px',
        verticalAlign: 'middle',
    },
    idCell: {
        color: '#666',
        fontSize: '13px',
        fontFamily: 'monospace',
    },
    quantity: {
        fontWeight: '500',
    },
    critical: {
        color: '#ff4757',
    },
    warning: {
        color: '#ffa502',
    },
    editButton: {
        backgroundColor: '#4facfe',
        color: '#ffffff',
        padding: '4px 12px',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '13px',
        marginRight: '6px',
        display: 'inline-block',
        border: 'none',
        cursor: 'pointer',
    },
    deleteButton: {
        backgroundColor: '#ff4757',
        color: '#ffffff',
        border: 'none',
        padding: '4px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '13px',
    },
    loading: {
        color: '#aaa',
        textAlign: 'center',
        marginTop: '60px',
        fontSize: '16px',
    },
    error: {
        color: '#ff4757',
        textAlign: 'center',
        marginTop: '60px',
        fontSize: '16px',
    },
    empty: {
        color: '#aaa',
        textAlign: 'center',
        marginTop: '60px',
        fontSize: '16px',
    },
};

export default Products;