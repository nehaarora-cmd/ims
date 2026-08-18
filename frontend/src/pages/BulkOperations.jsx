import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI, categoryAPI } from '../api/api';

function BulkOperations() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- Bulk Create State ---
    const [createRows, setCreateRows] = useState([
        { name: '', description: '', quantity: 0, price: 0, category: '' }
    ]);

    // --- Bulk Update State ---
    const [updateRows, setUpdateRows] = useState([
        { id: '', name: '', description: '', quantity: '', price: '', category: '' }
    ]);

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

    // --- Create Handlers ---
    const handleCreateChange = (index, field, value) => {
        const updated = [...createRows];
        updated[index][field] = value;
        setCreateRows(updated);
    };

    const addCreateRow = () => {
        setCreateRows([...createRows, { name: '', description: '', quantity: 0, price: 0, category: '' }]);
    };

    const removeCreateRow = (index) => {
        if (createRows.length === 1) return;
        setCreateRows(createRows.filter((_, i) => i !== index));
    };

    const handleBulkCreate = async () => {
        setError('');
        setLoading(true);

        // Transform GUI rows into the JSON format your backend expects
        const payload = createRows.map(row => {
            const categoryObj = categories.find(c => c.name.toLowerCase() === row.category.toLowerCase());
            return {
                name: row.name,
                description: row.description,
                quantity: parseInt(row.quantity) || 0,
                price: parseFloat(row.price) || 0,
                category_id: categoryObj ? categoryObj.id : null
            };
        });

        try {
            await productAPI.bulkCreate(payload);
            alert('Products created successfully!');
            navigate('/products'); // Go back to main product list
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create products');
        } finally {
            setLoading(false);
        }
    };

    // --- Update Handlers ---
    const handleUpdateChange = (index, field, value) => {
        const updated = [...updateRows];
        updated[index][field] = value;
        setUpdateRows(updated);
    };

    const addUpdateRow = () => {
        setUpdateRows([...updateRows, { id: '', name: '', description: '', quantity: '', price: '', category: '' }]);
    };

    const removeUpdateRow = (index) => {
        if (updateRows.length === 1) return;
        setUpdateRows(updateRows.filter((_, i) => i !== index));
    };

    const handleBulkUpdate = async () => {
        setError('');
        setLoading(true);

        const payload = updateRows
            .filter(row => row.id) // Only include rows with an ID
            .map(row => {
                const categoryObj = categories.find(c => c.name.toLowerCase() === row.category.toLowerCase());
                return {
                    id: parseInt(row.id),
                    name: row.name || undefined,
                    description: row.description || undefined,
                    quantity: row.quantity !== '' ? parseInt(row.quantity) : undefined,
                    price: row.price !== '' ? parseFloat(row.price) : undefined,
                    category_id: row.category ? (categoryObj ? categoryObj.id : null) : undefined
                };
            });

        if (payload.length === 0) {
            setError('Please provide at least one valid Product ID to update.');
            setLoading(false);
            return;
        }

        try {
            await productAPI.bulkUpdate(payload);
            alert('Products updated successfully!');
            navigate('/products');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update products');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.3 }}
            style={styles.container}
        >
            <div style={styles.header}>
                <h1 style={styles.title}>Bulk Operations</h1>
                <Link to="/products" style={styles.backButton}>← Back to Products</Link>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            {/* ---------------- BULK CREATE SECTION ---------------- */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Bulk Create Products</h2>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Description</th>
                                <th style={styles.th}>Quantity</th>
                                <th style={styles.th}>Price</th>
                                <th style={styles.th}>Category</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {createRows.map((row, index) => (
                                    <motion.tr 
                                        key={index} 
                                        layout
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.15 }}
                                        style={styles.tr}
                                    >
                                        <td style={styles.td}>
                                            <input 
                                                style={styles.input} 
                                                value={row.name} 
                                                onChange={(e) => handleCreateChange(index, 'name', e.target.value)} 
                                                placeholder="Product name"
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <input 
                                                style={styles.input} 
                                                value={row.description} 
                                                onChange={(e) => handleCreateChange(index, 'description', e.target.value)} 
                                                placeholder="Description"
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <input 
                                                style={styles.input} 
                                                type="number" 
                                                value={row.quantity} 
                                                onChange={(e) => handleCreateChange(index, 'quantity', e.target.value)} 
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <input 
                                                style={styles.input} 
                                                type="number" 
                                                step="0.01"
                                                value={row.price} 
                                                onChange={(e) => handleCreateChange(index, 'price', e.target.value)} 
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <select 
                                                style={styles.select} 
                                                value={row.category} 
                                                onChange={(e) => handleCreateChange(index, 'category', e.target.value)}
                                            >
                                                <option value="">Uncategorized</option>
                                                {categories.map(c => (
                                                    <option key={c.id} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={styles.td}>
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }} 
                                                whileTap={{ scale: 0.9 }}
                                                style={styles.removeBtn} 
                                                onClick={() => removeCreateRow(index)}
                                            >
                                                ✕
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.95 }}
                    style={styles.addRowBtn} 
                    onClick={addCreateRow}
                >
                    + Add Row
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.95 }}
                    style={styles.submitBtn} 
                    onClick={handleBulkCreate} 
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create Products'}
                </motion.button>
            </div>

            <hr style={styles.divider} />

            {/* ---------------- BULK UPDATE SECTION ---------------- */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Bulk Update Products</h2>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>ID (Required)</th>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Description</th>
                                <th style={styles.th}>Quantity</th>
                                <th style={styles.th}>Price</th>
                                <th style={styles.th}>Category</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {updateRows.map((row, index) => (
                                    <motion.tr 
                                        key={index} 
                                        layout
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.15 }}
                                        style={styles.tr}
                                    >
                                        <td style={styles.td}>
                                            <input 
                                                style={styles.input} 
                                                value={row.id} 
                                                onChange={(e) => handleUpdateChange(index, 'id', e.target.value)} 
                                                placeholder="e.g. 1"
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <input 
                                                style={styles.input} 
                                                value={row.name} 
                                                onChange={(e) => handleUpdateChange(index, 'name', e.target.value)} 
                                                placeholder="Leave blank to skip"
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <input 
                                                style={styles.input} 
                                                value={row.description} 
                                                onChange={(e) => handleUpdateChange(index, 'description', e.target.value)} 
                                                placeholder="Leave blank to skip"
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <input 
                                                style={styles.input} 
                                                type="number" 
                                                value={row.quantity} 
                                                onChange={(e) => handleUpdateChange(index, 'quantity', e.target.value)} 
                                                placeholder="Leave blank to skip"
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <input 
                                                style={styles.input} 
                                                type="number" 
                                                step="0.01"
                                                value={row.price} 
                                                onChange={(e) => handleUpdateChange(index, 'price', e.target.value)} 
                                                placeholder="Leave blank to skip"
                                            />
                                        </td>
                                        <td style={styles.td}>
                                            <select 
                                                style={styles.select} 
                                                value={row.category} 
                                                onChange={(e) => handleUpdateChange(index, 'category', e.target.value)}
                                            >
                                                <option value="">Skip / Uncategorized</option>
                                                {categories.map(c => (
                                                    <option key={c.id} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={styles.td}>
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }} 
                                                whileTap={{ scale: 0.9 }}
                                                style={styles.removeBtn} 
                                                onClick={() => removeUpdateRow(index)}
                                            >
                                                ✕
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.95 }}
                    style={styles.addRowBtn} 
                    onClick={addUpdateRow}
                >
                    + Add Row
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.95 }}
                    style={styles.submitBtn} 
                    onClick={handleBulkUpdate} 
                    disabled={loading}
                >
                    {loading ? 'Updating...' : 'Update Products'}
                </motion.button>
            </div>
        </motion.div>
    );
}

