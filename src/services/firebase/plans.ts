// TODO: Connect Firebase Firestore here
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
import { db } from './config'
import type { Plan } from '@/types'

export async function savePlan(plan: Plan): Promise<void> {
  const ref = doc(db, 'plans', plan.id)
  await setDoc(ref, plan)
}

export async function getPlan(planId: string): Promise<Plan | null> {
  const ref = doc(db, 'plans', planId)
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as Plan) : null
}

export async function getUserPlans(userId: string): Promise<Plan[]> {
  const q = query(
    collection(db, 'plans'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as Plan)
}

export async function deletePlan(planId: string): Promise<void> {
  await deleteDoc(doc(db, 'plans', planId))
}

export async function getPlanByShareCode(shareCode: string): Promise<Plan | null> {
  const q = query(collection(db, 'plans'), where('shareCode', '==', shareCode), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return snap.docs[0].data() as Plan
}
