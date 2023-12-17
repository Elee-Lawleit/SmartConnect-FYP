import {
  AnyPgColumn,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { user } from "./user"
import { post } from "./post"

export const comment = pgTable("comment", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }),
  likes: integer("likes").notNull(),
  parentComment: uuid("parent_comment").references(
    (): AnyPgColumn => comment.id,
    { onDelete: "cascade" }
  ),
  postId: uuid("post_id").references(() => post.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => user.id, { onDelete: "cascade" }),
})
