import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Users, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Search, 
  BookOpen, 
  MessageSquare, 
  Play, 
  UserCheck,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { Topic, UserProfile, StudyRequest } from '../types';

interface StudyRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  incomingRequests: StudyRequest[];
  outgoingRequests: StudyRequest[];
  peers: UserProfile[];
  topics: Topic[];
  initialTopicId?: string;
  initialQuizId?: string;
  onSendRequest: (data: {
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    topicId: string;
    topicTitle: string;
    quizId?: string;
    quizTitle?: string;
    message?: string;
  }) => Promise<string | void>;
  onRespondRequest: (requestId: string, status: 'accepted' | 'declined') => Promise<void>;
  onCancelRequest: (requestId: string) => Promise<void>;
  onStartCollaborativePractice: (request: StudyRequest) => void;
  onOpenChat?: (peerId: string) => void;
}

export default function StudyRequestsModal({
  isOpen,
  onClose,
  currentUser,
  incomingRequests,
  outgoingRequests,
  peers,
  topics,
  initialTopicId,
  initialQuizId,
  onSendRequest,
  onRespondRequest,
  onCancelRequest,
  onStartCollaborativePractice,
  onOpenChat
}: StudyRequestsModalProps) {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'new'>(
    initialTopicId ? 'new' : incomingRequests.some(r => r.status === 'pending') ? 'incoming' : 'new'
  );

  // Form state for new study request
  const [selectedPeerId, setSelectedPeerId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || (topics[0]?.id || ''));
  const [selectedQuizId, setSelectedQuizId] = useState<string>(initialQuizId || '');
  const [message, setMessage] = useState<string>('');
  const [peerSearchQuery, setPeerSearchQuery] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  const currentSelectedTopic = topics.find(t => t.id === selectedTopicId) || topics[0];
  const pendingIncomingCount = incomingRequests.filter(r => r.status === 'pending').length;

  const filteredPeers = peers.filter(p => 
    p.displayName.toLowerCase().includes(peerSearchQuery.toLowerCase()) ||
    (p.mathAbility && p.mathAbility.toLowerCase().includes(peerSearchQuery.toLowerCase()))
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeerId || !selectedTopicId) return;

    const targetPeer = peers.find(p => p.uid === selectedPeerId);
    if (!targetPeer) return;

    const topic = topics.find(t => t.id === selectedTopicId);
    if (!topic) return;

    const quiz = selectedQuizId ? topic.quizzes.find(q => q.id === selectedQuizId) : undefined;

    setIsSubmitting(true);
    try {
      await onSendRequest({
        fromUserId: currentUser.uid,
        fromUserName: currentUser.displayName,
        toUserId: targetPeer.uid,
        toUserName: targetPeer.displayName,
        topicId: topic.id,
        topicTitle: topic.title,
        quizId: quiz?.id,
        quizTitle: quiz?.title,
        message: message.trim() || undefined
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('outgoing');
        setSelectedPeerId('');
        setMessage('');
      }, 1200);
    } catch (err) {
      console.error("Failed to send study request:", err);
      alert("Failed to send study request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div 
      id="study-requests-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div
        id="study-requests-modal"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Peer Study Requests
                <span className="text-xs px-2.5 py-0.5 bg-indigo-100 text-indigo-700 font-semibold rounded-full">
                  Collaborative
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Team up with classmates for targeted practice and mutual mastery
              </p>
            </div>
          </div>
          <button
            id="close-study-modal-button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-white gap-2">
          <button
            id="tab-incoming-requests"
            onClick={() => setActiveTab('incoming')}
            className={`pb-3 px-3 text-sm font-semibold relative transition-colors flex items-center gap-2 ${
              activeTab === 'incoming'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Incoming</span>
            {pendingIncomingCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded-full">
                {pendingIncomingCount}
              </span>
            )}
          </button>

          <button
            id="tab-outgoing-requests"
            onClick={() => setActiveTab('outgoing')}
            className={`pb-3 px-3 text-sm font-semibold relative transition-colors flex items-center gap-2 ${
              activeTab === 'outgoing'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Sent Requests</span>
            <span className="text-xs text-slate-400 font-normal">({outgoingRequests.length})</span>
          </button>

          <button
            id="tab-new-request"
            onClick={() => setActiveTab('new')}
            className={`pb-3 px-3 text-sm font-semibold relative transition-colors flex items-center gap-2 ${
              activeTab === 'new'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send New Request</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* TAB 1: INCOMING REQUESTS */}
          {activeTab === 'incoming' && (
            <div className="space-y-4">
              {incomingRequests.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">No incoming requests yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                    When classmates invite you to review topics or solve math problems together, they will show up here!
                  </p>
                  <button
                    id="switch-to-send-tab-button"
                    onClick={() => setActiveTab('new')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Invite a Classmate
                  </button>
                </div>
              ) : (
                incomingRequests.map((req) => (
                  <motion.div
                    key={req.id}
                    id={`incoming-request-card-${req.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 transition-all shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                          {req.fromUserName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{req.fromUserName}</span>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(req.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-0.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            {req.topicTitle}
                            {req.quizTitle && <span className="text-slate-400"> • {req.quizTitle}</span>}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      {req.status === 'pending' && (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {req.status === 'accepted' && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Accepted
                        </span>
                      )}
                      {req.status === 'declined' && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                          Declined
                        </span>
                      )}
                      {req.status === 'completed' && (
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Completed
                        </span>
                      )}
                    </div>

                    {req.message && (
                      <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 italic border border-slate-100 flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span>"{req.message}"</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      {onOpenChat ? (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenChat(req.fromUserId);
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-1.5"
                          title={`Message ${req.fromUserName} directly`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat with {req.fromUserName}</span>
                        </button>
                      ) : <div />}

                      <div className="flex items-center gap-2">
                        {req.status === 'pending' && (
                          <>
                            <button
                              id={`decline-request-button-${req.id}`}
                              onClick={() => onRespondRequest(req.id, 'declined')}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Decline
                            </button>
                            <button
                              id={`accept-request-button-${req.id}`}
                              onClick={() => {
                                onRespondRequest(req.id, 'accepted');
                                onStartCollaborativePractice(req);
                              }}
                              className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-100 transition-colors flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Accept & Practice
                            </button>
                          </>
                        )}

                        {req.status === 'accepted' && (
                          <button
                            id={`start-collaborative-practice-${req.id}`}
                            onClick={() => onStartCollaborativePractice(req)}
                            className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-100 transition-colors flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Launch Practice Session
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: OUTGOING REQUESTS */}
          {activeTab === 'outgoing' && (
            <div className="space-y-4">
              {outgoingRequests.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Send className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">No study requests sent yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                    Ready to practice difficult topics with a friend? Send a request to any classmate.
                  </p>
                  <button
                    id="switch-to-new-request-button"
                    onClick={() => setActiveTab('new')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Create Study Request
                  </button>
                </div>
              ) : (
                outgoingRequests.map((req) => (
                  <motion.div
                    key={req.id}
                    id={`outgoing-request-card-${req.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 transition-all shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm">
                          {req.toUserName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">To: {req.toUserName}</span>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(req.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-0.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            {req.topicTitle}
                            {req.quizTitle && <span className="text-slate-400"> • {req.quizTitle}</span>}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      {req.status === 'pending' && (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Waiting for response
                        </span>
                      )}
                      {req.status === 'accepted' && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Accepted!
                        </span>
                      )}
                      {req.status === 'declined' && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                          Declined
                        </span>
                      )}
                      {req.status === 'completed' && (
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Completed
                        </span>
                      )}
                      {req.status === 'cancelled' && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-400 text-xs font-semibold rounded-full">
                          Cancelled
                        </span>
                      )}
                    </div>

                    {req.message && (
                      <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 italic border border-slate-100">
                        "{req.message}"
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      {onOpenChat ? (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenChat(req.toUserId);
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-1.5"
                          title={`Message ${req.toUserName} directly`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat with {req.toUserName}</span>
                        </button>
                      ) : <div />}

                      <div className="flex items-center gap-2">
                        {req.status === 'pending' && (
                          <button
                            id={`cancel-request-button-${req.id}`}
                            onClick={() => onCancelRequest(req.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            Cancel Request
                          </button>
                        )}

                        {req.status === 'accepted' && (
                          <button
                            id={`launch-outgoing-session-${req.id}`}
                            onClick={() => onStartCollaborativePractice(req)}
                            className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-100 transition-colors flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Start Practice with {req.toUserName}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: SEND NEW STUDY REQUEST */}
          {activeTab === 'new' && (
            <form onSubmit={handleSend} className="space-y-5">
              {submitSuccess ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Study Request Sent!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your classmate has been notified. You can track their response in the Sent Requests tab.
                  </p>
                </div>
              ) : (
                <>
                  {/* Step 1: Select Peer */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      1. Select a Classmate
                    </label>

                    {/* Search filter */}
                    <div className="relative mb-2">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="peer-search-input"
                        type="text"
                        placeholder="Search classmates by name or ability..."
                        value={peerSearchQuery}
                        onChange={(e) => setPeerSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                      {filteredPeers.length === 0 ? (
                        <div className="col-span-2 py-6 text-center text-xs text-slate-400">
                          No classmates found matching "{peerSearchQuery}"
                        </div>
                      ) : (
                        filteredPeers.map((peer) => {
                          const isSelected = selectedPeerId === peer.uid;
                          return (
                            <button
                              key={peer.uid}
                              id={`select-peer-${peer.uid}`}
                              type="button"
                              onClick={() => setSelectedPeerId(peer.uid)}
                              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center ${
                                  isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {peer.displayName.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-xs text-slate-900">{peer.displayName}</div>
                                  <div className="text-[10px] text-slate-500">
                                    Lvl {peer.level} • {peer.xp} XP
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                  <UserCheck className="w-3 h-3" />
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Step 2: Select Topic & Quiz */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        2. Math Topic
                      </label>
                      <select
                        id="study-topic-select"
                        value={selectedTopicId}
                        onChange={(e) => {
                          setSelectedTopicId(e.target.value);
                          setSelectedQuizId('');
                        }}
                        className="w-full px-3 py-2.5 text-xs font-medium bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        {topics.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Specific Quiz (Optional)
                      </label>
                      <select
                        id="study-quiz-select"
                        value={selectedQuizId}
                        onChange={(e) => setSelectedQuizId(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs font-medium bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Any practice in this topic</option>
                        {currentSelectedTopic?.quizzes.map(q => (
                          <option key={q.id} value={q.id}>
                            {q.title} (+{q.xpReward} XP)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Step 3: Message / Note */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      3. Study Note (Optional)
                    </label>
                    <textarea
                      id="study-request-message-input"
                      rows={2}
                      placeholder="e.g., Let's practice finding vertical asymptotes together before Friday's quiz!"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={160}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Tip: State what specific problems or concepts you want to collaborate on.</span>
                      <span>{message.length}/160</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      id="send-study-request-submit-button"
                      type="submit"
                      disabled={!selectedPeerId || !selectedTopicId || isSubmitting}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Study Request
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>

        {/* Modal Footer Tip */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Students practicing collaboratively earn a <strong>+50 XP peer bonus</strong> on completion!</span>
          </div>
          <button
            id="footer-close-study-modal-button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
