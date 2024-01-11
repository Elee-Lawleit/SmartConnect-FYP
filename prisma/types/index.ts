import { EmailAddress } from "@clerk/clerk-sdk-node";
import { Prisma } from "@prisma/client"

export type PostWithRelations = Prisma.PostGetPayload<{
  include: { comments: true; postLikes: true; media: true }
}>

export type CommentWithRelations = Prisma.CommentGetPayload<{
  include: { replies: true; commentLikes: true }
}>

export type User = {
  id: string
  username: string | null
  imageUrl: string | null
  emailAddresses: string[]
}

// I will probably do something this, maybe I won't I really don't know REALLY
//wait a minute, I haven't restarted my server yet, I am so stupid
export type CommentWithUser = {
  user: User
  id: string
  text: string
  createdAt: string
  updatedAt: string
  likes: number
  userId: string
  postId: string
  parentId: string | null
}
