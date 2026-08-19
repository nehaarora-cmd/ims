import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/api";

function EditProduct() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/products/${id}`);
        const product = response.data;
        setName(product.name);
        setDescription(product.description);
        setQuantity(product.quantity.toString());
        setPrice(product.price.toString());
      } catch (err) {
        setError("Failed to fetch product: " + err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.patch(`/products/${id}`, {
        name,
        description,
        quantity: parseInt(quantity),
        price: parseFloat(price),
      });
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update product");
    }
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
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
        Edit Product
      </h1>
      {error && (
        <p className="text-rose-500 text-center mb-4 bg-rose-500/10 p-2 rounded-lg">
          {error}
        </p>
      )}

      <motion.form
        onSubmit={handleSubmit}
        variants={formVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <motion.input
          variants={itemVariants}
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <motion.textarea
          variants={itemVariants}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.input
            variants={itemVariants}
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <motion.input
            variants={itemVariants}
            type="number"
            step="0.01"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <motion.div variants={itemVariants} className="flex gap-4 pt-2">
          <button
            type="submit"
            className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-cyan-600/20"
          >
            Update Product
          </button>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </motion.div>
      </motion.form>
    </div>
  );
}

export default EditProduct;
