import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { formatCurrency, formatDate } from '../utils/formatters';
import { getOrderStatus, getOrderStatusMeta, ORDER_STATUS } from '../utils/orderStatus';

const STATUS_ACCENTS = {
  [ORDER_STATUS.DELIVERED]: 'bg-emerald-500',
  [ORDER_STATUS.IN_PROCESS]: 'bg-amber-500',
  [ORDER_STATUS.UPCOMING]: 'bg-blue-500',
  [ORDER_STATUS.SCHEDULED]: 'bg-neutral-400',
};

const PurchaseOrderDetailsPanel = ({ order, isOpen, onClose }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timeout = window.setTimeout(() => setShouldRender(false), 320);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    window.requestAnimationFrame(() => {
      panelRef.current?.focus({ preventScroll: true });
    });
  }, [isOpen, order]);

  const statusMeta = useMemo(() => {
    if (!order) {
      return null;
    }

    const statusKey = getOrderStatus(order);
    return {
      ...getOrderStatusMeta(statusKey),
      accent: STATUS_ACCENTS[statusKey] ?? STATUS_ACCENTS[ORDER_STATUS.SCHEDULED],
    };
  }, [order]);

  if (!shouldRender) {
    return null;
  }

  const labelValue = (value) => {
    if (value === null || value === undefined) {
      return 'Not provided';
    }

    if (typeof value === 'string' && value.trim().length === 0) {
      return 'Not provided';
    }

    return value;
  };

  const scheduleItems = [
    {
      label: 'Order Date',
      value: order ? formatDate(order.order_date) : '—',
    },
    {
      label: 'Delivery Date',
      value: order ? formatDate(order.delivery_date) : '—',
    },
  ];

  const summaryItems = [
    {
      label: 'Quantity',
      value: order ? order.quantity : '—',
    },
    {
      label: 'Unit Price',
      value: order ? formatCurrency(order.unit_price) : '—',
    },
    {
      label: 'Total Value',
      value: order ? formatCurrency(order.total_price) : '—',
    },
  ];

  const extendedDetails = [
    {
      label: 'Description',
      value: labelValue(order?.description),
      multiline: true,
    },
    {
      label: 'Vendor',
      value: labelValue(order?.vendor),
    },
    {
      label: 'Shipping Address',
      value: labelValue(order?.shipping_address),
      multiline: true,
    },
    {
      label: 'Category',
      value: labelValue(order?.category),
    },
    {
      label: 'Notes',
      value: labelValue(order?.notes),
      multiline: true,
    },
  ];

  const content = (
    <div
      className={`fixed inset-0 z-[70] flex justify-end overflow-hidden transition-all duration-300 ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div
        className={`absolute inset-0 bg-neutral-950/55 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby="purchase-order-details-title"
        className={`relative z-[71] flex h-full w-full max-w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-neutral-950 sm:max-w-md lg:max-w-[480px] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400 dark:text-neutral-500">
              Purchase Order
            </p>
            <h2
              id="purchase-order-details-title"
              className="mt-2 text-xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-2xl"
            >
              {order?.item_name ?? 'Order Details'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors duration-200 hover:border-neutral-400 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-200 dark:focus-visible:ring-neutral-600 dark:focus-visible:ring-offset-neutral-950"
            aria-label="Close details panel"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M18 6L6 18M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-12 sm:pb-16">
          <section className="space-y-8 px-6 py-6 sm:px-8">
            <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-900/60">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 transition-colors duration-300 dark:text-neutral-500">
                    Status
                  </p>
                  {statusMeta ? (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-neutral-200/60 bg-neutral-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-600 transition-colors duration-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${statusMeta.accent}`}
                        aria-hidden="true"
                      />
                      {statusMeta.label}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                      Not available
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 transition-colors duration-300 dark:text-neutral-500">
                    Total Value
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-neutral-900 transition-colors duration-300 dark:text-neutral-50">
                    {order ? formatCurrency(order.total_price) : '—'}
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                {summaryItems.map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 transition-colors duration-300 dark:text-neutral-500">
                      {item.label}
                    </dt>
                    <dd className="mt-2 text-base font-semibold text-neutral-900 transition-colors duration-300 dark:text-neutral-100">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white/70 p-6 transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-900/50">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-400 transition-colors duration-300 dark:text-neutral-500">
                Schedule
              </h3>
              <dl className="mt-4 grid gap-5 sm:grid-cols-2">
                {scheduleItems.map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 transition-colors duration-300 dark:text-neutral-500">
                      {item.label}
                    </dt>
                    <dd className="mt-2 text-sm font-medium text-neutral-700 transition-colors duration-300 dark:text-neutral-200">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="space-y-5 rounded-3xl border border-neutral-200 bg-white/70 p-6 transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-900/50">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-400 transition-colors duration-300 dark:text-neutral-500">
                Extended Details
              </h3>
              <dl className="space-y-5">
                {extendedDetails.map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400 transition-colors duration-300 dark:text-neutral-500">
                      {item.label}
                    </dt>
                    <dd
                      className={`mt-2 text-sm leading-relaxed text-neutral-700 transition-colors duration-300 dark:text-neutral-200 ${
                        item.multiline ? 'whitespace-pre-line' : ''
                      }`}
                    >
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );

  return createPortal(content, document.body);
};

export default PurchaseOrderDetailsPanel;


