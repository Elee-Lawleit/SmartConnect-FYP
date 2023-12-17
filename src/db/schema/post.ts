import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core"

export const post = pgTable("post", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  caption: text("caption"),
  //can also make a separate table called "Media"
  image: text("image_url"),
  video: text("video_url"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  likes: integer("likes").notNull(),
  views: integer("views"),
  // comments: List<comment>
})
