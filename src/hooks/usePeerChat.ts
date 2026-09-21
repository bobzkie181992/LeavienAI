import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { db, sanitizeForFirestore } from '../lib/firebase';
import { ChatMessage, ChatConversation, UserProfile, StudyRequestStatus } from '../types';

const LOCAL_MESSAGES_KEY = 'mathquest_local_chat_messages_v1';

function getLocalChatMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalChatMessage(msg: ChatMessage) {
  try {
    const all = getLocalChatMessages();
    const idx = all.findIndex(m => m.id === msg.id);
    if (idx >= 0) {
      all[idx] = msg;
    } else {
      all.push(msg);
    }
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event('mathquest_chat_updated'));
  } catch (err) {
    console.warn("Failed to save local chat message:", err);
  }
}

export function usePeerChat(currentUserId: string | undefined, currentUserName: string | undefined, peers: UserProfile[]) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const syncLocalMessages = useCallback(() => {
    if (!currentUserId) return;
    const all = getLocalChatMessages();
    const mine = all.filter(m => m.participants.includes(currentUserId));
    mine.sort((a, b) => (new Date(a.createdAt).getTime() || 0) - (new Date(b.createdAt).getTime() || 0));
    setMessages(mine);
    setLoading(false);
  }, [currentUserId]);

  // Real-time listener for direct messages where current user is a participant
  useEffect(() => {
    if (!currentUserId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    syncLocalMessages();

    const handleLocalUpdate = () => syncLocalMessages();
    window.addEventListener('mathquest_chat_updated', handleLocalUpdate);

    try {
      const q = query(
        collection(db, 'chat_messages'),
        where('participants', 'array-contains', currentUserId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const cloudMessages: ChatMessage[] = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as ChatMessage));

          // Merge local and cloud
          const localMessages = getLocalChatMessages().filter(m => m.participants.includes(currentUserId));
          const msgMap = new Map<string, ChatMessage>();
          localMessages.forEach(m => msgMap.set(m.id, m));
          cloudMessages.forEach(m => msgMap.set(m.id, m));

          const merged = Array.from(msgMap.values());
          merged.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime() || 0;
            const timeB = new Date(b.createdAt).getTime() || 0;
            return timeA - timeB;
          });

          setMessages(merged);
          setLoading(false);
        },
        (error) => {
          console.warn("Firestore peer chat listener note:", error?.message || error);
          syncLocalMessages();
          setLoading(false);
        }
      );

      return () => {
        window.removeEventListener('mathquest_chat_updated', handleLocalUpdate);
        unsubscribe();
      };
    } catch (err) {
      console.warn("Could not initialize Firestore chat listener:", err);
      syncLocalMessages();
      setLoading(false);
      return () => {
        window.removeEventListener('mathquest_chat_updated', handleLocalUpdate);
      };
    }
  }, [currentUserId, syncLocalMessages]);

  // Derive conversation threads from messages and peers
  const conversations = useMemo<ChatConversation[]>(() => {
    if (!currentUserId) return [];

    const convMap = new Map<string, ChatConversation>();

    // 1. Group existing messages by conversationId
    messages.forEach(msg => {
      const isSender = msg.senderId === currentUserId;
      const peerId = isSender ? msg.recipientId : msg.senderId;
      const peerName = isSender ? msg.recipientName : msg.senderName;
      const convId = msg.conversationId || [currentUserId, peerId].sort().join('_');

      const existing = convMap.get(convId);
      const isUnreadForMe = !isSender && !msg.read;

      if (!existing) {
        const peerProfile = peers.find(p => p.uid === peerId);
        convMap.set(convId, {
          conversationId: convId,
          peerId,
          peerName: peerProfile?.displayName || peerName || 'Classmate',
          peerMathAbility: peerProfile?.mathAbility,
          lastMessage: msg,
          unreadCount: isUnreadForMe ? 1 : 0
        });
      } else {
        // Keep the latest message
        const currTime = new Date(msg.createdAt).getTime() || 0;
        const existTime = existing.lastMessage ? new Date(existing.lastMessage.createdAt).getTime() || 0 : 0;
        if (currTime >= existTime) {
          existing.lastMessage = msg;
        }
        if (isUnreadForMe) {
          existing.unreadCount += 1;
        }
      }
    });

    // 2. Also ensure any peers with whom a conversation can be started exist or are easily selectable
    const convList = Array.from(convMap.values());
    convList.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() || 0 : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() || 0 : 0;
      return timeB - timeA;
    });

    return convList;
  }, [messages, currentUserId, peers]);

  // Total unread count for badges
  const totalUnreadCount = useMemo(() => {
    if (!currentUserId) return 0;
    return messages.filter(m => m.recipientId === currentUserId && !m.read).length;
  }, [messages, currentUserId]);

  // Send a direct message
  const sendMessage = useCallback(async (params: {
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
  }) => {
    if (!currentUserId) throw new Error("Must be logged in to send a message");

    const senderName = currentUserName || 'Student';
    const conversationId = [currentUserId, params.recipientId].sort().join('_');

    const newMessage: Omit<ChatMessage, 'id'> = {
      conversationId,
      participants: [currentUserId, params.recipientId],
      senderId: currentUserId,
      senderName,
      recipientId: params.recipientId,
      recipientName: params.recipientName,
      text: params.text.trim(),
      createdAt: new Date().toISOString(),
      read: false,
      ...(params.studyRequestId ? { studyRequestId: params.studyRequestId } : {}),
      ...(params.studyRequestData ? { studyRequestData: params.studyRequestData } : {})
    };

    const newId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const fullMessage: ChatMessage = {
      id: newId,
      ...newMessage
    };
    saveLocalChatMessage(fullMessage);

    try {
      await addDoc(collection(db, 'chat_messages'), sanitizeForFirestore(newMessage));
    } catch (err) {
      console.warn("Firestore message send skipped (saved locally):", err);
    }
    return newId;
  }, [currentUserId, currentUserName]);

  // Mark all unread messages in a conversation as read
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    if (!currentUserId) return;

    const all = getLocalChatMessages();
    let changed = false;
    all.forEach(m => {
      if (m.conversationId === conversationId && m.recipientId === currentUserId && !m.read) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(all));
      window.dispatchEvent(new Event('mathquest_chat_updated'));
    }

    const unreadMsgs = messages.filter(
      m => m.conversationId === conversationId && m.recipientId === currentUserId && !m.read
    );

    if (unreadMsgs.length === 0) return;

    await Promise.all(
      unreadMsgs.map(m => updateDoc(doc(db, 'chat_messages', m.id), { read: true }).catch(() => {}))
    );
  }, [messages, currentUserId]);

  // Update status of study request attached to a message
  const updateChatMessageStudyStatus = useCallback(async (messageId: string, status: StudyRequestStatus) => {
    const all = getLocalChatMessages();
    const target = all.find(m => m.id === messageId);
    if (target && target.studyRequestData) {
      target.studyRequestData.status = status;
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(all));
      window.dispatchEvent(new Event('mathquest_chat_updated'));
    }

    try {
      const msgRef = doc(db, 'chat_messages', messageId);
      await updateDoc(msgRef, {
        'studyRequestData.status': status
      });
    } catch (err) {
      console.warn("Firestore status update in chat message skipped (saved locally):", err);
    }
  }, []);

  return {
    messages,
    conversations,
    totalUnreadCount,
    loading,
    sendMessage,
    markConversationAsRead,
    updateChatMessageStudyStatus
  };
}
