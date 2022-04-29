import { describe, expect, it } from '@jest/globals'
import request from 'supertest'
import app from './app'

describe('LDN inbox', () => {
  describe('receives info about item to index', () => {
    it('receives info about the item', async () => {
      const response = await request(app)
        .post('/inbox')
        .set(
          'content-type',
          'application/ld+json;profile="https://www.w3.org/ns/activitystreams"',
        )
        .send({
          '@context': 'https://www.w3.org/ns/activitystreams',
          '@id': '',
          '@type': 'Announce',
          actor: 'https://solididentity.example#me',
          object: 'https://solidpod.example/my-new-idea',
        })
      expect(response.statusCode).toBe(202)
    })
    it.skip('receives info in turtle format', () => {})
    it('adds item to process to database', () => {
      throw 'no database set up'
    })
  })
})