const styles = {
    container: { maxWidth: '1200px', margin: '40px auto', padding: '0 20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { color: '#ffffff', fontSize: '24px', fontWeight: '600', margin: 0 },
    backButton: { backgroundColor: '#666', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' },
    errorBox: { backgroundColor: '#ff4757', color: '#fff', padding: '12px', borderRadius: '6px', marginBottom: '20px' },
    section: { marginBottom: '40px' },
    sectionTitle: { color: '#ffffff', fontSize: '20px', marginBottom: '15px' },
    divider: { border: 'none', borderTop: '1px solid #2a2a4e', margin: '40px 0' },
    tableContainer: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #2a2a4e' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#1a1a2e' },
    th: { padding: '12px 16px', textAlign: 'left', color: '#aaa', fontSize: '13px', fontWeight: '600', borderBottom: '2px solid #2a2a4e', backgroundColor: '#0f0f1a' },
    tr: { borderBottom: '1px solid #2a2a4e' },
    td: { padding: '8px 12px', color: '#e0e0e0', fontSize: '13px', verticalAlign: 'middle' },
    input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #2a2a4e', backgroundColor: '#0f0f1a', color: '#e0e0e0', fontSize: '13px' },
    select: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #2a2a4e', backgroundColor: '#0f0f1a', color: '#e0e0e0', fontSize: '13px' },
    addRowBtn: { backgroundColor: '#4facfe', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginTop: '12px', marginRight: '12px', fontWeight: '500' },
    removeBtn: { backgroundColor: '#ff4757', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    submitBtn: { backgroundColor: '#00d4aa', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', marginTop: '12px' },
};

export default BulkOperations;