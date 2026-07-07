import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  return redirectToCheckout(request, formData);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  return redirectToCheckout(request, url.searchParams);
}

function redirectToCheckout(request: Request, values: FormData | URLSearchParams) {
  const requestUrl = new URL(request.url);
  const checkoutUrl = new URL("/checkout", requestUrl.origin);
  const extraData = getValue(values, "ExtraData");
  const storeId = getValue(values, "CVSStoreID");
  const storeName = getValue(values, "CVSStoreName");
  const storeAddress = getValue(values, "CVSAddress");
  const storeTelephone = getValue(values, "CVSTelephone");

  checkoutUrl.searchParams.set("shipping", "711");
  if (extraData === "1") checkoutUrl.searchParams.set("guest", "1");
  if (storeId) checkoutUrl.searchParams.set("cvsStoreId", storeId);
  if (storeName) checkoutUrl.searchParams.set("cvsStoreName", storeName);
  if (storeAddress) checkoutUrl.searchParams.set("cvsAddress", storeAddress);
  if (storeTelephone) checkoutUrl.searchParams.set("cvsTelephone", storeTelephone);

  return NextResponse.redirect(checkoutUrl);
}

function getValue(values: FormData | URLSearchParams, key: string) {
  const value = values.get(key);
  return typeof value === "string" ? value : "";
}
