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
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Unsupported file type: ${fileType}.`,
        cause: {
          fileType,
          index,
        },
      })
    }

    // Check for file size exceeding the limit
    if (fileSize > maxFileSize) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `File size at ${index} exceeds the maximum limit of 50MB.`,
        cause: {
          fileSize,
          index,
        },
      })
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
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error retrieving signed urls. Please try again later.",
      })
    }
  }

  return { success: true, signedUrls }
}

export default getSignedUrls
