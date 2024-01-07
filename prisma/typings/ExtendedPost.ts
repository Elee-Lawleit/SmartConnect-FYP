import { User } from "@clerk/clerk-sdk-node"
import { Post } from "@prisma/client"

export type ExtendedPost = Post & {
  user: User
} | null | undefined
