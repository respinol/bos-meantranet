const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  country: { type: String, unique: true },
  scraper: String,

  data: {
    name: String,
    phone: { type: String, unique: true },
    street_address: String,
    address_locality: String,
    address_region: String,
    postal_code: String,
    category: String,
    price_range: String,
    review_count: String,
    star_count: String,
    email: String,
    website: String,
    page_url: { type: String, unique: true }
  }
}, { timestamps: true });


const Business = mongoose.model('Business', businessSchema);

module.exports = Business;
