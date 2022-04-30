import { DataSource } from 'typeorm'
import { db } from '../../config'
import path from 'path'
import { RDFSubject } from './entity/RDFSubject'
import { RDFPredicate } from './entity/RDFPredicate'
import { RDFObject } from './entity/RDFObject'
import { Triple } from './entity/Triple'
import { Inbox } from './entity/Inbox'
// import { Initialize1651286490354 } from './migration/1651286490354-Initialize'

const AppDataSource = new DataSource({
  type: 'mysql',
  ...db,
  entities: [RDFSubject, RDFPredicate, RDFObject, Triple, Inbox],
  synchronize: true, // development and testing only
  migrations: [path.resolve('./services/db/migration') + '/**/*.ts'],
  migrationsTableName: 'migration',
})

export default AppDataSource
