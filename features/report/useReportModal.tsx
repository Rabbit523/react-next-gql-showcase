import useModal from 'app/hooks/nftmall/useModal'
import useToast from 'app/hooks/nftmall/useToast'
import { restAPI } from 'app/utils/rest'
import { useCallback } from 'react'

import ReportModal from './ReportModal'

const useReportModal = () => {
  const { toastError, toastSuccess } = useToast()

  const sendReport = useCallback(
    async (email: string, description: string) => {
      const windowLocationHref = typeof window !== 'undefined' ? window.location.href : '#'
      const response = await restAPI.sendReport(email, description, windowLocationHref)
      if (response.report) {
        toastSuccess('Thanks for reporting!')
      } else {
        toastError('Failed to report. Try again later.')
      }
      onDismissReportModal()
    },
    [
      // onDismissReportModal,
      toastError,
      toastSuccess,
    ]
  )
  const [onPresentReportModal, onDismissReportModal] = useModal(<ReportModal onSubmit={sendReport} />)
  return [onPresentReportModal, onDismissReportModal]
}

export default useReportModal
