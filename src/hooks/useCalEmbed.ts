import { useEffect } from 'react'
import { getCalApi } from '@calcom/embed-react'

interface CalEmbedOptions {
  namespace: string
  styles?: {
    branding?: {
      brandColor?: string
    }
  }
  hideEventTypeDetails?: boolean
  layout?: 'month_view' | 'week_view' | 'column_view'
}

export const useCalEmbed = (options: CalEmbedOptions) => {
  useEffect(() => {
    ;(async function () {
      const cal = await getCalApi({ namespace: options.namespace })
      cal('ui', {
        styles: options.styles,
        hideEventTypeDetails: options.hideEventTypeDetails,
        layout: options.layout,
      })
    })()
  }, [options])

  return {
    namespace: options.namespace,
    layout: options.layout,
  }
}

