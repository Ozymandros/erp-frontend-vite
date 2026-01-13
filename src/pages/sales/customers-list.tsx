"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { customersService } from "@/api/services/customers.service";
import type { CustomerDto, PaginatedResponse, QuerySpec } from "@/types/api.types";
import { handleApiError, isForbiddenError, getForbiddenMessage, getErrorMessage } from "@/lib/error-handling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Eye } from "lucide-react";
import { CreateCustomerDialog } from "@/components/sales/create-customer-dialog";

export function CustomersListPage() {
  const [customers, setCustomers] = useState<PaginatedResponse<CustomerDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [querySpec, setQuerySpec] = useState<QuerySpec>({ page: 1, pageSize: 10, searchTerm: "", searchFields: "name,email,city,country", sortBy: "createdAt", sortDesc: true });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await customersService.searchCustomers(querySpec);
      setCustomers(data);
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      // Handle 403 Forbidden (permission denied) with user-friendly message
      if (isForbiddenError(apiError)) {
        setError(getForbiddenMessage("customers"));
      } else {
        setError(getErrorMessage(apiError, "Failed to fetch customers"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [querySpec]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (value: string) => {
    setQuerySpec((prev) => ({ ...prev, searchTerm: value, page: 1 }));
  };

  const handleCustomerCreated = () => {
    setIsCreateDialogOpen(false);
    fetchCustomers();
  };

  const totalPages = customers ? Math.ceil(customers.total / (querySpec.pageSize ?? 20)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customers</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>{customers ? `${customers.total} total customers` : "Loading..."}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, email, city, or country..." className="pl-10" value={querySpec.searchTerm} onChange={(e) => handleSearch(e.target.value)} />
            </div>
          </div>

          {error && <div className="text-center text-red-500 py-8"><p>{error}</p></div>}
          {isLoading && <div className="text-center py-8"><p className="text-muted-foreground">Loading customers...</p></div>}
          {!isLoading && customers && customers.items.length === 0 && <div className="text-center py-8"><p className="text-muted-foreground">No customers found</p></div>}

          {!isLoading && customers && customers.items.length > 0 && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.items.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email || <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell>{customer.phone || <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell>{customer.city || <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell>{customer.country || <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell><Badge variant={customer.isActive ? "default" : "secondary"}>{customer.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/sales/customers/${customer.id}`}>
                              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {querySpec.page} of {totalPages}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setQuerySpec(prev => ({ ...prev, page: (prev.page ?? 1) - 1 }))} disabled={!customers.hasPreviousPage}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setQuerySpec(prev => ({ ...prev, page: (prev.page ?? 1) + 1 }))} disabled={!customers.hasNextPage}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CreateCustomerDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSuccess={handleCustomerCreated} />
    </div>
  );
}
