"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { suppliersService } from "@/api/services/suppliers.service";
import type { SupplierDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useModulePermissions } from "@/hooks/use-permissions";
import { EditSupplierDialog } from "@/components/purchasing/edit-supplier-dialog";
import { DeleteSupplierDialog } from "@/components/purchasing/delete-supplier-dialog";

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<SupplierDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { canUpdate, canDelete } = useModulePermissions("purchasing");

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await suppliersService.getSupplierById(id);
        setSupplier(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch supplier");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSupplier();
  }, [id]);

  const handleUpdated = () => {
    setIsEditOpen(false);
    if (id) {
      suppliersService.getSupplierById(id).then(setSupplier).catch(() => {});
    }
  };

  const handleDeleted = () => {
    setIsDeleteOpen(false);
    navigate("/purchasing/suppliers");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link to="/purchasing/suppliers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Suppliers
          </Button>
        </Link>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading supplier...</p>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="space-y-6">
        <Link to="/purchasing/suppliers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Suppliers
          </Button>
        </Link>
        <div className="text-center text-red-500 py-8">
          <p>{error || "Supplier not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/purchasing/suppliers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Suppliers
          </Button>
        </Link>
        <div className="flex gap-2">
          {canUpdate && (
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" size="sm" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>Supplier contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-lg font-semibold">{supplier.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-base">{supplier.email}</p>
            </div>
            {supplier.phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-base">{supplier.phone}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p className="mt-1">
                <Badge variant={supplier.isActive ? "default" : "secondary"}>
                  {supplier.isActive ? "Active" : "Inactive"}
                </Badge>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
            <CardDescription>Supplier address details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Street Address</label>
                <p className="text-base">{supplier.address}</p>
              </div>
            )}
            {(supplier.city || supplier.country || supplier.postalCode) && (
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {supplier.city && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">City</label>
                    <p className="text-base">{supplier.city}</p>
                  </div>
                )}
                {supplier.country && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Country</label>
                    <p className="text-base">{supplier.country}</p>
                  </div>
                )}
                {supplier.postalCode && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Postal Code</label>
                    <p className="text-base">{supplier.postalCode}</p>
                  </div>
                )}
              </div>
            )}
            {!supplier.address && !supplier.city && !supplier.country && !supplier.postalCode && (
              <p className="text-muted-foreground text-sm">No address on file</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Audit Information</CardTitle>
            <CardDescription>Creation and modification history</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created At</label>
              <p className="text-base">{formatDateTime(supplier.createdAt)}</p>
            </div>
            {supplier.updatedAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-base">{formatDateTime(supplier.updatedAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {canUpdate && (
        <EditSupplierDialog
          supplier={supplier}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSuccess={handleUpdated}
        />
      )}

      {canDelete && (
        <DeleteSupplierDialog
          supplier={supplier}
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onSuccess={handleDeleted}
        />
      )}
    </div>
  );
}
