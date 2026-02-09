"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { customersService } from "@/api/services/customers.service";
import type { CustomerDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ArrowLeft } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await customersService.getCustomerById(id);
        setCustomer(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch customer");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link to="/sales/customers"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Customers</Button></Link>
        <div className="text-center py-8"><p className="text-muted-foreground">Loading customer...</p></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <Link to="/sales/customers"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Customers</Button></Link>
        <div className="text-center text-red-500 py-8"><p>{error || "Customer not found"}</p></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/sales/customers"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Customers</Button></Link>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Basic customer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><span className="text-sm font-medium text-muted-foreground">Name</span><p className="text-lg font-semibold">{customer.name}</p></div>
            {customer.email && <div><span className="text-sm font-medium text-muted-foreground">Email</span><p className="text-base">{customer.email}</p></div>}
            {customer.phoneNumber && <div><span className="text-sm font-medium text-muted-foreground">Phone</span><p className="text-base">{customer.phoneNumber}</p></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
            <CardDescription>Customer address details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.address && <div><span className="text-sm font-medium text-muted-foreground">Street Address</span><p className="text-base">{customer.address}</p></div>}

          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Audit Information</CardTitle>
            <CardDescription>Creation and modification history</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div><span className="text-sm font-medium text-muted-foreground">Created At</span><p className="text-base">{formatDateTime(customer.createdAt)}</p></div>
            {customer.updatedAt && <div><span className="text-sm font-medium text-muted-foreground">Last Updated</span><p className="text-base">{formatDateTime(customer.updatedAt)}</p></div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
