import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { websocketRoutes } from './routes/websocket';
import { receiptRoutes } from './routes/receipts';
import rabbitmq from './routes/rabbitmq';

const app = Fastify({
  bodyLimit: 5 * 1024 * 1024 // 5MB
})
const PORT = 3338;

app.register(cors, {
  origin: '*',
})

app.register(rabbitmq)
app.register(multipart)
app.register(websocket)

app.register(websocketRoutes)
app.register(receiptRoutes)

app.listen({ port: PORT }, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server is running on http://localhost:${PORT}`)
  // consumeMessages('image_upload_queue', 'receipts_topic_exchange', 'receipts.new')
})