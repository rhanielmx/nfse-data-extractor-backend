import type { FastifyInstance, FastifyRequest } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { convertPdfFileToBase64PngImage, processDocumentWithTextract, uploadFileToBucketS3 } from "@/lib/utils"

interface ImageProps {
  filename: string
  image: string
  status: 'processing' | 'finished'
 }

export async function receiptRoutes(app:FastifyInstance) {
  app.get('/receipts', async (request, reply) => {
    const images = await prisma.receipt.findMany()
    return reply.status(200).send({
      images
    })
  })

  app.post('/upload', async (request, reply) => {
    const images: ImageProps[] = []
 
    for await (const file of request.files()) {
      const filename = file.filename.replace('pdf', 'png')
      
      const { buffer } = await convertPdfFileToBase64PngImage({
        file
      })
      const { imageUrl } = await uploadFileToBucketS3(buffer!, filename)

      images.push({
        filename,
        image: imageUrl,
        status: 'processing'
      })
    }

    try {
      const receipts = await prisma.receipt.createManyAndReturn({
        data: images
      })

      const formattedReceipts = receipts.map((receipt) => {
        return {
          id: receipt.id,
          filename: receipt.filename,
          image: receipt.image,
          status: receipt.status,
        }
      })  

    app.rabbit.publish({
      exchange: 'receipts',
      routingKey: 'upload',
      content: formattedReceipts
    })

    return reply.status(200).send({
      receipts: formattedReceipts
    })
    } catch(error) { 
      console.log(error)
    }    
  })

  const receiptsSchema = z.array(z.object({
    id: z.string().uuid(),
    filename: z.string(),
    image: z.string(),
    status: z.enum(['processing', 'finished'])
  }))

  app.post('/receipts', async (request, reply) => {    
    const {data:images, error} = receiptsSchema.safeParse(request.body)
    if(error) {
      return reply.status(400).send({message: error.format()})
    }
    if(!images){
      return reply.status(400).send({message: 'No images found!'})
    }

    const receipts = await prisma.receipt.findMany({
      where: {
        filename: {
          in: images.map((image)=>image.filename)
        }
      }
    })

    images.forEach(async (image)=> {
      const result = await processDocumentWithTextract(image.image)
      const receipt = receipts.filter((d)=>d.image === image.image)[0]
      app.rabbit.publish({
        exchange: 'receipts',
        routingKey: 'process',
        content: {
          id: receipt.id,
          ...result,
          status: 'done'
        }
      })
    })

    return reply.status(200).send({
      receipts
    })
  })

  app.delete('/receipts', async (request, reply) => {
    await prisma.receipt.deleteMany()
  })
}