// 郵便番号の上2桁と都道府県の対応
// https://www.post.japanpost.jp/notification/pressrelease/2021/00_honsha/1029_01_02.pdf
export const DOCUMENT_KEYS = [
  // 北海道
  "00", "04", "05", "06", "07", "08", "09",
  // 青森県
  "03",
  // 岩手県
  "02",
  // 宮城県
  "98",
  // 秋田県
  "01",
  // 山形県
  "99",
  // 福島県
  "96", "97",
  // 茨城県
  "30", "31",
  // 栃木県
  "32",
  // 群馬県
  "37",
  // 埼玉県
  "33", "34", "35", "36",
  // 千葉県
  "26", "27", "28", "29",
  // 東京都
  "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  // 神奈川県
  "21", "22", "23", "24", "25",
  // 山梨県
  "40",
  // 新潟県
  "94", "95",
  // 長野県
  "38", "39",
  // 富山県
  "93",
  // 石川県
  "92",
  // 福井県
  "91",
  // 岐阜県
  "50",
  // 静岡県
  "41", "42", "43",
  // 愛知県
  "44", "45", "46", "47", "48", "49",
  // 三重県
  "51",
  // 滋賀県
  "52",
  // 京都府
  "60", "61", "62",
  // 大阪府
  "53", "54", "55", "56", "57", "58", "59",
  // 兵庫県
  "65", "66", "67",
  // 奈良県
  "63",
  // 和歌山県
  "64",
  // 鳥取県
  "68",
  // 島根県
  "69",
  // 岡山県
  "70", "71",
  // 広島県
  "72", "73",
  // 山口県
  "74", "75",
  // 徳島県
  "77",
  // 香川県
  "76",
  // 愛媛県
  "79",
  // 高知県
  "78",
  // 静岡県
  "80", "81", "82", "83",
  // 佐賀県
  "84",
  // 長崎県
  "85",
  // 熊本県
  "86",
  // 大分県
  "87",
  // 宮崎県
  "88",
  // 鹿児島県
  "89",
  // 沖縄県
  "90",
]

export const GCP_REGION_TOKYO = "asia-northeast1"
export const PUBSUB_TOPIC_ADD_DOC = "addDocuments"
export const FIRESTORE_COLLECTION = "Addresses"

export const REGEX_INCLUDES_BRACKETS=
    /（.+）$/g
export const REGEX_INCLUDES_BRACKETS_KANA =
    /\(.+\)$/g
export const REGEX_SET_EMPTY_ADDRESS_3 =
    /(^以下に掲載がない場合$|^.+の次に.*番地.*がくる場合.*$|^.+一円$)/
export const REGEX_SET_EMPTY_IN_BRACKETS =
    /^次のビルを除く$|^その他$|^全域$|^丁目$|^番地$|^地階・階層不明$/g
export const REGEX_INCLUDE_TOWN =
    /を含む$/g
export const REGEX_REPLACE_IS_BUILDING =
    /（[０-９]+階）$/g
export const REGEX_REPLACE_IS_BUILDING_KANA =
    /\([0-9]+ｶｲ\)$/g
