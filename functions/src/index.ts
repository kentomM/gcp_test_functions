import * as functions from "firebase-functions"

import { GCP_REGION_TOKYO, PUBSUB_TOPIC_ADD_DOC } from "./postal-code/const"
import * as postalCodeAPI from "./postal-code/router/route"
import { addAddresses } from "./postal-code/functions/addAddress"
import { Address } from "./postal-code/types/address"

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
        addAddresses(data.key, data.records)
        return 0
    })
