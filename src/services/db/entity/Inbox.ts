import { Uri } from 'src/types'
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class Inbox {
  @PrimaryColumn()
  subject!: Uri

  @Column()
  sender!: Uri

  @Column({ type: 'timestamp' })
  suggestedAt!: number
}
