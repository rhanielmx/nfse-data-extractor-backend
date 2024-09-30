import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';
import sharp from 'sharp';
import FormData from 'form-data';
import { randomUUID } from 'node:crypto'
import { fakerPT_BR as faker } from '@faker-js/faker'
pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs'
import { DocumentType, Receipt, type ReceiptItem } from '@prisma/client'

import { fromBuffer } from 'pdf2pic'
import type { MultipartFile } from '@fastify/multipart'
import type { Options } from 'pdf2pic/dist/types/options'

type ImageProps = {
  filename: string
  buffer: Buffer
}

interface ProcessedDocument extends Omit<Receipt, 'issueDate' | 'accrualDate' | "id" | "filename" | "status" | "image"> {
  issueDate:string,
  accrualDate:string,
}

type ProcessedItem = Omit<ReceiptItem, "id" | "receiptId">[]

export interface TextractResponse {
  receipt: ProcessedDocument
  items: ProcessedItem
}

function generateCNPJDigitsOnly() {
    const randomDigits = () => Math.floor(Math.random() * 10);
    let cnpj = '';

    // Generate the first 12 digits
    for (let i = 0; i < 12; i++) {
        cnpj += randomDigits();
    }

    // Calculate the first verification digit
    let firstDigit = 0;
    for (let i = 0; i < 12; i++) {
        firstDigit += parseInt(cnpj[i]) * (5 + (i % 8));
    }
    firstDigit = (firstDigit % 11) < 2 ? 0 : 11 - (firstDigit % 11);
    cnpj += firstDigit;

    // Calculate the second verification digit
    let secondDigit = 0;
    for (let i = 0; i < 13; i++) {
        secondDigit += parseInt(cnpj[i]) * (6 + (i % 8));
    }
    secondDigit = (secondDigit % 11) < 2 ? 0 : 11 - (secondDigit % 11);
    cnpj += secondDigit;

    // Format the CNPJ
    return `${cnpj.slice(0, 2)}${cnpj.slice(2, 5)}${cnpj.slice(5, 8)}${cnpj.slice(8, 12)}${cnpj.slice(12)}`;
}

export async function convertPdfMessageToBase64(message: string){
  const pdfData = Uint8Array.from(JSON.parse(message))
  const pdfDocument = await pdfjs.getDocument({data: pdfData, standardFontDataUrl: ''}).promise

  const page = await pdfDocument.getPage(1)
  const viewport = page.getViewport({ scale: 2 })

  const canvas = createCanvas(viewport.width, viewport.height)
  const context = canvas.getContext('2d') as unknown as CanvasRenderingContext2D //TODO - Found better solution

  await page.render({ canvasContext: context, viewport }).promise 

  const base64Image = canvas.toDataURL() 
  return base64Image.split(',').at(1)! // won't be null because the function uses comma to separate the image info from the actual base64
}

export async function createFormDataFromFiles(files: string[]) {
  const form = new FormData()
  const promises: Promise<ImageProps>[] = files.map((file) => {
    return new Promise(async (resolve) => {
      const { filename, data } = JSON.parse(file)      
      const base64Image = await convertPdfMessageToBase64(JSON.stringify(data))
      const buffer = Buffer.from(base64Image, 'base64')
      resolve({
        filename,
        buffer,
      })
    })
  })

  const images = await Promise.all(promises)

  for (const image of images){
    const { filename, buffer } = image
    form.append('images', buffer, { filename })
  }
  return form
}

export async function compressBase64Image(base64Image: string){
  const imgBuffer = Buffer.from(base64Image, 'base64')
  const compressedImageBuffer = await sharp(imgBuffer)
    .resize({ width: 800 }) 
    .png({ quality: 80 })
    .toBuffer()

  const compressedBase64 = compressedImageBuffer.toString('base64')
  return compressedBase64
}

//TODO - Remove mock when finished with dev
export async function processDocumentWithTextract(imageUrl: string, mock=true):Promise<TextractResponse | undefined> {
  const fakeDelay = Math.random() * 0
  await new Promise(resolve => setTimeout(resolve, fakeDelay))
  
  
  if (mock){
    return {
      receipt: {
        customer: generateCNPJDigitsOnly(),
        supplier: generateCNPJDigitsOnly(),
        receiptValueInCents: 100 * (faker.commerce.price() as unknown as number),
        issValueInCents: 100 * (faker.commerce.price() as unknown as number),
        receiptNumber: '12345',
        documentType: DocumentType.NFSE_SERVICOS_TERCEIROS,
        issueDate: faker.date.recent().toISOString(),
        accrualDate: faker.date.recent().toISOString(),
        },
      items: [{
        code: `${Math.round(Math.random() * 50000)}`,
        name: `Objeto ${Math.round(Math.random() * 10)}`,
        purpose: 3,
        costCenter: 3,
        activity: 37,
        quantity: Math.random() * 20,
        unitPriceInCents: (Math.random() * 300) *100,
      }, {
        code: `${Math.round(Math.random() * 50000)}`,
        name: `Objeto ${Math.round(Math.random() * 10)}`,
        purpose: 3,
        costCenter: 3,
        activity: 37,
        quantity: Math.random() * 20,
        unitPriceInCents: (Math.random() * 300) *100,
      }]
    }
  }
}

const isMultipartFile = (value: unknown): value is MultipartFile => {
  return value instanceof File && value.size > 0
};

type FileConvertProps = {
  file: MultipartFile,
  options?: Options,
}

export async function convertPdfFileToBase64PngImage({
  file,
  options = {
    density: 100,
    quality: 100,
    format: 'png',
    preserveAspectRatio: true
  }
}:FileConvertProps): Promise<Record<string,Buffer | undefined>>{
  const bufferPDF = await file.toBuffer()
  const convert = fromBuffer(bufferPDF, options) // TODO - Install the dependencies with docker

  const result = await convert(1, { responseType: 'buffer' })

  return {
    buffer: result.buffer
  }
}

export async function uploadFileToBucketS3(file: Buffer, filename: string, bucketName: string = 'malibru') {
  // const s3Client = new S3Client()
  // const uploadParams = {
  //   Bucket: bucketName,
  //   Key: filename,
  //   Body: file,
  //   ContentType: 'image/png'
  // }
  // const data = await s3Client.send(new PutObjectCommand(uploadParams))
  const data = null
  return {
    data,
    imageUrl: `https://${bucketName}.s3.us-east-2.amazonaws.com/${filename}`
  }
}

import { spawn } from 'node:child_process'

export function getPythonData(scriptPath: string, args: any, callback: typeof console.log) {
    console.log(args)
    const pythonProcess = spawn('python3', [scriptPath, ...args])

    let data = ''
    pythonProcess.stdout.on('data', (chunk) => {
        data += chunk.toString()
    })

    pythonProcess.stderr.on('data', (error) => {
        console.error(`stderr: ${error}`)
    })

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            callback(`Error: Script exited with code ${code}`, null)
        } else {
            callback(null, data)
        }
    });
}