type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number]
export const addressKeys = [
    "local_government_code",
    "postal_code_old",
    "postal_code",
    "kana_1",
    "kana_2",
    "kana_3",
    "address_1",
    "address_2",
    "address_3",
    "option_1",
    "option_2",
    "option_3",
    "option_4",
    "option_5",
    "option_6",
]
export const addressKeysUnions = [...addressKeys] as const

export type Address = {
    [key in ArrayElement<typeof addressKeysUnions>]?: string
  }
