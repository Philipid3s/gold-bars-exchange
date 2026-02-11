import mongoose from 'mongoose'

const GoldBarSchema = new mongoose.Schema(
  {
    contract: { type: String, required: true },
    owner: { type: String, required: true },
    reference: { type: String, required: true },
    askingPrice: { type: Number, required: true },
    state: { type: String },
    buyer: { type: String },
    offerPrice: { type: Number }
  },
  { timestamps: true }
)

export default mongoose.models.GoldBar || mongoose.model('GoldBar', GoldBarSchema)
