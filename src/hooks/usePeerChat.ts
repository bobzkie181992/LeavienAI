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
import { db } from '../lib/firebase';
import { ChatMessage, ChatConversation, UserProfile, StudyRequestStatus } from '../types';

export function usePeerChat(currentUserId: string | undefined, currentUserName: string | undefined, peers: UserProfile[]) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for direct messages where current user is a participant
  useEffect(() => {
    if (!currentUserId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'chat_messages'),
        where('participants', 'array-contains', currentUserId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedMessages: ChatMessage[] = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as ChatMessage));

          // Sort chronologically ascending
          fetchedMessages.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime() || 0;
            const timeB = new Date(b.createdAt).getTime() || 0;
            return timeA - timeB;
          });

          setMessages(fetchedMessages);
          setLoading(false);
        },
        (error) => {
          console.error("Error listening to peer chat messages:", error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Failed to initialize chat listener:", err);
      setLoading(false);
    }
  }, [currentUserId]);

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

    const docRef = await addDoc(collection(db, 'chat_messages'), newMessage);
    return docRef.id;
  }, [currentUserId, currentUserName]);

  // Mark all unread messages in a conversation as read
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    if (!currentUserId) return;

    const unreadMsgs = messages.filter(
      m => m.conversationId === conversationId && m.recipientId === currentUserId && !m.read
    );

    if (unreadMsgs.length === 0) return;

    await Promise.all(
      unreadMsgs.map(m => updateDoc(doc(db, 'chat_messages', m.id), { read: true }).catch(console.error))
    );
  }, [messages, currentUserId]);

  // Update status of study request attached to a message
  const updateChatMessageStudyStatus = useCallback(async (messageId: string, status: StudyRequestStatus) => {
    try {
      const msgRef = doc(db, 'chat_messages', messageId);
      await updateDoc(msgRef, {
        'studyRequestData.status': status
      });
    } catch (err) {
      console.error("Error updating study request status in chat message:", err);
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
