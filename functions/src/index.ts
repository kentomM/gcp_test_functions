import * as functions from "firebase-functions"

import * as postalCodeAPI from "./postal-code/router/route"

// 郵便番号apiが動くようにする
const api = functions
    .region("asia-northeast1")
    .https.onRequest(postalCodeAPI.app)
module.exports = {api}
