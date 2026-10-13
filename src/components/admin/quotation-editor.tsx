"use client";

import { CurrencyDisplay } from "@/components/shared/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { quoteTotals } from "@/lib/pricing";
import type { QuotationLine } from "@/lib/types";
import { uid } from "@/lib/format";

export function QuotationEditor({
  items,
  depositPercent,
  onItemsChange,
  onDepositChange,
}: {
  items: QuotationLine[];
  depositPercent: number;
  onItemsChange: (items: QuotationLine[]) => void;
  onDepositChange: (value: number) => void;
}) {
  const totals = quoteTotals(items, depositPercent);

  function update(id: string, patch: Partial<QuotationLine>) {
    onItemsChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-auto md:block">
        <table className="w-full text-sm">
          <thead className="text-left text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="py-2">Item</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit price</th>
              <th>Discount %</th>
              <th>Amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const amount = item.quantity * item.unitPrice * (1 - item.discountPercent / 100);
              return (
                <tr key={item.id} className="border-t">
                  <td className="py-2 pr-2"><Input value={item.item} onChange={(event) => update(item.id, { item: event.target.value })} /></td>
                  <td className="pr-2"><Input value={item.description} onChange={(event) => update(item.id, { description: event.target.value })} /></td>
                  <td className="pr-2"><Input type="number" value={item.quantity} onChange={(event) => update(item.id, { quantity: Number(event.target.value) })} /></td>
                  <td className="pr-2"><Input type="number" value={item.unitPrice} onChange={(event) => update(item.id, { unitPrice: Number(event.target.value) })} /></td>
                  <td className="pr-2"><Input type="number" value={item.discountPercent} onChange={(event) => update(item.id, { discountPercent: Number(event.target.value) })} /></td>
                  <td className="pr-2"><CurrencyDisplay value={amount} /></td>
                  <td><Button type="button" size="sm" variant="ghost" onClick={() => onItemsChange(items.filter((line) => line.id !== item.id))}>Remove</Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {items.map((item) => (
          <div key={item.id} className="space-y-2 border border-stone-200 p-3">
            <Input value={item.item} onChange={(event) => update(item.id, { item: event.target.value })} />
            <Input value={item.description} onChange={(event) => update(item.id, { description: event.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" value={item.quantity} onChange={(event) => update(item.id, { quantity: Number(event.target.value) })} />
              <Input type="number" value={item.unitPrice} onChange={(event) => update(item.id, { unitPrice: Number(event.target.value) })} />
              <Input type="number" value={item.discountPercent} onChange={(event) => update(item.id, { discountPercent: Number(event.target.value) })} />
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => onItemsChange(items.filter((line) => line.id !== item.id))}>Remove item</Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          onItemsChange([
            ...items,
            { id: uid("ql"), item: "New item", description: "", quantity: 1, unitPrice: 0, discountPercent: 0 },
          ])
        }
      >
        Add Item
      </Button>
      <div className="ml-auto max-w-sm space-y-2 text-sm">
        <Row label="Subtotal" value={totals.subtotal} />
        <Row label="Discount" value={totals.discount} />
        <Row label="Grand total" value={totals.grandTotal} />
        <label className="flex items-center justify-between gap-3">
          Deposit %
          <Input className="h-9 w-24" type="number" value={depositPercent} onChange={(event) => onDepositChange(Number(event.target.value))} />
        </label>
        <Row label="Deposit" value={totals.deposit} />
        <Row label="Remaining balance" value={totals.balance} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <CurrencyDisplay value={value} />
    </div>
  );
}
