import React, { useCallback, useEffect, useState } from "react";
import { useCustomFetch } from "src/hooks/useCustomFetch";
import { SetTransactionApprovalParams } from "src/utils/types";
import { TransactionPane } from "./TransactionPane";
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types";

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch();
  const [approvedMap, setApprovedMap] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!transactions) return;

    const initialApprovedMap = transactions.reduce(
      (map, transaction) => ({
        ...map,
        [transaction.id]: transaction.approved,
      }),
      {}
    );

    const mergedApprovedMap = {
      ...initialApprovedMap,
      ...approvedMap,
    };

    if (JSON.stringify(mergedApprovedMap) !== JSON.stringify(approvedMap)) {
      setApprovedMap(mergedApprovedMap);
    }
  }, [transactions, approvedMap]);

  useEffect(() => {
    localStorage.setItem("approvedMap", JSON.stringify(approvedMap));
  }, [approvedMap]);

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      });
      setApprovedMap((prevApprovedMap) => ({
        ...prevApprovedMap,
        [transactionId]: newValue,
      }));
    },
    [fetchWithoutCache]
  );

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>;
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          approved={approvedMap[transaction.id]}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  );
};
