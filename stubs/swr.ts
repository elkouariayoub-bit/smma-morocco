import { useEffect, useState } from "react"

type Key = string | null

type Fetcher<Data> = (key: string) => Promise<Data>

type SWRConfiguration = {
  revalidateOnFocus?: boolean
}

type SWRResponse<Data> = {
  data: Data | undefined
  error: unknown
  isLoading: boolean
}

export default function useSWR<Data = unknown>(
  key: Key,
  fetcher: Fetcher<Data>,
  _config?: SWRConfiguration,
): SWRResponse<Data> {
  const [data, setData] = useState<Data | undefined>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(key))

  useEffect(() => {
    let cancelled = false

    if (!key) {
      setData(undefined)
      setError(undefined)
      setIsLoading(false)
      return () => {
        cancelled = true
      }
    }

    setIsLoading(true)
    fetcher(key)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError(undefined)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setData(undefined)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [key, fetcher])

  return { data, error, isLoading }
}
