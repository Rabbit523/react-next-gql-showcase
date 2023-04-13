/* eslint-disable react/display-name */
import { AlertStatus } from '@chakra-ui/alert'
import { useToast } from '@chakra-ui/react'
import { Notification } from '@nftmall/uikit'
import { createContext, FC, ReactNode, useCallback } from 'react'

interface Toast {
  type: AlertStatus
  title: string
  description?: string
}
type ToastSignature = (
  title: Toast['title'],
  description?: Toast['description'] | ReactNode
) => string | number | undefined

interface ToastContextApi {
  toastError: ToastSignature
  toastInfo: ToastSignature
  toastSuccess: ToastSignature
  toastWarning: ToastSignature
}

export const ToastContext = createContext<ToastContextApi>({
  toastError: () => undefined,
  toastInfo: () => undefined,
  toastSuccess: () => undefined,
  toastWarning: () => undefined,
})

type ToastProviderProps = {
  children: React.ReactNode
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const toast = useToast()

  const handleToast = useCallback(
    (props: Toast) => {
      return toast({
        status: props.type,
        duration: 8000,
        isClosable: true,
        position: 'bottom-right',
        render: ({ onClose }) => (
          <Notification type={props.type} title={props.title} description={props.description} onClose={onClose} />
        ),
      })
    },
    [toast]
  )

  const toastError = useCallback(
    (title: string, description?: string) => {
      return handleToast({ title, description, type: 'error' })
    },
    [handleToast]
  )
  const toastInfo = useCallback(
    (title: string, description?: string) => {
      return handleToast({ title, description, type: 'info' })
    },
    [handleToast]
  )
  const toastSuccess = useCallback(
    (title: string, description?: string) => {
      return handleToast({ title, description, type: 'success' })
    },
    [handleToast]
  )
  const toastWarning = useCallback(
    (title: string, description?: string) => {
      return handleToast({ title, description, type: 'warning' })
    },
    [handleToast]
  )

  return (
    <ToastContext.Provider value={{ toastError, toastInfo, toastSuccess, toastWarning }}>
      {children}
    </ToastContext.Provider>
  )
}
