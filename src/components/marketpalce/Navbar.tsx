import Image from "next/image"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const Navbar = () => {
  return (
    <header className="bg-white p-3 shadow-md sticky top-0 w-full z-50">
      <nav className="w-full flex">
        <div className="w-full flex items-center justify-between gap-2">
          <Image src="/SmartConnect.png" alt="logo" width={130} height={1} />
          <Sheet>
            <SheetTrigger>
              <Menu className="h-8 w-8" />
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>NFT Marketplace</SheetTitle>
                <SheetDescription>
                  Monetize your creativity. Showcase and sell your NFTs on
                  SmartConnect.
                </SheetDescription>
              </SheetHeader>
              <div aria-hidden="true" className="mt-2 h-[1px] bg-gray-300" />
              <div className="mt-2 flex flex-col shrink-0 gap-2 h-full">
                <Button variant="outline" className="rounded-full" asChild>
                  <Link href="">Explore</Link>
                </Button>
                <Button variant="outline" className="rounded-full">
                  <Link href="">Activity</Link>
                </Button>
                <Button className="rounded-full bg-gradient-to-r from-[#40777A] via-[#40777A] at-[22.17%] to-[#37C9D0] at-[74.29%]">
                  <Link href="">Create</Link>
                </Button>
                <Button variant="outline" className="rounded-full align-bottom">
                  <Link href="">How it works?</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
