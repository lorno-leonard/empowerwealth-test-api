import { Schema, model, Document } from 'mongoose'

export interface IIncomeExpence {
  [key: string]: number
}

export interface IPropertyData extends Document {
  propertyId: number
  propertyName: string
  income: IIncomeExpence
  expense: IIncomeExpence
}

const IncomeExpenseSchema = new Schema({
  January: { type: Number },
  February: { type: Number },
  March: { type: Number },
  April: { type: Number },
  May: { type: Number },
  June: { type: Number },
  July: { type: Number },
  August: { type: Number },
  September: { type: Number },
  October: { type: Number },
  November: { type: Number },
  December: { type: Number },
})

const PropertyDataSchema = new Schema(
  {
    propertyId: { type: Number, required: true, unique: true },
    propertyName: { type: String, required: true },
    income: IncomeExpenseSchema,
    expense: IncomeExpenseSchema,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'propertyData',
  }
)

// Indexes
PropertyDataSchema.index({ propertyId: 1 })
PropertyDataSchema.index({ propertyName: 1 })

export default model<IPropertyData>('propertyData', PropertyDataSchema)
