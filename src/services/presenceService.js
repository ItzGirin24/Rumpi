






















import { getDatabase, ref, onDisconnect, set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const setupPresence = () => {
  console.log("🔹 setupPresence called");

  const db = getDatabase();
  const auth = getAuth();

  onAuthStateChanged(auth, (user) => {
    console.log("🔹 auth state:", user);

    if (!user) return;

    const userRef = ref(db, "users/" + user.uid);

    const onlineData = { online: true, lastSeen: Date.now() };
    const offlineData = { online: false, lastSeen: Date.now() };

    onDisconnect(userRef).set(offlineData).then(() => {
      set(userRef, onlineData);
      console.log("✅ Presence written:", onlineData);
    });
  });
};

