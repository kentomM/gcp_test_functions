import { parse } from "csv-parse/sync"
import * as iconv from 'iconv-lite'
import fetch from "node-fetch"

import * as cons from "../const"
import { makeIterator } from "../scripts/utils"
import { Address, addressKeys } from "../types/address"

/***
 * KEN_ALL.csvをダウンロードして解析、全レコードを返す
 * @params {string} url - 日本郵便のURL
 * @return csv全データの配列
 ***/
export const getAddressesFromCsv = async() => {
  const AdmZip = require("adm-zip")
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
