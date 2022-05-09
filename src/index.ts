#!/usr/bin/env node

import app from './app'
import AppDataSource from './services/db/data-source'
import processInbox from './jobs/processInbox'
const port = 3000

AppDataSource.initialize().then(() => {
  const recursive = async () => {
    await processInbox()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await recursive()
  }
  recursive()

  app.listen(port, () => {
    console.log('serving on port', port)
  })
})
