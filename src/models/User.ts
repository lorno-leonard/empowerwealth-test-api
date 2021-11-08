import { Schema, model, Document } from 'mongoose'
import md5 from 'md5'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  validPassword: (password: string) => boolean
}

const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'user',
  }
)

// Middlewares
UserSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = md5(this.password)
  }
  next()
})

// Methods
UserSchema.methods.validPassword = function (password) {
  return this.password === md5(password)
}

// Indexes
UserSchema.index({ email: 1 })

export default model<IUser>('user', UserSchema)
