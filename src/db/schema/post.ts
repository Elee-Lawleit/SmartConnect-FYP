import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm"

export const post = pgTable("post", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  caption: text("caption"),
  //can also make a separate table called "Media"
  mediaUrl: text("media_url").array(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .default(sql`now()`)
    .notNull(),
  likes: integer("likes").default(0).notNull(),
  views: integer("views").default(0),
  userId: text("user_id").notNull() //clerk userId 
})

export type selectPost = InferSelectModel<typeof post>
export type InsertPost = InferInsertModel<typeof post>