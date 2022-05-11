import path from 'path'
import { DataSource } from 'typeorm'
import { db } from '../../config'
import { Inbox } from './entity/Inbox'
import { RDFSubject } from './entity/RDFSubject'
import { Triple } from './entity/Triple'
// import { Initialize1651286490354 } from './migration/1651286490354-Initialize'

const AppDataSource = new DataSource({
  type: 'mysql',
  ...db,
  entities: [RDFSubject, /*RDFPredicate, RDFObject,*/ Triple, Inbox],
  synchronize: true, // development and testing only
  migrations: [path.resolve('./services/db/migration') + '/**/*.ts'],
  migrationsTableName: 'migration',
  logging: false, //process.env.NODE_ENV === 'test',
})

export default AppDataSource
