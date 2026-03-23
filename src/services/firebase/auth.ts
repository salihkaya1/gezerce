// TODO: Connect Firebase Authentication here
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from './config'
import type { AppUser } from '@/types'

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle(): Promise<AppUser> {
  const result = await signInWithPopup(auth, googleProvider)
  return mapUser(result.user, false)
}

export async function signInAsGuest(): Promise<AppUser> {
  const result = await signInAnonymously(auth)
  return mapUser(result.user, true)
}

export async function signOutUser(): Promise<void> {
  await signOut(auth)
}

export function onAuthChanged(callback: (user: AppUser | null) => void): () => void {
  return onAuthStateChanged(auth, (firebaseUser: User | null) => {
    if (!firebaseUser) {
      callback(null)
      return
    }
    const isGuest = firebaseUser.isAnonymous
    callback(mapUser(firebaseUser, isGuest))
  })
}

function mapUser(user: User, isGuest: boolean): AppUser {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    isGuest,
  }
}
