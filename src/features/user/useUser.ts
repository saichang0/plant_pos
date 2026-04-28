"use client";

import { useState, useEffect, useCallback } from "react";
import { gqlFetch } from "@/src/lib/gqlFetch";
import { GET_USER_QUERY } from "@/src/apollo/user/query";
import { UPDATE_USER_MUTATION } from "@/src/apollo/user/mutation";
import type { User } from "@/src/types/auth";

function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr).id || null;
  } catch {
    return null;
  }
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setError("No user logged in");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await gqlFetch(GET_USER_QUERY, { id: userId });

      if (result.errors) {
        setError(result.errors[0].message);
        return;
      }

      const data = result.data?.getUser;
      if (data?.status) {
        setUser(data.user);
      } else {
        setError(data?.message || "Failed to fetch user");
      }
    } catch {
      setError("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
}

export function useUpdateUser() {
  const [submitting, setSubmitting] = useState(false);

  const updateUser = async (
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      shopName?: string;
      profileImageUrl?: string;
      bankAccountImageUrl?: string;
    }
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    setSubmitting(true);

    try {
      const result = await gqlFetch(UPDATE_USER_MUTATION, {
            input: { id: userId, data },
          });

      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }

      const res = result.data?.updateUser;
      if (res?.status) {
        // Update localStorage with new user data
        if (res.user) {
          localStorage.setItem("user", JSON.stringify(res.user));
        }
        return {
          success: true,
          message: res.message || "Profile updated successfully!",
          user: res.user,
        };
      }

      return {
        success: false,
        message: res?.message || "Failed to update profile",
      };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, updateUser };
}
