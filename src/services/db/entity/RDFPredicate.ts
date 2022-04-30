import { Uri } from 'src/types'
import { Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'predicate' })
export class RDFPredicate {
  @PrimaryColumn()
  uri!: Uri
}
