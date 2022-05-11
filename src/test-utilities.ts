import { afterAll, afterEach, beforeAll, jest } from '@jest/globals'
import * as verifier from '@solid/access-token-verifier'
import request from 'supertest'
import app from './app'
import AppDataSource from './services/db/data-source'
import { Uri } from './types'

export const defaultActor = 'https://solididentity.example#me'

export const sendNotification = async ({
  subject,
  actor = defaultActor,
  action = 'add',
}: {
  subject: Uri
  actor?: Uri
  action?: 'add' | 'remove'
}) => {
  return await request(app)
    .post('/inbox')
    .set(
      'content-type',
      'application/ld+json;profile="https://www.w3.org/ns/activitystreams"',
    )
    .send({
      '@context': 'https://www.w3.org/ns/activitystreams',
      '@id': '',
      '@type': action === 'remove' ? 'Remove' : 'Announce',
      actor,
      object: subject,
    })
}

const fakeTokenVerifierFactory = (webid: string) =>
  jest.fn(async () => ({
    webid,
    aud: 'solid' as const,
    exp: Date.now() + 10000,
    iss: '',
    iat: Date.now() - 10000,
  }))

export const signInAs = (person: Uri = defaultActor, once = false) => {
  const fakeTokenVerifier = fakeTokenVerifierFactory(person)
  jest
    .spyOn(verifier, 'createSolidTokenVerifier')
    [once ? 'mockReturnValueOnce' : 'mockReturnValue'](fakeTokenVerifier)
  return fakeTokenVerifier
}

export const signOut = () => {
  jest.resetAllMocks()
}

export const prepareDatabase = () => {
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
}
