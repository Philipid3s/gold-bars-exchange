const appName = 'gold-bars-exchange'
const databaseName = 'gold-bars'
const serverPort = process.env.PORT || 3000
const explicitApiUrl = process.env.NEXT_PUBLIC_API_URL
const isBrowser = typeof window !== 'undefined'
const apiUrl = explicitApiUrl || (isBrowser ? '' : `http://localhost:${serverPort}`)
// This module is imported by the browser bundle. Never read API_KEY or
// NEXT_PUBLIC_API_KEY here. Write routes accept same-origin browser calls
// and, for other clients, the runtime server env API_KEY (see lib/apiGuard.js).

const completeConfig = {

  default: {
    appName,
    serverPort,
    databaseUrl: process.env.MONGODB_URI || `mongodb://localhost/${databaseName}`,
    jsonOptions: {
      headers: {
        'Content-Type': 'application/json'
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
