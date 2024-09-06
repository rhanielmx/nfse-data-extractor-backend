import 'fastify'
import type { Channel } from 'amqplib'

interface NewMessageOptions {
  exchange: string
  routingKey: string
  content: object
}

declare module 'fastify' {
  interface FastifyInstance {
    // rabbitChannel: {
    //   sendToQueue: (queueName: string, message: Buffer) => void,
    //   publish: (exchangeName: string, routingKey: string, message: Buffer) => void
    // },
    rabbit: {
      channel: Channel,
      publish: (options: NewMessageOptions) => void
    }
  }
}