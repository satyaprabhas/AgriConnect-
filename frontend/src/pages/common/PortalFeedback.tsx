import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MessageSquare, 
  GraduationCap, 
  Send, 
  CheckCircle2, 
  User, 
  Phone, 
  Sparkles, 
  Calendar, 
  ThumbsUp, 
  RefreshCw, 
  Plus 
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FeedbackModal from '../../components/common/FeedbackModal';

interface AdviserFeedbackDisplay {
  id: number;
  submitter_role: string;
  submitter_name: string;
  feedback_type: string;
  adviser_id?: number;
  adviser_name?: string;
  adviser_specialization?: string;
  rating: number;
  comments: string;
  created_at: string;
}

const PortalFeedback: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [advisers, setAdvisers] = useState<any[]>([]);
  const [selectedAdviser, setSelectedAdviser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvisers();
  }, []);

  const fetchAdvisers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/feedback/advisers');
      setAdvisers(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedAdviser(res.data[0]);
      }
    } catch (err) {
      showToast('Failed to load advisers list', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
            <span>{language === 'te' ? 'అడ్మిన్‌కు మాత్రమే చేరే గోప్యమైన అభిప్రాయం' : 'Admin-Only Confidential Feedback'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'te' ? 'సలహాదారులపై & వేదికపై అభిప్రాయం' : 'Adviser & Platform Feedback'}
          </h1>
          <p className="text-green-100 text-sm mt-2 leading-relaxed">
            {language === 'te' 
              ? 'వ్యవసాయ సలహాదారుల సిఫార్సులు, పంట వ్యాధుల పరిష్కారం మరియు అగ్రి కనెక్ట్ వేదికపై మీ అభిప్రాయాన్ని నేరుగా అడ్మిన్‌కు పంపండి. ఇది పూర్తిగా గోప్యంగా ఉంటుంది.' 
              : 'Share your genuine feedback on agricultural advisers or platform services directly with the Platform Administrator. Your feedback is strictly confidential.'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 flex items-center gap-2 px-6 py-3 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-5 h-5 text-emerald-700" />
          <span>{language === 'te' ? 'అభిప్రాయం ఇవ్వండి' : 'Write Feedback'}</span>
        </button>
      </div>

      {/* Verified Advisers Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              <span>{language === 'te' ? 'ధృవీకరించబడిన వ్యవసాయ సలహాదారులు' : 'Verified Agricultural Advisers'}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'te' ? 'మీరు సంప్రదించిన సలహాదారుని ఎంచుకుని అడ్మిన్‌కు అభిప్రాయం తెలియజేయండి' : 'Select an adviser to submit feedback to the Administrator'}
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : advisers.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No advisers registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {advisers.map((adv) => (
              <div 
                key={adv.id}
                className="p-4 rounded-2xl border border-emerald-100/80 bg-emerald-50/30 hover:bg-emerald-50/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {adv.full_name?.charAt(0) || 'A'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 truncate">{adv.full_name}</h3>
                      <p className="text-xs text-emerald-700 truncate">{adv.specialization || 'Agronomist'}</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1 mb-4 bg-white/80 p-2.5 rounded-xl border border-gray-100">
                    {adv.qualification && <p>🎓 {adv.qualification}</p>}
                    {adv.experience_years ? <p>⏱️ {adv.experience_years} years experience</p> : null}
                    {adv.district && <p>📍 {adv.district}, {adv.state}</p>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedAdviser(adv);
                    setIsModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'అడ్మిన్‌కు అభిప్రాయం పంపండి' : 'Send Feedback to Admin'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultFeedbackType="ADVISER"
        preselectedAdviserId={selectedAdviser?.id}
      />
    </div>
  );
};

export default PortalFeedback;
