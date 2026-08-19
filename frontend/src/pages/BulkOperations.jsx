import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { productAPI, categoryAPI } from "../api/api";
import { useNavigate, Link, useLocation } from "react-router-dom";

function BulkOperations() {
  const navigate = useNavigate();
  const location = useLocation();
  // Grab the Products passed from Products page (fallback to empty array)
  const selectedProducts = location.state?.selectedProducts || [];

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [createRows, setCreateRows] = useState([
    { name: "", description: "", quantity: 0, price: 0, category: "" },
  ]);

  // Now 'selectedProducts' is already defined, so this works perfectly!
  const [updateRows, setUpdateRows] = useState(
    selectedProducts.length > 0
      ? selectedProducts.map((p) => ({
          id: p.id.toString(),
          name: p.name || "",
          description: p.description || "",
          quantity: p.quantity !== undefined ? p.quantity.toString() : "",
          price: p.price !== undefined ? p.price.toString() : "",
          category: "",
        }))
      : [
          {
            id: "",
            name: "",
            description: "",
            quantity: "",
            price: "",
            category: "",
          },
        ],
  );

  // Phase 1: If new products are selected, reinitialize the rows
  useEffect(() => {
    if (selectedProducts.length > 0) {
      setUpdateRows(
        selectedProducts.map((p) => ({
          id: p.id.toString(),
          name: p.name || "",
          description: p.description || "",
          quantity: p.quantity !== undefined ? p.quantity.toString() : "",
          price: p.price !== undefined ? p.price.toString() : "",
          category: "", // Will be translated after categories load
        })),
      );
    } else {
      setUpdateRows([
        {
          id: "",
          name: "",
          description: "",
          quantity: "",
          price: "",
          category: "",
        },
      ]);
    }
  }, [location.state]);

  // Phase 2: Once categories are fetched, map the numeric category_id to a human-readable name
  useEffect(() => {
    if (categories.length > 0 && selectedProducts.length > 0) {
      setUpdateRows((prevRows) =>
        prevRows.map((row) => {
          const product = selectedProducts.find(
            (p) => p.id.toString() === row.id,
          );
          if (product?.category_id) {
            const cat = categories.find((c) => c.id === product.category_id);
            return { ...row, category: cat ? cat.name : "" };
          }
          return row;
        }),
      );
    }
  }, [categories]); // Automatically updates the instant the categories array changes

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories: " + err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create Handlers
  const handleCreateChange = (index, field, value) => {
    const updated = [...createRows];
    updated[index][field] = value;
    setCreateRows(updated);
  };
  const addCreateRow = () =>
    setCreateRows([
      ...createRows,
      { name: "", description: "", quantity: 0, price: 0, category: "" },
    ]);
  const removeCreateRow = (index) => {
    if (createRows.length === 1) return;
    setCreateRows(createRows.filter((_, i) => i !== index));
  };

  const handleBulkCreate = async () => {
    setError("");
    setLoading(true);
    const payload = createRows.map((row) => {
      const categoryObj = categories.find(
        (c) => c.name.toLowerCase() === row.category.toLowerCase(),
      );
      return {
        name: row.name,
        description: row.description,
        quantity: parseInt(row.quantity) || 0,
        price: parseFloat(row.price) || 0,
        category_id: categoryObj ? categoryObj.id : null,
      };
    });
    try {
      await productAPI.bulkCreate(payload);
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create products");
    } finally {
      setLoading(false);
    }
  };

  // Update Handlers
  const handleUpdateChange = (index, field, value) => {
    const updated = [...updateRows];
    updated[index][field] = value;
    setUpdateRows(updated);
  };
  const addUpdateRow = () =>
    setUpdateRows([
      ...updateRows,
      {
        id: "",
        name: "",
        description: "",
        quantity: "",
        price: "",
        category: "",
      },
    ]);
  const removeUpdateRow = (index) => {
    if (updateRows.length === 1) return;
    setUpdateRows(updateRows.filter((_, i) => i !== index));
  };

  const handleBulkUpdate = async () => {
    setError("");
    setLoading(true);
    const payload = updateRows
      .filter((row) => row.id)
      .map((row) => {
        const categoryObj = categories.find(
          (c) => c.name.toLowerCase() === row.category.toLowerCase(),
        );
        return {
          id: parseInt(row.id),
          name: row.name || undefined,
          description: row.description || undefined,
          quantity: row.quantity !== "" ? parseInt(row.quantity) : undefined,
          price: row.price !== "" ? parseFloat(row.price) : undefined,
          category_id: row.category
            ? categoryObj
              ? categoryObj.id
              : null
            : undefined,
        };
      });
    if (payload.length === 0) {
      setError("Please provide at least one valid Product ID to update.");
      setLoading(false);
      return;
    }
    try {
      await productAPI.bulkUpdate(payload);
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-10"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Bulk Operations
        </h1>
        <Link
          to="/products"
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          ← Back
        </Link>
      </div>
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Bulk Create */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Bulk Create Products
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-xs uppercase bg-slate-800 text-slate-300">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <AnimatePresence mode="popLayout">
                {createRows.map((row, idx) => (
                  <motion.tr
                    key={idx}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="bg-slate-900/50"
                  >
                    <td className="px-4 py-2">
                      <input
                        value={row.name}
                        onChange={(e) =>
                          handleCreateChange(idx, "name", e.target.value)
                        }
                        placeholder="Name"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={row.description}
                        onChange={(e) =>
                          handleCreateChange(idx, "description", e.target.value)
                        }
                        placeholder="Desc"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={(e) =>
                          handleCreateChange(idx, "quantity", e.target.value)
                        }
                        className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-200 focus:ring-1 focus:ring-cyan-500 outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={row.price}
                        onChange={(e) =>
                          handleCreateChange(idx, "price", e.target.value)
                        }
                        className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-200 focus:ring-1 focus:ring-cyan-500 outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={row.category}
                        onChange={(e) =>
                          handleCreateChange(idx, "category", e.target.value)
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-200 focus:ring-1 focus:ring-cyan-500 outline-none"
                      >
                        <option value="">Uncategorized</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => removeCreateRow(idx)}
                        className="text-rose-500 hover:text-rose-400 font-bold"
                      >
                        ✕
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={addCreateRow}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            + Add Row
          </button>
          <button
            onClick={handleBulkCreate}
            disabled={loading}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-cyan-600/20"
          >
            {loading ? "Creating..." : "Create Products"}
          </button>
        </div>
      </div>

      {/* Bulk Update */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Bulk Update Products
        </h2>
        <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 p-4 rounded-lg mb-6 text-sm flex items-start gap-3">
          <span>
            <strong>Pro tip:</strong> To auto-fill these rows, head to the{" "}
            <Link
              to="/products"
              className="underline hover:text-cyan-200 transition-colors font-medium"
            >
              Products
            </Link>{" "}
            page, select your items, and click <strong>"Bulk Ops"</strong>. All
            their current data (Name, Price, Category, etc.) will be pre-filled
            for you.
          </span>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-xs uppercase bg-slate-800 text-slate-300">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <AnimatePresence mode="popLayout">
                {updateRows.map((row, idx) => (
                  <motion.tr
                    key={idx}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="bg-slate-900/50"
                  >
                    <td className="px-4 py-2">
                      <input
                        value={row.id}
                        onChange={(e) =>
                          handleUpdateChange(idx, "id", e.target.value)
                        }
                        placeholder="ID"
                        className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={row.name}
                        onChange={(e) =>
                          handleUpdateChange(idx, "name", e.target.value)
                        }
                        placeholder="Leave blank"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={row.description}
                        onChange={(e) =>
                          handleUpdateChange(idx, "description", e.target.value)
                        }
                        placeholder="Leave blank"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={(e) =>
                          handleUpdateChange(idx, "quantity", e.target.value)
                        }
                        placeholder="Leave blank"
                        className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-200 focus:ring-1 focus:ring-cyan-500 outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={row.price}
                        onChange={(e) =>
                          handleUpdateChange(idx, "price", e.target.value)
                        }
                        placeholder="Leave blank"
                        className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-200 focus:ring-1 focus:ring-cyan-500 outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={row.category}
                        onChange={(e) =>
                          handleUpdateChange(idx, "category", e.target.value)
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-200 focus:ring-1 focus:ring-cyan-500 outline-none"
                      >
                        <option value="">Skip</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => removeUpdateRow(idx)}
                        className="text-rose-500 hover:text-rose-400 font-bold"
                      >
                        ✕
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={addUpdateRow}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            + Add Row
          </button>
          <button
            onClick={handleBulkUpdate}
            disabled={loading}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-cyan-600/20"
          >
            {loading ? "Updating..." : "Update Products"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default BulkOperations;
