import { db, auth } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';

// Users collection
export const createUserProfile = async (user) => {
  if (!auth.currentUser) {
    console.error("User not authenticated");
    return;
  }

  console.log("Auth UID:", auth.currentUser.uid);
  console.log("Creating profile for user:", user.uid);

  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
    online: false // Start as offline, presence service will handle online status
  });
};

export const updateUserOnlineStatus = async (userId, isOnline) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    online: isOnline,
    lastSeen: serverTimestamp()
  });
};

export const getUserByEmail = async (email) => {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
  }
  return null;
};

export const getUserById = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() };
  }
  return null;
};

// Contacts collection
export const addContact = async (currentUserId, contactUserId, customName = null) => {
  // Check if contact already exists
  const existingContactQuery = query(
    collection(db, 'contacts'),
    where('userId', '==', currentUserId),
    where('contactUserId', '==', contactUserId)
  );
  const existingContactSnapshot = await getDocs(existingContactQuery);

  if (!existingContactSnapshot.empty) {
    throw new Error('Contact already exists');
  }

  const contactRef = doc(collection(db, 'contacts'));
  await setDoc(contactRef, {
    userId: currentUserId,
    contactUserId: contactUserId,
    customName: customName,
    addedAt: serverTimestamp()
  });

  // Create a conversation between the two users if it doesn't exist
  const conversationQuery = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', currentUserId)
  );
  const conversationSnapshot = await getDocs(conversationQuery);

  let conversationExists = false;
  for (const doc of conversationSnapshot.docs) {
    const participants = doc.data().participants;
    if (participants.includes(currentUserId) && participants.includes(contactUserId) && participants.length === 2) {
      conversationExists = true;
      break;
    }
  }

  if (!conversationExists) {
    await createConversation([currentUserId, contactUserId]);
  }

  return contactRef.id;
};

export const updateContactName = async (contactId, customName) => {
  const contactRef = doc(db, 'contacts', contactId);
  await updateDoc(contactRef, {
    customName: customName
  });
};

export const updateUserProfile = async (userId, updates) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const removeContact = async (contactId) => {
  await deleteDoc(doc(db, 'contacts', contactId));
};

export const getUserContacts = async (userId) => {
  const q = query(collection(db, 'contacts'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const contacts = [];
  for (const docSnap of querySnapshot.docs) {
    const contactData = docSnap.data();
    const userData = await getUserById(contactData.contactUserId);
    if (userData) {
      contacts.push({
        id: docSnap.id,
        ...contactData,
        user: userData
      });
    }
  }
  return contacts;
};

// Conversations collection
export const createConversation = async (participants, isGroup = false, groupName = null) => {
  const conversationRef = await addDoc(collection(db, 'conversations'), {
    participants: participants,
    isGroup: isGroup,
    groupName: groupName,
    createdAt: serverTimestamp(),
    lastMessage: null,
    lastMessageTime: null
  });
  return conversationRef.id;
};

export const getUserConversations = (userId, callback) => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId)
  );
  return onSnapshot(q, (querySnapshot) => {
    const conversations = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => {
        const aTime = a.lastMessageTime?.toDate?.() || new Date(0);
        const bTime = b.lastMessageTime?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
    callback(conversations);
  });
};

export const updateConversationLastMessage = async (conversationId, messageData) => {
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    lastMessage: messageData.text,
    lastMessageTime: serverTimestamp(),
    lastMessageSender: messageData.senderId
  });
};

