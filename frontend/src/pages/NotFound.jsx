import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="text-9xl font-extrabold text-cyan-400 tracking-tight drop-shadow-lg">
          404
        </h1>
        <p className="text-2xl font-semibold text-white mt-4">Page not found</p>
        <p className="text-slate-400 text-lg mt-2 mb-8 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-block px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-cyan-600/20"
        >
          Return to home page
        </Link>
      </motion.div>
    </div>
  );
}

export default NotFound;
