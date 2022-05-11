const { Schema, model } = require('mongoose')

replySchema = new Schema({
  board: { type: String, required: true },
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  reported: { type: Boolean, default: false },
},
  {
    versionKey: false,
    timestamps: { createdAt: 'created_on',updatedAt: false },
  })

threadSchema = new Schema({
  board: { type: String, required: true },
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  reported: { type: Boolean, default: false },
  replycount: { type: Number, default: 0 },
  replies: { type: [replySchema], default: [] }
},
  {
    versionKey: false,
    timestamps: { createdAt: 'created_on', updatedAt: 'bumped_on' },
  })

const Thread = model('Thread', threadSchema)

module.exports = Thread