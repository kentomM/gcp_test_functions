/***
 * @param {T[]} array - イテレータにしたい配列
 * @return {T} イテレータの先頭の要素
 ***/
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

/***
 * @params {number} milliseonds - 処理を止める秒数(ms)
 ***/
export const sleep = (milliSeconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliSeconds))
}

/***
 * @params {any[]} args - 同じ長さを持つ複数の配列の配列
 * @return argsの各配列の同じindexの要素
 ***/
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