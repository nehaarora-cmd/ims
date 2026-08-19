import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { categoryAPI } from "../api/api";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (err) {
      setError("Failed to fetch categories: " + err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      const response = await categoryAPI.create({ name: newCategory });
      setCategories([...categories, response.data]);
      setNewCategory("");
    } catch (err) {
      alert("Failed to create category: " + err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await categoryAPI.delete(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete category: " + err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-slate-400">
        Loading...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">
        Categories
      </h1>

      <form onSubmit={handleCreate} className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-cyan-600/20"
        >
          Add
        </button>
      </form>

      {error && <p className="text-rose-500 text-center mb-4">{error}</p>}

      <div className="space-y-3">
        {categories.length === 0 ? (
          <p className="text-center text-slate-500">
            No categories yet. Create one!
          </p>
        ) : (
          <AnimatePresence mode="popLayout">
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="flex justify-between items-center p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-sm hover:border-slate-700 transition-colors"
              >
                <span className="text-slate-200 font-medium">{cat.name}</span>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-sm rounded-lg transition-colors"
                >
                  Delete
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default Categories;
