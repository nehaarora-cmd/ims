import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../api/api';

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkData, setBulkData] = useState('');
    const [bulkError, setBulkError] = useState('');
    const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
    const [bulkUpdateData, setBulkUpdateData] = useState('');
    const [bulkUpdateError, setBulkUpdateError] = useState('');

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

    const handleBulkCreate = async () => {
        try {
            const productsData = JSON.parse(bulkData);
            
            if (!Array.isArray(productsData) || productsData.length === 0) {
                setBulkError('Please provide a valid array of products');
                return;
            }

            const transformedProducts = [];
            for (const p of productsData) {
                if (!p.name) {
                    setBulkError('Each product must have a name');
                    return;
                }
                if (p.quantity === undefined || p.price === undefined) {
                    setBulkError('Each product must have quantity and price');
                    return;
                }

                const newProduct = {
                    name: p.name,
                    description: p.description || '',
                    quantity: p.quantity,
                    price: p.price,
                };

                if (p.category) {
                    const category = categories.find(c => c.name.toLowerCase() === p.category.toLowerCase());
                    if (category) {
                        newProduct.category_id = category.id;
                    } else {
                        setBulkError(`Category "${p.category}" not found. Available: ${categories.map(c => c.name).join(', ')}`);
                        return;
                    }
                } else {
                    newProduct.category_id = null;
                }

                transformedProducts.push(newProduct);
            }

            const response = await productAPI.bulkCreate(transformedProducts);
            setProducts([...products, ...response.data]);
            setShowBulkModal(false);
            setBulkData('');
            setBulkError('');
        } catch (err) {
            if (err instanceof SyntaxError) {
                setBulkError('Invalid JSON format. Please check your data.');
            } else {
                setBulkError(err.response?.data?.error || 'Failed to create products');
            }
        }
    };

    const handleBulkUpdate = async () => {
        try {
            const productsData = JSON.parse(bulkUpdateData);
            
            if (!Array.isArray(productsData) || productsData.length === 0) {
                setBulkUpdateError('Please provide a valid array of products');
                return;
            }

            const transformedProducts = [];
            for (const p of productsData) {
                if (!p.id) {
                    setBulkUpdateError('Each product must have an id');
                    return;
                }

                const updateItem = { id: p.id };

                if (p.name !== undefined) updateItem.name = p.name;
                if (p.description !== undefined) updateItem.description = p.description;
                if (p.quantity !== undefined) updateItem.quantity = p.quantity;
                if (p.price !== undefined) updateItem.price = p.price;

                if (p.category !== undefined) {
                    if (p.category === null || p.category === '') {
                        updateItem.category_id = null;
                    } else {
                        const category = categories.find(c => c.name.toLowerCase() === p.category.toLowerCase());
                        if (category) {
                            updateItem.category_id = category.id;
                        } else {
                            setBulkUpdateError(`Category "${p.category}" not found. Available: ${categories.map(c => c.name).join(', ')}`);
                            return;
                        }
                    }
                }

                transformedProducts.push(updateItem);
            }

            const response = await productAPI.bulkUpdate(transformedProducts);
            const updatedIds = response.data.map(p => p.id);
            setProducts(products.map(p => 
                updatedIds.includes(p.id) ? response.data.find(u => u.id === p.id) : p
            ));
            setShowBulkUpdateModal(false);
            setBulkUpdateData('');
            setBulkUpdateError('');
        } catch (err) {
            if (err instanceof SyntaxError) {
                setBulkUpdateError('Invalid JSON format. Please check your data.');
            } else {
                setBulkUpdateError(err.response?.data?.error || 'Failed to update products');
            }
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
                    <button onClick={() => setShowBulkModal(true)} style={styles.bulkCreateButton}>
                        Bulk Create
                    </button>
                    <button onClick={() => setShowBulkUpdateModal(true)} style={styles.bulkUpdateButton}>
                        Bulk Update
                    </button>
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

            {/* Bulk Create Modal */}
            {showBulkModal && (
                <div style={styles.modalOverlay} onClick={() => setShowBulkModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>Bulk Create Products</h2>
                        <p style={styles.modalDescription}>
                            Paste a JSON array of products below. Each product can have:
                            <br />
                            <code>{'{ "name", "description", "quantity", "price", "category" }'}</code>
                            <br />
                            <span style={{ color: '#ffa502' }}>category: </span>
                            Use the category name. It will be looked up automatically.
                            <br />
                            <span style={{ color: '#00d4aa' }}>Required fields: </span>
                            name, quantity, price
                        </p>

                        <textarea
                            value={bulkData}
                            onChange={(e) => {
                                setBulkData(e.target.value);
                                setBulkError('');
                            }}
                            style={styles.textarea}
                            placeholder='[{"name": "Product", "description": "Desc", "quantity": 10, "price": 9.99, "category": "Electronics"}]'
                            rows={10}
                        />

                        {bulkError && <p style={styles.bulkError}>{bulkError}</p>}

                        <div style={styles.modalActions}>
                            <button onClick={handleBulkCreate} style={styles.submitButton}>
                                Create Products
                            </button>
                            <button onClick={() => {
                                setShowBulkModal(false);
                                setBulkData('');
                                setBulkError('');
                            }} style={styles.cancelButton}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Update Modal */}
            {showBulkUpdateModal && (
                <div style={styles.modalOverlay} onClick={() => setShowBulkUpdateModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>Bulk Update Products</h2>
                        <p style={styles.modalDescription}>
                            Paste a JSON array of products to update. Only fields you include will be updated.
                            <br />
                            <code>{'{ "id", "name", "description", "quantity", "price", "category" }'}</code>
                            <br />
                            <span style={{ color: '#ffa502' }}>id: </span>
                            Required - the ID of the product to update.
                            <br />
                            <span style={{ color: '#ffa502' }}>category: </span>
                            Use the category name. Set to <code>null</code> or empty string to remove category.
                            <br />
                            <span style={{ color: '#00d4aa' }}>Note: </span>
                            Only include the fields you want to change.
                        </p>

                        <textarea
                            value={bulkUpdateData}
                            onChange={(e) => {
                                setBulkUpdateData(e.target.value);
                                setBulkUpdateError('');
                            }}
                            style={styles.textarea}
                            placeholder='[{"id": 1, "name": "Updated Product", "description": "New desc", "quantity": 20, "price": 15.99, "category": "Electronics"}]'
                            rows={10}
                        />

                        {bulkUpdateError && <p style={styles.bulkError}>{bulkUpdateError}</p>}

                        <div style={styles.modalActions}>
                            <button onClick={handleBulkUpdate} style={styles.submitButton}>
                                Update Products
                            </button>
                            <button onClick={() => {
                                setShowBulkUpdateModal(false);
                                setBulkUpdateData('');
                                setBulkUpdateError('');
                            }} style={styles.cancelButton}>
                                Cancel
                            </button>
                        </div>
                    </div>
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
    bulkCreateButton: {
        backgroundColor: '#4facfe',
        color: '#ffffff',
        padding: '10px 20px',
        borderRadius: '6px',
        border: 'none',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    bulkUpdateButton: {
        backgroundColor: '#ffa502',
        color: '#ffffff',
        padding: '10px 20px',
        borderRadius: '6px',
        border: 'none',
        fontSize: '14px',
        fontWeight: '500',
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
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: '#1a1a2e',
        padding: '30px',
        borderRadius: '10px',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #2a2a4e',
    },
    modalTitle: {
        color: '#ffffff',
        fontSize: '22px',
        fontWeight: '600',
        marginBottom: '15px',
    },
    modalDescription: {
        color: '#aaa',
        marginBottom: '20px',
        fontSize: '14px',
        lineHeight: '1.8',
    },
    textarea: {
        width: '100%',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #2a2a4e',
        backgroundColor: '#0f0f1a',
        color: '#e0e0e0',
        fontSize: '13px',
        fontFamily: 'monospace',
        resize: 'vertical',
        minHeight: '200px',
    },
    bulkError: {
        color: '#ff4757',
        marginTop: '12px',
        fontSize: '14px',
    },
    modalActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px',
        flexWrap: 'wrap',
    },
    submitButton: {
        backgroundColor: '#00d4aa',
        color: '#ffffff',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        flex: 1,
    },
    cancelButton: {
        backgroundColor: '#ff4757',
        color: '#ffffff',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
};

export default Products;