import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { convertDate, convertPdfFileToBase64PngImage, processDocumentWithTextract, uploadFileToBucketS3 } from "@/lib/utils"
import type { MultipartFile } from "@fastify/multipart"
import fs from 'node:fs'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

import { fromBase64, fromBuffer } from 'pdf2pic'; // Use fromBuffer instead of fromPath

const filesSchema = z.object({
  images: z.record(z.string())
})

const processImageSchema = z.object({
  messageId: z.string().uuid()
})

export async function receiptRoutes(app:FastifyInstance) {
  app.post('/receipts/old', async (request, reply) => {
    const { images } = filesSchema.parse(request.body)
    // images.forEach((file)=>console.log(file.filename))
    // const data = filenames.map((filename) => ({ filename, status: 'processing' }))

    // const receipts = await prisma.receipt.createManyAndReturn({
    //   data
    // })
    // // console.log('[POST] Receipts: ', receipts)

    return reply.status(201).send({
      images
    })
  })
  
  app.post('/receipts', async (request, reply) => {
    const files = []
    for await (const file of request.files()) {
      const base64Image = (await file.toBuffer()).toString('base64')
      files.push({ filename:file.filename, image:base64Image })
    }

    const receiptsToCreate = files.map((file) => {
      return { filename: file.filename, image: file.image, status:'processing' }
    })

    const receipts = await prisma.receipt.createManyAndReturn({
      data: receiptsToCreate
    })

    const ids = receipts.reduce<string[]>((acc, curr) => {
      return [...acc, curr.id]
    }, [])

    app.rabbit.publish({
      exchange: 'receipts_topic_exchange',
      routingKey: 'receipts.new',
      content: ids
    })

    return reply.status(201).send({
      ids,
      receipts
    })
  })

  app.post('/upload', async (request, reply) => {
    const images = []
 
    for await (const file of request.files()) {
      const filename = file.filename.replace('pdf', 'png')
      
      const { buffer } = await convertPdfFileToBase64PngImage({
        file
      })
      const { imageUrl } = await uploadFileToBucketS3(buffer!, filename)

      images.push({
        filename,
        imageUrl
      })
    }

    app.rabbit.publish({
      exchange: 'receipts_topic_exchange',
      routingKey: 'receipts.new',
      content: images
    })

    return reply.status(200).send({
      images
    })
  })

  app.delete('/receipts', async (request, reply) => {
    await prisma.receipt.deleteMany()
  })
}