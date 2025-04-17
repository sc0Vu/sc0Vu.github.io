const BECH_ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
const radix2carry = (from, to) => from + (to - gcd(from, to))

const powers = (() => {
    let res = []
    for (let i = 0; i < 9; i++) res.push(2 ** i)
    return res
})()

function convertRadix2(data, from, to, padding) {
    if (from <= 0 || from > 32) throw new Error(`convertRadix2: wrong from=${from}`)
    if (to <= 0 || to > 32) throw new Error(`convertRadix2: wrong to=${to}`)
    if (radix2carry(from, to) > 32) {
      throw new Error(
        `convertRadix2: carry overflow from=${from} to=${to} carryBits=${radix2carry(from, to)}`
      )
    }
    let carry = 0
    let pos = 0 // bitwise position in current element
    const max = powers[from]
    const mask = powers[to] - 1
    const res = []
    for (const n of data) {
      if (n >= max) throw new Error(`convertRadix2: invalid data word=${n} from=${from}`)
      carry = (carry << from) | n
      if (pos + from > 32) throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`)
      pos += from
      for (; pos >= to; pos -= to) res.push(((carry >> (pos - to)) & mask) >>> 0)
      const pow = powers[pos]
      if (pow === undefined) throw new Error('invalid carry')
      carry &= pow - 1 // clean carry, otherwise it will cause overflow
    }
    carry = (carry << (to - pos)) & mask
    if (!padding && pos >= from) throw new Error('Excess padding')
    if (!padding && carry > 0) throw new Error(`Non-zero padding: ${carry}`)
    if (padding && pos > 0) res.push(carry >>> 0)
    return res
}

function decodeBech32Unsafe(str, limit=90) {
    if (typeof str !== 'string') throw Error('paramater should be string')
    const slen = str.length
    if (slen < 8 || (limit !== false && slen > limit)) throw new TypeError(`invalid string length: ${slen} (${str}). Expected (8..${limit})`)
    const lowered = str.toLowerCase()
    if (str !== lowered) throw new Error(`string must be lowercase`)
    const sepIndex = lowered.lastIndexOf('1')
    if (sepIndex === 0 || sepIndex === -1) throw new Error(`letter "1" must be present between prefix and data only`)
    const prefix = lowered.slice(0, sepIndex)
    const data = lowered.slice(sepIndex + 1)
    if (data.length < 6) throw new Error('data must be at least 6 characters long')
    const words = data.split('').map((s) => BECH_ALPHABET_MAP[s])
    console.log(prefix, words.slice(0, -6).length)
    const priv = convertRadix2(words.slice(0, -6), 5, 8, false).slice(1)
    return priv
}

const BECH_ALPHABET_MAP = {}
BECH_ALPHABET.split('').forEach((l, i) => BECH_ALPHABET_MAP[l] = i)