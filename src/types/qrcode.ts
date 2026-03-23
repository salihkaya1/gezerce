export type QRCodeStatus = 'unused' | 'used' | 'expired'

export interface QRCodeDoc {
  id: string
  code: string
  userId: string | null
  planId: string
  partnerVenueId: string
  status: QRCodeStatus
  discountPercent: number
  createdAt: string
  expiresAt: string
  usedAt: string | null
  scanCount: number
}
