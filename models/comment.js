const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "user", required: true },
  dateSent: { type: Date, required: true, default: Date.now },
  text: { type: String, required: true },
  like: { type: Number, default: 0 },
});

module.exports = mongoose.model("comment", CommentSchema);
