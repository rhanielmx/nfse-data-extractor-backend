import 'fastify'
import type { Channel } from 'amqplib'

interface NewMessageOptions {
  exchange: string
  routingKey: string
  content: object
}

declare module 'fastify' {
  interface FastifyInstance {
    rabbit: {
      channel: Channel,
      publish: (options: NewMessageOptions) => void
    }
  }
}