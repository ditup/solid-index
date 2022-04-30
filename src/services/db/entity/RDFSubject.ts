import { Uri } from 'src/types'
import { Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'subject' })
export class RDFSubject {
  @PrimaryColumn()
  uri!: Uri
}
