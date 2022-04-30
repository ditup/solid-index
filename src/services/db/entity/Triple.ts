import { Uri } from 'src/types'
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { RDFObject } from './RDFObject'
import { RDFPredicate } from './RDFPredicate'
import { RDFSubject } from './RDFSubject'

@Entity()
export class Triple {
  @PrimaryColumn()
  @ManyToOne(() => RDFSubject, subject => subject.uri, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'subject' })
  subject!: Uri

  @PrimaryColumn()
  @ManyToOne(() => RDFPredicate, predicate => predicate.uri, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'predicate' })
  predicate!: Uri

  @PrimaryColumn()
  @ManyToOne(() => RDFObject, object => object.uri, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'object' })
  object!: Uri
}
