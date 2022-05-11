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

    it.skip('should be able to receive info in turtle format', () => {})

    it('should add the announced thing to database', async () => {
      const response = await sendNotification({
        subject: 'https://something.example/example/path#it',
        actor: defaultActor,
      })

      const items = await AppDataSource.manager.find(Inbox, {})
      expect(items.length).toBe(1)
      expect(items[0].sender).toBe(defaultActor)
      expect(items[0].action).toBe('add')
    })

    it('should be able to add multiple items', async () => {
      await sendNotification({
        subject: 'https://something.example/example/path#it',
      })
      await sendNotification({
        subject: 'https://something.else.example/example/path#it',
      })

      const items = await AppDataSource.manager.find(Inbox, {})
      expect(items.length).toBe(2)
    })

    it("shouldn't add the same item", async () => {
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

  describe('Request removal of the item from index', () => {
    it('should accept the request', async () => {
      const response = await sendNotification({
        subject: defaultActor,
        actor: defaultActor,
        action: 'remove',
      })

      expect(response.statusCode).toBe(202)
    })

    it('should save the remove request to the database', async () => {
      // before, there is nothing
      const itemsBefore = await AppDataSource.manager.find(Inbox, {})
      expect(itemsBefore.length).toBe(0)

      const response = await sendNotification({
        subject: defaultActor,
        actor: defaultActor,
        action: 'remove',
      })

      // after, there is request to
      expect(response.statusCode).toBe(202)
      const items = await AppDataSource.manager.find(Inbox, {})
      expect(items.length).toBe(1)
      expect(items[0].sender).toBe(defaultActor)
      expect(items[0].action).toBe('remove')
    })

    const something = 'https://something.example#thing'
    it('should be able to save both "Announce" and "Remove" request at the same time, exactly once', async () => {
      const itemsBefore = await AppDataSource.manager.find(Inbox, {})
      expect(itemsBefore.length).toBe(0)

      const addResponse = await sendNotification({
        subject: something,
        actor: defaultActor,
        action: 'add',
      })
      expect(addResponse.statusCode).toBe(202)
      const removeResponse = await sendNotification({
        subject: something,
        actor: defaultActor,
        action: 'remove',
      })
      expect(removeResponse.statusCode).toBe(202)
      const removeResponse2 = await sendNotification({
        subject: something,
        actor: defaultActor,
        action: 'remove',
      })

      // after, there is request to
      expect(removeResponse2.statusCode).toBe(202)

      const items = await AppDataSource.manager.find(Inbox, {})
      expect(items.length).toBe(2)
      // https://medium.com/@andrei.pfeiffer/jest-matching-objects-in-array-50fe2f4d6b98
      expect(items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subject: something,
            sender: defaultActor,
            action: 'add',
          }),
          expect.objectContaining({
            subject: something,
            sender: defaultActor,
            action: 'remove',
          }),
        ]),
      )
    })

    it('should fail when user is not logged in', async () => {
      jest
        .spyOn(verifier, 'createSolidTokenVerifier')
        .mockReturnValueOnce(async () => {
          throw new Error('failed')
        })
      const response = await sendNotification({
        subject: something,
        actor: defaultActor,
        action: 'remove',
      })
      expect(response.statusCode).toBe(401)
    })

    it('should fail when logged user is different from actor', async () => {
      const response = await sendNotification({
        subject: something,
        actor: 'different-identity.example/profile/card#me',
        action: 'remove',
      })

      expect(response.statusCode).toBe(403)
    })
  })
})
