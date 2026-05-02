"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ContactDto } from "@/types/api.types";
import { crmContactsService } from "@/api/services/crm-contacts.service";

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [contact, setContact] = useState<ContactDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");

  const refresh = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await crmContactsService.getContactById(id);
      setContact(data);
      setFullName(data.fullName ?? "");
      setEmail(data.email ?? "");
      setPhone(data.phone ?? "");
      setTitle(data.title ?? "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch contact");
      setContact(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSave = async () => {
    if (!contact) return;
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        fullName,
        email: email || undefined,
        phone: phone || undefined,
        title: title || undefined,
      };
      await crmContactsService.updateContact(id, payload);
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update contact");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPrimary = async () => {
    if (!contact) return;
    setIsLoading(true);
    setError(null);
    try {
      await crmContactsService.setPrimaryContact(contact.accountId, {
        contactId: contact.id,
      });
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to set primary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!contact) return;
    setIsLoading(true);
    setError(null);
    try {
      await crmContactsService.deactivateContact(contact.id);
      window.location.href = "/crm/contacts";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to deactivate contact");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link to="/crm/contacts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Button>
        </Link>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading contact...</p>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="space-y-6">
        <Link to="/crm/contacts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Button>
        </Link>
        <div className="text-center text-destructive py-8">
          <p>{error || "Contact not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/crm/contacts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button onClick={() => void handleSetPrimary()}>
            {contact.isPrimary ? "Primary" : "Set Primary"}
          </Button>
          <Button variant="destructive" onClick={() => void handleDeactivate()}>
            Deactivate
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                disabled={isLoading}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={isLoading}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={isLoading}
                className="mt-2"
              />
            </div>

            <Button onClick={() => void handleSave()} disabled={isLoading}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Account ID</p>
              <p className="font-medium">{contact.accountId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Primary</p>
              <p className="font-medium">{contact.isPrimary ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="font-medium">{contact.isActive ? "Yes" : "No"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

