import Blockies from "react-blockies"

const minifyAddress = (address: string) => {
  const start = address.substring(0, 5)
  const end = address.substring(address.length - 4)
  return `${start}...${end}`
}

const AddressAvatar = ({ seed }: { seed: string }) => {
  return (
    <div className="flex h-10 items-center">
      <Blockies size={5} seed={seed} className="mr-2 rounded-md" />
      <p className="text-xs text-gray-600">{minifyAddress(seed)}</p>
    </div>
  )
}

export default AddressAvatar
