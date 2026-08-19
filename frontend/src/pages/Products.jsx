import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { productAPI, categoryAPI } from "../api/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      setError("Failed to fetch products: " + err);
    } finally {
      setLoading(false);
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories: " + err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await productAPI.delete(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete product: " + err);
    }
  };

  const handleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  const handleSelectAll = () => {
    if (selectedIds.length === products.length) setSelectedIds([]);
    else setSelectedIds(products.map((p) => p.id));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} products?`)) return;
    try {
      await productAPI.bulkDelete(selectedIds);
      setProducts(products.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    } catch (err) {
      alert("Failed to delete products: " + err);
    }
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Uncategorized";
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Uncategorized";
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-slate-400">
        Loading...
      </div>
    );
  if (error)
    return <div className="text-center text-rose-500 mt-10">{error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-10"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Products
        </h1>
        <div className="flex gap-3 flex-wrap">
          <Link
            to="/products/new"
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-cyan-600/20"
          >
            Add Product
          </Link>
          <Link
            to="/products/bulk"
            state={{
              selectedProducts: products.filter((p) =>
                selectedIds.includes(p.id),
              ),
            }}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Bulk Ops
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 flex flex-wrap justify-between items-center gap-4"
          >
            <span className="text-slate-300 font-medium">
              {selectedIds.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-sm rounded-lg transition-colors"
            >
              Delete Selected
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {products.length === 0 ? (
        <p className="text-center text-slate-500 mt-10">
          No products yet. Create your first product.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-xs uppercase bg-slate-800 text-slate-300">
              <tr>
                <th className="px-4 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === products.length &&
                      products.length > 0
                    }
                    onChange={handleSelectAll}
                    className="accent-cyan-500 rounded bg-slate-700 border-slate-600"
                  />
                </th>
                <th className="px-4 py-4">ID</th>
                <th className="px-4 py-4">Name</th>
                <th className="px-4 py-4 hidden md:table-cell">Description</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Qty</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <AnimatePresence mode="popLayout">
                {products.map((product) => {
                  const lowStock = product.quantity < 10;
                  const critical = product.quantity < 5;
                  return (
                    <motion.tr
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="bg-slate-900/50 hover:bg-slate-800 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => handleSelect(product.id)}
                          className="accent-cyan-500 rounded bg-slate-700 border-slate-600"
                        />
                      </td>
                      <td className="px-4 py-4 font-mono text-slate-500">
                        {product.id}
                      </td>
                      <td className="px-4 py-4 text-slate-200 font-medium">
                        {product.name}
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-slate-400 max-w-xs truncate">
                        {product.description || "-"}
                      </td>
                      <td className="px-4 py-4">
                        {getCategoryName(product.category_id)}
                      </td>
                      <td
                        className={`px-4 py-4 font-medium ${critical ? "text-rose-500" : lowStock ? "text-amber-500" : "text-emerald-400"}`}
                      >
                        {product.quantity} {critical && "(Critical)"}{" "}
                        {!critical && lowStock && "(Low)"}
                      </td>
                      <td className="px-4 py-4 text-slate-200">
                        ₹{parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 flex justify-end gap-2">
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

export default Products;
