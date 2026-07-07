import { NextResponse } from "next/server";
import { ecpayLogisticsConfig } from "@/config/logistics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const siteUrl = ecpayLogisticsConfig.siteUrl || url.origin;
  const guest = url.searchParams.get("guest") === "1" ? "1" : "0";
  const serverReplyUrl = `${siteUrl}/api/logistics/711-callback`;
  const fields = {
    MerchantID: ecpayLogisticsConfig.merchantId,
    MerchantTradeNo: createMerchantTradeNo(),
    LogisticsType: "CVS",
    LogisticsSubType: "UNIMART",
    IsCollection: "N",
    ServerReplyURL: serverReplyUrl,
    ExtraData: guest,
    Device: "0"
  };

  return new NextResponse(renderAutoSubmitForm(ecpayLogisticsConfig.mapUrl, fields), {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}

function createMerchantTradeNo() {
  return `CVS${Date.now().toString().slice(-12)}`;
}

function renderAutoSubmitForm(action: string, fields: Record<string, string>) {
  const inputs = Object.entries(fields)
    .map(([name, value]) => `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" />`)
    .join("\n");

  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>前往 7-11 門市選擇</title>
  </head>
  <body>
    <form id="ecpay-cvs-map" action="${escapeHtml(action)}" method="post">
      ${inputs}
      <noscript>
        <button type="submit">前往 7-11 門市選擇</button>
      </noscript>
    </form>
    <script>
      document.getElementById("ecpay-cvs-map").submit();
    </script>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
