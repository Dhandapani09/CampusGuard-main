import React, { useState } from 'react';
import { LogIn, User, Key } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Button from '../components/shared/Button';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, branding } = useAppContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Brief aesthetic network authentication delay
      await new Promise(resolve => setTimeout(resolve, 600));
      const success = await login(username, password);
      if (success) {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        const userRole = savedUser?.role || 'Guard';
        if (userRole === 'Host') {
          navigate('/gate/entry');
        } else {
          navigate('/dashboard/local');
        }
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 light:bg-gray-50 relative overflow-hidden font-sans transition-colors duration-200">
      
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 light:bg-indigo-600/10 blur-[100px] animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-600/20 light:bg-cyan-600/10 blur-[120px] animate-pulse duration-8000" style={{animationDelay: '-2s'}}></div>
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-purple-600/10 blur-[80px] animate-pulse duration-6000" style={{animationDelay: '-4s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-10 rounded-2xl bg-gray-900/40 light:bg-white border border-white/10 light:border-gray-200 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] light:shadow-[0_8px_32px_rgba(0,0,0,0.06)] animate-in fade-in duration-300">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mb-8">
          {branding?.logo_url ? (
            <img src={branding.logo_url} alt="Logo" className="w-16 h-16 object-contain mb-4 rounded" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-500/30 mb-4 select-none">
              {branding?.logo_initial || 'CG'}
            </div>
          )}
          
          <h2 className="text-2xl font-bold tracking-tight text-white light:text-gray-900 font-heading m-0">
            {branding?.company_name || 'CampusGuard'}
          </h2>
          <p className="text-xs text-gray-400 light:text-gray-500 font-medium uppercase tracking-wider mt-1.5 m-0">
            {branding?.tagline || 'Secure. Smart. Seamless.'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg text-center animate-in duration-200">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold block mb-1">
              Username
            </label>
            <div className="relative group">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                className="w-full bg-gray-850/40 light:bg-gray-55/40 border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-gray-600 light:placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold block mb-1">
              Password
            </label>
            <div className="relative group">
              <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full bg-gray-855/40 light:bg-gray-55/40 border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-gray-600 light:placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>

          <div className="pt-3">
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              fullWidth 
              loading={loading}
              disabled={loading}
              icon={LogIn}
            >
              Log In
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center text-[10px] text-gray-500 uppercase tracking-widest font-semibold select-none">
          AUTHORIZED PERSONNEL ONLY
        </div>
      </div>
    </div>
  );
};

export default Login;