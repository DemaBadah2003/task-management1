import { NextRequest, NextResponse } from "next/server";

async function handleProxy(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api\/proxy/, "");
    const targetUrl = `https://mr89tdrc7j.apidog.io${path}${url.search}`;

    const contentType = req.headers.get("content-type") || "application/json";
    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;

    const res = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "content-type": contentType,
      },
      body,
    });

    const resText = await res.text();

    return new NextResponse(resText, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proxy error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
