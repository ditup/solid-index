#!/usr/bin/env node

import app from './app'
import AppDataSource from './services/db/data-source'
const port = 3000
AppDataSource.initialize().then(() => {
  app.listen(port, () => {
    console.log('serving on port', port)
  })
})
