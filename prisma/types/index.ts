import { Prisma } from "@prisma/client"

export type PostWithRelations = Prisma.PostGetPayload<{
  include: { comments: true; postLikes: true; media: true }
}>

export type CommentWithRelations = Prisma.CommentGetPayload<{
  include: { replies: true; commentLikes: true }
}>
