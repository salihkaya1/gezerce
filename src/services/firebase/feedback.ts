// TODO: Connect Firebase Firestore here
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './config'

interface FeedbackPayload {
  message: string
  email: string | null
  userId: string | null
  language: string
  page: string
}

export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  await addDoc(collection(db, 'feedback'), {
    ...payload,
    appVersion: import.meta.env.VITE_APP_VERSION ?? '0.1.0',
    createdAt: serverTimestamp(),
  })
}
