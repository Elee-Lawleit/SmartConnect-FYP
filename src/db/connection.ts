import { Client } from "pg";
import {drizzle as Drizzle} from "drizzle-orm/node-postgres"
import { comment } from "./schema/comment";
import { event } from "./schema/event";
import { group } from "./schema/group";
import { post } from "./schema/post";
import dotenv from "dotenv"

dotenv.config({path: ".env"})

if (!process.env.DATABASE_URL){
  console.log("🔴 Database url is missing")
}
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

client.connect()
export const drizzle = Drizzle(client, {schema: {...comment, ...event, ...group, ...post}})