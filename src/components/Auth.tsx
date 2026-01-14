import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Lock, Mail, LogIn, UserPlus, CheckCircle, Apple, Leaf, Sparkles } from 'lucide-react';
import { TermsAndConditions } from './TermsAndConditions';
import { PrivacyPolicy } from './PrivacyPolicy';

interface AuthProps {
  onAuthChange: (user: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthChange }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Check terms acceptance for sign up
    if (!isLogin && !termsAccepted) {
      setError('You must accept the terms and conditions to sign up');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        onAuthChange(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        onAuthChange(data.user);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-green-100">
        {/* Header with Branding */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg transform hover:scale-110 transition-transform duration-300">
              <Apple className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Leaf className="w-5 h-5 text-green-700" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            OrchardIntel
          </h1>
          <p className="text-sm text-gray-500 mb-1 font-medium">Apple Disease Detector & Climate Risk Advisor</p>
          
          <div className="flex items-center justify-center space-x-2 mt-3">
            <div className={`h-1 w-12 rounded-full transition-all duration-300 ${isLogin ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`h-1 w-12 rounded-full transition-all duration-300 ${!isLogin ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          </div>
          
          <p className="text-gray-600 mt-4 flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span>{isLogin ? 'Welcome back!' : 'Join the smart farming revolution'}</span>
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
              <Mail className="w-4 h-4 text-green-600" />
              <span>Email Address</span>
            </label>
            <div className="relative group">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-green-600 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
              <Lock className="w-4 h-4 text-green-600" />
              <span>Password</span>
            </label>
            <div className="relative group">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-green-600 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* ✅ TERMS AND CONDITIONS - ONLY FOR SIGN UP */}
          {!isLogin && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 mt-0.5 cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-green-600 hover:text-green-700 font-semibold underline hover:no-underline transition-all"
                  >
                    Terms and Conditions
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacy(true)}
                    className="text-green-600 hover:text-green-700 font-semibold underline hover:no-underline transition-all"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-shake shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold hover:from-green-700 hover:via-green-800 hover:to-emerald-700 transform hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                <span>{isLogin ? 'Sign In to OrchardIntel' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setTermsAccepted(false);
            }}
            className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-all"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
        
        {/* Feature Pills */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium flex items-center space-x-1">
            <Leaf className="w-3 h-3" />
            <span>AI Disease Detection</span>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Climate Risk Analysis</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTerms && <TermsAndConditions onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
    </div>
  );
};