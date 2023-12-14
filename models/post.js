const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "user", required: true },
  datePublished: { type: Date, required: true, default: Date.now },
  text: { type: String, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "comment" }],
  isPublished: { type: Boolean, default: false },
});

module.exports = mongoose.model("post", PostSchema);
