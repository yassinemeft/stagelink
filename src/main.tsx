import { StrictMode, useState, useEffect, createContext, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { app, auth } from './firebase'
import LoginForm from './LoginForm'
import SignUpForm from './SignUpForm'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import ProfilePage from './ProfilePage'
import AddOpportunityForm from './AddOpportunityForm'
import translations from './i18n'
import SettingsScreen from './SettingsScreen';
import InternshipsScreen from './InternshipsScreen';
import JobsScreen from './JobsScreen';
import EmployersScreen from './EmployersScreen';
import AboutScreen from './AboutScreen';

// --- Theme & Language Contexts ---
type Theme = 'light' | 'dark';
type Lang = 'en' | 'fr';

const ThemeLangContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (ns: string, key: string) => string;
}>({
  theme: 'light',
  setTheme: () => {},
  lang: 'en',
  setLang: () => {},
  t: () => '',
});

export function useThemeLang() {
  return useContext(ThemeLangContext);
}

function RootLayout() {
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'internships' | 'jobs' | 'employers' | 'about' | 'profile' | 'addopportunity'>('home');
  const [theme, setTheme] = useState<Theme>('light');
  const [lang, setLang] = useState<Lang>('en');

  // Translation function
  const t = (ns: string, key: string) => {
    // @ts-ignore
    return translations[lang]?.[ns]?.[key] || translations['en'][ns]?.[key] || key;
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Handler to be passed to forms for successful login/signup
  const handleAuthSuccess = (userObj: any) => {
    setUser(userObj);
    setShowLogin(false);
    setShowSignUp(false);
    setWelcomeMsg(`Welcome, ${userObj.displayName || userObj.email || 'User'}!`);
    setTimeout(() => setWelcomeMsg(''), 3000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setMenuOpen(false);
    setWelcomeMsg('Logged out successfully.');
    setTimeout(() => setWelcomeMsg(''), 2000);
  };

  // Tailwind dark mode class on html
  useEffect(() => {
    // Remove dark mode class toggling
  }, [theme]);

  return (
    <ThemeLangContext.Provider value={{ theme, setTheme, lang, setLang, t }}>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <nav className="py-4 px-6 flex items-center justify-between bg-[#222] text-white">
          <span
            className="font-bold text-xl tracking-wide cursor-pointer"
            onClick={() => { setCurrentPage('home'); setShowProfile(false); setShowSettings(false); }}
          >
            InternLink
          </span>
          <div className="flex gap-4 items-center relative">
            <a href="#" className="hover:underline" onClick={() => { setCurrentPage('home'); setShowProfile(false); setShowSettings(false); }}>Home</a>
            <a href="#" className="hover:underline" onClick={() => { setCurrentPage('internships'); setShowProfile(false); setShowSettings(false); }}>{t('nav', 'internships')}</a>
            <a href="#" className="hover:underline" onClick={() => { setCurrentPage('jobs'); setShowProfile(false); setShowSettings(false); }}>{t('nav', 'jobs')}</a>
            <a href="#" className="hover:underline" onClick={() => { setCurrentPage('employers'); setShowProfile(false); setShowSettings(false); }}>{t('nav', 'employers')}</a>
            <a href="#" className="hover:underline" onClick={() => { setCurrentPage('about'); setShowProfile(false); setShowSettings(false); }}>{t('nav', 'about')}</a>
            <button
              className="px-4 py-2 rounded bg-white text-[#222] font-semibold"
              onClick={() => { setCurrentPage('addopportunity'); setShowProfile(false); setShowSettings(false); }}
            >
              {t('nav', 'post')}
            </button>
            {!user && (
              <>
                <button
                  className="bg-transparent text-white border-none cursor-pointer"
                  onClick={() => { setShowLogin(true); setShowSignUp(false); }}
                >
                  {t('nav', 'login')}
                </button>
                <button
                  className="bg-transparent text-white border-none cursor-pointer"
                  onClick={() => { setShowSignUp(true); setShowLogin(false); }}
                >
                  {t('nav', 'signup')}
                </button>
              </>
            )}
            {user && (
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#555',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => setMenuOpen(v => !v)}
                  tabIndex={0}
                  onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                >
                  {(user.displayName && user.displayName[0]) || (user.email && user.email[0]) || 'U'}
                </div>
                {menuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '110%',
                      background: '#fff',
                      color: '#222',
                      borderRadius: 6,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      minWidth: 140,
                      zIndex: 10,
                    }}
                  >
                    <button
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem 1rem',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setMenuOpen(false);
                        setShowProfile(true);
                        setShowSettings(false);
                        setCurrentPage('profile');
                      }}
                    >
                      {t('nav', 'profile')}
                    </button>
                    <button
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem 1rem',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setMenuOpen(false);
                        setShowSettings(true);
                        setShowProfile(false);
                      }}
                    >
                      Settings
                    </button>
                    <button
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem 1rem',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: '#d32f2f'
                      }}
                      onClick={handleLogout}
                    >
                      {t('nav', 'logout')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
        <div style={{ minHeight: '80vh' }}>
          {welcomeMsg && (
            <div style={{ margin: '2rem auto', maxWidth: 400, background: '#e0ffe0', color: '#222', padding: '1rem', borderRadius: 8, textAlign: 'center' }}>
              {welcomeMsg}
            </div>
          )}
          {showSettings ? (
            <SettingsScreen />
          ) : showProfile && user ? (
            <ProfilePage user={user} />
          ) : showLogin ? (
            <LoginForm onAuthSuccess={handleAuthSuccess} />
          ) : showSignUp ? (
            <SignUpForm onAuthSuccess={handleAuthSuccess} />
          ) : currentPage === 'internships' ? (
            <InternshipsScreen />
          ) : currentPage === 'jobs' ? (
            <JobsScreen />
          ) : currentPage === 'employers' ? (
            <EmployersScreen />
          ) : currentPage === 'about' ? (
            <AboutScreen />
          ) : currentPage === 'addopportunity' ? (
            user && user.userType === 'employer' ? (
              <AddOpportunityForm />
            ) : (
              <div className="p-8 text-center text-red-700">
                {t('misc', 'onlyEmployers')}
              </div>
            )
          ) : (
            <App />
          )}
        </div>
        <footer className="py-4 bg-[#222] text-white text-center">
          &copy; {new Date().getFullYear()} InternLink. {t('misc', 'copyright')}
        </footer>
      </div>
    </ThemeLangContext.Provider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootLayout />
  </StrictMode>,
)
