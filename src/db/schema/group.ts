import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

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
  adminId: text("admin_id").notNull() //clerk userId

  //or either, just make a separate table/role called "admin", would be a lot easier
})

export const group_users = pgTable(
  "group_users",
  {
    userId: text("user_id"), //clerk userId
    groupId: uuid("group_id").references(() => group.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.groupId] }), //to create multi column foreign key
    }
  }
)
