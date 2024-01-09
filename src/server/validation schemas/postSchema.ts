import * as z from "zod"

// union means the post can contain all the values or one of them
// or it can be

export const postSchema = z
  .object({
    caption: z.string().max(2000).optional(), //text post
    mediaUrls: z.array(z.string().url()).optional(), //array of the media attached to it
    fileTypes: z.array(z.string()).optional(),
  })
  .refine((data) => {
    if (!data.caption && data.mediaUrls?.length === 0) return false
    if (data.mediaUrls?.length !== 0 && data.fileTypes?.length === 0)
      return false
    return true
  }, "cannot send an empty post")

export type PostSchema = z.infer<typeof postSchema>
