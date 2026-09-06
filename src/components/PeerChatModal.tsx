import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Search, 
  Users, 
  BookOpen, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Plus, 
  Zap, 
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { 
  UserProfile, 
  Topic, 
  ChatMessage, 
  ChatConversation, 
  StudyRequest, 
  StudyRequestStatus 
} from '../types';

interface PeerChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  peers: UserProfile[];
  topics: Topic[];
  conversations: ChatConversation[];
  messages: ChatMessage[];
  totalUnreadCount: number;
  initialPeerId?: string;
  initialTopicId?: string;
  onSendMessage: (params: {
    recipientId: string;
    recipientName: string;
    text: string;
    studyRequestId?: string;
    studyRequestData?: {
      topicId: string;
      topicTitle: string;
      quizId?: string;
      quizTitle?: string;
      status: StudyRequestStatus;
    };
  }) => Promise<string>;
  onMarkConversationAsRead: (conversationId: string) => Promise<void>;
  onSendStudyRequest: (data: {
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
  onRespondStudyRequest: (requestId: string, status: 'accepted' | 'declined') => Promise<void>;
  onStartCollaborativePractice: (request: StudyRequest) => void;
}

export default function PeerChatModal({
  isOpen,
  onClose,
  currentUser,
  peers,
  topics,
  conversations,
  messages,
  initialPeerId,
  initialTopicId,
  onSendMessage,
  onMarkConversationAsRead,
  onSendStudyRequest,
  onRespondStudyRequest,
  onStartCollaborativePractice
}: PeerChatModalProps) {
  // Active conversation state
  const [activePeerId, setActivePeerId] = useState<string | null>(
    initialPeerId || (conversations[0]?.peerId || (peers[0]?.uid || null))
  );

  // Search filter for peer list
  const [searchQuery, setSearchQuery] = useState('');
  // Message input
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Study Proposal Sub-form state inside chat
  const [showProposePanel, setShowProposePanel] = useState(false);
  const [proposeTopicId, setProposeTopicId] = useState<string>(initialTopicId || topics[0]?.id || '');
  const [proposeQuizId, setProposeQuizId] = useState<string>('');
  const [proposeNote, setProposeNote] = useState<string>('');
  const [isSendingProposal, setIsSendingProposal] = useState(false);

  // Show "New Chat / Directory" on mobile or empty
  const [mobileView, setMobileView] = useState<'threads' | 'messages'>('threads');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync initialPeerId if opened with a specific peer
  useEffect(() => {
    if (initialPeerId) {
      setActivePeerId(initialPeerId);
      setMobileView('messages');
    }
  }, [initialPeerId]);

  // Selected peer profile
  const activePeer = peers.find(p => p.uid === activePeerId) || 
    (conversations.find(c => c.peerId === activePeerId) ? {
      uid: activePeerId!,
      displayName: conversations.find(c => c.peerId === activePeerId)!.peerName,
      email: '',
      role: 'student' as const,
      xp: 0,
      level: 1,
      streak: 0,
      lastActive: new Date().toISOString(),
      badges: [],
      mathAbility: conversations.find(c => c.peerId === activePeerId)!.peerMathAbility
    } : null);

  // Filter messages for currently active conversation
  const activeConversationId = activePeerId && currentUser.uid
    ? [currentUser.uid, activePeerId].sort().join('_')
    : null;

  const conversationMessages = messages.filter(
    m => m.conversationId === activeConversationId
  );

  // Automatically mark active conversation as read
  useEffect(() => {
    if (isOpen && activeConversationId) {
      onMarkConversationAsRead(activeConversationId);
    }
  }, [isOpen, activeConversationId, messages.length, onMarkConversationAsRead]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (mobileView === 'messages' || !window.matchMedia('(max-width: 768px)').matches) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages.length, showProposePanel]);

  if (!isOpen) return null;

  // Filter peers by search query
  const filteredPeers = peers.filter(p => 
    p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.mathAbility && p.mathAbility.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Send regular text message
  const handleSendTextMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activePeer || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await onSendMessage({
        recipientId: activePeer.uid,
        recipientName: activePeer.displayName,
        text
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setInputText(text); // Restore on error
    } finally {
      setIsSending(false);
    }
  };

  // Send study request directly inside the conversation
  const handleSendStudyProposal = async () => {
    if (!activePeer || !proposeTopicId || isSendingProposal) return;

    const topic = topics.find(t => t.id === proposeTopicId);
    if (!topic) return;

    const quiz = topic.quizzes.find(q => q.id === proposeQuizId);

    setIsSendingProposal(true);
    try {
      // 1. Create the persistent StudyRequest in Firestore
      const note = proposeNote.trim() || `Hey ${activePeer.displayName}, let's practice ${topic.title} together!`;
      const requestId = await onSendStudyRequest({
        fromUserId: currentUser.uid,
        fromUserName: currentUser.displayName,
        toUserId: activePeer.uid,
        toUserName: activePeer.displayName,
        topicId: topic.id,
        topicTitle: topic.title,
        quizId: quiz?.id,
        quizTitle: quiz?.title,
        message: note
      });

      // 2. Send as direct message with embedded study request card
      await onSendMessage({
        recipientId: activePeer.uid,
        recipientName: activePeer.displayName,
        text: note,
        studyRequestId: typeof requestId === 'string' ? requestId : undefined,
        studyRequestData: {
          topicId: topic.id,
          topicTitle: topic.title,
          quizId: quiz?.id,
          quizTitle: quiz?.title,
          status: 'pending'
        }
      });

      setShowProposePanel(false);
      setProposeNote('');
      setProposeQuizId('');
    } catch (err) {
      console.error("Error creating study proposal in chat:", err);
      alert("Failed to send study proposal. Please try again.");
    } finally {
      setIsSendingProposal(false);
    }
  };

  // Accept study request from inside chat
  const handleAcceptFromChat = async (message: ChatMessage) => {
    if (!message.studyRequestId || !message.studyRequestData) return;

    try {
      // 1. Update Firestore study request doc
      await onRespondStudyRequest(message.studyRequestId, 'accepted');

      // 2. Post quick confirmation message to thread
      await onSendMessage({
        recipientId: message.senderId,
        recipientName: message.senderName,
        text: `I accepted your study invite for "${message.studyRequestData.topicTitle}"! Let's start practice.`
      });

      // 3. Immediately launch collaborative practice
      const studyReqObj: StudyRequest = {
        id: message.studyRequestId,
        fromUserId: message.senderId,
        fromUserName: message.senderName,
        toUserId: currentUser.uid,
        toUserName: currentUser.displayName,
        topicId: message.studyRequestData.topicId,
        topicTitle: message.studyRequestData.topicTitle,
        quizId: message.studyRequestData.quizId,
        quizTitle: message.studyRequestData.quizTitle,
        status: 'accepted',
        createdAt: message.createdAt
      };

      onClose();
      onStartCollaborativePractice(studyReqObj);
    } catch (err) {
      console.error("Error accepting study request in chat:", err);
    }
  };

  // Decline study request from inside chat
  const handleDeclineFromChat = async (message: ChatMessage) => {
    if (!message.studyRequestId || !message.studyRequestData) return;

    try {
      await onRespondStudyRequest(message.studyRequestId, 'declined');
      await onSendMessage({
        recipientId: message.senderId,
        recipientName: message.senderName,
        text: `Sorry, I can't study "${message.studyRequestData.topicTitle}" right now.`
      });
    } catch (err) {
      console.error("Error declining study request in chat:", err);
    }
  };

  // Launch practice for an already accepted request
  const handleLaunchFromChat = (message: ChatMessage) => {
    if (!message.studyRequestId || !message.studyRequestData) return;

    const studyReqObj: StudyRequest = {
      id: message.studyRequestId,
      fromUserId: message.senderId,
      fromUserName: message.senderName,
      toUserId: message.recipientId,
      toUserName: message.recipientName,
      topicId: message.studyRequestData.topicId,
      topicTitle: message.studyRequestData.topicTitle,
      quizId: message.studyRequestData.quizId,
      quizTitle: message.studyRequestData.quizTitle,
      status: 'accepted',
      createdAt: message.createdAt
    };

    onClose();
    onStartCollaborativePractice(studyReqObj);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white w-full max-w-5xl h-[90vh] max-h-[760px] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative"
      >
        {/* Modal Main Top Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">Peer Study Chat</h2>
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-300" /> Grade 11 Direct Messages
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Message classmates and propose collaborative practice sessions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Sidebar & Chat Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* ========================================================================= */}
          {/* 1. SIDEBAR: THREADS & CLASSMATES DIRECTORY                                */}
          {/* ========================================================================= */}
          <div 
            className={`w-full md:w-80 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 ${
              mobileView === 'messages' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Search Input */}
            <div className="p-3 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search classmate by name or ability..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Peer List / Conversations */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
              {filteredPeers.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No classmates found</p>
                </div>
              ) : (
                filteredPeers.map(peer => {
                  const conv = conversations.find(c => c.peerId === peer.uid);
                  const isSelected = activePeerId === peer.uid;
                  const unread = conv?.unreadCount || 0;

                  return (
                    <button
                      key={peer.uid}
                      onClick={() => {
                        setActivePeerId(peer.uid);
                        setMobileView('messages');
                        setShowProposePanel(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between gap-3 ${
                        isSelected 
                          ? 'bg-white shadow-sm border border-indigo-200 ring-1 ring-indigo-500/10' 
                          : 'hover:bg-white/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-sm flex items-center justify-center shadow-sm">
                            {peer.displayName.charAt(0).toUpperCase()}
                          </div>
                          <span className="w-3 h-3 bg-emerald-500 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-900 text-xs truncate">
                              {peer.displayName}
                            </h4>
                            {peer.mathAbility && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 shrink-0">
                                {peer.mathAbility}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {conv?.lastMessage?.text 
                              ? (conv.lastMessage.senderId === currentUser.uid ? 'You: ' : '') + conv.lastMessage.text
                              : 'Tap to start collaborating'}
                          </p>
                        </div>
                      </div>

                      {unread > 0 && (
                        <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0 animate-pulse">
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Sidebar Footer Hint */}
            <div className="p-3 border-t border-slate-200 bg-white/70 text-[11px] text-slate-500 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Collaborative study grants <strong>+50 XP</strong> per completed session.</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. CHAT PANE: MESSAGES & STUDY PROPOSALS                                  */}
          {/* ========================================================================= */}
          <div 
            className={`flex-1 flex flex-col bg-white ${
              mobileView === 'threads' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {activePeer ? (
              <>
                {/* Active Peer Conversation Header */}
                <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMobileView('threads')}
                      className="md:hidden p-1.5 -ml-2 text-slate-400 hover:text-slate-700 rounded-lg"
                      title="Back to conversations"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>

                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-bold text-xs flex items-center justify-center">
                        {activePeer.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{activePeer.displayName}</h3>
                        {activePeer.mathAbility && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                            {activePeer.mathAbility}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium">Lvl {activePeer.level || 1}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Available for study
                      </span>
                    </div>
                  </div>

                  {/* Propose Study Button */}
                  <button
                    onClick={() => setShowProposePanel(!showProposePanel)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                      showProposePanel
                        ? 'bg-slate-900 text-white'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Propose Study Topic</span>
                    <span className="sm:hidden">Study</span>
                  </button>
                </div>

                {/* Propose Study Topic Drawer/Panel */}
                <AnimatePresence>
                  {showProposePanel && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-indigo-900 text-white p-4 border-b border-indigo-800 overflow-hidden shrink-0"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-amber-300" />
                          <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-200">
                            Propose Collaborative Practice
                          </h4>
                        </div>
                        <button 
                          onClick={() => setShowProposePanel(false)}
                          className="text-indigo-300 hover:text-white text-xs"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-indigo-300 block mb-1">
                            Topic
                          </label>
                          <select
                            value={proposeTopicId}
                            onChange={(e) => {
                              setProposeTopicId(e.target.value);
                              setProposeQuizId('');
                            }}
                            className="w-full bg-indigo-950/80 border border-indigo-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          >
                            {topics.map(t => (
                              <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                                {t.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-indigo-300 block mb-1">
                            Specific Quiz (Optional)
                          </label>
                          <select
                            value={proposeQuizId}
                            onChange={(e) => setProposeQuizId(e.target.value)}
                            className="w-full bg-indigo-950/80 border border-indigo-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          >
                            <option value="" className="bg-slate-900 text-white">All Competencies in Topic</option>
                            {topics.find(t => t.id === proposeTopicId)?.quizzes.map(q => (
                              <option key={q.id} value={q.id} className="bg-slate-900 text-white">
                                {q.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="text-[10px] font-bold uppercase text-indigo-300 block mb-1">
                          Custom Invite Message
                        </label>
                        <input
                          type="text"
                          placeholder={`Hey ${activePeer.displayName}, let's practice this together!`}
                          value={proposeNote}
                          onChange={(e) => setProposeNote(e.target.value)}
                          className="w-full bg-indigo-950/80 border border-indigo-700 text-white placeholder:text-indigo-400 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleSendStudyProposal}
                          disabled={isSendingProposal}
                          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSendingProposal ? 'Sending Request...' : 'Send Study Request in Chat'}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Messages Feed Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                  {conversationMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-3">
                        <MessageSquare className="w-7 h-7" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">
                        Start studying with {activePeer.displayName}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mb-4">
                        Send a message or propose a mathematics topic to begin collaborative practice and earn bonus XP.
                      </p>
                      <button
                        onClick={() => setShowProposePanel(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Propose a Study Topic</span>
                      </button>
                    </div>
                  ) : (
                    conversationMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser.uid;
                      const hasStudyProposal = !!msg.studyRequestData;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[10px] text-slate-400 mb-1 px-1">
                            {isMe ? 'You' : msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-xs ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-tr-xs'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                            }`}
                          >
                            {/* Regular Message Text */}
                            {msg.text && (
                              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                                {msg.text}
                              </p>
                            )}

                            {/* Embedded Study Request Card */}
                            {hasStudyProposal && msg.studyRequestData && (
                              <div className={`mt-2 pt-2 border-t rounded-xl p-3 ${
                                isMe 
                                  ? 'bg-indigo-700/60 border-indigo-500/50 text-white' 
                                  : 'bg-indigo-50/80 border-indigo-100 text-slate-900'
                              }`}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                    isMe ? 'bg-white/20 text-indigo-100' : 'bg-indigo-200 text-indigo-800'
                                  }`}>
                                    <BookOpen className="w-2.5 h-2.5" /> Study Invitation
                                  </span>

                                  {/* Status Pill */}
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    msg.studyRequestData.status === 'accepted'
                                      ? 'bg-emerald-500 text-white'
                                      : msg.studyRequestData.status === 'declined'
                                      ? 'bg-rose-500 text-white'
                                      : msg.studyRequestData.status === 'completed'
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-amber-400 text-slate-900'
                                  }`}>
                                    {msg.studyRequestData.status === 'accepted' && 'Accepted'}
                                    {msg.studyRequestData.status === 'pending' && 'Awaiting'}
                                    {msg.studyRequestData.status === 'declined' && 'Declined'}
                                    {msg.studyRequestData.status === 'completed' && 'Completed (+50 XP)'}
                                  </span>
                                </div>

                                <h5 className="font-black text-xs mb-0.5">
                                  {msg.studyRequestData.topicTitle}
                                </h5>
                                {msg.studyRequestData.quizTitle && (
                                  <p className={`text-[11px] mb-2 ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                                    Quiz: {msg.studyRequestData.quizTitle}
                                  </p>
                                )}

                                {/* Card Action Buttons */}
                                <div className="mt-2.5 flex items-center gap-2">
                                  {!isMe && msg.studyRequestData.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleAcceptFromChat(msg)}
                                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-all shadow flex items-center gap-1 active:scale-95"
                                      >
                                        <Play className="w-3 h-3 fill-current" />
                                        <span>Accept & Practice</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeclineFromChat(msg)}
                                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs rounded-lg transition-colors"
                                      >
                                        Decline
                                      </button>
                                    </>
                                  )}

                                  {msg.studyRequestData.status === 'accepted' && (
                                    <button
                                      onClick={() => handleLaunchFromChat(msg)}
                                      className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-all shadow flex items-center gap-1.5 active:scale-95 ${
                                        isMe 
                                          ? 'bg-white text-indigo-800 hover:bg-indigo-50' 
                                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                      }`}
                                    >
                                      <Play className="w-3 h-3 fill-current" />
                                      <span>Launch Collaborative Practice (+50 XP)</span>
                                    </button>
                                  )}

                                  {isMe && msg.studyRequestData.status === 'pending' && (
                                    <span className="text-[11px] text-indigo-200 flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> Waiting for {activePeer.displayName} to accept
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Bar */}
                <form
                  onSubmit={handleSendTextMessage}
                  className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => setShowProposePanel(!showProposePanel)}
                    className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors shrink-0"
                    title="Propose Study Topic"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder={`Message ${activePeer.displayName}... (Press Enter to send)`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isSending}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-all shrink-0 active:scale-95 shadow-sm"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-center text-slate-400">
                <div>
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-bold text-slate-700">No conversation selected</p>
                  <p className="text-xs text-slate-500 mt-1">Select a classmate from the list to start messaging.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
