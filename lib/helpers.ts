import { Weights } from "@/lib/weight";

export function DateToUTCDate(date: Date) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );
}
export async function fetchTransactionById(id: number) {
  const response = await fetch(`/api/transactions/${id}`);
  if (!response.ok) throw new Error("Failed to fetch transaction");
  return await response.json();
}


export function GetFormatterForWeight(defaultUnit: string) {
  const weightInfo = Weights.find((w) => w.value === defaultUnit);

  if (!weightInfo) {
    throw new Error(`Invalid defaultUnit: ${defaultUnit}`);
  }

  return new Intl.NumberFormat(weightInfo.locale, {
    style: "defaultUnit",
    defaultUnit: weightInfo.intlDefaultUnit,  // Use the valid Intl defaultUnit name
    defaultUnitDisplay: "short",
  });
}