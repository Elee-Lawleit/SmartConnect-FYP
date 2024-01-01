import Blockies from "react-blockies"

//just hardcode everything for now
const AddressAvatar = () => {
  return (
    <div className="flex h-10 items-center">
      <Blockies
        size={5}
        seed="0x98FA01aba583E1dAff7fF5D2464111306669050b"
        className="mr-2 rounded-md"
      />
      <p className="text-xs text-gray-600">0x6B1B...4Ed2C9</p>
    </div>
  )
}

export default AddressAvatar
