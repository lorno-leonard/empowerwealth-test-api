import mongoose from 'mongoose'

import config from '@config/mongo'

const connect = async () => {
  await mongoose.connect(config.host, config?.options)
}

const disconnect = async () => {
  await mongoose.disconnect()
}

export default {
  connect,
  disconnect,
}
