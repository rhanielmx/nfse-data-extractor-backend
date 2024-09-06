import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

import amqp, { Channel, Connection } from 'amqplib'

const rabbitUrl = 'amqp://guest:guest@localhost:5672'
const exchangeName = 'receipts_topic_exchange'
const queueName = 'image_processing_queue'
const routingKeys = ['receipts.new', 'receipts.process']

async function rabbitPlugin(fastify: FastifyInstance) {
    const connection = await amqp.connect(rabbitUrl)
    const channel = await connection.createChannel()

    await channel.assertExchange(exchangeName, 'topic', { durable: false })
    await channel.assertQueue('image_upload_queue', { durable: false})
    await channel.assertQueue('image_processing_queue', { durable: false})
    await channel.bindQueue('image_upload_queue', exchangeName, 'receipts.new')
    await channel.bindQueue('image_processing_queue', exchangeName, 'receipts.process')

    fastify.decorate('rabbitChannel', channel)

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


    // fastify.post('/send', async (request, reply) => {
    //     const message = JSON.stringify(request.body)
    //     channel.sendToQueue(queueName, Buffer.from(message))
    //     reply.send({ status: 'Message sent' })
    // })

    // fastify.get('/rbmq', async(request, reply) => {
    //   channel.consume(queueName, (msg) => {
    //     if(msg) {
    //       console.log("Received", msg.content.toString())
    //       channel.ack(msg)
    //     }
    //   })
    // } )
}

export default fastifyPlugin(rabbitPlugin);