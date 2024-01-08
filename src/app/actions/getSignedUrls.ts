"use server"

import { TRPCError } from "@trpc/server"
import * as Crpyto from "crypto"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const getSignedUrls = async (
  fileTypes: string[],
  fileSizes: number[],
  fileChecksums: string[],
  userId: string
) => {
  const acceptedFileTypes = ["image/*", "video/*"]
  const maxFileSize = 1024 * 1024 * 50 //50 MB

  const isAcceptedFileType = (fileType: string) => {
    return acceptedFileTypes.some((acceptedType) => {
      if (acceptedType.endsWith("/*")) {
        // Check general category (e.g., 'image/*')
        const typeCategory = acceptedType.split("/")[0]
        return fileType.startsWith(`${typeCategory}/`)
      }
      return fileType === acceptedType // Check specific type
    })
  }

  //check for invalid file type and size here
  fileTypes.forEach((fileType, index) => {
    const fileSize = fileSizes[index]

    // Check for invalid file type
    if (!isAcceptedFileType(fileType)) {
      return {
        success: false,
        code: "BAD_REQUEST",
        fileType,
        message: `Unsupported file type: ${fileType}.`,
      }
    }

    // Check for file size exceeding the limit
    if (fileSize > maxFileSize) {
      return {
        success: false,
        code: "BAD_REQUEST",
        fileSize,
        index,
        message: `File size at ${index} exceeds the maximum limit of 50MB.`,
      }
    }
  })

  const generateRandomFileName = (bytes = 32) =>
    Crpyto.randomBytes(bytes).toString("hex")

  const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_BUCKET_SECRET_ACCESS_KEY!,
    },
  })

  let signedUrls = []
  // let mediaResults = []
  for (let i = 0; i < fileTypes.length; i++) {
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: generateRandomFileName(), //filename that will be stored in s3 bucket
      ContentType: fileTypes[i],
      ContentLength: fileSizes[i],
      ChecksumSHA256: fileChecksums[i],
      Metadata: {
        userId: userId,
      },
    })

    try {
      const signedUrl = await getSignedUrl(s3, putObjectCommand, {
        expiresIn: 1600, //30 minutes
      })

      signedUrls.push(signedUrl)
    } catch (error) {
      return {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: `An internal server error occured. Please try again later.`,
      }
    }

    //Attach media to user later
    // const mediaResult = await prisma.media.create({
    //   data: {
    //     userId: ctx.user.id,
    //     type: fileTypes[i].startsWith("image") ? "image" : "video",
    //     url: signedUrl.split("?")[0] //everything before the query params
    //   }
    // })
    // mediaResults.push(mediaResult)
  }

  return { success: true, signedUrls }
}

export default getSignedUrls
