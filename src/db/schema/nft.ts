import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  boolean,
} from "drizzle-orm/pg-core"
import { user } from "./user"

export const nft = pgTable("nft", {
  //or can also make the nft url (ipfs uri) the primary key here
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  // attributes: json("attributes"),
  metadataUrl: text("metadata_url"), //or above
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }),
  ownerId: uuid("owner_id").references(() => user.id),
})

export const nftSale = pgTable("nft_listings", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  price: numeric("price").notNull(),
  isAvailable: boolean("available_status").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }),
  nftId: uuid("nft_id").references(() => nft.id),
})
