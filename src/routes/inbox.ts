import { json, Router } from 'express'
import { solidAuth } from '../solid-auth'
import { addSubject } from '../services/db'

const router = Router()

router
  .use(
    json({
      type: ['application/json', 'application/ld+json'],
    }),
  )
  .route('/')
  .post(solidAuth, async (req, res, next) => {
    try {
      const sender = req.body.actor
      if (sender !== res.locals.user)
        return res
          .status(403)
          .send(
            `You have to be authenticated as actor.\nActor: ${sender}\nAuthenticated: ${res.locals.user}`,
          )
      const action =
        req.body['@type'] === 'Announce'
          ? 'add'
          : req.body['@type'] === 'Remove'
          ? 'remove'
          : ''
      if (!action)
        throw new Error(
          `Unsupported Activity. Received ${req.body['@type']}. Expected 'Announce' or 'Remove'`,
        )
      await addSubject({ subject: req.body.object, sender, action })
      res.status(202).end()
    } catch (error) {
      console.log(error)
      return next(error)
    }
  })

export default router
