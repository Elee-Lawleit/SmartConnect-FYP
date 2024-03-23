import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers"
import Web3Modal from "web3modal"

type SignerContextType = {
  signer?: JsonRpcSigner
  address?: string
  loading: boolean
  hasMetamask: boolean
  connectWallet: () => Promise<void>
}

const SingerContext = createContext<SignerContextType>({} as any)

const useSigner = () => useContext(SingerContext)

export const SignerProvider = ({ children }: { children: ReactNode }) => {
  const [signer, setSigner] = useState<JsonRpcSigner>()
  const [address, setAddress] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMetamask, setHasMetamask] = useState(true)
  const [seenMetamaskNotification, setSeenMetamaskNotification] =
    useState(false)

  useEffect(() => {
    if (!window.ethereum) {
      setHasMetamask(false)
    }

    window.ethereum?.on("accountsChanged", connectWallet)

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", connectWallet)
      }
    }
  }, [])

  const connectWallet = async () => {
    setLoading(true)
    try {
      const web3modal = new Web3Modal({ cacheProvider: true })
      const instance = await web3modal.connect()
      const provider = new Web3Provider(instance)
      const signer = provider.getSigner()
      const address = await signer.getAddress()

      setSigner(signer)
      setAddress(address)
    } catch (error) {
      console.log("ERROR CONNECTING WALLET: ", error)
      setLoading(false)
    }
    setLoading(false)
  }

  const contextValue = { signer, address, loading, hasMetamask, connectWallet }

  return (
    <SingerContext.Provider value={contextValue}>
      {children}
    </SingerContext.Provider>
  )
}

export default useSigner
