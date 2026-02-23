import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getDatabase, ref, get, set } from 'firebase/database';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

const provider = new GoogleAuthProvider();

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const signOutUser = () => signOut(auth);

export const loadPagesFromFirestore = async () => {
    const snap = await get(ref(db, 'pages'));
    if (!snap.exists()) return null;
    const data = snap.val();
    const pages = Object.values(data);
    pages.sort((a, b) => (a._order ?? 0) - (b._order ?? 0));
    return pages;
};

export const savePagesToFirestore = async (pages) => {
    const data = {};
    pages.forEach((page, index) => {
        data[page.id] = { ...page, _order: index };
    });
    await set(ref(db, 'pages'), data);
};
