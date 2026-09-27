import { MongoClient } from "mongodb"

export async function getDatabase() {
  if (!process.env.MONGODB_URI) throw new Error("Database is not configured")
  if (!globalThis.lifeLessonsMongo) {
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    globalThis.lifeLessonsMongo = client.connect().catch((error) => {
      globalThis.lifeLessonsMongo = null
      throw error
    })
  }
  const client = await globalThis.lifeLessonsMongo
  return client.db(process.env.MONGODB_DB_NAME || "digital-life-lesson")
}
