import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCT1Hjy6FUFOXUGnCn7+E+RP7xdRZ5BzFbtrIge6VSW+mgk79OfcAYFo8Rvsal0VGZzkJqkvPUwfCvcgpKRzrE9G3kqEDC67+bVMHZcGi8olQDILifjj8m8cTc3emtoanOZt8t0UEIrkUk+tj3FT1U9wB5PKFn94rM+z9iG60n8TwIDAQAB'

// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}