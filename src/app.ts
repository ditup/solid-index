import express from 'express'
import winston from 'winston'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

export default app
