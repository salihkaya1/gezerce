import { openDB, type IDBPDatabase } from 'idb'
import type { Plan } from '@/types'

const DB_NAME = 'gezerce-offline'
const DB_VERSION = 1

interface GezercDB {
  plans: {
    key: string
    value: Plan
  }
}

let dbPromise: Promise<IDBPDatabase<GezercDB>> | null = null

function getDB(): Promise<IDBPDatabase<GezercDB>> {
  if (!dbPromise) {
    dbPromise = openDB<GezercDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('plans')) {
          db.createObjectStore('plans', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export async function cachePlan(planId: string, plan: Plan): Promise<void> {
  const db = await getDB()
  await db.put('plans', { ...plan, id: planId })
}

export async function getCachedPlan(planId: string): Promise<Plan | undefined> {
  const db = await getDB()
  return db.get('plans', planId)
}

export async function deleteCachedPlan(planId: string): Promise<void> {
  const db = await getDB()
  await db.delete('plans', planId)
}

export async function getAllCachedPlans(): Promise<Plan[]> {
  const db = await getDB()
  return db.getAll('plans')
}
