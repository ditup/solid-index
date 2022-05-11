// unfinished

import type { NextFunction, Request, Response } from 'express'

export type ContentType = 'trig' | 'jsonld' | 'turtle'

const typeDict = {
  trig: 'application/trig',
  jsonld: 'application/ld+json',
  turtle: 'text/turtle',
} as const

const rdf = (options: { types: ContentType[] }) => {
  const contentTypes = options.types.map(type => typeDict[type])
  return (req: Request, res: Response, next: NextFunction) => {
    if (
      contentTypes.includes(
        req.headers['content-type'] as typeof typeDict[ContentType],
      )
    ) {
      console.log(req.body)
    }

    return next()
  }
}

export default rdf
