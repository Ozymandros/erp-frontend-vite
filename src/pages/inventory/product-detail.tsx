"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productsService } from "@/api/services/products.service";
import type { ProductDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { EditProductDialog } from "@/components/inventory/edit-product-dialog";
import { DeleteProductDialog } from "@/components/inventory/delete-product-dialog";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { handleApiError, isForbiddenError, getForbiddenMessage, getErrorMessage } from "@/lib/error-handling";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await productsService.getProductById(id);
      setProduct(data);
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      // Handle 403 Forbidden (permission denied) with user-friendly message
      if (isForbiddenError(apiError)) {
        setError(getForbiddenMessage("product"));
      } else {
        setError(getErrorMessage(apiError, "Failed to fetch product"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleProductUpdated = () => {
    setIsEditDialogOpen(false);
    fetchProduct();
  };

  const handleProductDeleted = () => {
    navigate("/inventory/products");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/inventory/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/inventory/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
        <div className="text-center text-red-500 py-8">
          <p>{error || "Product not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/inventory/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Basic product details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                SKU
              </label>
              <p className="text-lg font-semibold">{product.sku}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="text-lg">{product.name}</p>
            </div>
            {product.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="text-base">{product.description}</p>
              </div>
            )}


          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
            <CardDescription>Price and stock information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Unit Price
              </label>
              <p className="text-lg font-semibold">
                {formatCurrency(product.unitPrice)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Current Stock
              </label>
              <p
                className={`text-lg font-semibold ${
                  product.quantityInStock <= product.reorderLevel
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {product.quantityInStock} units
              </p>
              {product.quantityInStock <= product.reorderLevel && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ Below reorder level
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Reorder Level
              </label>
              <p className="text-base">{product.reorderLevel} units</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Audit Information</CardTitle>
            <CardDescription>Creation and modification history</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created At
              </label>
              <p className="text-base">{formatDateTime(product.createdAt)}</p>
              {product.createdBy && (
                <p className="text-sm text-muted-foreground">
                  by {product.createdBy}
                </p>
              )}
            </div>
            {product.updatedAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="text-base">{formatDateTime(product.updatedAt)}</p>
                {product.updatedBy && (
                  <p className="text-sm text-muted-foreground">
                    by {product.updatedBy}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditProductDialog
        product={product}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleProductUpdated}
      />

      <DeleteProductDialog
        product={product}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleProductDeleted}
      />
    </div>
  );
}
