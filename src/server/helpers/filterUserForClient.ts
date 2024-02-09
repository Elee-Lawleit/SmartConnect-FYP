import type { User } from "@clerk/clerk-sdk-node"
export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl,
    emailAddresses: user.emailAddresses,
    fullname: user.firstName + " " + user.lastName
  }
}

