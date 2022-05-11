import { getSolidDataset, getThing, getUrlAll } from '@inrupt/solid-client'
import intersection from 'lodash.intersection'
import { as, dct, foaf, rdf } from 'rdf-namespaces'
import { removeRDFSubject, removeSubject, saveTriples } from '../services/db'
import AppDataSource from '../services/db/data-source'
import { Inbox } from '../services/db/entity/Inbox'
import { Uri } from '../types'

const DITS = ['https://ditup.example#Idea', 'https://ditup.example#Problem']

const processInbox = async () => {
  // get oldest item of inbox
  const [item] = await AppDataSource.getRepository(Inbox).find({
    skip: 0,
    take: 1,
    order: { suggestedAt: 'ASC' },
  })

  if (!item) return

  try {
    // fetch the related document
    // i'd really prefer to use a different library
    const isSender = item.subject === item.sender

    const dataset = await getSolidDataset(item.subject)
    const thing = getThing(dataset, item.subject)
    let foundTriples: [Uri, Uri, Uri][] = []
    if (thing) {
      // find thing's creators
      const creators = getUrlAll(thing, dct.creator)
      if (!(isSender || creators.includes(item.sender)))
        throw new Error("sender doesn't own this")

      // find interesting relationships
      const types = getUrlAll(thing, rdf.type)
      if (types.includes(foaf.Person)) {
        const interests = getUrlAll(thing, foaf.topic_interest)
        foundTriples = foundTriples.concat(
          interests.map(uri => [item.subject, foaf.topic_interest, uri]),
        )
      }
      if (intersection(types, DITS).length > 0) {
        const tags = getUrlAll(thing, as.tag)
        foundTriples = foundTriples.concat(
          tags.map(uri => [item.subject, as.tag, uri]),
        )
      }
    }
    // if action is "remove" or subject was not found, delete the subject, and all triples with it
    if (item.action === 'remove' || !thing) {
      await removeRDFSubject(item.subject)
    } else {
      // save the interesting relationships
      await saveTriples(foundTriples)
    }
  } catch (e) {
    console.log(e)
  } finally {
    await removeSubject(item.subject)
    console.log('finished', item)
  }
}

export default processInbox
