require('dotenv').config()

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  env: {
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || ''
  },
  async headers () {
    if (isProd) return []
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data:; object-src 'none'; base-uri 'self';"
          }
        ]
      }
    ]
  }
}
