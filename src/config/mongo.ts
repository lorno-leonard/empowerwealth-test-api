import { MongoDbConfigProps } from './types'

const globalAny: any = global
let config: MongoDbConfigProps

if (process.env.NODE_ENV === 'test') {
  config = {
    host: globalAny.__MONGO_URI__,
    options: {
      dbName: globalAny.__MONGO_DB_NAME__,
      useNewUrlParser: true,
    },
  }
} else {
  config = {
    host: process.env.MONGODB_URI || '',
    options: {
      dbName: process.env.MONGODB_DB || 'realty-labs-dev',
      useNewUrlParser: true,
    },
  }
}

export default config
