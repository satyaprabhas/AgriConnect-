import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  GraduationCap, 
  Trash2, 
  Filter, 
  CheckCircle, 
  AlertCircle,
  Search,
  User,
  Phone,
  Calendar,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Sprout,
  Truck,
  ShieldCheck
} from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

interface FeedbackItem {
  id: number;
  user_id?: number;
  submitter_role: string;
  submitter_name: string;
  submitter_contact?: string;
  feedback_type: string;
  adviser_id?: number;
  adviser_name?: string;
  adviser_specialization?: string;
  rating: number;
  comments: string;
  created_at: string;
}

const AdminFeedback: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedAdviserFilter, setSelectedAdviserFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [advisersList, setAdvisersList] = useState<{ id: number; full_name: string }[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    adviserCount: 0,
    avgAdviserRating: 0
  });

  useEffect(() => {
    fetchAdvisers();
    fetchFeedbacks();
  }, [filterType, selectedAdviserFilter]);

  const fetchAdvisers = async () => {
    try {
      const res = await api.get('/feedback/advisers');
      setAdvisersList(res.data || []);
    } catch (_) {}
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/feedback', {
        params: {
          type: filterType,
          adviser_id: selectedAdviserFilter
        }
      });
      setFeedbacks(res.data.feedbacks || []);
      setStats({
        total: res.data.total_feedback || 0,
        adviserCount: res.data.adviser_feedback_count || 0,
        avgAdviserRating: res.data.avg_adviser_rating || 0
      });
    } catch (err) {
      showToast('Failed to load feedback records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(language === 'te' ? 'ఈ సమీక్షను తొలగించాలనుకుంటున్నారా?' : 'Are you sure you want to delete this feedback?')) {
      return;
    }
    try {
      await api.delete(`/feedback/${id}`);
      showToast(language === 'te' ? 'సమీక్ష విజయవంతంగా తొలగించబడింది' : 'Feedback deleted successfully', 'success');
      fetchFeedbacks();
    } catch (err) {
      showToast('Failed to delete feedback', 'error');
    }
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      fb.submitter_name?.toLowerCase().includes(term) ||
      fb.adviser_name?.toLowerCase().includes(term) ||
      fb.comments?.toLowerCase().includes(term) ||
      fb.submitter_contact?.toLowerCase().includes(term)
    );
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'FARMER': return 'bg-green-100 text-green-800 border-green-200';
      case 'CONSUMER': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LARGE_SCALE_CONSUMER': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COORDINATOR': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ADVISER': return { label: 'Agricultural Adviser Review', icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> };
      case 'FARMER_EXPERIENCE': return { label: 'Produce Quality', icon: <Sprout className="w-3.5 h-3.5 text-green-600" /> };
      case 'DELIVERY': return { label: 'Delivery & Logistics', icon: <Truck className="w-3.5 h-3.5 text-blue-600" /> };
      case 'PLATFORM': return { label: 'AgriConnect Platform', icon: <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> };
      default: return { label: 'General Feedback', icon: <MessageSquare className="w-3.5 h-3.5 text-gray-600" /> };
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-emerald-600" />
            <span>{language === 'te' ? 'అభిప్రాయాలు & సలహాదారుల సూచనలు' : 'Feedback & Community Suggestions'}</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              {language === 'te' 
                ? '🔒 అడ్మిన్‌కు మాత్రమే ప్రత్యేకం • సలహాదారులు మరియు ఇతరులకు కనిపించదు' 
                : '🔒 Confidential to Admin • Hidden from advisers & other users'}
            </span>
          </div>
        </div>

        <button
          onClick={fetchFeedbacks}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition-colors shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{language === 'te' ? 'రిఫ్రెష్' : 'Refresh'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {language === 'te' ? 'మొత్తం అభిప్రాయాలు' : 'Total Feedbacks'}
            </p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.total}</h3>
            <p className="text-xs text-green-600 mt-1">All categories</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {language === 'te' ? 'సలహాదారు అభిప్రాయాలు' : 'Adviser Feedbacks'}
            </p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.adviserCount}</h3>
            <p className="text-xs text-emerald-600 mt-1">Crop & soil consultations</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {language === 'te' ? 'రైతుల నుండి సూచనలు' : 'Platform & Quality'}
            </p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.total - stats.adviserCount}</h3>
            <p className="text-xs text-emerald-600 mt-1">Produce & delivery feedback</p>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Sparkles className="w-6 h-6 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:ring-2 focus:ring-green-500"
          >
            <option value="ALL">All Categories</option>
            <option value="ADVISER">Adviser Reviews</option>
            <option value="FARMER_EXPERIENCE">Produce Quality</option>
            <option value="DELIVERY">Delivery & Logistics</option>
            <option value="PLATFORM">AgriConnect Platform</option>
            <option value="GENERAL">General Feedback</option>
          </select>

          {/* Adviser Filter */}
          <select
            value={selectedAdviserFilter}
            onChange={(e) => setSelectedAdviserFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:ring-2 focus:ring-green-500"
          >
            <option value="ALL">All Advisers</option>
            {advisersList.map((adv) => (
              <option key={adv.id} value={adv.id}>
                {adv.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'te' ? 'శోధించండి (పేరు, సలహాదారు, విషయం)...' : 'Search submitter, adviser, text...'}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-green-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Feedbacks List */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredFeedbacks.length === 0 ? (
        <EmptyState
          title={language === 'te' ? 'ఎటువంటి అభిప్రాయాలు కనుగొనబడలేదు' : 'No Feedback Found'}
          message={language === 'te' ? 'ఎంచుకున్న ఫిల్టర్‌కు సరిపోలే సమీక్షలు ఏవీ లేవు.' : 'No feedback matching the selected filter was found.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeedbacks.map((fb) => {
            const typeInfo = getTypeLabel(fb.feedback_type);
            return (
              <div 
                key={fb.id} 
                className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top line: Role badge, type, delete */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRoleBadgeColor(fb.submitter_role)}`}>
                        {fb.submitter_role}
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                        {typeInfo.icon}
                        <span>{typeInfo.label}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(fb.id)}
                      title="Delete Feedback"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Feedback Date */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {new Date(fb.created_at).toLocaleDateString()} • {new Date(fb.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* If Adviser Feedback: Show Adviser Box */}
                  {fb.adviser_id && (
                    <div className="mb-3 p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-950 truncate">
                          Adviser: {fb.adviser_name || `ID #${fb.adviser_id}`}
                        </p>
                        {fb.adviser_specialization && (
                          <p className="text-[11px] text-emerald-700 truncate">
                            {fb.adviser_specialization}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Comments text */}
                  <p className="text-sm text-gray-800 leading-relaxed font-normal bg-gray-50/60 p-3 rounded-xl border border-gray-100/80">
                    "{fb.comments}"
                  </p>
                </div>

                {/* Submitter Info Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                      {fb.submitter_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{fb.submitter_name}</p>
                      {fb.submitter_contact && (
                        <p className="text-[11px] text-gray-400">{fb.submitter_contact}</p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    ID #{fb.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
