import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import http from 'http'
import request from 'supertest'

import listHandler from '../../pages/api/v1/goldbars/index'
import idHandler from '../../pages/api/v1/goldbars/[id]'

let mongo

function createServer (handler, query = {}) {
  return http.createServer((req, res) => {
    req.query = query
    handler(req, res)
  })
}

describe('API /api/v1/goldbars', () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create()
    process.env.MONGODB_URI = mongo.getUri()
    process.env.API_KEY = 'test-key'
    await mongoose.connect(process.env.MONGODB_URI)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongo.stop()
  })

  it('creates and lists goldbars', async () => {
    const createServerInstance = createServer(listHandler)
    await request(createServerInstance)
      .post('/api/v1/goldbars')
      .set('x-api-key', 'test-key')
      .send({
        contract: '0xabc',
        owner: '0xowner',
        reference: 'REF-1',
        askingPrice: 100,
        state: 'Available'
      })
      .expect(201)

    const listServerInstance = createServer(listHandler, { limit: '10', offset: '0' })
    const res = await request(listServerInstance)
      .get('/api/v1/goldbars?limit=10&offset=0')
      .set('x-api-key', 'test-key')
      .expect(200)

    expect(res.body.total).toBe(1)
    expect(res.body.items.length).toBe(1)
  })

  it('updates and deletes a goldbar', async () => {
    const createServerInstance = createServer(listHandler)
    const created = await request(createServerInstance)
      .post('/api/v1/goldbars')
      .set('x-api-key', 'test-key')
      .send({
        contract: '0xdef',
        owner: '0xowner2',
        reference: 'REF-2',
        askingPrice: 200,
        state: 'Available'
      })
      .expect(201)

    const id = created.body._id

    const updateServerInstance = createServer(idHandler, { id })
    const updated = await request(updateServerInstance)
      .put(`/api/v1/goldbars/${id}`)
      .set('x-api-key', 'test-key')
      .send({ state: 'Accepted' })
      .expect(200)

    expect(updated.body.state).toBe('Accepted')

    const deleteServerInstance = createServer(idHandler, { id })
    await request(deleteServerInstance)
      .delete(`/api/v1/goldbars/${id}`)
      .set('x-api-key', 'test-key')
      .expect(200)
  })

  it('rejects unauthorized requests', async () => {
    const listServerInstance = createServer(listHandler)
    await request(listServerInstance).get('/api/v1/goldbars').expect(401)
  })
})
