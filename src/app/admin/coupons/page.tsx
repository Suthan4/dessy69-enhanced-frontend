"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Copy, Ticket } from "lucide-react";
import { couponsApi } from "@/lib/api/coupons";
import { Coupon } from "@/lib/types/coupon";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { CouponForm } from "@/components/admin/couponForm";
import { Loading } from "@/components/ui/Loading";
import { toast } from "sonner";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    coupon: Coupon | null;
  }>({ isOpen: false, coupon: null });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    coupon: Coupon | null;
  }>({ isOpen: false, coupon: null });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const data = await couponsApi().getAll(1, 50);
      setCoupons(data.items);
      console.log("data",data);
    } catch (error) {
      toast.error("Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (formModal.coupon) {
        await couponsApi().update(formModal.coupon.id, data);
        toast.success("Coupon updated successfully");
      } else {
        await couponsApi().create(data);
        toast.success("Coupon created successfully");
      }
      setFormModal({ isOpen: false, coupon: null });
      loadCoupons();
    } catch (error: any) {
      toast.error(error.message || "Failed to save coupon");
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.coupon) return;

    try {
      await couponsApi().delete(deleteModal.coupon.id);
      toast.success("Coupon deleted successfully");
      setDeleteModal({ isOpen: false, coupon: null });
      loadCoupons();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete coupon");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading coupons..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Coupons
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage discount coupons ({coupons?.length})
          </p>
        </div>
        <Button onClick={() => setFormModal({ isOpen: true, coupon: null })}>
          <Plus className="w-5 h-5 mr-2" />
          Add Coupon
        </Button>
      </div>

      {/* Coupons Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons?.map((coupon) => (
          <CouponCard
            key={coupon.id}
            coupon={coupon}
            onCopy={handleCopyCode}
            onEdit={() => setFormModal({ isOpen: true, coupon })}
            onDelete={() => setDeleteModal({ isOpen: true, coupon })}
          />
        ))}
      </div>

      {coupons?.length === 0 && (
        <Card>
          <div className="p-12 text-center">
            <Ticket className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No coupons created yet
            </p>
          </div>
        </Card>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, coupon: null })}
        title={formModal.coupon ? "Edit Coupon" : "Create Coupon"}
        size="lg"
      >
        <CouponForm
          onSubmit={handleSubmit}
          initialData={formModal.coupon || undefined}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, coupon: null })}
        title="Delete Coupon"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete coupon{" "}
            <strong>{deleteModal.coupon?.code}</strong>?
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteModal({ isOpen: false, coupon: null })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CouponCard({
  coupon,
  onCopy,
  onEdit,
  onDelete,
}: {
  coupon: Coupon;
  onCopy: (code: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isExpired = new Date(coupon.endDate) < new Date();
  const isUsedUp = coupon.usedCount >= coupon.usageLimit;

  return (
    <Card>
      <div className="p-4">
        {/* Coupon Code */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
              {coupon.code}
            </span>
          </div>
          <button
            onClick={() => onCopy(coupon.code)}
            className="p-2 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </button>
        </div>

        {/* Coupon Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Discount
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {coupon.type === "percentage"
                ? `${coupon.value}%`
                : formatCurrency(coupon.value)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Min Order
            </span>
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {formatCurrency(coupon.minOrderAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Usage
            </span>
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {coupon.usedCount} / {coupon.usageLimit}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Expires
            </span>
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {formatDate(coupon.endDate)}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          {isExpired ? (
            <Badge variant="error">Expired</Badge>
          ) : isUsedUp ? (
            <Badge variant="warning">Used Up</Badge>
          ) : coupon.isActive ? (
            <Badge variant="success">Active</Badge>
          ) : (
            <Badge variant="default">Inactive</Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
