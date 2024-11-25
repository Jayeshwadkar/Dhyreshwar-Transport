const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VehicleType = new Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tyreQuantity: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: function () { return !this.updatedBy }
  },
  updatedBy: {
    type: String,
    required: function () { return !this.createdBy }
  }
}, {
  collection: 'vehicleType',
  timestamps: true
})

module.exports = mongoose.model('VehicleType', VehicleType);
