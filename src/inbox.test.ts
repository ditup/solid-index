import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals'
import * as verifier from '@solid/access-token-verifier'
import AppDataSource from './services/db/data-source'
import { Inbox } from './services/db/entity/Inbox'
import {
  defaultActor,
  prepareDatabase,
  sendNotification,
  signInAs,
  signOut,
} from './test-utilities'

prepareDatabase()

describe('LDN inbox', () => {
  beforeEach(() => {
    signInAs()
  })
  afterEach(signOut)

  describe('receives info about item to index', () => {
    it('should receive info about the item and accept it', async () => {
      const verifierMock = signInAs(defaultActor, true)
      const response = await sendNotification({
        subject: 'https://subject.example',
      })
      expect(response.statusCode).toBe(202)

      // also check that the actual verifier gets called with the right params (partial check)
      expect(verifierMock.mock.calls.length).toBe(1)
      const params = verifierMock.mock
        .calls[0] as unknown as Parameters<verifier.SolidTokenVerifierFunction>

      expect(params[1]?.url).toMatch('/inbox')
    })

    it('should fail when user is not logged in', async () => {
      jest
        .spyOn(verifier, 'createSolidTokenVerifier')
        .mockReturnValueOnce(async () => {
          throw new Error('failed')
        })
      const response = await sendNotification({
        subject: 'https://subject.example',
      })
      expect(response.statusCode).toBe(401)
    })

    it('should fail when logged user is different from actor', async () => {
      const response = await sendNotification({
        subject: 'https://something.example/example/path#it',
        actor: 'different-identity.example/profile/card#me',
      })

      expect(response.statusCode).toBe(403)
    })

    it.skip('receives info in turtle format', () => {})

    it('adds item to process to database', async () => {
      const response = await sendNotification({
        subject: 'https://something.example/example/path#it',
        actor: defaultActor,
      })

      const items = await AppDataSource.manager.find(Inbox, {})
      expect(items.length).toBe(1)
      expect(items[0].sender).toBe(defaultActor)
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
