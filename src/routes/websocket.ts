import type { FastifyInstance } from "fastify"
import { createFormDataFromFiles } from "../lib/utils"
import z from 'zod'

const fileSchema = z.object({
  filename: z.string(),
  data: z.array(z.string())
})

const messageSchema = z.object({
  type: z.string(),
  files: z.array(z.string())
})

type FileProps = z.infer<typeof fileSchema>
type MessageProps = z.infer<typeof messageSchema>

export async function websocketRoutes(app: FastifyInstance){
  app.get('/websocket', { websocket: true }, async (connection) => {
    console.log('WebSocket client connected')

    connection.on('message', async (message: string) => {
      const { type, files } = JSON.parse(message) as MessageProps
  
      const filenames = files.reduce<string[]>((acc, curr) => {
        const { filename } = JSON.parse(curr) as FileProps
        return [...acc, filename]
      }, [])

      // const images = files.reduce(async (accumulatorPromise, curr) => {
      //   const { filename, data } = JSON.parse(curr) as FileProps
      //   const accumulator = await accumulatorPromise
      //   const image = await convertPdfMessageToBase64(JSON.stringify(data))

      //   return {...accumulator, [filename]: image}
      // }, Promise.resolve({}))

      // const imagePromises = files.map(async (file) => {      
      //   return new Promise(async (resolve, reject) => {
      //       const { filename, data } = JSON.parse(file) as FileProps
      //       const image = await convertPdfMessageToBase64(JSON.stringify(data))
      //       resolve({
      //         filename,
      //         image
      //       })
      //   })
      // })

      // const images = await Promise.all(imagePromises)
      const form = await createFormDataFromFiles(files)

      const receiptsResponse = await app.inject({
          method: 'POST',
          url: '/receipts',
          payload: form,
          headers: form.getHeaders()
      })
      
      const { ids, receipts } = JSON.parse(receiptsResponse.payload)

      // app.rabbit.publish({
      //   exchange: 'receipts_topic_exchange',
      //   routingKey: 'receipts.new',
      //   content: ids
      // })

      const msg = JSON.stringify({ data: receipts})
      connection.send(msg)
      // app.rabbitChannel.publish('receipts_topic_exchange', 'receipts.new', Buffer.from(msg))
      
      // const processedReceiptsResponse = await app.inject({
      //     method: 'POST',
      //     url: '/send',
      //     payload: form,
      //     headers: form.getHeaders()
      // })

      // const { receipts:processedReceipts } = JSON.parse(processedReceiptsResponse.payload)
      
      // files.forEach(async (file: string) => {
      //   const { filename, } = JSON.parse(file)
      //   // console.log(filename)
      //   // const base64Image = await convertPdfMessageToBase64(file)
      // })
      // try {
      //   const base64Image = await convertPdfMessageToBase64(message)
        
      //   // const responseMessage = JSON.parse(message)
      //   const response = await app.inject({
      //     method: 'POST',
      //     url: '/receipts',
      //     payload: {
      //       image: base64Image,
      //     },
      //     headers: {
      //       'Content-Type': 'application/json'
      //     }
      //   })
      //   const { receipt } = JSON.parse(response.payload)

      //   connection.send(JSON.stringify({ data: receipt}))

      //   const processedResponse = await app.inject({
      //     method: 'PUT',
      //     url: `/receipts/${receipt.id}`
      //   })

      //   const { receipt:updatedReceipt } = JSON.parse(processedResponse.payload)
      //   // await new Promise(resolve=>setTimeout(resolve, 3000))
      //   const messageData = { id: receipt.id, image: base64Image, status: 'finished' }
      //   connection.send(JSON.stringify({data: updatedReceipt}))

      // } catch (error) {
      //   console.error('Error converting PDF:', error);
      //   connection.send(JSON.stringify({ error: 'Error converting PDF' }))
      // }
    })

    connection.on('close', () => {
      console.log('WebSocket client disconnected')
    })
  })
}