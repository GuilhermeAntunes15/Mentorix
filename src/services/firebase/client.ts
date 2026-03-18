import { initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from '@/services/firebase/config';

// Mantemos a inicializacao isolada para permitir mocks e testes no futuro.
const firebaseApp = isFirebaseConfigured() ? initializeApp(firebaseConfig) : null;
const provisioningApp = isFirebaseConfigured() ? initializeApp(firebaseConfig, 'mentorix-provisioning') : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const provisioningAuth = provisioningApp ? getAuth(provisioningApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;

if (auth) {
  void setPersistence(auth, browserLocalPersistence);
}
