import * as admin from "firebase-admin"

import { deleteCollection, registerAddresses } from "../scripts/firestore"
import * as cons from "../const"

export const changeAddresses = async () => {
  const db = admin.firestore()

  console.info(`Delete all documents in collection ${cons.FIRESTORE_COLLECTION}`)
  const ref = db.collection(cons.FIRESTORE_COLLECTION)
  const batchSize = 200
  await deleteCollection(ref, batchSize)

  console.info(`Register documents from newest KEN_ALL.CSV`)
  await registerAddresses()
}