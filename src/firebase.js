import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const signOutUser = () => signOut(auth);

// Strip base64 image content (too large for Firestore) — replace with placeholder
const stripLargeBase64 = (blocks) =>
    blocks.map(b => {
        if (b.type === 'image' && typeof b.content === 'string' && b.content.startsWith('data:')) {
            return { ...b, content: '__base64_image__' };
        }
        return b;
    });

// Each page stored as a separate Firestore document: posts/pages/{pageId}
export const loadPagesFromFirestore = async () => {
    const snap = await getDocs(collection(db, 'posts', 'pages', 'data'));
    if (snap.empty) return null;
    const pages = [];
    snap.forEach(d => pages.push(d.data()));
    // Restore order by createdAt or id
    pages.sort((a, b) => (a._order ?? 0) - (b._order ?? 0));
    return pages;
};

export const savePagesToFirestore = async (pages) => {
    const promises = pages.map((page, index) => {
        const cleanBlocks = stripLargeBase64(page.blocks ?? []);
        const pageData = { ...page, blocks: cleanBlocks, _order: index };
        return setDoc(doc(db, 'posts', 'pages', 'data', page.id), pageData);
    });
    await Promise.all(promises);
};
