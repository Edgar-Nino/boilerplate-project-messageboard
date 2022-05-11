'use strict';
const mongoose = require('mongoose')
const Thread = require('../models/thread')
module.exports = function(app) {
  mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

  app.route('/api/threads/:board')
    .get(async (req, res) => {
      try {
        const { board } = req.params
        let result = await Thread.find({ board: board }).select('-delete_password -reported -replies.delete_password -replies.reported').sort('-bumped_on').limit(10).lean()
        result = result.map((v, i, a) => {
          let newReplies = v.replies.sort((a, b) => new Date(b.created_on) - new Date(a.created_on)).slice(0,3)
          const aux = { ...v, replies: newReplies }
          return aux
        })
        res.json(result)
      } catch (e) {

      }
    })
    .post(async (req, res) => {
      try {
        const { board } = req.params
        const { text, delete_password } = req.body
        const thread = new Thread({
          board, text, delete_password
        })
        const result = await thread.save()
        res.redirect(`/b/${board}`)
      } catch (e) {
        res.send('error')
      }
    })
    .put(async (req, res) => {
      try {
        const { board } = req.params
        const { report_id } = req.body
        const result = await Thread.updateOne(
          { board, _id: report_id },
          { reported: true },
          { timestamps: false })
        if (result.matchedCount != 1) { res.send('error'); return }
        res.send('reported')
      } catch (e) {
        res.send('error')
      }
    })
    .delete(async (req, res) => {
      try {
        const { board } = req.params
        const { delete_password, thread_id } = req.body
        const result = await Thread.deleteOne({ board, delete_password, _id: thread_id })
        if (result.deletedCount != 1) { res.send('incorrect password'); return }
        res.send('success')
      } catch (e) {
        res.send('incorrect password')
      }
    })
  app.route('/api/replies/:board')
    .get(async (req, res) => {
      const { board } = req.params
      const { thread_id } = req.query
      let result = await Thread.findOne({ board: board, _id: thread_id }).select('-delete_password -reported -replies.delete_password -replies.reported').sort('-bumped_on').limit(10).lean()
      res.json(result)
    })
    .post(async (req, res) => {
      try {
        const { board } = req.params
        const { text, delete_password, thread_id } = req.body
        const reply = {
          board, text, delete_password
        }
        const result = await Thread.findOneAndUpdate({ board: board, _id: thread_id }, {
          $push: {
            replies: reply
          }
        }, { new: true }).select('-replies.created_on')

        res.redirect(`/b/${board}/${thread_id}`)
      } catch (e) {
        res.send('Error')
      }

    })
    .put(async (req, res) => {
      try {
        const { board } = req.params
        const { thread_id, reply_id } = req.body
        const result = await Thread.updateOne(
          { board, _id: thread_id, 'replies._id': reply_id },
          { $set: { 'replies.$.reported': true } },
          { timestamps: false })
        if (result.matchedCount != 1) { res.send('error'); return }
        res.send('reported')
      } catch (e) {
        res.send('error')
      }
    })
    .delete(async (req, res) => {
      try {
        const { board } = req.params
        const { delete_password, thread_id, reply_id } = req.body
        const result = await Thread.updateOne(
          { board, delete_password, thread_id, 'replies._id': reply_id },
          { $set: { 'replies.$.text': '[deleted]' } },
          { timestamps: false })
        if (result.matchedCount != 1) { res.send('incorrect password'); return }
        res.send('success')
      } catch (e) {
        res.send('incorrect password')
      }
    })

};