// Messages collection
export const sendMessage = async (conversationId, senderId, text, contactId = null, messageType = 'text', mediaData = null) => {
  if (!auth.currentUser) {
    console.error("User not authenticated");
    return;
  }

  console.log("Auth UID:", auth.currentUser.uid);
  console.log("Conversation ID:", conversationId);
  console.log("Sender ID:", senderId);
  console.log("Contact ID:", contactId);

  let finalConversationId = conversationId;

  // If no conversation exists, create one
  if (!finalConversationId && contactId) {
    console.log("Creating new conversation between", senderId, "and", contactId);
    finalConversationId = await createConversation([senderId, contactId]);
    console.log("Created conversation ID:", finalConversationId);
  }

  if (!finalConversationId) {
    console.error("No conversation ID available");
    return;
  }

  const messageRef = await addDoc(collection(db, 'messages'), {
    conversationId: finalConversationId,
    senderId: senderId,
    text: text,
    timestamp: serverTimestamp(),
    status: 'sent',
    deliveredTo: [], // Track who has received the message
    type: messageType,
    mediaData: mediaData
  });

  // Update conversation's last message
  await updateConversationLastMessage(finalConversationId, { senderId, text });

  // Check if this is an AI contact and generate AI response
  if (contactId && (contactId === 'ai-contact-1' || contactId === 'ai-contact-2')) {
    // Import AI service dynamically to avoid circular dependencies
    import('./aiService').then(async ({ generateAIResponse, getAIPersonality }) => {
      try {
        const personality = getAIPersonality(contactId);
        const aiResponse = await generateAIResponse(text, [], personality);

        if (aiResponse) {
          // Send AI response after a short delay to simulate typing
          setTimeout(async () => {
            await addDoc(collection(db, 'messages'), {
              conversationId: finalConversationId,
              senderId: contactId, // AI as sender
              text: aiResponse,
              timestamp: serverTimestamp(),
              status: 'sent',
              deliveredTo: [],
              type: 'text',
              mediaData: null
            });

            // Update conversation's last message with AI response
            await updateConversationLastMessage(finalConversationId, { senderId: contactId, text: aiResponse });
          }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
        }
      } catch (error) {
        console.error('Error generating AI response:', error);
      }
    });
  }

  return { messageId: messageRef.id, conversationId: finalConversationId };
};

export const getConversationMessages = (conversationId, callback) => {
  if (!conversationId) {
    console.log('No conversationId provided to getConversationMessages');
    callback([]);
    return () => {};
  }

  console.log('Querying messages for conversationId:', conversationId);
  // Try without ordering first to avoid index issues
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId)
  );
  return onSnapshot(q, (querySnapshot) => {
    console.log('Query snapshot docs count:', querySnapshot.docs.length);
    const messages = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Message doc:', doc.id, data);
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date()
      };
    });
    // Sort messages by timestamp after fetching
    messages.sort((a, b) => a.timestamp - b.timestamp);
    console.log('Processed messages:', messages);
    callback(messages);
  });
};

export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    // First get all messages in the conversation
    const allMessagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId)
    );
    const querySnapshot = await getDocs(allMessagesQuery);

    // Filter messages that need to be marked as read
    const messagesToUpdate = querySnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.senderId !== userId && data.status !== 'read';
    });

    const updatePromises = messagesToUpdate.map(doc => {
      console.log('Marking message as read:', doc.id);
      return updateDoc(doc.ref, { status: 'read' });
    });

    await Promise.all(updatePromises);
    console.log(`Marked ${updatePromises.length} messages as read`);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

export const markMessagesAsDelivered = async (conversationId, userId) => {
  try {
    // First get all messages in the conversation
    const allMessagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId)
    );
    const querySnapshot = await getDocs(allMessagesQuery);

    // Filter messages that need to be marked as delivered
    const messagesToUpdate = querySnapshot.docs.filter(doc => {
      const data = doc.data();
      const deliveredTo = data.deliveredTo || [];
      return data.senderId !== userId && data.status === 'sent' && !deliveredTo.includes(userId);
    });

    const updatePromises = messagesToUpdate.map(doc => {
      const data = doc.data();
      const deliveredTo = data.deliveredTo || [];
      console.log('Marking message as delivered:', doc.id);
      return updateDoc(doc.ref, {
        status: 'delivered',
        deliveredTo: [...deliveredTo, userId]
      });
    });

    await Promise.all(updatePromises);
    console.log(`Marked ${updatePromises.length} messages as delivered`);
  } catch (error) {
    console.error('Error marking messages as delivered:', error);
  }
};

export const deleteMessageForUser = async (messageId, userId) => {
  if (!auth.currentUser) {
    console.error("User not authenticated");
    return;
  }

  const messageRef = doc(db, 'messages', messageId);
  const messageDoc = await getDoc(messageRef);

  if (!messageDoc.exists()) {
    throw new Error('Message not found');
  }

  const messageData = messageDoc.data();

  // Check if user is sender or participant in conversation
  if (messageData.senderId !== userId) {
    // For non-senders, we add to "deletedFor" array
    const deletedFor = messageData.deletedFor || [];
    if (!deletedFor.includes(userId)) {
      await updateDoc(messageRef, {
        deletedFor: [...deletedFor, userId]
      });
    }
  } else {
    // For sender, we can mark as deleted
    await updateDoc(messageRef, {
      deletedBySender: true
    });
  }
};

// Groups
export const createGroup = async (creatorId, groupName, participants) => {
  const groupRef = await addDoc(collection(db, 'groups'), {
    name: groupName,
    creatorId: creatorId,
    participants: participants,
    createdAt: serverTimestamp()
  });
  return groupRef.id;
};

export const getGroupById = async (groupId) => {
  const groupDoc = await getDoc(doc(db, 'groups', groupId));
  if (groupDoc.exists()) {
    return { id: groupDoc.id, ...groupDoc.data() };
  }
  return null;
};
