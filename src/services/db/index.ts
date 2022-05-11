import type { Uri } from '../../types'
import AppDataSource from './data-source'
import { Inbox } from './entity/Inbox'
import { RDFSubject } from './entity/RDFSubject'
import { Triple } from './entity/Triple'

export const addSubject = async ({
  subject,
  sender,
  action,
}: {
  subject: Uri
  sender: Uri
  action: 'add' | 'remove'
}) => {
  await AppDataSource.createQueryBuilder()
    .insert()
    .orIgnore()
    .into(Inbox)
    .values({
      subject,
      sender,
      action,
    })
    .execute()
}

export const removeSubject = async (uri: Uri) => {
  await AppDataSource.createQueryBuilder()
    .delete()
    .from(Inbox)
    .where('subject = :uri', { uri })
    .execute()
}

export const removeRDFSubject = async (uri: Uri) => {
  await AppDataSource.createQueryBuilder()
    .delete()
    .from(RDFSubject)
    .where('uri = :uri', { uri })
    .execute()
}

export const saveTriples = async (triples: [Uri, Uri, Uri][]) => {
  if (triples.length === 0) return
  // all unfound triples should be removed
  await AppDataSource.createQueryBuilder()
    .delete()
    .from(Triple)
    .where('subject = :subject AND (predicate, object) NOT IN (:relations)', {
      subject: triples[0][0],
      relations: triples.map(([, predicate, object]) => [predicate, object]),
    })
    .execute()

  // insert subjects, predicates and objects if they don't exist (why?)
  await AppDataSource.createQueryBuilder()
    .insert()
    .orUpdate(['updatedAt'])
    .into(RDFSubject)
    .values(
      [...new Set(triples.map(([subject]) => subject))].map(uri => ({
        uri,
      })),
    )
    .execute()
  /*
  await AppDataSource.createQueryBuilder()
    .insert()
    .orIgnore()
    .into(RDFPredicate)
    .values(
      [...new Set(triples.map(([, p]) => p))].map(uri => ({
        uri,
      })),
    )
    .execute()
  await AppDataSource.createQueryBuilder()
    .insert()
    .orIgnore()
    .into(RDFObject)
    .values(
      [...new Set(triples.map(([, , o]) => o))].map(uri => ({
        uri,
      })),
    )
    .execute()
    */

  // all found triples should be created or updated
  await AppDataSource.createQueryBuilder()
    .insert()
    .orIgnore()
    .into(Triple)
    .values(
      triples.map(([subject, predicate, object]) => ({
        subject,
        predicate,
        object,
      })),
    )
    .execute()
  // the info about first subject fetch and latest subject fetch should be saved
  // TODO
}
