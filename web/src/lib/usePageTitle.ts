import { useEffect } from 'react'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | Fazenda Artesanal` : 'Fazenda Artesanal | Tortas e massas feitas à mão'
  }, [title])
}
