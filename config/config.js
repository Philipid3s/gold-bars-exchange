const appName = 'gold-bars-exchange'
const databaseName = 'gold-bars'
const serverPort = process.env.PORT || 3000
const explicitApiUrl = process.env.NEXT_PUBLIC_API_URL
const isBrowser = typeof window !== 'undefined'
const apiUrl = explicitApiUrl || (isBrowser ? '' : `http://localhost:${serverPort}`)
// NEXT_PUBLIC_API_KEY is embedded at build time and available in the browser.
// API_KEY is server-only; set NEXT_PUBLIC_API_KEY for browser requests to carry x-api-key.
const apiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY || ''

const completeConfig = {

  default: {
    appName,
    serverPort,
    databaseUrl: process.env.MONGODB_URI || `mongodb://localhost/${databaseName}`,
    jsonOptions: {
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-api-key': apiKey } : {})
      }
    }
  },

  development: {
    appUrl: apiUrl
  },

  production: {
    // In the browser, always use relative URLs to avoid leaking localhost from build env.
    appUrl: isBrowser ? '' : (process.env.APP_URL || `http://localhost:${serverPort}/`)
  }

}

// Public API
module.exports = {
  config: { ...completeConfig.default, ...completeConfig[process.env.NODE_ENV] },
  completeConfig
}
