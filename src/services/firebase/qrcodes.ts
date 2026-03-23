// TODO: Connect Firebase Firestore here
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore'
import { db } from './config'
import type { QRCodeDoc } from '@/types'

interface CreateQRParams {
  partnerVenueId: string
  planId: string
  userId: string | null
}

interface CreateQRResult {
  code: string
  expiresAt: string
}

export async function createQRCode(params: CreateQRParams): Promise<CreateQRResult> {
  // Mevcut kullanılmamış kodu kontrol et
  if (params.userId) {
    const existing = await findUnusedCode(params.partnerVenueId, params.userId, params.planId)
    if (existing) return { code: existing.code, expiresAt: existing.expiresAt }
  }

  const code = crypto.randomUUID()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // +24 saat

  const docData: QRCodeDoc = {
    id: code,
    code,
    userId: params.userId,
    planId: params.planId,
    partnerVenueId: params.partnerVenueId,
    status: 'unused',
    discountPercent: 10,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    usedAt: null,
    scanCount: 0,
  }

  await setDoc(doc(db, 'qrcodes', code), docData)
  return { code, expiresAt: expiresAt.toISOString() }
}

async function findUnusedCode(
  partnerVenueId: string,
  userId: string,
  planId: string
): Promise<QRCodeDoc | null> {
  const q = query(
    collection(db, 'qrcodes'),
    where('partnerVenueId', '==', partnerVenueId),
    where('userId', '==', userId),
    where('planId', '==', planId),
    where('status', '==', 'unused'),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const data = snap.docs[0].data() as QRCodeDoc
  // Süresi dolmuş mu?
  if (new Date(data.expiresAt) < new Date()) return null
  return data
}

export async function validateQRCode(code: string): Promise<{ valid: boolean; reason?: string }> {
  const ref = doc(db, 'qrcodes', code)
  const snap = await getDoc(ref)
  if (!snap.exists()) return { valid: false, reason: 'Kod bulunamadı' }

  const data = snap.data() as QRCodeDoc
  if (data.status === 'used') return { valid: false, reason: 'Bu kod daha önce kullanıldı' }
  if (new Date(data.expiresAt) < new Date()) return { valid: false, reason: 'Kodun süresi dolmuş' }
  if (data.scanCount >= 1) return { valid: false, reason: 'Kod zaten tarandı' }

  return { valid: true }
}

export async function markQRCodeUsed(code: string): Promise<void> {
  const ref = doc(db, 'qrcodes', code)
  await updateDoc(ref, {
    status: 'used',
    usedAt: new Date().toISOString(),
    scanCount: 1,
  })
}
