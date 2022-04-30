import { Uri } from 'src/types'
import { Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'object' })
export class RDFObject {
  @PrimaryColumn()
  uri!: Uri
}
