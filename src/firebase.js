import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, onValue } from "firebase/database";
export { onValue, ref };

const firebaseConfig = {
  apiKey: "AIzaSyBeHko5VxMtS9bpRhfuYFX3q94DzJ9zb7g",
  authDomain: "pomp-op-sahat-46e0d.firebaseapp.com",
  databaseURL: "https://pomp-op-sahat-46e0d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pomp-op-sahat-46e0d",
  storageBucket: "pomp-op-sahat-46e0d.firebasestorage.app",
  messagingSenderId: "704221487800",
  appId: "1:704221487800:web:69069fb2b6d848d0720a4d",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Key convention: dots become slashes.
// "lock.solaria"                    → /lock/solaria
// "order.solaria.Christine_Tambunan"→ /order/solaria/Christine_Tambunan
const toPath = (k) => k.replace(/\./g, "/").replace(/\/$/, "");

export const sGet = async (k) => {
  try {
    const snap = await get(ref(db, toPath(k)));
    return snap.exists() ? snap.val() : null;
  } catch {
    return null;
  }
};

export const sSet = async (k, v) => {
  try {
    await set(ref(db, toPath(k)), v);
    return true;
  } catch {
    return false;
  }
};

// prefix e.g. "order.solaria." — returns keys in original dot-notation
export const sList = async (prefix) => {
  try {
    const parentPath = toPath(prefix);
    const snap = await get(ref(db, parentPath));
    if (!snap.exists()) return [];
    const keys = [];
    snap.forEach((child) => keys.push(prefix + child.key));
    return keys;
  } catch {
    return [];
  }
};
