"use client";

import { useState, useEffect, useCallback } from "react";
import { gqlFetch } from "@/src/lib/gqlFetch";
import { GET_UNITS_QUERY } from "@/src/apollo/unit/query";
import {
  CREATE_UNIT_MUTATION,
  UPDATE_UNIT_MUTATION,
  DELETE_UNIT_MUTATION,
} from "@/src/apollo/unit/mutation";

// ─── Types ───────────────────────────────────────────────────
export interface Unit {
  id: string;
  name: string;
  weightInGrams?: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}


// ─── Hook: Fetch all units ──────────────────────────────────
export function useUnitList() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await gqlFetch(GET_UNITS_QUERY);
      if (result.errors) {
        setError(result.errors[0].message);
        return;
      }
      const data = result.data?.getUnits;
      if (data?.status) {
        setUnits(data.units || []);
      } else {
        setError(data?.message || "Failed to fetch units");
      }
    } catch {
      setError("Failed to fetch units");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  return { units, loading, error, refetch: fetchUnits };
}

// ─── Hook: Create unit ───────────────────────────────────
export function useCreateUnit() {
  const [submitting, setSubmitting] = useState(false);

  const createUnit = async (
    name: string,
    weightInGrams?: number,
  ): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);
    try {
      const result = await gqlFetch(CREATE_UNIT_MUTATION, {
        input: { name, weightInGrams },
      });
      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }
      const data = result.data?.createUnit;
      if (data?.status) {
        return { success: true, message: data.message || "Created!" };
      }
      return { success: false, message: data?.message || "Failed" };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, createUnit };
}

// ─── Hook: Update unit ───────────────────────────────────
export function useUpdateUnit() {
  const [submitting, setSubmitting] = useState(false);

  const updateUnit = async (
    id: string,
    name: string
  ): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);
    try {
      const result = await gqlFetch(UPDATE_UNIT_MUTATION, {
        input: { id, data: { name } },
      });
      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }
      const data = result.data?.updateUnit;
      if (data?.status) {
        return { success: true, message: data.message || "Updated!" };
      }
      return { success: false, message: data?.message || "Failed" };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, updateUnit };
}

// ─── Hook: Delete unit ───────────────────────────────────
export function useDeleteUnit() {
  const [submitting, setSubmitting] = useState(false);

  const deleteUnit = async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);
    try {
      const result = await gqlFetch(DELETE_UNIT_MUTATION, {
        input: { id },
      });
      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }
      const data = result.data?.deleteUnit;
      if (data?.status) {
        return { success: true, message: data.message || "Deleted!" };
      }
      return { success: false, message: data?.message || "Failed" };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, deleteUnit };
}
