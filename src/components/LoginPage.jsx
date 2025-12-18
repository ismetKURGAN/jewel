import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/users');
      const users = await response.json();
      
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        localStorage.setItem('jewl_auth', JSON.stringify({ 
          username: user.username, 
          role: user.role,
          loginTime: Date.now() 
        }));
        onLogin(user);
      } else {
        setError('Kullanıcı adı veya şifre hatalı');
      }
    } catch (err) {
      setError('Giriş yapılırken bir hata oluştu');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface-dark rounded-2xl p-8 border border-border-dark shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-4">
              <span className="material-symbols-outlined text-4xl text-yellow-400">diamond</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary-dark">Jewl Panel</h1>
            <p className="text-text-secondary-dark mt-1">Kuyumcu Yönetim Sistemi</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary-dark mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary-dark">
                  person
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background-dark border border-border-dark rounded-lg text-text-primary-dark placeholder-text-secondary-dark focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="Kullanıcı adınızı girin"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary-dark mb-2">
                Şifre
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary-dark">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background-dark border border-border-dark rounded-lg text-text-primary-dark placeholder-text-secondary-dark focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="Şifrenizi girin"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-500/50 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  Giriş Yap
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-text-secondary-dark text-xs mt-6">
          © 2025 Jewl Panel - Tüm hakları saklıdır
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
