import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals'
import type { MockedFunctionDeep } from 'jest-mock'
import request from 'supertest'
import app from '../app'
import AppDataSource from '../services/db/data-source'
import type { Uri } from '../types'
import processInbox from './processInbox'
import * as fetch from 'cross-fetch'
import { MetadataAlreadyExistsError } from 'typeorm'

jest.mock('cross-fetch')

type MockedFetch = MockedFunctionDeep<typeof fetch.default>

beforeAll(() => AppDataSource.initialize())
afterAll(() => AppDataSource.destroy())
afterEach(async () => {
  const entities = AppDataSource.entityMetadatas

  for (const entity of entities) {
    //await AppDataSource.getRepository(entity.name).clear()
    await AppDataSource.getRepository(entity.name).query(
      `DELETE FROM ${entity.tableName}`,
    )
  }
})

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

const wait = (n: number) =>
  new Promise(resolve => {
    setTimeout(resolve, n)
  })

describe.only('process inbox, save triples to database', () => {
  beforeEach(() => {
    ;(fetch.default as MockedFetch).mockResolvedValue({
      headers: new Headers({ 'content-type': 'text/turtle' }),
      text: async () => `
      @prefix foaf: <http://xmlns.com/foaf/0.1/>.
      @prefix wd: <http://www.wikidata.org/entity/>.
      <https://mrkvon.solidcommunity.net/profile/card#me> a foaf:Person;
      foaf:topic_interest wd:Q42, wd:Q1, wd:Q100.
      `,
      status: 200,
      statusText: 'OK',
      ok: true,
    } as Response)
  })

  it.only('should save interesting triples to database', async () => {
    //* get the notification
    const response = await sendNotification({
      subject: 'https://mrkvon.solidcommunity.net/profile/card#me',
    })
    await wait(1000)
    expect(response.statusCode).toBe(202)
    const response2 = await sendNotification({
      subject: 'https://vcxy.solidcommunity.net/profile/card#me',
    })
    await wait(1000)
    expect(response2.statusCode).toBe(202)
    const response3 = await sendNotification({
      subject: 'https://mrkvon.inrupt.net/profile/card#me',
    })
    expect(response3.statusCode).toBe(202)
    //*/
    // execute the search
    await processInbox()
    throw 'process'
  })

  it.skip('should delete the processed record', () => {})
})
