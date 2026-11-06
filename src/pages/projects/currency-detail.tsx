import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { projectCurrenciesService } from "@/api/services/project-currencies.service";
import type { ProjectCurrencyDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateExchangeRateDialog } from "@/components/projects/create-exchange-rate-dialog";
import { useModulePermissions } from "@/hooks/use-permissions";
import { formatDateTime } from "@/lib/utils";

export function CurrencyDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [currency, setCurrency] = useState<ProjectCurrencyDto | null>(null);
  const [isRateOpen, setIsRateOpen] = useState(false);
  const { canUpdate } = useModulePermissions("projects");

  const refresh = useCallback(async () => {
    if (!code) return;
    setCurrency(await projectCurrenciesService.getCurrencyByCode(code));
  }, [code]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!currency) {
    return <p className="p-6 text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <Link to="/projects/currencies">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>
            {currency.code} — {currency.description}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p>Symbol: {currency.symbol ?? "—"}</p>
          <p>Local currency: {currency.isLocalCurrency ? "Yes" : "No"}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Exchange rates</CardTitle>
          {canUpdate ? (
            <Button size="sm" onClick={() => setIsRateOpen(true)}>
              Add rate
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {currency.exchangeRates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rates</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {currency.exchangeRates.map((rate) => (
                <li key={rate.id} className="flex justify-between gap-4">
                  <span>{formatDateTime(rate.startingDate)}</span>
                  <span>{rate.rateToLocal}</span>
                  {canUpdate ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        void projectCurrenciesService
                          .deleteExchangeRate(currency.code, rate.id)
                          .then(refresh)
                      }
                    >
                      Remove
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <CreateExchangeRateDialog
        currencyCode={currency.code}
        open={isRateOpen}
        onOpenChange={setIsRateOpen}
        onSuccess={refresh}
      />
    </div>
  );
}
