import cors from 'cors'
import express from 'express'
import { inbox } from './routes'
//import rdf from './middlewares/rdf'

const app = express()

app
  .use(cors())
  .get('/', (req, res) => {
    res.send('Hello World!')
  })
  .use('/inbox', inbox)

export default app
