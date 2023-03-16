// 郵便番号の上2桁と都道府県の対応
// https://www.post.japanpost.jp/notification/pressrelease/2021/00_honsha/1029_01_02.pdf
export const DOCUMENT_KEYS = [
  "00", "04", "05", "06", // 北海道
  "07", "08", "09",
  "03",                   // 青森県
  "02",                   // 岩手県
  "98",                   // 宮城県
  "01",                   // 秋田県
  "99",                   // 山形県
  "96", "97",             // 福島県
  "30", "31",             // 茨城県
  "32",                   // 栃木県
  "37",                   // 群馬県
  "33", "34", "35", "36", // 埼玉県
  "26", "27", "28", "29", // 千葉県
  "10", "11", "12", "13", // 東京都
  "14", "15", "16", "17", //
  "18", "19", "20",       //
  "21", "22", "23", "24", // 神奈川県
  "25",                   //
  "40",                   // 山梨県
  "94", "95",             // 
  "38", "39",
  "93",
  "92",
  "91",
  "50",
  "41", "42", "43",
  "44", "45", "46", "47", "48", "49",
  "51", "52",
  "60", "61", "62",
  "53", "54", "55", "56", "57", "58", "59",
  "65", "66", "67",
  "63",
  "64",
  "68",
  "69",
  "70", "71",
  "72", "73",
  "74", "75",
  "77",
  "76",
  "79",
  "78",
  "80", "81", "82", "83",
  "84",
  "85",
  "86",
  "87",
  "88",
  "89",
  "90",
]

export const GCP_REGION_TOKYO = "asia-northeast1"
export const PUBSUB_TOPIC_ADD_DOC = "addDocuments"
export const FIRESTORE_COLLECTION = "Addresses"

export const REGEX_INCLUDES_BRACKETS
    = /（.+）$/g
export const REGEX_INCLUDES_BRACKETS_KANA
    = /\(.+\)$/g
export const REGEX_SET_EMPTY_ADDRESS_3
    = /(^以下に掲載がない場合$|^.+の次に.*番地.*がくる場合.*$|^.+一円$)/
export const REGEX_SET_EMPTY_IN_BRACKETS
    = /^次のビルを除く$|^その他$|^全域$|^丁目$|^番地$|^地階・階層不明$/g
export const REGEX_INCLUDE_TOWN
    = /を含む$/g
export const REGEX_REPLACE_IS_BUILDING
    = /（[０-９]+階）$/g
export const REGEX_REPLACE_IS_BUILDING_KANA
    = /\([0-9]+ｶｲ\)$/g