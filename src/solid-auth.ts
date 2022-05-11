import type {
  RequestMethod,
  SolidTokenVerifierFunction,
} from '@solid/access-token-verifier'
import { RequestHandler } from 'express'
import * as verifier from '@solid/access-token-verifier'

export const solidAuth: RequestHandler = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization
  const dpopHeader = req.headers.dpop
  const solidOidcAccessTokenVerifier: SolidTokenVerifierFunction =
    verifier.createSolidTokenVerifier()

  try {
    const { /*client_id: clientId,*/ webid: webId } =
      await solidOidcAccessTokenVerifier(authorizationHeader as string, {
        header: dpopHeader as string,
        method: req.method as RequestMethod,
        url: `${req.protocol}://${req.get('host')}${req.baseUrl}`,
      })

    res.locals.user = webId

    return next()
  } catch (error: unknown) {
    const message = `Error verifying Access Token via WebID: ${
      (error as Error).message
    }`

    //return next(new Error(message))
    return res.status(401).send({
      error: message,
    })
  }
}

/*
import { createSolidTokenVerifier } from '@solid/access-token-verifier';


*/
