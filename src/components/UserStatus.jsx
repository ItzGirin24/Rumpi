import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { getUserById } from "../services/firestoreService";

const UserStatus = ({ userId }) => {
  const [presence, setPresence] = useState({ online: false, lastSeen: null });
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Load user data from Firestore
    const loadUserData = async () => {
      try {
        const data = await getUserById(userId);
        setUserData(data);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [userId]);

  useEffect(() => {
    // Listen to presence data from Realtime Database
    const db = getDatabase();
    const statusRef = ref(db, "users/" + userId);

    const unsubscribe = onValue(statusRef, (snapshot) => {
      console.log("📡 snapshot for", userId, ":", snapshot.val());
      if (snapshot.exists()) {
        setPresence(snapshot.val());
      } else {
        // If no presence data, assume offline
        setPresence({ online: false, lastSeen: null });
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Belum pernah online";

    // Handle Firebase serverTimestamp - it comes as an object with seconds/nanoseconds
    let date;
    if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (timestamp?.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      date = new Date(timestamp);
    }

    // If date is invalid, return default message
    if (isNaN(date.getTime())) return "Belum pernah online";

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return "Terakhir dilihat baru saja";
    } else if (diffMins < 60) {
      return `Terakhir dilihat ${diffMins} menit yang lalu`;
    } else if (diffHours < 24) {
      return `Terakhir dilihat ${diffHours} jam yang lalu`;
    } else if (diffDays === 1) {
      return "Terakhir dilihat kemarin";
    } else if (diffDays < 7) {
      return `Terakhir dilihat ${diffDays} hari yang lalu`;
    } else {
      return `Terakhir dilihat ${date.toLocaleDateString("id-ID")}`;
    }
  };

  if (!userData) {
    return <span className="text-sm text-gray-500">Loading...</span>;
  }

  return (
    <span className="text-sm text-gray-500">
      {presence.online ? (
        <span className="text-green-600">online</span>
      ) : (
        formatLastSeen(presence.lastSeen)
      )}
    </span>
  );
};

export default UserStatus;
