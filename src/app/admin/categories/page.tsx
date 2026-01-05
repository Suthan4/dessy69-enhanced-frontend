"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, FolderTree } from "lucide-react";
import { categoriesApi } from "@/lib/api/categories";
import { Category } from "@/lib/types/category";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Loading } from "@/components/ui/Loading";
import { toast } from "sonner";
import { CategoryForm } from "../../../components/admin/categoryForm";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({ isOpen: false, category: null });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({ isOpen: false, category: null });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi().getAll();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleDelete = async () => {
    if (!deleteModal.category) return;

    try {
      await categoriesApi().delete(deleteModal.category.id);
      toast.success("Category deleted successfully");
      setDeleteModal({ isOpen: false, category: null });
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading categories..." />;
  }

  console.log("categories", categories);
  // Group categories by level
  const rootCategories = categories?.data?.filter((cat:Category) => cat.level === 0);
  const childCategories = categories?.data?.filter(
    (cat: Category) => cat.level > 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage menu categories ({categories?.length})
          </p>
        </div>
        <Button onClick={() => setFormModal({ isOpen: true, category: null })}>
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Root Categories */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Main Categories
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rootCategories?.map((category: Category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={() => setFormModal({ isOpen: true, category })}
              onDelete={() => setDeleteModal({ isOpen: true, category })}
            />
          ))}
        </div>
      </div>

      {/* Child Categories */}
      {childCategories?.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Sub Categories
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {childCategories?.map((category: Category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={() => setFormModal({ isOpen: true, category })}
                onDelete={() => setDeleteModal({ isOpen: true, category })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, category: null })}
        title={formModal.category ? "Edit Category" : "Add Category"}
      >
        <CategoryForm
          onSubmit={handleSubmit}
          initialData={formModal.category || undefined}
          categories={categories?.data}
        />
      </Modal>

      {/* Delete Modal */}
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
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

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
