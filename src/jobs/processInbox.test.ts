import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals'
import * as fetch from 'cross-fetch'
import type { MockedFunctionDeep } from 'jest-mock'
import { as, dct } from 'rdf-namespaces'
import AppDataSource from '../services/db/data-source'
import { Triple } from '../services/db/entity/Triple'
import { RDFSubject } from '../services/db/entity/RDFSubject'
import {
  prepareDatabase,
  sendNotification,
  signInAs,
  signOut,
} from '../test-utilities'
import type { Uri } from '../types'
import processInbox from './processInbox'

jest.mock('cross-fetch')

type MockedFetch = MockedFunctionDeep<typeof fetch.default>

prepareDatabase()

const wait = (n: number) =>
  new Promise(resolve => {
    setTimeout(resolve, n)
  })

const person1 = 'https://actor1.example/profile/card#me'
const person2 = 'https://actor2.example/profile/card#me'
const person3 = 'https://actor3.example/profile/card#me'

const prepareFetchProfileOf = (person: Uri) =>
  (fetch.default as MockedFetch).mockResolvedValue({
    headers: new Headers({
      'content-type': 'text/turtle',
      'WAC-Allow': 'user="read write append",public="read"',
    }),
    text: async () => `
      @prefix foaf: <http://xmlns.com/foaf/0.1/>.
      @prefix wd: <http://www.wikidata.org/entity/>.
      <${person}> a foaf:Person;
      foaf:topic_interest wd:Q42, wd:Q1, wd:Q100.
      `,
    status: 200,
    statusText: 'OK',
    ok: true,
  } as Response)

const prepareFetchThingOf = (thing: Uri, person: Uri) =>
  (fetch.default as MockedFetch).mockResolvedValue({
    headers: new Headers({
      'content-type': 'text/turtle',
      'WAC-Allow': 'user="read write append",public="read"',
    }),
    text: async () => `
      @prefix wd: <http://www.wikidata.org/entity/>.
      @prefix ditup: <https://ditup.example#>.
      <${thing}> a ditup:Idea;
      <${dct.creator}> <${person}>;
      <${as.tag}> wd:Q42, wd:Q1, wd:Q100.
      `,
    status: 200,
    statusText: 'OK',
    ok: true,
  } as Response)

describe('process inbox, save triples to database', () => {
  beforeEach(() => {
    signInAs()
  })

  afterEach(signOut)

  it('[person] should save interesting triples to database', async () => {
    //* get the notification
    signInAs(person1, true)
    const response = await sendNotification({
      subject: person1,
      actor: person1,
    })

    await wait(1000)

    signInAs(person2, true)
    const response2 = await sendNotification({
      subject: person2,
      actor: person2,
    })
    expect(response2.statusCode).toBe(202)

    await wait(1000)

    signInAs(person3, true)
    const response3 = await sendNotification({
      subject: person3,
      actor: person3,
    })
    expect(response3.statusCode).toBe(202)

    //*/
    // execute the search
    prepareFetchProfileOf(person1)
    await processInbox()
    const items = await AppDataSource.manager.find(Triple, {})

    expect(items.length).toBe(3)
  })

  it('should not save persons who were not provided by themselves', async () => {
    signInAs(person2, true)
    const response = await sendNotification({
      subject: person1,
      actor: person2,
    })

    expect(response.status).toBe(202)

    prepareFetchProfileOf(person1)
    await processInbox()

    const items = await AppDataSource.manager.find(Triple, {})
    expect(items.length).toBe(0)
  })

  const thing1 = 'https://thing.example#1'
  const thing2 = 'https://thing2.example#2'
  it('[thing] should save interesting triples to database', async () => {
    //* get the notification
    signInAs(person1, true)
    const response = await sendNotification({
      subject: thing1,
      actor: person1,
    })

    //*/
    // execute the search
    prepareFetchThingOf(thing1, person1)
    await processInbox()
    const items = await AppDataSource.manager.find(Triple, {})

    expect(items.length).toBe(3)
  })

  it('[thing, but actor is not creator] should not save triples to database', async () => {
    //* get the notification
    signInAs(person1, true)
    const response = await sendNotification({
      subject: thing1,
      actor: person1,
    })

    //*/
    // execute the search
    prepareFetchThingOf(thing1, person2)
    await processInbox()
    const items = await AppDataSource.manager.find(Triple, {})

    expect(items.length).toBe(0)
  })

  it('should remove all related triples if action is "remove"', async () => {
    // first announce the thing to index
    signInAs(person1, true)
    await sendNotification({
      subject: thing1,
      actor: person1,
      action: 'add',
    })
    // process it
    prepareFetchThingOf(thing1, person1)
    await processInbox()
    // and see that it was saved
    const itemsAfterAdd = await AppDataSource.manager.find(Triple, {})
    expect(itemsAfterAdd.length).toBe(3)
    const subjectsAfterAdd = await AppDataSource.manager.find(RDFSubject, {})
    expect(subjectsAfterAdd.length).toBe(1)
    expect(subjectsAfterAdd[0]).toMatchObject({
      uri: thing1,
    })

    // then request removal
    signInAs(person1, true)
    await sendNotification({
      subject: thing1,
      actor: person1,
      action: 'remove',
    })

    // process it
    prepareFetchThingOf(thing1, person1)
    await processInbox()
    const items = await AppDataSource.manager.find(Triple, {})

    expect(items.length).toBe(0)
  })

  it.skip('should delete the processed record', () => {})
})
