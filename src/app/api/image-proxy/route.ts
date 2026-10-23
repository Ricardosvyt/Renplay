import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return new NextResponse("URL required", { status: 400 });
  }

  // Se já for uma URL local
  if (urlParam.startsWith("/")) {
    return NextResponse.redirect(new URL(urlParam, request.url));
  }

  try {
    const parsed = new URL(urlParam);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return new NextResponse("Invalid protocol", { status: 400 });
    }

    // Configura cabeçalhos adequados para contornar proteções de hotlink
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    };

    // F95Zone e anexos exigem o próprio domínio como Referer
    if (parsed.hostname.includes("f95zone.to")) {
      headers["Referer"] = "https://f95zone.to/";
    }

    const response = await fetch(urlParam, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`[ImageProxy] Status ${response.status} ao carregar: ${urlParam}`);
      return NextResponse.redirect(new URL("/images/so-much-to-love-cover.jpg", request.url));
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.warn(`[ImageProxy] Erro de rede ao carregar: ${urlParam}`, (error as Error).message);
    return NextResponse.redirect(new URL("/images/so-much-to-love-cover.jpg", request.url));
  }
}
