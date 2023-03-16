import * as admZip from 'adm-zip'
import fetch from 'node-fetch'
import * as iconv from 'iconv-lite'
import { parse } from 'csv-parse'

import { Address } from '../types/address';

export function makeIterator<T> (array: T[]) {
  let nextIndex = 0
  return {
    next: () => {
      return nextIndex < array.length ? {
        value: array[nextIndex++] as T,
        done: false,
      } : {
        done: true,
      }
    }
  }
}

export const readAddressesFromZipFile = async (url: string): Promise<Address[]> => {
  const response = await fetch(url)
  const buffer = await response.buffer()

  const zip = new admZip(buffer)
  const entries = zip.getEntries()
  const csvEntry = entries.find((entry:any) => entry.entryName = "KEN_ALL.CSV")
  if (!csvEntry) {
    throw new Error("KEN_ALL.CSV is not found in zip")
  }

  const csvData = await csvEntry.getData()
  const decodedData = iconv.decode(csvData, "Shift-JIS")

  const records: Address[] = await new Promise((resolve, reject) => {
    const parser = parse(decodedData, {columns: true})
    const records: Address[] = []
    parser.on('readable', () => {
      let record = parser.read()
      while(record) {
        records.push(record as Address)
        record = parser.read()
      }
    })
    parser.on('error', reject)
    parser.on('end', () => resolve(records))
  })
  return records
}

export const sleep = (milliSeconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliSeconds))
}

export function* zip(...args: any[]) {
    
  const length = args[0].length;
  
  // 引数チェック
  for (let arr of args) {
      if (arr.length !== length){
          throw "Lengths of arrays are not eqaul.";
      }
  }
  
  // 
  for (let index = 0; index < length; index++) {
      let elms = [];
      for (let arr of args) {
          elms.push(arr[index]);
      }
      yield elms;
  }
}