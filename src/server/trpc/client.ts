import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from ".";

//contains types for our entire backend, used by front-end
export const trpc = createTRPCReact<AppRouter>({})