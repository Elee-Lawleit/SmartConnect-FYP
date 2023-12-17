import { pgTable, text, uuid } from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  // POSTS, CHATS, GROUPS, Ads
})
