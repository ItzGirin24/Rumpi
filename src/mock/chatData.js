// Mock data untuk WhatsApp Clone

export const currentUser = {
  id: 'user-1',
  name: 'Kamu',
  phone: '+62 812 3456 7890',
  avatar: 'https://ui-avatars.com/api/?name=Kamu&background=25D366&color=fff',
  status: 'Hey there! I am using WhatsApp'
};

export const contacts = [
  {
    id: 'contact-1',
    name: 'Sarah Johnson',
    phone: '+62 812 1111 1111',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=0D8ABC&color=fff',
    status: 'Available',
    online: true
  },
  {
    id: 'contact-2',
    name: 'Ahmad Rahman',
    phone: '+62 813 2222 2222',
    avatar: 'https://ui-avatars.com/api/?name=Ahmad+Rahman&background=667eea&color=fff',
    status: 'Busy',
    online: false
  },
  {
    id: 'contact-3',
    name: 'Lisa Anderson',
    phone: '+62 814 3333 3333',
    avatar: 'https://ui-avatars.com/api/?name=Lisa+Anderson&background=f093fb&color=fff',
    status: 'At work',
    online: true
  },
  {
    id: 'contact-4',
    name: 'Budi Santoso',
    phone: '+62 815 4444 4444',
    avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=fa709a&color=fff',
    status: 'Sleeping',
    online: false
  },
  {
    id: 'contact-5',
    name: 'Emily Chen',
    phone: '+62 816 5555 5555',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Chen&background=fee140&color=000',
    status: 'Available',
    online: true
  }
];

export const groups = [
  {
    id: 'group-1',
    name: 'Tim Kerja',
    avatar: 'https://ui-avatars.com/api/?name=Tim+Kerja&background=128C7E&color=fff',
    members: ['contact-1', 'contact-2', 'contact-4'],
    isGroup: true
  },
  {
    id: 'group-2',
    name: 'Keluarga',
    avatar: 'https://ui-avatars.com/api/?name=Keluarga&background=25D366&color=fff',
    members: ['contact-3', 'contact-5'],
    isGroup: true
  }
];

export const conversations = [
  {
    id: 'conv-1',
    contactId: 'contact-1',
    lastMessage: 'Hai! Gimana kabarnya?',
    timestamp: new Date('2025-01-15T10:30:00'),
    unreadCount: 2,
    isGroup: false
  },
  {
    id: 'conv-2',
    contactId: 'group-1',
    lastMessage: 'Meeting jam 2 siang ya',
    timestamp: new Date('2025-01-15T09:15:00'),
    unreadCount: 5,
    isGroup: true
  },
  {
    id: 'conv-3',
    contactId: 'contact-3',
    lastMessage: 'Terima kasih banyak!',
    timestamp: new Date('2025-01-14T18:45:00'),
    unreadCount: 0,
    isGroup: false
  },
  {
    id: 'conv-4',
    contactId: 'contact-2',
    lastMessage: 'Oke siap, nanti aku kabari',
    timestamp: new Date('2025-01-14T15:20:00'),
    unreadCount: 0,
    isGroup: false
  },
  {
    id: 'conv-5',
    contactId: 'group-2',
    lastMessage: 'Jangan lupa belanja ya',
    timestamp: new Date('2025-01-14T12:00:00'),
    unreadCount: 1,
    isGroup: true
  },
  {
    id: 'conv-6',
    contactId: 'contact-5',
    lastMessage: 'See you tomorrow!',
    timestamp: new Date('2025-01-13T20:30:00'),
    unreadCount: 0,
    isGroup: false
  },
  {
    id: 'conv-7',
    contactId: 'contact-4',
    lastMessage: 'Sudah saya kirim filenya',
    timestamp: new Date('2025-01-13T16:10:00'),
    unreadCount: 0,
    isGroup: false
  }
];

export const messages = {
  'conv-1': [
    {
      id: 'msg-1',
      senderId: 'user-1',
      text: 'Hai Sarah! Apa kabar?',
      timestamp: new Date('2025-01-15T10:25:00'),
      status: 'read'
    },
    {
      id: 'msg-2',
      senderId: 'contact-1',
      text: 'Hai! Gimana kabarnya?',
      timestamp: new Date('2025-01-15T10:30:00'),
      status: 'delivered'
    },
    {
      id: 'msg-3',
      senderId: 'contact-1',
      text: 'Aku baik, lagi sibuk proyekan nih',
      timestamp: new Date('2025-01-15T10:30:15'),
      status: 'delivered'
    }
  ],
  'conv-2': [
    {
      id: 'msg-4',
      senderId: 'contact-2',
      senderName: 'Ahmad Rahman',
      text: 'Meeting jam 2 siang ya',
      timestamp: new Date('2025-01-15T09:15:00'),
      status: 'delivered'
    },
    {
      id: 'msg-5',
      senderId: 'contact-1',
      senderName: 'Sarah Johnson',
      text: 'Oke, aku siap',
      timestamp: new Date('2025-01-15T09:16:00'),
      status: 'delivered'
    },
    {
      id: 'msg-6',
      senderId: 'user-1',
      text: 'Noted!',
      timestamp: new Date('2025-01-15T09:17:00'),
      status: 'read'
    },
    {
      id: 'msg-7',
      senderId: 'contact-4',
      senderName: 'Budi Santoso',
      text: 'Sip, agenda sudah aku kirim via email',
      timestamp: new Date('2025-01-15T09:18:00'),
      status: 'delivered'
    },
    {
      id: 'msg-8',
      senderId: 'contact-2',
      senderName: 'Ahmad Rahman',
      text: 'Perfect! See you all',
      timestamp: new Date('2025-01-15T09:19:00'),
      status: 'delivered'
    }
  ],
  'conv-3': [
    {
      id: 'msg-9',
      senderId: 'user-1',
      text: 'Lisa, ini file yang kamu minta',
      timestamp: new Date('2025-01-14T18:40:00'),
      status: 'read'
    },
    {
      id: 'msg-10',
      senderId: 'contact-3',
      text: 'Terima kasih banyak!',
      timestamp: new Date('2025-01-14T18:45:00'),
      status: 'delivered'
    }
  ],
  'conv-4': [
    {
      id: 'msg-11',
      senderId: 'contact-2',
      text: 'Oke siap, nanti aku kabari',
      timestamp: new Date('2025-01-14T15:20:00'),
      status: 'delivered'
    }
  ],
  'conv-5': [
    {
      id: 'msg-12',
      senderId: 'contact-3',
      senderName: 'Lisa Anderson',
      text: 'Jangan lupa belanja ya',
      timestamp: new Date('2025-01-14T12:00:00'),
      status: 'delivered'
    }
  ],
  'conv-6': [
    {
      id: 'msg-13',
      senderId: 'user-1',
      text: 'Looking forward to it!',
      timestamp: new Date('2025-01-13T20:25:00'),
      status: 'read'
    },
    {
      id: 'msg-14',
      senderId: 'contact-5',
      text: 'See you tomorrow!',
      timestamp: new Date('2025-01-13T20:30:00'),
      status: 'delivered'
    }
  ],
  'conv-7': [
    {
      id: 'msg-15',
      senderId: 'contact-4',
      text: 'Sudah saya kirim filenya',
      timestamp: new Date('2025-01-13T16:10:00'),
      status: 'delivered'
    }
  ]
};

export const getContactById = (id) => {
  return contacts.find(c => c.id === id) || groups.find(g => g.id === id);
};

export const getConversationMessages = (convId) => {
  return messages[convId] || [];
};