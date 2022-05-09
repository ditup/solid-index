import { getSolidDataset, getThing, getUrlAll } from '@inrupt/solid-client'
import intersection from 'lodash.intersection'
import { as, foaf, rdf } from 'rdf-namespaces'
import { removeSubject, saveTriples } from '../services/db'
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
    const dataset = await getSolidDataset(item.subject)
    const thing = getThing(dataset, item.subject)
    let foundTriples: [Uri, Uri, Uri][] = []
    if (thing) {
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
    // save the interesting relationships
    console.log(foundTriples)
    await saveTriples(foundTriples)
  } catch (e) {
    console.log(e)
  } finally {
    await removeSubject(item.subject)
    console.log('finished', item)
  }
}

export default processInbox
