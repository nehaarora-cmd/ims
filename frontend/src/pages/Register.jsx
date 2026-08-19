import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api/api';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.post('/auth/register', { email, password });
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800"
      >
        <h1 className="text-3xl font-bold text-center text-white mb-8 tracking-tight">Create Account</h1>
        
        {error && <p className="text-rose-500 text-center text-sm mb-4 bg-rose-500/10 p-2 rounded-lg">{error}</p>}
        {success && <p className="text-emerald-400 text-center text-sm mb-4 bg-emerald-400/10 p-2 rounded-lg">{success}</p>}
        
        <motion.form onSubmit={handleSubmit} variants={formVariants} initial="hidden" animate="visible" className="space-y-4">
          <motion.input variants={itemVariants} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
          <motion.input variants={itemVariants} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
          <motion.button variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} type="submit"
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg shadow-lg shadow-cyan-600/20 transition-colors"
          >
            Register
          </motion.button>
        </motion.form>
        
        <p className="text-slate-400 text-center mt-6">
          Already have an account? <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;