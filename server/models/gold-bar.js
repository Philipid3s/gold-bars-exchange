const mongoose = require('mongoose')

const Schema = mongoose.Schema

const GoldBarSchema = new Schema({
  contract: { type: String, required: true },
  owner: { type: String, required: true },
  reference: { type: String, required: true },
  askingPrice: { type: Number, required: true },
  state: { type: String },

  buyer: { type: String },
  offerPrice: { type: Number }
})

module.exports = mongoose.model('GoldBar', GoldBarSchema)
