const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let thread_id = null
let reply_id = null

suite('Functional Tests', function() {
  test('Creating a new thread: POST request to /api/threads/{board}', async () => {
    const res = await chai.request(server)
      .post('/api/threads/test')
      .send({ text: 'Hello', delete_password: '123' })
    assert.equal(res.status, 200)
    assert.equal(res.request.req.path, '/b/test')
  })
  test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', async () => {
    const res = await chai.request(server)
      .get('/api/threads/test')
    assert.equal(res.status, 200)
    assert.isAtMost(res.body.length, 10)
    assert.equal(res.body.every((v) => v.replies.length <= 3), true)
    assert.equal(res.body.sort((a, b) => new Date(b.bumped_on) - new Date(a.bumped_on)), res.body)
    assert.equal(res.body.every(v => v.replies.sort((a, b) => new Date(b.created_on) - new Date(a.created_on)) == v.replies), true)
    thread_id = res.body[0]._id
  })

  test('Reporting a thread: PUT request to /api/threads/{board}', async () => {
    const res = await chai.request(server)
      .put('/api/threads/test')
      .send({report_id:thread_id})
    assert.equal(res.status, 200)
    assert.equal(res.text, 'reported')
  })

  test('Creating a new reply: POST request to /api/replies/{board}', async () => {
    const res = await chai.request(server)
      .post('/api/replies/test')
      .send({ thread_id: thread_id,text: 'Hello', delete_password: '123' })
    assert.equal(res.status, 200)
    assert.equal(res.request.req.path, `/b/test/${thread_id}`)
  })

  test('Viewing a single thread with all replies: GET request to /api/replies/{board}', async () => {
    const res = await chai.request(server)
      .get('/api/replies/test')
      .query({ thread_id: thread_id })
    assert.equal(res.status, 200)
    assert.equal(res.body._id, thread_id)
    assert.equal(res.body.replies.length, 1)
    assert.equal(res.body.replies[0].text, 'Hello')
    reply_id = res.body.replies[0]._id
  })

  test('Reporting a reply: PUT request to /api/replies/{board}', async () => {
    const res = await chai.request(server)
      .put('/api/replies/test')
      .send({thread_id:thread_id, reply_id:reply_id})
    assert.equal(res.status, 200)
    assert.equal(res.text, 'reported')
  })

  test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', async () => {
    const res = await chai.request(server)
      .delete('/api/replies/test')
      .send({thread_id:thread_id, reply_id:reply_id, delete_password:'hahaha'})
    assert.equal(res.status, 200)
    assert.equal(res.text, 'incorrect password')
  })

  test('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', async () => {
    const res = await chai.request(server)
      .delete('/api/replies/test')
      .send({thread_id:thread_id, reply_id:reply_id, delete_password:'123'})
    assert.equal(res.status, 200)
    assert.equal(res.text, 'success')
  })

  test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', async () => {
    const res = await chai.request(server)
      .delete('/api/threads/test')
      .send({thread_id:thread_id, delete_password:'hahaha'})
    assert.equal(res.status, 200)
    assert.equal(res.text, 'incorrect password')
  })

  test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', async () => {
    const res = await chai.request(server)
      .delete('/api/threads/test')
      .send({thread_id:thread_id, delete_password:'123'})
    assert.equal(res.status, 200)
    assert.equal(res.text, 'success')
  })
})

// Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password
// Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password\