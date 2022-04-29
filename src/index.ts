#!/usr/bin/env node

import app from './app'
const port = 3000

app.listen(port, () => {
  console.log('serving on port', port)
})
