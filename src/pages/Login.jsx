import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Utensils,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Star,
  ShieldCheck,
  Facebook,
  Twitter,
  Instagram,
} from 'lucide-react';

const HERO_IMG =
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900&q=80&auto=format&fit=crop';

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        user = await signup(name, email, password, 'customer');
      } else {
        user = await login(email, password);
      }
      
      if (user && (user.role === 'vendor' || user.role === 'admin')) {
        navigate('/vendor');
      } else {
        navigate('/menu');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0a0806] text-white overflow-hidden relative"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* background blobs */}
      <div className="pointer-events-none absolute -left-40 top-20 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-orange-500/15 rounded-full blur-[80px] md:blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-green-500/10 rounded-full blur-[80px] md:blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />

      {/* top bar */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 h-14 md:h-20 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-[10px] md:text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
          <span>Back</span>
        </Link>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 md:w-9 md:h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Utensils className="w-3 h-3 md:w-5 md:h-5 text-white" />
          </div>
          <span className="text-sm md:text-xl font-extrabold tracking-tight">
            <span className="text-orange-500">Nex</span>Serv
          </span>
        </Link>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-2 md:py-6 grid lg:grid-cols-2 gap-4 md:gap-12 items-center">
        {/* ============ LEFT: visual ============ */}
        <div className="hidden lg:flex relative items-center justify-center">
          <svg
            className="absolute -right-10 top-0 w-[400px] md:w-[480px] h-[400px] md:h-[480px] text-green-600/60"
            viewBox="0 0 200 200"
            fill="currentColor"
          >
            <path d="M100 10 C 40 40 30 110 60 170 C 90 200 150 180 175 130 C 195 90 170 30 100 10 Z" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[340px] md:w-[420px] h-[340px] md:h-[420px] rounded-full border border-orange-400/30" />
          </div>

          <div className="relative animate-float-slow z-10">
            <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-3xl scale-90 -z-10" />
            <img
              src={HERO_IMG}
              alt="Featured plate"
              className="w-full max-w-[300px] md:max-w-[380px] max-h-[250px] md:max-h-[400px] object-cover rounded-full shadow-[0_50px_120px_-20px_rgba(0,0,0,0.9)] border-[6px] border-white/[0.04]"
            />
          </div>

          <div className="absolute bottom-8 left-8 z-20 flex items-center gap-3 px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500 fill-orange-500" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold leading-none">10k+ orders</p>
              <p className="text-[10px] md:text-xs text-gray-400 mt-1">delivered fresh & hot</p>
            </div>
          </div>

          <div className="absolute top-8 right-2 z-20 flex items-center gap-3 px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-400" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold leading-none">100% Secure</p>
              <p className="text-[10px] md:text-xs text-gray-400 mt-1">end-to-end encrypted</p>
            </div>
          </div>
        </div>

        {/* ============ RIGHT: form ============ */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
          <div className="p-4 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl">
            <div className="grid grid-cols-2 p-1 rounded-full bg-white/[0.04] border border-white/10 mb-4 md:mb-8">
              <button
                onClick={() => setIsSignUp(false)}
                className={`py-1 md:py-2.5 rounded-full text-[10px] md:text-sm font-semibold transition-all ${
                  !isSignUp
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`py-1 md:py-2.5 rounded-full text-[10px] md:text-sm font-semibold transition-all ${
                  isSignUp
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            <p
              className="text-orange-400 text-sm md:text-xl mb-0.5"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              {!isSignUp ? 'Welcome back!' : 'Hello there!'}
            </p>
            <h2
              className="text-lg md:text-4xl font-extrabold leading-tight tracking-tight mb-1"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {!isSignUp ? (
                <>
                  Sign in to <span className="text-orange-500">NexServ</span>
                </>
              ) : (
                <>
                  Create your <span className="text-orange-500">account</span>
                </>
              )}
            </h2>
            <p className="text-[10px] md:text-sm text-gray-400 mb-4 md:mb-8">
              {!isSignUp
                ? 'Enter your credentials to continue ordering.'
                : 'Join 10k+ foodies — your favourite meal is one tap away.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
              {error && (
                <div className="p-2 rounded-lg md:rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] md:text-sm">
                  {error}
                </div>
              )}

              {isSignUp && (
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 md:pl-11 pr-4 py-2 md:py-3.5 rounded-lg md:rounded-xl bg-white/[0.04] border border-white/10 focus:border-orange-500/60 outline-none transition-all text-[11px] md:text-sm"
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 md:pl-11 pr-4 py-2 md:py-3.5 rounded-lg md:rounded-xl bg-white/[0.04] border border-white/10 focus:border-orange-500/60 outline-none transition-all text-[11px] md:text-sm"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 md:pl-11 pr-10 md:pr-12 py-2 md:py-3.5 rounded-lg md:rounded-xl bg-white/[0.04] border border-white/10 focus:border-orange-500/60 outline-none transition-all text-[11px] md:text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                </button>
              </div>

              {isSignUp && (
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 md:pl-11 pr-10 md:pr-12 py-2 md:py-3.5 rounded-lg md:rounded-xl bg-white/[0.04] border border-white/10 focus:border-orange-500/60 outline-none transition-all text-[11px] md:text-sm"
                    required={isSignUp}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 md:py-3.5 rounded-lg md:rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs md:text-base shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : !isSignUp ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-4 md:mt-8 pt-4 md:pt-8 border-t border-white/10 flex items-center justify-center gap-6 text-gray-500">
              <Facebook className="w-3.5 h-3.5 md:w-5 md:h-5 hover:text-blue-500 cursor-pointer transition-colors" />
              <Twitter className="w-3.5 h-3.5 md:w-5 md:h-5 hover:text-blue-400 cursor-pointer transition-colors" />
              <Instagram className="w-3.5 h-3.5 md:w-5 md:h-5 hover:text-pink-500 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
