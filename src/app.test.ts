import { test, expect } from '@jest/globals'
import app from './app'
import request from 'supertest'

test('asdfghjkl', async () => {
  const response = await request(app).get('/')

  expect(response.statusCode).toBe(200)
  expect(response.text).toBe('Hello World!')
})
