// import * as os from "os"
// import * as fs from "fs"

import * as cors from "cors"
import * as express from "express"
import * as admin from "firebase-admin"
import * as iconv from "iconv-lite"
import fetch from "node-fetch"
import { parse } from "csv-parse/sync"
import { PubSub } from "@google-cloud/pubsub"

import { Address, addressKeys } from "../types/address"
import { makeIterator } from "../functions/utils"
import * as cons from "../const"
import * as util from "../functions/utils"
// import { parsePostalCode } from "../functions/parse"
// import * as addressesController from "../controller/addresses"
// import * as addressesFromPostalController from "../controller/addressesFromPostal"

const AdmZip = require("adm-zip")
export const app = express()

// cors対策
app.use(cors({origin: true}))
// jsonパーサの登録
app.use(express.json())
// firebase-adminの初期化
admin.initializeApp()

const db = admin.firestore()
const pubsub = new PubSub()

// 住所取得
app.get("/addresses/:postalCode", async (req, res) => {
  const postalCode = req.params.postalCode
  const firstTwoDigis = postalCode.substring(0, 2)

  const doc = await db
    .collection(cons.FIRESTORE_COLLECTION)
    .doc(firstTwoDigis)
    .get()
  
  const addresses: Address[] = doc ? doc.data()?.data : []
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
// 郵便番号取得（できたら）
app.get("/postal", async (req, res) => {
  res.send("get /postal")
})

// CSV手動追加（できたら）
app.post("/addresses", async (req, res) => {
  res.send("post /addresses")
})

// CSV手動削除（できたら）
app.delete("/addresses", async (req, res) => {
  const deletedPostalCode = "0000001"
  await db.collection("addresses")
      .doc(deletedPostalCode)
      .delete()
  res.send({message: "success"})
})

// データ登録エンドポイント
app.post("/csv", async (req, res) => {

  // CSVファイルの読み込み
  // NOTE: 複数行に分かれている町域は1行に直して読み込む
  const getAddressCsv = async () => {
    // URLからcsvファイルをダウンロード
    const fileUrl = "https://www.post.japanpost.jp/zipcode/dl/kogaki/zip/ken_all.zip"
    const response = await fetch(fileUrl)
    const buffer = await response.buffer()
  
    const zip = new AdmZip(buffer)
    const entries = zip.getEntries()
    const csvEntry = entries.find((entry:any) => entry.entryName = "KEN_ALL.CSV")
    if (!csvEntry) {
      throw new Error("KEN_ALL.CSV is not found in zip")
    }
  
    const csvData = await csvEntry.getData()

    // デバッグ用: ローカルのCSVファイルを使用
    // const filePath = `${os.tmpdir()}/KEN_ALL.CSV`
    // const decodeData = iconv.decode(fs.readFileSync(filePath), "Shift-JIS")
    const decodedData = iconv.decode(csvData, "Shift-JIS")
    const rawRecords = makeIterator<Address>(parse(decodedData, {
      columns: addressKeys,
    }))

    const mergedRecords: Address[] = []
    let row
    // csvを読み込んで複数行を1行にマージ
    while (!(row = rawRecords.next()).done) {
      if (row.value?.address_3!.includes("（") && !row.value?.address_3!.includes("）")){
        let mergedRow
        while(true){
          mergedRow = rawRecords.next()
          row.value.address_3! += mergedRow.value?.address_3
          row.value.kana_3! += mergedRow.value?.kana_3
          if (mergedRow.value?.address_3!.includes("）")) break
        }
      }
      mergedRecords.push(row.value as Address)
    }
    // 町域周りの解析
    const parsedRecords: Address[] = []
    for(let record of mergedRecords) {
      if (!record.address_3 || !record.kana_3) continue

      let regResult = record.address_3.match(cons.REGEX_INCLUDES_BRACKETS)
      let regResultKana = record.kana_3.match(cons.REGEX_INCLUDES_BRACKETS_KANA)

      /* ---問答無用で町域を削除する場合--- */
      // 町域が特定の文字列だった時、町域を空文字に変更
      if (cons.REGEX_SET_EMPTY_ADDRESS_3.test(record.address_3)){
        record.address_3 = ""
        record.kana_3 = ""
        parsedRecords.push(record)
        continue
      }
      
      /* ---町域に括弧が含まれる場合--- */
      if (regResult && regResultKana){
        let inBracketsString = regResult[0].slice(1, -1)
        let inBracketsStringKana = regResultKana[0].slice(1, -1)
        // ビルの階層を含む情報の場合、（）を外して登録
        if(cons.REGEX_REPLACE_IS_BUILDING.test(`（${inBracketsString}）`)){
          record.address_3 = record.address_3.replace(cons.REGEX_REPLACE_IS_BUILDING, str => str.slice(1,-1))
          record.kana_3 = record.kana_3.replace(cons.REGEX_REPLACE_IS_BUILDING_KANA, str => str.slice(1,-1))
          parsedRecords.push(record)
          continue
        }
        // （）内の情報を全て削除して登録
        record.address_3 = record.address_3.replace(`（${inBracketsString}）`, "")
        record.kana_3 = record.kana_3.replace(`(${inBracketsStringKana})`, "")
        parsedRecords.push(record)
        continue
      }

      /* ---町域に括弧が含まれない場合--- */
      parsedRecords.push(record)
    }
    return parsedRecords
  }
  
  const records = await getAddressCsv()
  console.log(`records.length: ${records.length}`)

  // オプションや町域を見て必要に応じて次の行の町域を追加する
  // 特定の要素が含まれている場合町域を削除する
  // 、で区切られている場合別の住所として登録
  const convertedRecords = records.map<Address>((r: Address) => {
    return {
      postal_code: r.postal_code,
      address_1: r.address_1,
      address_2: r.address_2,
      address_3: r.address_3,
      kana_1: r.kana_1,
      kana_2: r.kana_2,
      kana_3: r.kana_3,
      local_government_code: r.local_government_code,
    }
  })

  // 郵便番号上2桁を基準に都道府県毎のarrayに分ける
  const recordsFromDocKeys = cons.DOCUMENT_KEYS.reduce(
    (acc, key) => {
      acc[key] = []
      return acc
    },
    {} as {[x:string]: Address[]},
  )
  convertedRecords.forEach((record) => {
    const firstTwoDigis = record.postal_code ? record.postal_code.substring(0, 2) : ""
    if(Object.keys(recordsFromDocKeys).includes(firstTwoDigis)) {
      recordsFromDocKeys[firstTwoDigis].push(record)
    } else {
      if(!Object.keys(recordsFromDocKeys).includes("other")) {
        recordsFromDocKeys["other"] = []
      }
      recordsFromDocKeys["other"].push(record)
    }
  })

  // わけたarrayをpub/subで送信
  /******** debug *********/
  const [topics] = await pubsub.getTopics()
  const testTopic = topics.filter((tp)=> tp.name.includes(cons.PUBSUB_TOPIC_ADD_DOC))?.[0]
  if (!testTopic) await pubsub.createTopic(cons.PUBSUB_TOPIC_ADD_DOC)
  /******** ここまで *******/
  const topic = pubsub.topic(cons.PUBSUB_TOPIC_ADD_DOC)
  for (const [key, value] of Object.entries(recordsFromDocKeys)){
    const message = {
      key,
      records: value,
    }
    try {
      util.sleep(1000)
      topic.publishMessage({json: message})
      console.log(`published message. key: ${key}`)
    } catch {
      console.error(`missing message. key: ${key}`)
    }
  }

  res.send({message: "success"})
})