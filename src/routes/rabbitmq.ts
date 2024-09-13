import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

import amqp, { Channel, Connection } from 'amqplib'
import { env } from '@/env';

const exchangeName = 'receipts'
const queueName = 'images'
const routingKeys = ['upload', 'process']

async function rabbitPlugin(fastify: FastifyInstance) {
    const connection = await amqp.connect(env.RABBITMQ_URL)
    const channel = await connection.createChannel()

    await channel.assertExchange(exchangeName, 'topic', { durable: false })
    await channel.assertQueue(queueName, { durable: false})
    routingKeys.forEach(async (routingKey)=> await channel.bindQueue(queueName, exchangeName, routingKey))
   
    fastify.decorate('rabbit', {
        channel,
        publish: (options) => {
            channel.publish(
                options.exchange,
                options.routingKey,
                Buffer.from(JSON.stringify(options.content)),
                { persistent: true }
            )
        },
    })

    fastify.addHook('onClose', async () => {
        await channel.close()
        await connection.close()
    })
}

export default fastifyPlugin(rabbitPlugin)