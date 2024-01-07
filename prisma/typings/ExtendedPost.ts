import { User } from "@clerk/clerk-sdk-node"
import { Post } from "@prisma/client"

export type ExtendedPost = Post & {
  user: User
} | null | undefined

export type ExtendedPosts = Post & {
  user: User | null | undefined
} | null | undefined
