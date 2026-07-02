"use client";

import { useCallback, useEffect, useState } from "react";
import { gqlFetch } from "@/src/lib/gqlFetch";
import { API_BASE_URL } from "@/src/lib/config";
import { BANK_ACCOUNTS_QUERY } from "@/src/apollo/bank/query";
import {
  CREATE_BANK_ACCOUNT_MUTATION,
  DELETE_BANK_ACCOUNT_MUTATION,
  UPDATE_BANK_ACCOUNT_MUTATION,
} from "@/src/apollo/bank/mutation";

export type BankAccount = {
  id: string;
  userId: string;
  bankName: string;
  qrImageUrl: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function uploadBankImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const result = await response.json();
  if (result.data?.url) return result.data.url;
  if (result.url) return result.url;
  throw new Error(result.message || "Upload failed");
}

export function useBankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await gqlFetch(BANK_ACCOUNTS_QUERY);
      if (result.errors) {
        setError(result.errors[0].message);
        return;
      }
      const payload = result.data?.bankAccounts;
      if (payload?.status) {
        setAccounts(payload.data || []);
      } else {
        setError(payload?.message || "Failed to fetch bank accounts");
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch bank accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, loading, error, refetch: fetchAccounts };
}

export function useCreateBankAccount() {
  const [submitting, setSubmitting] = useState(false);

  const create = useCallback(
    async (input: { bankName: string; qrImageUrl: string }) => {
      setSubmitting(true);
      try {
        const result = await gqlFetch(CREATE_BANK_ACCOUNT_MUTATION, { input });
        if (result.errors) {
          return { success: false, message: result.errors[0].message };
        }
        const payload = result.data?.createBankAccount;
        return {
          success: !!payload?.status,
          message: payload?.message || "",
          data: payload?.data as BankAccount | undefined,
        };
      } catch (e: any) {
        return { success: false, message: e.message || "Create failed" };
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { submitting, create };
}

export function useUpdateBankAccount() {
  const [submitting, setSubmitting] = useState(false);

  const update = useCallback(
    async (id: string, input: { bankName?: string; qrImageUrl?: string }) => {
      setSubmitting(true);
      try {
        const result = await gqlFetch(UPDATE_BANK_ACCOUNT_MUTATION, {
          id,
          input,
        });
        if (result.errors) {
          return { success: false, message: result.errors[0].message };
        }
        const payload = result.data?.updateBankAccount;
        return {
          success: !!payload?.status,
          message: payload?.message || "",
          data: payload?.data as BankAccount | undefined,
        };
      } catch (e: any) {
        return { success: false, message: e.message || "Update failed" };
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { submitting, update };
}

export function useDeleteBankAccount() {
  const [submitting, setSubmitting] = useState(false);

  const remove = useCallback(async (id: string) => {
    setSubmitting(true);
    try {
      const result = await gqlFetch(DELETE_BANK_ACCOUNT_MUTATION, { id });
      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }
      const payload = result.data?.deleteBankAccount;
      return {
        success: !!payload?.status,
        message: payload?.message || "",
      };
    } catch (e: any) {
      return { success: false, message: e.message || "Delete failed" };
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submitting, remove };
}
