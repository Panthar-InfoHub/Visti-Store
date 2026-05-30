import { AddressesList } from "@/components/store/account/addresses-list";
import { Suspense } from "react";
import { AddressesSkeleton } from "@/components/store/account/addresses-skeleton";

export default function AddressesPage() {
  return (
    <Suspense fallback={<AddressesSkeleton />}>
      <AddressesList />
    </Suspense>
  );
}
