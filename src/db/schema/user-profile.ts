import { pgTable, uuid, text, boolean } from "drizzle-orm/pg-core"
import { user } from "./user"

export const userProfile = pgTable("user_profile", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  walletAddress: text("wallet_address"),
  bio: text("bio"),
  status: boolean("status"),
  profileImageUrl: text("profile_image_url"), //can later change this to a seprate table with multiple profile images and active status
  userId: uuid("user_id").references(() => user.id, { onDelete: "cascade" }),
})
