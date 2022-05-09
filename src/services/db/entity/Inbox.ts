import { Uri } from 'src/types'
import { Column, Entity, Index, PrimaryColumn } from 'typeorm'

@Entity()
export class Inbox {
  @PrimaryColumn()
  subject!: Uri

  @Column()
  sender!: Uri

  @Index()
  @Column({ type: 'timestamp' })
  suggestedAt!: number
}
