import * as admin from "firebase-admin"

import { Address } from "../types/address"
import * as cons from "../const"


export const addAddresses = async (docKey: string, addresses: Address[]) => {
  const bulkWriter = admin.firestore().bulkWriter()
  const db = admin.firestore()
  bulkWriter.create(
    db.collection(cons.FIRESTORE_COLLECTION).doc(docKey),
    { data: addresses },
  )
  await bulkWriter.flush().then(()=>{
    console.log(`created ${docKey} documents.`)
  })
  return null
}
