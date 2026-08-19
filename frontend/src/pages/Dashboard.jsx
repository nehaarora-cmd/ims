import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { productAPI, categoryAPI } from "../api/api";

function Dashboard() {
  const [stats, setStats] = useState({ total: 0, lowStock: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getAll(),
      ]);
      const products = productsRes.data;
      setStats({
        total: products.length,
        lowStock: products.filter((p) => p.quantity < 10).length,
        categories: categoriesRes.data.length,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-slate-400">
        Loading...
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8 tracking-tight">
        Dashboard
      </h1>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
      >
        <motion.div
          variants={itemVariants}
          className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg border-l-4 border-l-cyan-500"
        >
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">
            Total Products
          </h3>
          <p className="text-4xl font-bold text-cyan-400 mt-2">{stats.total}</p>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg border-l-4 border-l-rose-500"
        >
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">
            Low Stock
          </h3>
          <p className="text-4xl font-bold text-rose-500 mt-2">
            {stats.lowStock}
          </p>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg border-l-4 border-l-emerald-500"
        >
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">
            Categories
          </h3>
          <p className="text-4xl font-bold text-emerald-400 mt-2">
            {stats.categories}
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-4"
      >
        <Link
          to="/products"
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700"
        >
          View All Products
        </Link>
        <Link
          to="/products/new"
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-cyan-600/20"
        >
          Add New Product
        </Link>
        <Link
          to="/categories"
          className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-rose-600/20"
        >
          Manage Categories
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;
