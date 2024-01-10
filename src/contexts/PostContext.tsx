import { ReactNode } from "react";
import { createContext } from "react";


interface PostContextInterface {
  
}

const PostContext = createContext<PostContextInterface | null>(null)

export function PostProvider({children}: {children: ReactNode}){
  return <PostContext.Provider value={{}}>{children}</PostContext.Provider>
}