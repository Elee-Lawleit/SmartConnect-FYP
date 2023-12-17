import {
  AnyPgColumn,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { user } from "./user"

export const group = pgTable("group", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }),
  //one admin for now, can change this to many to many later
  // refer admin from junction table
  adminId: uuid("admin_id").references(() => user.id),

  //or either, just make a separate table/role called "admin", would be a lot easier
})

export const group_users = pgTable(
  "group_users",
  {
    userId: uuid("user_id").references(() => user.id),
    groupId: uuid("group_id").references(() => group.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.groupId] }), //to create multi column foreign key
    }
  }
)
