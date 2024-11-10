const mongoose = require('mongoose');
const { Schema } = mongoose;

const asteroidSchema = new Schema({
    neo_reference_id: { type: String, required: true },
    name: { type: String, required: true },
    nasa_jpl_url: { type: String, required: true },
    absolute_magnitude_h: { type: Number, default: null },
    estimated_diameter: {
        kilometers: {
            estimated_diameter_min: { type: Number, default: null },
            estimated_diameter_max: { type: Number, default: null },
        },
        meters: {
            estimated_diameter_min: { type: Number, default: null },
            estimated_diameter_max: { type: Number, default: null },
        },
        miles: {
            estimated_diameter_min: { type: Number, default: null },
            estimated_diameter_max: { type: Number, default: null },
        },
        feet: {
            estimated_diameter_min: { type: Number, default: null },
            estimated_diameter_max: { type: Number, default: null },
        }
    },
    is_potentially_hazardous_asteroid: { type: Boolean, default: false },
    close_approach_data: [{
        close_approach_date: { type: String, required: true },
        close_approach_date_full: { type: String },
        epoch_date_close_approach: { type: Number },
        relative_velocity: {
            kilometers_per_second: { type: String, default: null },
            kilometers_per_hour: { type: String, default: null },
            miles_per_hour: { type: String, default: null },
        },
        miss_distance: {
            astronomical: { type: String, default: null },
            lunar: { type: String, default: null },
            kilometers: { type: String, default: null },
            miles: { type: String, default: null },
        },
        orbiting_body: { type: String, default: null },
    }],
    orbital_data: { type: Schema.Types.Mixed, default: {} },
    is_sentry_object: { type: Boolean, default: false },
    // date: { type: String, ref: 'Date', required: true }, // Foreign key to the Date model
    dateString: { type: String, required: true },
}, { timestamps: true });

asteroidSchema.index({ neo_reference_id: 1 });
asteroidSchema.index({ dateString: 1 });

module.exports = mongoose.model('Asteroid', asteroidSchema);
