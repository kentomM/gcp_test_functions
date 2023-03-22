import * as functions from "firebase-functions"

import {changeAddresses} from "./postal-code/batch/changeAddresses"
import {GCP_REGION_TOKYO, PUBSUB_TOPIC_ADD_DOC} from "./postal-code/const"
import * as postalCodeAPI from "./postal-code/router/route"
import {insertAddresses} from "./postal-code/scripts/firestore"
import {Address} from "./postal-code/types/address"

// 郵便番号api
export const api = functions
    .region(GCP_REGION_TOKYO)
    .runWith({timeoutSeconds: 540})
    .https.onRequest(postalCodeAPI.app)

// pub/subで受け取ったデータを元に登録
export const addDocumentsPubSub = functions
    .runWith({timeoutSeconds: 540})
    .pubsub
    .topic(PUBSUB_TOPIC_ADD_DOC)
    .onPublish((message) => {
      const data: {key:string, records: Address[]} = message.json
      insertAddresses(data.key, data.records)
      return 0
    })

// 毎月1日に実行するバッチ処理
export const changeAddressesBatch = functions
    .runWith({timeoutSeconds: 540})
    .pubsub
    .schedule("1 of month 01:00")
    .timeZone("Asia/Tokyo")
    .onRun((ctx) => {
      changeAddresses()
      return null
    })
