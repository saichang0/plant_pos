"use client";

import {
  BackIcon,
  CallIcon,
  EmailIcon,
  LocationIcon,
} from "@/src/components/icons/page";
import React from "react";
import type { SaleRecord } from "@/src/features/sale/useSale";

type OrderDetailsPanelProps = {
  order: SaleRecord;
  onClose: () => void;
  onConfirm: (order: SaleRecord) => void | Promise<void>;
  onCancel: (order: SaleRecord) => void | Promise<void>;
  busy?: boolean;
};

function formatDate(value: string | number | Date | undefined) {
  if (!value) return "";
  const d = new Date(typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    Number(n) || 0
  );
}

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === "pending") return "bg-orange-100 text-orange-700";
  if (s === "confirmed" || s === "paid") return "bg-emerald-100 text-emerald-700";
  if (s === "completed") return "bg-teal-100 text-teal-700";
  if (s === "cancelled") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

const OrderDetailsPanel: React.FC<OrderDetailsPanelProps> = ({
  order,
  onClose,
  onConfirm,
  onCancel,
  busy = false,
}) => {
  const customerName =
    order.customer
      ? `${order.customer.firstName ?? ""} ${order.customer.lastName ?? ""}`.trim()
      : order.customerName || "Guest";

  const itemCount = order.saleDetails.reduce(
    (sum, d) => sum + Number(d.quantity || 0),
    0
  );
  const subTotal = order.saleDetails.reduce(
    (sum, d) => sum + Number(d.totalPrice || 0),
    0
  );
  const paidByCustomer = order.payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const addr = order.customerAddress;
  const shippingLine = addr
    ? [addr.village, addr.district, addr.province, addr.country]
        .filter(Boolean)
        .join(", ")
    : order.customer?.address || "No shipping address";

  const canConfirm = order.status.toLowerCase() === "pending";
  const canCancel = ["pending", "confirmed"].includes(order.status.toLowerCase());

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-20" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-[600px] bg-white shadow-2xl overflow-y-auto z-30">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="text-gray-600 hover:text-gray-900"
                onClick={onClose}
                aria-label="Close details"
              >
                <BackIcon size={24} />
              </button>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusBadgeClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(order.saleDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Items */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-semibold text-gray-900">
                Order Items ({order.saleDetails.length})
              </h4>
            </div>

            <div className="space-y-3">
              {order.saleDetails.map((d) => {
                const qty = Number(d.quantity || 0);
                const unitPrice = Number(d.unitPrice || 0);
                const totalPrice = Number(d.totalPrice || 0);
                const unitLabel =
                  d.unit?.name ?? d.product?.unit?.name ?? "unit";
                return (
                  <div
                    key={d.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4"
                  >
                    {d.product?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.product.imageUrl}
                        alt={d.product.name}
                        className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-gray-900">
                        {d.product?.name || "Product"}
                      </h5>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatMoney(unitPrice)} / {unitLabel}
                      </p>
                      {d.weightGrams > 0 && (
                        <p className="text-xs text-gray-500">
                          Weight: {formatMoney(d.weightGrams)} g
                        </p>
                      )}
                      {d.note && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          “{d.note}”
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">× {qty}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatMoney(totalPrice)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Order Summary */}
          <section>
            <h4 className="text-base font-semibold text-gray-900 mb-3">
              Order Summary
            </h4>

            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <div className="text-right">
                  <span className="text-gray-500 mr-2">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatMoney(subTotal)}
                  </span>
                </div>
              </div>

              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-gray-900">
                    -{formatMoney(order.discountAmount)}
                  </span>
                </div>
              )}

              {Number(order.taxAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">
                    {formatMoney(order.taxAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900">
                  {formatMoney(order.totalAmount)}
                </span>
              </div>

              <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
                <span className="text-gray-600">Paid by customer</span>
                <span className="font-medium text-gray-900">
                  {formatMoney(paidByCustomer)}
                </span>
              </div>

              {order.note && (
                <p className="text-xs text-gray-500 pt-3 border-t border-gray-200">
                  Note: {order.note}
                </p>
              )}

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
                <button
                  disabled={!canCancel || busy}
                  onClick={() => onCancel(order)}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Cancel order
                </button>
                <button
                  disabled={!canConfirm || busy}
                  onClick={() => onConfirm(order)}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {busy ? "Working…" : "Confirm order"}
                </button>
              </div>
            </div>
          </section>

          {/* Delivery */}
          {order.deliveries && order.deliveries.length > 0 && (
            <section>
              <h4 className="text-base font-semibold text-gray-900 mb-3">
                Delivery
              </h4>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                {order.deliveries.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-start justify-between text-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {d.deliveryService}
                        {d.branch ? ` — ${d.branch}` : ""}
                      </p>
                      {d.trackingNumber && (
                        <p className="text-xs text-gray-500 mt-1">
                          Tracking: {d.trackingNumber}
                        </p>
                      )}
                      {d.shippedAt && (
                        <p className="text-xs text-gray-500">
                          Shipped: {formatDate(d.shippedAt)}
                        </p>
                      )}
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Payment Slips */}
          {order.payments.some((p) => p.slipImageUrl) && (
            <section>
              <h4 className="text-base font-semibold text-gray-900 mb-3">
                Payment Slip
              </h4>
              <div className="space-y-3">
                {order.payments
                  .filter((p) => p.slipImageUrl)
                  .map((p) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={p.id}
                      src={p.slipImageUrl!}
                      alt="Payment slip"
                      className="w-full max-h-64 rounded-lg border border-gray-200 bg-gray-50 object-contain"
                    />
                  ))}
              </div>
            </section>
          )}

          {/* Customer Details */}
          <section>
            <h4 className="text-base font-semibold text-gray-900 mb-3">
              Customer Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Customer */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Customer
                </p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-900">{customerName}</p>
                  {order.customer?.phoneNumber && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <CallIcon size={14} className="text-gray-500" />
                      {order.customer.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Contact
                </p>
                <div className="space-y-1">
                  {order.customer?.email && (
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <EmailIcon size={14} className="text-gray-500" />
                      {order.customer.email}
                    </p>
                  )}
                  {!order.customer?.email && (
                    <p className="text-xs text-gray-500">No contact info</p>
                  )}
                </div>
              </div>

              {/* Shipping */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Shipping address
                </p>
                <p className="text-sm text-gray-900 flex items-start gap-2">
                  <LocationIcon
                    size={14}
                    className="text-gray-500 mt-0.5"
                  />
                  <span>{shippingLine}</span>
                </p>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
};

export default OrderDetailsPanel;
