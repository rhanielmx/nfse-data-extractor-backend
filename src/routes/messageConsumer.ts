import amqp, { Channel, Connection } from 'amqplib'

const rabbitUrl = 'amqp://guest:guest@localhost:5672'
let channel: Channel;

async function connectToRabbitMQ(queueName: string, exchangeName: string, routingKey:string) {
  const connection: Connection = await amqp.connect(rabbitUrl)
  channel = await connection.createChannel()
  await channel.assertQueue(queueName, { durable: false })
  await channel.assertExchange(exchangeName, 'topic', { durable: false })
  await channel.bindQueue(queueName, exchangeName, routingKey)  
}

async function consumeMessages(queueName:string, exchangeName:string, routingKey:string) {
  await connectToRabbitMQ(queueName, exchangeName, routingKey)

  channel.consume(queueName, (message) => {
    if (message) {
      console.log("Received:", message.content.toString());
      channel.ack(message)
    }
  }, { noAck: false })
}

export { consumeMessages }