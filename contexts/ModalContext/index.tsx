import { Flex } from '@chakra-ui/react'
import { cloneElement, createContext, Dispatch, FC, isValidElement, ReactNode, SetStateAction, useState } from 'react'

type Handler = () => void

interface ModalsContext {
  onPresent: (node: ReactNode, key?: string) => void
  onDismiss: Handler
  setCloseOnOverlayClick: Dispatch<SetStateAction<boolean>>
}

export const Context = createContext<ModalsContext>({
  onPresent: () => null,
  onDismiss: () => null,
  setCloseOnOverlayClick: () => true,
})

type ModalProviderProps = {
  children: React.ReactNode
}

const ModalProvider: FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [modalNode, setModalNode] = useState<ReactNode>()
  const [closeOnOverlayClick, setCloseOnOverlayClick] = useState(true)

  const handlePresent = (node: ReactNode) => {
    setModalNode(node)
    setIsOpen(true)
  }

  const handleDismiss = () => {
    setModalNode(undefined)
    setIsOpen(false)
  }

  const handleOverlayDismiss = () => {
    if (closeOnOverlayClick) {
      handleDismiss()
    }
  }

  return (
    <Context.Provider
      value={{
        onPresent: handlePresent,
        onDismiss: handleDismiss,
        setCloseOnOverlayClick,
      }}
    >
      {isOpen && (
        <Flex direction="column" justify="center" align="center" position="fixed" top="0" right="0" bottom="0" left="0">
          {/* <Overlay show onClick={handleOverlayDismiss} /> */}
          {isValidElement(modalNode) &&
            cloneElement(modalNode, {
              onDismiss: handleDismiss,
            })}
        </Flex>
      )}
      {children}
    </Context.Provider>
  )
}

export default ModalProvider
