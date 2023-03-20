import * as admin from "firebase-admin"
import { PubSub } from "@google-cloud/pubsub"
import { CollectionReference, Query, WriteBatch, WriteResult } from "@google-cloud/firestore"

import { getAddressesFromCsv } from "./parseKenAll"
import { Address } from "../types/address"
import * as cons from "../const"

/***
 * firestoreにデータを保存する
 * @params {string} docKey - documentのID(pk)になる文字列
 * @params {Address} addresses - documentに保存されるデータ
 ***/
export const insertAddresses = async (docKey: string, addresses: Address[]) => {
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

/***
 * firestoreのデータを削除する
 * @params {CollectionReference} collectionRef - コレクションデータ
 * @params {number} batchSize - 一度に処理するデータ数の上限値（最大500件）
 ***/
export async function deleteCollection(collectionRef: CollectionReference, batchSize: number = 500) {
  const firestore = admin.firestore();
  const query = collectionRef.orderBy('__name__').limit(batchSize);
  await deleteQueryBatch(firestore, query, batchSize);
}

async function deleteQueryBatch(firestore: FirebaseFirestore.Firestore, query: Query, batchSize: number): Promise<void> {
  const snapshot = await query.get();

  // When there are no documents left, we are done
  if (snapshot.size === 0) {
    return;
  }

  // Delete documents in a batch
  const results = await execute(async (batch) => {
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
  });
  console.log(`deleted count: ${results.length}`);
  
  return await deleteQueryBatch(firestore, query, batchSize);
}

export async function execute(f: (batch: WriteBatch) => Promise<void>): Promise<WriteResult[]> {
  const batch = admin.firestore().batch();
  await f(batch);
  return await batch.commit();
}

/***
 * firestoreにKEN_ALL.CSVを登録
 ***/
export const registerAddresses = async () => {
  const pubsub = new PubSub()

  // CSVファイルの読み込み
  const records = await getAddressesFromCsv()
  console.log(`data size: ${records.length}`)

  // 郵便番号上2桁を基準に都道府県毎のarrayに分ける
  const recordsFromDocKeys = cons.DOCUMENT_KEYS.reduce(
    (acc, key) => {
      acc[key] = []
      return acc
    },
    {} as {[x:string]: Address[]},
  )
  records.forEach((record: Address) => {
    const formattedRecord = {
      postal_code: record.postal_code,
      address_1: record.address_1,
      address_2: record.address_2,
      address_3: record.address_3,
      kana_1: record.kana_1,
      kana_2: record.kana_2,
      kana_3: record.kana_3,
      local_government_code: record.local_government_code,
    }
    const firstTwoDigis = record.postal_code ? record.postal_code.substring(0, 2) : ""
    if(Object.keys(recordsFromDocKeys).includes(firstTwoDigis)) {
      recordsFromDocKeys[firstTwoDigis].push(formattedRecord)
    } else {
      if(!Object.keys(recordsFromDocKeys).includes("other")) {
        recordsFromDocKeys["other"] = []
      }
      recordsFromDocKeys["other"].push(formattedRecord)
    }
  })

  // わけたarrayをpub/subで送信
  /******** ローカル実行時にはコメントアウトを無くす *********/
  const [topics] = await pubsub.getTopics()
  const testTopic = topics.filter((tp)=> tp.name.includes(cons.PUBSUB_TOPIC_ADD_DOC))?.[0]
  if (!testTopic) await pubsub.createTopic(cons.PUBSUB_TOPIC_ADD_DOC)
  /******** ここまで *******/
  const topic = pubsub.topic(cons.PUBSUB_TOPIC_ADD_DOC)
  let loopCount = 0
  for (const [key, value] of Object.entries(recordsFromDocKeys)){
    const message = {
      key,
      records: value,
    };
    
    (function(){
      try {
        setTimeout(() => {
          topic.publishMessage({json: message})
          console.log(`published message. key: ${key}`)  
        }, loopCount * 450)
      } catch {
        console.error(`missing message. key: ${key}`)
      }
    })()
    loopCount++
  }
}