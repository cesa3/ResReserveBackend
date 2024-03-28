const mongoose = require('mongoose');
const Restaurant = require('./Restaurant');

const ReserveSchema = new mongoose.Schema({
    start: {
        type: Date,
        require:true
    },
    end: {
        type: Date,
        require:true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref:'User',
        require:true
    },
    restaurant: {
        type: mongoose.Schema.ObjectId,
        ref: 'Restaurant',
        require: true
    },
    table:{
        type: String,
        require: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

module.exports=mongoose.model('Reserve',ReserveSchema);
