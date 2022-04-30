import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.resolve(`./${process.env.NODE_ENV}.env`),
})

export const db = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
}
