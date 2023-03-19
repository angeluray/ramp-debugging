import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    let allTransactions: Transaction[] = []

    if (paginatedTransactions !== null) {
      allTransactions = paginatedTransactions.data
    }
  
    let nextPage = paginatedTransactions === null ? 0 : paginatedTransactions.nextPage
  
    if (nextPage !== null) {
      const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
        "paginatedTransactions",
        {
          page: nextPage,
        }
      )
  
      if(response !== null) {
        allTransactions = allTransactions.concat(response.data)
        nextPage = response.nextPage
      }
    }
  
    setPaginatedTransactions({ data: allTransactions, nextPage })
      }, [fetchWithCache, paginatedTransactions])


  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
