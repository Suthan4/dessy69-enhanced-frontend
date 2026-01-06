"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, FolderTree, ChevronDown, ChevronRight, Trash } from "lucide-react";
import { categoriesApi } from "@/lib/api/categories";
import { Category, CategoryTree } from "@/lib/types/category";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Loading } from "@/components/ui/Loading";
import { toast } from "sonner";
import { CategoryForm } from "@/components/admin/categoryForm";

/* ================= Page ================= */
export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDelLoading, setIsDelLoading] = useState(false);

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({ isOpen: false, category: null });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({ isOpen: false, category: null });

  /* -------- Load Categories -------- */
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoriesApi().getAll();
      setCategories(res.data); // ✅ already TREE
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  /* -------- Create / Update -------- */
  const handleSubmit = async (data: any) => {
    try {
      if (formModal.category) {
        await categoriesApi().update(formModal.category.id, data);
        toast.success("Category updated successfully");
      } else {
        await categoriesApi().create(data);
        toast.success("Category created successfully");
      }
      setFormModal({ isOpen: false, category: null });
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || "Failed to save category");
      throw error;
    }
  };

  /* -------- Delete -------- */
  const handleDelete = async () => {
    setIsDelLoading(true);
    if (!deleteModal.category) return;

    try {
      await categoriesApi().delete(deleteModal.category.id);
      toast.success("Category deleted successfully");
      setIsDelLoading(false);
      setDeleteModal({ isOpen: false, category: null });
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
      setIsDelLoading(false)
    }finally{
      setIsDelLoading(false)
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading categories..." />;
  }

  return (
    <div className="space-y-6">
      {/* -------- Header -------- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage menu categories
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => setFormModal({ isOpen: true, category: null })}
        >
          Add Category
        </Button>
      </div>

      {/* -------- Category Tree -------- */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Category Tree
        </h2>

        <CategoryTreeView
          categories={categories}
          onEdit={(category) => setFormModal({ isOpen: true, category })}
          onDelete={(category) => setDeleteModal({ isOpen: true, category })}
        />
      </div>

      {/* -------- Form Modal -------- */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, category: null })}
        title={formModal.category ? "Edit Category" : "Add Category"}
      >
        <CategoryForm
          onSubmit={handleSubmit}
          initialData={formModal.category || undefined}
          categories={categories}
        />
      </Modal>

      {/* -------- Delete Modal -------- */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        title="Delete Category"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong>{deleteModal.category?.name}</strong>? This will also delete
            all subcategories.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteModal({ isOpen: false, category: null })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="danger" disabled={isDelLoading} onClick={handleDelete} className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ================= Tree Renderer ================= */
function CategoryTreeView({
  categories,
  onEdit,
  onDelete,
  level = 0,
}: {
  categories: CategoryTree[];
  onEdit: (cat: CategoryTree) => void;
  onDelete: (cat: CategoryTree) => void;
  level?: number;
}) {
  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <CategoryNode
          key={category.id}
          category={category}
          level={level}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

/* ================= Tree Node ================= */
function CategoryNode({
  category,
  level,
  onEdit,
  onDelete,
}: {
  category: CategoryTree;
  level: number;
  onEdit: (cat: CategoryTree) => void;
  onDelete: (cat: CategoryTree) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      {/* CARD */}
      <div
        className="flex items-center justify-between rounded-xl border bg-card p-4"
        style={{ marginLeft: level * 24 }}
      >
        <div className="flex items-center gap-3">
          {/* Chevron */}
          {hasChildren ? (
            <Button
              onClick={() => setOpen((prev) => !prev)}
              leftIcon={open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              className="text-muted-foreground"
            >
              
            </Button>
          ) : (
            <div className="w-[18px]" />
          )}

          {/* Name */}
          <div>
            <p className="font-semibold">{category.name}</p>
            <p className="text-xs text-muted-foreground">
              Level {category.level}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(category)}>
            <Edit size={14} />
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(category)}
          >
            <Trash size={14} />
          </Button>
        </div>
      </div>

      {/* CHILDREN */}
      {open && hasChildren && (
        <div className="mt-2 space-y-2">
          {category.children!.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}



/* ================= Card ================= */
function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-lg">
              <FolderTree className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {category.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Level {category.level}
              </p>
            </div>
          </div>
          <Badge variant={category.isActive ? "success" : "error"}>
            {category.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {category.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {category.description}
          </p>
        )}

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
