"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productsService } from "@/api/services/products.service";
import type { ProductDto, PaginatedResponse, QuerySpec } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, Eye, ArrowUpDown, AlertTriangle } from "lucide-react";
import { CreateProductDialog } from "@/components/inventory/create-product-dialog";
import { EditProductDialog } from "@/components/inventory/edit-product-dialog";
import { DeleteProductDialog } from "@/components/inventory/delete-product-dialog";

export function ProductsListPage() {
  const [products, setProducts] = useState<PaginatedResponse<ProductDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [querySpec, setQuerySpec] = useState<QuerySpec>({
    page: 1,
    pageSize: 10,
    searchTerm: "",
    searchFields: "sku,name,category",
    sortBy: "createdAt",
    sortDesc: true,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductDto | null>(null);
  const [showLowStock, setShowLowStock] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productsService.searchProducts(querySpec);
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLowStockProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productsService.getLowStockProducts();
      setProducts({
        items: data,
        page: 1,
        pageSize: data.length,
        total: data.length,
        hasNext: false,
        hasPrevious: false,
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch low stock products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showLowStock) {
      fetchLowStockProducts();
    } else {
      fetchProducts();
    }
  }, [querySpec, showLowStock]);

  const handleSearch = (value: string) => {
    setQuerySpec((prev) => ({ ...prev, searchTerm: value, page: 1 }));
  };

  const handleSort = (field: string) => {
    setQuerySpec((prev) => ({
      ...prev,
      sortBy: field,
      sortDesc: prev.sortBy === field ? !prev.sortDesc : false,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setQuerySpec((prev) => ({ ...prev, page: newPage }));
  };

  const handleProductCreated = () => {
    setIsCreateDialogOpen(false);
    setShowLowStock(false);
    fetchProducts();
  };

  const handleProductUpdated = () => {
    setEditingProduct(null);
    if (showLowStock) {
      fetchLowStockProducts();
    } else {
      fetchProducts();
    }
  };

  const handleProductDeleted = () => {
    setDeletingProduct(null);
    if (showLowStock) {
      fetchLowStockProducts();
    } else {
      fetchProducts();
    }
  };

  const totalPages = products
    ? Math.ceil(products.total / querySpec.pageSize)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your inventory products
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Products</CardTitle>
              <CardDescription>
                {products ? `${products.total} total products` : "Loading..."}
              </CardDescription>
            </div>
            <Button
              variant={showLowStock ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {showLowStock ? "Show All" : "Low Stock"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!showLowStock && (
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by SKU, name, or category..."
                  className="pl-10"
                  value={querySpec.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-8">
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          )}

          {!isLoading && products && products.items.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No products found</p>
            </div>
          )}

          {!isLoading && products && products.items.length > 0 && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          className="flex items-center hover:text-foreground"
                          onClick={() => handleSort("sku")}
                        >
                          SKU
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          className="flex items-center hover:text-foreground"
                          onClick={() => handleSort("name")}
                        >
                          Name
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>
                        <button
                          className="flex items-center hover:text-foreground"
                          onClick={() => handleSort("unitPrice")}
                        >
                          Unit Price
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Reorder Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.items.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.sku}
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          {product.category || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>${product.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <span
                            className={
                              product.stock <= product.reorderLevel
                                ? "text-red-600 font-semibold"
                                : ""
                            }
                          >
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell>{product.reorderLevel}</TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/inventory/products/${product.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingProduct(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingProduct(product)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {!showLowStock && totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {querySpec.page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(querySpec.page - 1)}
                      disabled={!products.hasPrevious}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(querySpec.page + 1)}
                      disabled={!products.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CreateProductDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleProductCreated}
      />

      <EditProductDialog
        product={editingProduct}
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        onSuccess={handleProductUpdated}
      />

      <DeleteProductDialog
        product={deletingProduct}
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        onSuccess={handleProductDeleted}
      />
    </div>
  );
}
