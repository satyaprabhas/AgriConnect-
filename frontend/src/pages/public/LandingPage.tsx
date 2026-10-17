import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sprout, 
  ShoppingCart, 
  Truck, 
  Shield, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Info, 
  Loader2,
  GraduationCap,
  Building2,
  Star,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import FeedbackModal from '../../components/common/FeedbackModal';

type Role = 'CONSUMER' | 'FARMER' | 'COORDINATOR' | 'ADMIN' | 'ADVISER' | 'LARGE_SCALE_CONSUMER';

export default function LandingPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [selectedRole, setSelectedRole] = useState<Role>('CONSUMER');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError(language === 'te' ? 'దయచేసి వినియోగదారు పేరు మరియు పాస్‌వర్డ్ నమోదు చేయండి' : 'Please enter both username and password');
      return;
    }

    try {
      await login(username, password, selectedRole);
      showToast(language === 'te' ? 'లాగిన్ విజయవంతమైంది' : 'Login successful', 'success');
      
      switch (selectedRole) {
        case 'FARMER':
          navigate('/farmer');
          break;
        case 'CONSUMER':
          navigate('/consumer');
          break;
        case 'COORDINATOR':
          navigate('/coordinator');
          break;
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'ADVISER':
          navigate('/adviser');
          break;
        case 'LARGE_SCALE_CONSUMER':
          navigate('/large-scale-consumer');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      setError(err.message || (language === 'te' ? 'లాగిన్ విఫలమైంది. దయచేసి వివరాలు సరిచూడండి.' : 'Login failed. Please check your credentials.'));
    }
  };

  const handleDemoFill = async (role: Role, user: string, pass: string) => {
    setSelectedRole(role);
    setUsername(user);
    setPassword(pass);
    setError('');

    try {
      await login(user, pass, role);
      showToast(language === 'te' ? 'లాగిన్ విజయవంతమైంది' : 'Login successful', 'success');
      
      switch (role) {
        case 'FARMER':
          navigate('/farmer');
          break;
        case 'CONSUMER':
          navigate('/consumer');
          break;
        case 'COORDINATOR':
          navigate('/coordinator');
          break;
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'ADVISER':
          navigate('/adviser');
          break;
        case 'LARGE_SCALE_CONSUMER':
          navigate('/large-scale-consumer');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      setError(err.message || (language === 'te' ? 'లాగిన్ విఫలమైంది. దయచేసి వివరాలు సరిచూడండి.' : 'Login failed. Please check your credentials.'));
    }
  };

  const roles: { id: Role; labelKey: string; defaultName: string; icon: React.ReactNode }[] = [
    { id: 'CONSUMER', labelKey: 'role.consumer', defaultName: 'Consumer', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'FARMER', labelKey: 'role.farmer', defaultName: 'Farmer', icon: <Sprout className="w-5 h-5" /> },
    { id: 'LARGE_SCALE_CONSUMER', labelKey: 'role.largeScaleConsumer', defaultName: 'Bulk Buyer', icon: <Building2 className="w-5 h-5" /> },
    { id: 'ADVISER', labelKey: 'role.adviser', defaultName: 'Adviser', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'COORDINATOR', labelKey: 'role.coordinator', defaultName: 'Coordinator', icon: <Truck className="w-5 h-5" /> },
    { id: 'ADMIN', labelKey: 'role.admin', defaultName: 'Admin', icon: <Shield className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative animate-fade-in">
      {/* Top Floating Actions for all devices */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setShowFeedbackModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/90 hover:bg-white text-emerald-800 text-xs sm:text-sm font-semibold shadow-md border border-emerald-100 hover:shadow-lg transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>{language === 'te' ? 'అభిప్రాయం ఇవ్వండి' : 'Give Feedback'}</span>
        </button>
        <LanguageToggle />
      </div>

      {/* Left Side - Hidden on Mobile */}
      {/* Left Side - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 p-8 xl:p-12 flex-col justify-start relative overflow-hidden bg-slate-900 min-h-[680px]">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src="/farmer-hero.jpg" 
            alt="AgriConnect Farmer" 
            className="w-full h-full object-cover" 
            style={{ objectPosition: '85% 100%' }}
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-xl">
          {/* Brand Header */}
          <div className="flex items-center gap-3 text-emerald-950 mb-6">
            <div className="p-2.5 bg-emerald-600/95 text-white rounded-2xl shadow-md">
              <Sprout className="w-8 h-8 xl:w-9 xl:h-9" />
            </div>
            <span className="text-3xl xl:text-4xl font-extrabold tracking-tight text-emerald-950 drop-shadow-xs">{t('brand.name', 'AgriConnect')}</span>
          </div>

          {/* Headline & Subtitle */}
          <h1 className="text-4xl xl:text-5xl font-black text-emerald-950 leading-tight mb-3 drop-shadow-xs">
            {language === 'te' ? (
              <>రైతులు & వినియోగదారుల <br /><span className="text-emerald-800">ప్రత్యక్ష అనుసంధానం</span></>
            ) : (
              <>Connecting Farmers & Consumers <br /><span className="text-emerald-800">Directly</span></>
            )}
          </h1>
          
          <p className="text-base xl:text-lg text-emerald-900 leading-relaxed font-semibold drop-shadow-xs mb-6">
            {t('auth.subtitle', 'Empowering farmers with fair mandated prices & connecting consumers directly with fresh harvest.')}
          </p>

          {/* Why Choose Us & Feature Cards directly below subtitle */}
          <div>
            <h3 className="text-xl xl:text-2xl font-bold text-emerald-950 mb-3.5 drop-shadow-xs">
              {language === 'te' ? 'మా ప్రత్యేకతలు' : 'Why Choose Us?'}
            </h3>
            <div className="grid grid-cols-1 gap-3.5">
              <div className="bg-white/85 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/80 shadow-md flex items-center gap-4">
                <div className="text-3xl sm:text-4xl flex-shrink-0">🌾</div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-emerald-950 mb-0.5">
                    {language === 'te' ? 'రైతుల నుండి నేరుగా' : 'Direct from Farmers'}
                  </h4>
                  <p className="text-emerald-900 text-sm sm:text-base font-medium leading-snug">
                    {language === 'te' ? 'దళారులు లేకుండా ధృవీకరించబడిన రైతుల నుండి నేరుగా కొనండి' : 'No middlemen, buy produce directly from verified farmers'}
                  </p>
                </div>
              </div>
              <div className="bg-white/85 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/80 shadow-md flex items-center gap-4">
                <div className="text-3xl sm:text-4xl flex-shrink-0">💰</div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-emerald-950 mb-0.5">
                    {language === 'te' ? 'గిట్టుబాటు ధర' : 'Fair & Transparent'}
                  </h4>
                  <p className="text-emerald-900 text-sm sm:text-base font-medium leading-snug">
                    {language === 'te' ? 'ప్రభుత్వ మార్కెట్ ధరలతో రైతులకు, వినియోగదారులకు న్యాయం' : 'Admin-controlled pricing ensures fairness for all'}
                  </p>
                </div>
              </div>
              <div className="bg-white/85 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/80 shadow-md flex items-center gap-4">
                <div className="text-3xl sm:text-4xl flex-shrink-0">🥬</div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-emerald-950 mb-0.5">
                    {language === 'te' ? 'తాజా & నాణ్యమైన పంట' : 'Fresh & Quality'}
                  </h4>
                  <p className="text-emerald-900 text-sm sm:text-base font-medium leading-snug">
                    {language === 'te' ? 'రోజూ పొలం నుండి తాజాగా కోసిన నాణ్యమైన కూరగాయలు' : 'Freshly harvested, quality guaranteed every time'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 xl:p-12 bg-white">
        <div className="w-full max-w-md py-4 sm:py-6">
          <div className="text-center mb-8">
            {/* AgriConnect above Welcome Back */}
            <div className="inline-flex items-center justify-center gap-2 text-primary-700 font-extrabold text-2xl sm:text-3xl tracking-tight mb-2">
              <Sprout className="w-8 h-8 text-primary-600" />
              <span>{t('brand.name', 'AgriConnect')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {language === 'te' ? 'స్వాగతం!' : 'Welcome Back!'}
            </h2>
            <p className="text-gray-500 text-sm">
              {language === 'te' ? 'మీ ఖాతాలోకి ప్రవేశించండి' : 'Login to continue to your account'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('auth.selectRole', 'Login As')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {roles.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                        ${isSelected 
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' 
                          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                    >
                      {role.icon}
                      <span className="text-xs font-medium mt-2">
                        {t(role.labelKey, role.defaultName)}
                      </span>
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center border-2 border-white">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.username', 'Username or Mobile')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                    placeholder={language === 'te' ? 'వినియోగదారు పేరు' : 'Enter username'}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.password', 'Password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                    placeholder={language === 'te' ? 'పాస్‌వర్డ్' : 'Enter password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  {t('auth.remember', 'Remember me')}
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => showToast(language === 'te' ? 'పాస్‌వర్డ్ రీసెట్ కోసం నిర్వాహకుడిని సంప్రదించండి' : 'Contact admin for password reset', 'info')}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  {language === 'te' ? 'పాస్‌వర్డ్ మర్చిపోయారా?' : 'Forgot password?'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                language === 'te' ? 'డ్యాష్‌బోర్డ్‌లోకి ప్రవేశించండి' : 'Login to Dashboard'
              )}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                {t('auth.noAccount', "Don't have an account?")}{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  {t('auth.register', 'Register Now')}
                </Link>
              </p>
            </div>
          </form>

          {/* Feedback & Suggestions Callout Card (Placed Above Demo Login) */}
          <div className="mt-6 p-3.5 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border border-emerald-200/80 rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">
                  {language === 'te' ? 'సలహాదారులపై లేదా వేదికపై అభిప్రాయం ఉందా?' : 'Have Feedback or Suggestions for Admin?'}
                </p>
                <p className="text-[11px] text-gray-600">
                  {language === 'te' ? 'నేరుగా అడ్మిన్‌కు మాత్రమే చేరే గోప్యమైన అభిప్రాయం' : 'Submitted directly & privately to Admin only'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowFeedbackModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              {language === 'te' ? 'అభిప్రాయం ఇవ్వండి' : 'Give Feedback'}
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-5 bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
              <Info className="w-4 h-4 text-blue-500" />
              {t('auth.demoTitle', 'Quick Demo Login:')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { role: 'FARMER' as Role, user: 'farmer3', pass: 'password123', labelKey: 'role.farmer', defaultLabel: 'Farmer' },
                { role: 'CONSUMER' as Role, user: 'consumer1', pass: 'password123', labelKey: 'role.consumer', defaultLabel: 'Consumer' },
                { role: 'LARGE_SCALE_CONSUMER' as Role, user: 'bulkbuyer1', pass: 'password123', labelKey: 'role.largeScaleConsumer', defaultLabel: 'Bulk Buyer' },
                { role: 'ADVISER' as Role, user: 'adviser1', pass: 'password123', labelKey: 'role.adviser', defaultLabel: 'Adviser' },
                { role: 'COORDINATOR' as Role, user: 'coordinator1', pass: 'password123', labelKey: 'role.coordinator', defaultLabel: 'Coordinator' },
                { role: 'ADMIN' as Role, user: 'admin', pass: 'password123', labelKey: 'role.admin', defaultLabel: 'Admin' },
              ].map((demo, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDemoFill(demo.role, demo.user, demo.pass)}
                  className="flex justify-between items-center px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left cursor-pointer"
                >
                  <span className="font-medium text-gray-700 text-xs">{t(demo.labelKey, demo.defaultLabel)}</span>
                  <span className="text-gray-500 font-mono text-xs">{demo.user}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
      />
    </div>
  );
}
