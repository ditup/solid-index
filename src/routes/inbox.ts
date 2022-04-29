import { json, Router } from 'express'

const router = Router()

router
  .use(
    json({
      type: ['application/json', 'application/ld+json'],
    }),
  )
  .route('/')
  .post((req, res) => {
    console.log(req.body.object)

    res.status(202).end()
  })

export default router
