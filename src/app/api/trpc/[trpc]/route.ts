import { appRouter } from "@/server/trpc"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

//simply change the next handler to trpc handler and mention api endpoint in server where all the calls will go, trpc will take over from there
const handler = (req: Request) => {
  fetchRequestHandler({
    endpoint: "api/trpc",
    req,
    router: appRouter,
    // @ts-expect-error context already passed in express middleware
    createContext: ()=>({})
  })
}

//so our trpc can run on Read as well as CUD operations
export {handler as GET, handler as POST}