import type { Uri } from '../../types'
import AppDataSource from './data-source'
import { Inbox } from './entity/Inbox'

export const addSubject = async ({
  subject,
  sender,
}: {
  subject: Uri
  sender: Uri
}) => {
  await AppDataSource.createQueryBuilder()
    .insert()
    .orIgnore()
    .into(Inbox)
    .values({
      subject,
      sender,
    })
    .execute()
}
