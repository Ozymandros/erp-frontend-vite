"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDateTime } from "@/lib/utils";
import type { AccountDto, ContactDto } from "@/types/api.types";
import { crmAccountsService } from "@/api/services/crm-accounts.service";
import { crmContactsService } from "@/api/services/crm-contacts.service";
import { UpdateAccountOwnerDialog } from "@/components/crm/update-account-owner-dialog";

export function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [account, setAccount] = useState<AccountDto | null>(null);
  const [contacts, setContacts] = useState<ContactDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [acc, contactList] = await Promise.all([
        crmAccountsService.getAccountById(id),
        crmContactsService.getContactsByAccount(id),
      ]);
      setAccount(acc);
      setContacts(contactList);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch account");
      setAccount(null);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link to="/crm/accounts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Accounts
          </Button>
        </Link>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading account...</p>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="space-y-6">
        <Link to="/crm/accounts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Accounts
          </Button>
        </Link>
        <div className="text-center text-destructive py-8">
          <p>{error || "Account not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/crm/accounts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Accounts
          </Button>
        </Link>

        <div className="flex gap-2">
          <Button onClick={() => setIsOwnerOpen(true)}>Change Owner</Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-base font-medium">{account.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer ID</p>
                <p className="text-base font-medium">{account.customerId}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Owner</p>
                <p className="text-base font-medium">{account.ownerUsername ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-base font-medium">
                  {account.isActive ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {(account.billingAddress || account.shippingAddress) && (
              <div className="grid gap-4 md:grid-cols-2">
                {account.billingAddress && (
                  <div>
                    <p className="text-sm text-muted-foreground">Billing Address</p>
                    <p className="text-base font-medium">{account.billingAddress}</p>
                  </div>
                )}
                {account.shippingAddress && (
                  <div>
                    <p className="text-sm text-muted-foreground">Shipping Address</p>
                    <p className="text-base font-medium">{account.shippingAddress}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-base font-medium">{formatDateTime(account.createdAt)}</p>
            </div>
            {account.updatedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Updated</p>
                <p className="text-base font-medium">{formatDateTime(account.updatedAt)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Last Synced</p>
              <p className="text-base font-medium">{formatDateTime(account.lastSyncedAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-muted-foreground">No contacts for this account.</p>
            ) : (
              <div className="space-y-3">
                {contacts.map(c => (
                  <div key={c.id} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{c.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.email ?? c.phone ?? "-"}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {c.isPrimary ? "Primary" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UpdateAccountOwnerDialog
        open={isOwnerOpen}
        onOpenChange={setIsOwnerOpen}
        onSuccess={refresh}
        accountId={account.id}
        initialOwnerUsername={account.ownerUsername}
      />
    </div>
  );
}

