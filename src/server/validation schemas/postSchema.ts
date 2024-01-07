import * as z from "zod"

// union means the post can contain all the values or one of them
// or it can be

export const postSchema = z
  .object({
    caption: z.string().min(1).max(2000), //text post
    mediaUrls: z.array(z.string().url().min(1)), //array of the media attached to it
  })
  .partial()
  .refine((data) => ((data.caption || data.mediaUrls)), "cannot send an empty post")

export type PostSchema = z.infer<typeof postSchema>
