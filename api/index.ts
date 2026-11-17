import { handle } from '@hono/node-server/vercel'
import app from '../backend/app.js'

export default handle(app)