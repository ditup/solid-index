import { json, Router } from 'express'
import { addSubject } from '../services/db'

const router = Router()

router
  .use(
    json({
      type: ['application/json', 'application/ld+json'],
    }),
  )
  .route('/')
  .post(async (req, res, next) => {
    try {
      await addSubject({ subject: req.body.object, sender: req.body.actor })
      res.status(202).end()
    } catch (error) {
      console.log(error)
      return next(error)
    }
  })

export default router
