import {
  date,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core"
import { user } from "./user"

export const eventTypeEnum = pgEnum("event_type_enum", ["online", "onsite"])

export const event = pgTable("event", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: eventTypeEnum("event_type"),
  location: text("location"),
  startDate: date("start_date", {
    mode: "string",
  }).notNull(),
  endDate: date("end_date", {
    mode: "string",
  }).notNull(),
  organizerId: uuid("organizer_id").references(() => user.id),
})

export const event_users = pgTable(
  "event_users",
  {
    userId: uuid("user_id").references(() => user.id),
    eventId: uuid("event_id").references(() => event.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.eventId] }), //to create multi column foreign key
    }
  }
)
