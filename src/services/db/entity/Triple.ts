import { Uri } from 'src/types'
import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm'
import { RDFSubject } from './RDFSubject'

@Entity()
export class Triple {
  @PrimaryColumn()
  @ManyToOne(() => RDFSubject, subject => subject.uri, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'subject' })
  @Index()
  subject!: Uri

  @PrimaryColumn()
  /*@ManyToOne(() => RDFPredicate, predicate => predicate.uri, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'predicate' })//*/
  @Index()
  predicate!: Uri

  @PrimaryColumn()
  /*@ManyToOne(() => RDFObject, object => object.uri, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'object' })//*/
  @Index()
  object!: Uri

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: number
}
