import { Uri } from 'src/types'
import {
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'subject' })
export class RDFSubject {
  @PrimaryColumn()
  uri!: Uri

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: number

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: number
}
