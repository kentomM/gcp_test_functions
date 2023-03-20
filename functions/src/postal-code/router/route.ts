import * as cors from "cors"
import * as express from "express"
import * as admin from "firebase-admin"

import * as cons from "../const"
import { deleteCollection, registerAddresses } from "../scripts/firestore"
import { Address } from "../types/address"

export const app = express()

// cors対策
app.use(cors({origin: true}))
// jsonパーサの登録
app.use(express.json())
// firebase-adminの初期化
admin.initializeApp()
const db = admin.firestore()

// 住所取得
app.get("/addresses/:postalCode", async (req, res) => {
  const postalCode = req.params.postalCode
  const firstTwoDigis = postalCode.substring(0, 2)

  const doc = await db
    .collection(cons.FIRESTORE_COLLECTION)
    .doc(firstTwoDigis)
    .get()

  if (!doc.data()) {
    res.send([])
    return
  }
  
  const addresses: Address[] = doc.data()?.data
  const result: Address[] = addresses.reduce(
    (prev, address) => {
      if (address.postal_code == postalCode) {
        let currentJSON = JSON.stringify(Object.entries(address).sort())
        let alreadyIncluded = prev.some(prevAddress => {
          let prevJSON = JSON.stringify(Object.entries(prevAddress).sort())
          return currentJSON === prevJSON
        })
        if (!alreadyIncluded) {
          prev.push(address)
        }
      }
      return prev
    }, [] as Address[]
  )
  res.send(result)
})

// 手動データ登録エンドポイント
app.post("/csv", async (req, res) => {
  await registerAddresses()
  res.send({message: "success"})
})

app.delete("/csv", async (req, res) => {
  const ref = db.collection(cons.FIRESTORE_COLLECTION)
  const batchSize = 200

  await deleteCollection(ref, batchSize)
  res.send({message: "success"})
})