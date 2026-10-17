import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  User, 
  Phone, 
  GraduationCap, 
  Sparkles,
  Loader2,
  Building2,
  Sprout,
  ShoppingCart,
  ShieldCheck,
  Lock
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface AdviserOption {
  id: number;
  full_name: string;
  specialization?: string;
  qualification?: string;
  village?: string;
  district?: string;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFeedbackType?: 'ADVISER' | 'PLATFORM' | 'DELIVERY' | 'FARMER_EXPERIENCE' | 'GENERAL';
  preselectedAdviserId?: number;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultFeedbackType = 'ADVISER',
  preselectedAdviserId
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();

  const [role, setRole] = useState<string>(user?.role || 'CONSUMER');
  const [name, setName] = useState<string>(user?.full_name || '');
  const [contact, setContact] = useState<string>(user?.mobile_number || user?.email || '');
  const [feedbackType, setFeedbackType] = useState<string>(defaultFeedbackType);
  const [adviserId, setAdviserId] = useState<string>(preselectedAdviserId ? String(preselectedAdviserId) : '');
  const [comments, setComments] = useState<string>('');
  
  const [advisers, setAdvisers] = useState<AdviserOption[]>([]);
  const [loadingAdvisers, setLoadingAdvisers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Helper to reset form inputs
  const resetForm = () => {
    setComments('');
    setErrorMessage('');
    setIsSuccess(false);
    if (user) {
      setName(user.full_name || '');
      setContact(user.mobile_number || user.email || '');
      setRole(user.role || 'CONSUMER');
    } else {
      setName('');
      setContact('');
      setRole('CONSUMER');
    }
    setFeedbackType(defaultFeedbackType);
    setAdviserId(preselectedAdviserId ? String(preselectedAdviserId) : '');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Auto-sync user if logged in
  useEffect(() => {
    if (user) {
      if (!name) setName(user.full_name || '');
      if (!contact) setContact(user.mobile_number || user.email || '');
      setRole(user.role || 'CONSUMER');
    }
  }, [user]);

  // Fetch advisers for dropdown & reset form on each open
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setLoadingAdvisers(true);
      api.get('/feedback/advisers')
        .then((res) => {
          setAdvisers(res.data || []);
          if (res.data && res.data.length > 0) {
            setAdviserId(preselectedAdviserId ? String(preselectedAdviserId) : String(res.data[0].id));
          }
        })
        .catch((err) => {
          console.warn('Could not load advisers:', err);
        })
        .finally(() => {
          setLoadingAdvisers(false);
        });
    }
  }, [isOpen, preselectedAdviserId, defaultFeedbackType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage(language === 'te' ? 'దయచేసి మీ పేరు నమోదు చేయండి' : 'Please enter your name');
      return;
    }

    if (!comments.trim()) {
      setErrorMessage(language === 'te' ? 'దయచేసి మీ అభిప్రాయాన్ని నమోదు చేయండి' : 'Please provide your comments');
      return;
    }

    if (feedbackType === 'ADVISER' && !adviserId) {
      setErrorMessage(language === 'te' ? 'దయచేసి సలహాదారుని ఎంచుకోండి' : 'Please select an adviser');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/feedback', {
        submitter_role: role,
        submitter_name: name.trim(),
        submitter_contact: contact.trim(),
        feedback_type: feedbackType,
        adviser_id: feedbackType === 'ADVISER' ? Number(adviserId) : null,
        comments: comments.trim()
      });

      setIsSuccess(true);
      setComments('');
      showToast(
        language === 'te' 
          ? 'మీ విలువైన అభిప్రాయం సమర్పించబడింది. ధన్యవాదాలు!' 
          : 'Your feedback has been submitted successfully!',
        'success'
      );
    } catch (err: any) {
      const msg = err.response?.data?.error || (language === 'te' ? 'సమర్పణ విఫలమైంది' : 'Failed to submit feedback');
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-gray-100 overflow-hidden transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 p-6 text-white relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {language === 'te' ? 'అభిప్రాయం & సూచనలు (అడ్మిన్‌కు)' : 'Feedback & Suggestions (To Admin)'}
              </h2>
              <p className="text-green-100 text-xs mt-0.5">
                {language === 'te' 
                  ? 'అడ్మిన్‌కు మాత్రమే చేరే గోప్యమైన అభిప్రాయం • ఎవరికీ బహిర్గతం కాదు' 
                  : 'Direct confidential feedback submitted exclusively to Platform Administrator'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {language === 'te' ? 'అభిప్రాయం అడ్మిన్‌కు చేరింది!' : 'Feedback Sent to Admin!'}
              </h3>
              <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
                {language === 'te'
                  ? 'మీ అభిప్రాయం నిర్వాహకులకు (Admin) విజయవంతంగా పంపబడింది. ఇది పూర్తిగా గోప్యంగా ఉంటుంది మరియు అడ్మిన్ తప్ప ఎవరూ చూడలేరు.'
                  : 'Your feedback has been submitted directly and confidentially to the Platform Administrator. No one else has access to view this feedback.'}
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  {language === 'te' ? 'పూర్తయింది' : 'Done & Close'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Submitter Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  {language === 'te' ? 'మీరు ఎవరు?' : 'I am a:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'FARMER', label: language === 'te' ? 'రైతు' : 'Farmer', icon: <Sprout className="w-4 h-4 text-green-600" /> },
                    { id: 'CONSUMER', label: language === 'te' ? 'వినియోగదారుడు' : 'Consumer', icon: <ShoppingCart className="w-4 h-4 text-emerald-600" /> },
                    { id: 'LARGE_SCALE_CONSUMER', label: language === 'te' ? 'టోకు కొనుగోలుదారు' : 'Bulk Buyer', icon: <Building2 className="w-4 h-4 text-amber-600" /> },
                    { id: 'GUEST', label: language === 'te' ? 'సందర్శకుడు' : 'Guest / Other', icon: <User className="w-4 h-4 text-blue-600" /> }
                  ].map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        role === r.id
                          ? 'border-green-600 bg-green-50 text-green-800 font-semibold shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {r.icon}
                      <span className="truncate">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submitter Name & Mobile / Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {language === 'te' ? 'మీ పేరు *' : 'Your Full Name *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'te' ? 'మీ పేరు' : 'e.g. Ramesh Reddy'}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {language === 'te' ? 'మొబైల్ లేదా ఈమెయిల్' : 'Mobile Number or Email'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder={language === 'te' ? '9876543210' : '9876543210 / email'}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Feedback Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {language === 'te' ? 'అభిప్రాయ రకం' : 'Feedback Category'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'ADVISER', label: language === 'te' ? '👨‍🌾 వ్యవసాయ సలహాదారు అభిప్రాయం' : '👨‍🌾 Agricultural Adviser Feedback', desc: 'Advice, disease remedy accuracy & suggestions' },
                    { id: 'FARMER_EXPERIENCE', label: language === 'te' ? '🌾 రైతుల పంట & నాణ్యత' : '🌾 Produce Quality & Freshness', desc: 'Feedback on vegetables & harvest quality' },
                    { id: 'DELIVERY', label: language === 'te' ? '🚚 డెలివరీ & సేకరణ' : '🚚 Delivery & Logistics', desc: 'Pickup and delivery coordinator service' },
                    { id: 'PLATFORM', label: language === 'te' ? '💡 అగ్రి కనెక్ట్ వేదిక' : '💡 AgriConnect App & Platform', desc: 'Suggestions & user experience' }
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setFeedbackType(cat.id)}
                      className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                        feedbackType === cat.id
                          ? 'border-green-600 bg-green-50/80 shadow-sm ring-1 ring-green-500'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-xs text-gray-900">{cat.label}</div>
                      <div className="text-[11px] text-gray-500 leading-tight mt-0.5">{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* If Feedback Type is ADVISER: Select Adviser Dropdown */}
              {feedbackType === 'ADVISER' && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-2">
                  <label className="block text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    {language === 'te' ? 'సలహాదారుని ఎంచుకోండి *' : 'Select Agricultural Adviser *'}
                  </label>
                  {loadingAdvisers ? (
                    <div className="flex items-center gap-2 text-xs text-gray-500 py-1">
                      <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                      Loading verified advisers...
                    </div>
                  ) : advisers.length === 0 ? (
                    <div className="text-xs text-gray-500 italic">
                      No advisers found. You can leave general feedback.
                    </div>
                  ) : (
                    <select
                      value={adviserId}
                      onChange={(e) => setAdviserId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-sm text-gray-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
                    >
                      {advisers.map((adv) => (
                        <option key={adv.id} value={adv.id}>
                          {adv.full_name} {adv.specialization ? `— (${adv.specialization})` : ''} {adv.district ? `[${adv.district}]` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Comments / Details (Rating removed as requested) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                  <span>
                    {language === 'te' ? 'మీ అభిప్రాయం & సూచనలు *' : 'Your Feedback & Comments *'}
                  </span>
                  <span className="text-[11px] font-normal text-gray-400">
                    {comments.length} characters
                  </span>
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  placeholder={
                    feedbackType === 'ADVISER'
                      ? (language === 'te' 
                          ? 'సలహాదారు ఇచ్చిన సలహాలు, పరిష్కారాల నాణ్యత, స్పందించిన సమయం మరియు మీ పంటకు కలిగిన ప్రయోజనాన్ని వివరించండి...' 
                          : 'Share your experience with the adviser: clarity of disease guidance, treatment effectiveness, response time, or suggestions...')
                      : (language === 'te' 
                          ? 'కూరగాయల తాజాదనం, మార్కెట్ ధరలు లేదా వేదిక సేవలపై మీ అభిప్రాయం పంచుకోండి...' 
                          : 'Share your experience regarding fair pricing, produce freshness, delivery, or general suggestions...')
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  required
                />
              </div>

              {/* Strict Privacy Guarantee Box */}
              <div className="flex items-start gap-2.5 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-950 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="leading-snug">
                  <span className="font-bold block text-emerald-900 mb-0.5">
                    {language === 'te' ? '🔒 అడ్మిన్‌కు మాత్రమే గోప్యతా హామీ:' : '🔒 Admin-Only Confidentiality Guarantee:'}
                  </span>
                  <span>
                    {language === 'te' 
                      ? 'ఈ అభిప్రాయం నేరుగా అడ్మిన్ పోర్టల్‌లో మాత్రమే ప్రతిబింబిస్తుంది. సలహాదారులు, ఇతర వినియోగదారులు లేదా మరెవరూ దీనిని చూడలేరు.' 
                      : 'This feedback reflects strictly on the Admin Portal. It will NOT be visible to advisers, farmers, consumers, or anyone else.'}
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {language === 'te' ? 'రద్దు' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === 'te' ? 'సమర్పిస్తోంది...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{language === 'te' ? 'అభిప్రాయాన్ని సమర్పించండి' : 'Submit Feedback'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
