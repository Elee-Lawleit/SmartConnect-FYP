import {
  date,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core"

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
  organizerId: text("organizer_id").notNull() //clerk userId,
})

export const event_users = pgTable(
  "event_users",
  {
    userId: text("user_id").notNull(), //clerk userId
    eventId: uuid("event_id").references(() => event.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.eventId] }), //to create multi column foreign key
    }
  }
)
