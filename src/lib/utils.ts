import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateString: string) {
  const now: any = new Date()
  const postDate: any = new Date(dateString)

  const diffInMilliseconds = now - postDate

  const seconds = Math.floor(diffInMilliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const timeAgo = {
    seconds: seconds % 60,
    minutes: minutes % 60,
    hours: hours % 24,
    days: days,
  }

  let relativeTimeString = ""

  if (days > 0) {
    relativeTimeString += `${days} day${days > 1 ? "s" : ""} ago`
  } else if (hours > 0) {
    relativeTimeString += `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else if (minutes > 0) {
    relativeTimeString += `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  } else {
    relativeTimeString += `${seconds} second${seconds > 1 ? "s" : ""} ago`
  }

  return relativeTimeString
}