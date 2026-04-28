"use client";

import { useSearchParams } from "next/navigation";
import PlantForm from "@/src/components/plantForm";

export default function UpdateStockPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  return (
    <div>
      <PlantForm productId={productId} />
    </div>
  );
}
