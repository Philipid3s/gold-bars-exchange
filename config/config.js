const appName = 'gold-bars-exchange'
const databaseName = 'gold-bars'
const serverPort = process.env.PORT || 3000
const apiUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${serverPort}`
const apiKey = process.env.NEXT_PUBLIC_API_KEY || ''

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
    appUrl: process.env.APP_URL || `http://localhost:${serverPort}/`
  }

}

// Public API
module.exports = {
  config: { ...completeConfig.default, ...completeConfig[process.env.NODE_ENV] },
  completeConfig
}
