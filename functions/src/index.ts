import * as cors from "cors"
import * as express from "express"
import * as admin from "firebase-admin"
import * as functions from "firebase-functions"

const app = express()

// cors対策
app.use(cors({origin: true}))
// jsonパーサの登録
app.use(express.json())
// firebase-adminの初期化
admin.initializeApp()

const db = admin.firestore()

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number]
// ここの順番で返すオブジェクトのkeyの順番も変わる
const addressKeys = [
  "postal_code",
  "address_1", "address_2", "address_3",
  "kana_1", "kana_2", "kana_3",
  "local_government_code",
] as const
type Address = {
  [key in ArrayElement<typeof addressKeys>]: string
}

// POSTリクエストで登録処理
app.post("/addresses", async (req, res) => {
  const setData: Address = {
    postal_code: "0000001",
    address_1: "東京都",
    address_2: "中野区",
    address_3: "本町",
    kana_1: "ﾄｳｷｮｳﾄ",
    kana_2: "ﾅｶﾉｸ",
    kana_3: "ﾎﾝﾏﾁ",
    local_government_code: "13114",
  }
  await db.collection("addresses").doc().set(setData)
  res.send({message: "success"})
})

// データを取得
app.get("/addresses", async (req, res) => {
  const docs = await db.collection("addresses").get()
  const data: Address[] = []
  docs.forEach((doc) => {
    const addresses = doc.data() as Address
    // そのままだとkeyの順番がごちゃごちゃなのでソート
    const sortedAddresses = addressKeys.reduce((obj, key) => {
      obj[key] = addresses[key]
      return obj
    }, {} as Address)
    data.push(sortedAddresses)
  })
  res.json({
    total: data.length,
    data,
  })
})

// apiが動くようにする
const api = functions.region("asia-northeast1").https.onRequest(app)
module.exports = {api}
