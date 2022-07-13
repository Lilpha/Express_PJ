const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    contents: {
        type : String,
        required : true
    },
    author: {
        type : String,
        required : true
    },
    comment_date: {type: String, required: true}
})
module.exports = mongoose.model('comment', commentSchema);