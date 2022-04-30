import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  afterEach,
} from '@jest/globals'
import request from 'supertest'
import app from './app'
import AppDataSource from './services/db/data-source'
import { Inbox } from './services/db/entity/Inbox'
import type { Uri } from './types'

beforeAll(() => AppDataSource.initialize())
afterAll(() => AppDataSource.destroy())

const sendNotification = async ({ subject }: { subject: Uri }) => {
  return await request(app)
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
      object: subject,
    })
}

describe('LDN inbox', () => {
  afterEach(async () => {
    const entities = AppDataSource.entityMetadatas

    for (const entity of entities) {
      //await AppDataSource.getRepository(entity.name).clear()
      await AppDataSource.getRepository(entity.name).query(
        `DELETE FROM ${entity.tableName}`,
      )
    }
  })
  describe('receives info about item to index', () => {
    it('receives info about the item', async () => {
      const response = await sendNotification({
        subject: 'https://subject.example',
      })
      expect(response.statusCode).toBe(202)
    })

    it.skip('receives info in turtle format', () => {})

    it('adds item to process to database', async () => {
      const response = await sendNotification({
        subject: 'https://something.example/example/path#it',
      })

      const items = await AppDataSource.manager.find(Inbox, {})
      expect(items.length).toBe(1)
    })

    it('adds multiple items', async () => {
      await sendNotification({
        subject: 'https://something.example/example/path#it',
      })
      await sendNotification({
        subject: 'https://something.else.example/example/path#it',
      })

      const items = await AppDataSource.manager.find(Inbox, {})
      expect(items.length).toBe(2)
    })

    it("doesn't add the same item", async () => {
      await sendNotification({
        subject: 'https://something.example/example/path#it',
      })
      await sendNotification({
        subject: 'https://something.example/example/path#it',
      })

      const items = await AppDataSource.manager.find(Inbox, {})
      expect(items.length).toBe(1)
    })
  })
})
