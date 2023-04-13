import { ethers } from 'ethers'

import ERC20Abi from '../config/abi/ERC20.json'
import ERC721Abi from '../config/abi/ERC721.json'
import ExchangeAbi from '../config/abi/ExchangeAbi.json'
import NFTmallERC721Abi from '../config/abi/NFTmallERC721Abi.json'
import GEMTokenAbi from '../config/abi/GEMAbi.json'
import MulticallAbi from '../config/abi/MulticallAbi.json'

export const getContract = (abi: any, address: string, signer?: ethers.Signer | ethers.providers.Provider) => {
  return new ethers.Contract(address, abi, signer)
}

export const getErc20Contract = (address, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(ERC20Abi, address, signer)
}

export const getErc721Contract = (address, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(ERC721Abi, address, signer)
}

export const getExchangeContract = (address, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(ExchangeAbi, address, signer)
}

export const getNFTmallERC721Contract = (address, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(NFTmallERC721Abi, address, signer)
}

export const getGEMTokenContract = (address, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(GEMTokenAbi, address, signer)
}
