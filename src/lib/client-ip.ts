import { createHash } from "node:crypto";
import { isIP } from "node:net";

/**
 * RENPLAY — Client IP Extraction, Trust Boundary, and Normalization
 * 
 * Security Architecture & Trust Boundary:
 * 1. Authoritative Platform Header:
 *    On Vercel (https://renplay.site), the edge infrastructure injects and guarantees
 *    `x-vercel-forwarded-for`. External clients cannot spoof this header because Vercel edge
 *    terminates the TLS connection and sets or overwrites it with the socket IP.
 * 2. Strict Trust Boundary:
 *    Headers like `cf-connecting-ip` are ONLY trusted when `TRUST_CLOUDFLARE_PROXY === "true"`.
 *    In production on Vercel, arbitrary `x-real-ip` or `x-forwarded-for` injected by clients
 *    are NOT accepted as authentic network identities.
 * 3. No Fictitious Fallback:
 *    If no trusted header is present or valid, the IP is explicitly represented as `null`.
 *    The application NEVER substitutes `127.0.0.1` for unknown external clients.
 * 4. Canonical Normalization (RFC 5952):
 *    All equivalent IPv4 and IPv6 representations map to the exact same normalized string.
 */

export interface ClientIpInfo {
  ip: string | null;
  normalizedIp: string | null;
  sourceHeader: string | null;
  isReliable: boolean;
  ipHash: string | null;
  maskedIp: string;
}

/**
 * Normalizes an IPv4 address.
 * Strips port if present, validates octets 0-255, removes leading zeros.
 */
export function normalizeIpv4(raw: string): string | null {
  let cleaned = raw.trim();
  // Strip port if present (e.g. 192.168.1.1:8080)
  if (cleaned.includes(":") && !cleaned.includes("[")) {
    const parts = cleaned.split(":");
    if (parts.length === 2 && /^\d+$/.test(parts[1])) {
      cleaned = parts[0];
    }
  }

  const octets = cleaned.split(".");
  if (octets.length !== 4) return null;

  const normalizedOctets: number[] = [];
  for (const octet of octets) {
    if (!/^\d{1,3}$/.test(octet)) return null;
    const num = Number(octet);
    if (num < 0 || num > 255) return null;
    normalizedOctets.push(num);
  }

  return normalizedOctets.join(".");
}

/**
 * Normalizes an IPv6 address according to RFC 5952.
 * - Expands abbreviations
 * - Converts IPv4-mapped addresses (::ffff:192.0.2.1) to standard IPv4
 * - Formats all blocks as lowercase hex without leading zeros
 * - Compresses the longest run of 2 or more consecutive zero-blocks with ::
 */
export function normalizeIpv6(raw: string): string | null {
  let cleaned = raw.trim();

  // Strip brackets and port if formatted as [2001:db8::1]:443
  if (cleaned.startsWith("[") && cleaned.includes("]")) {
    const closingIdx = cleaned.indexOf("]");
    cleaned = cleaned.slice(1, closingIdx);
  }

  // Handle IPv4-mapped IPv6 addresses (e.g., ::ffff:192.0.2.1 or 0:0:0:0:0:ffff:192.0.2.1)
  const lastColon = cleaned.lastIndexOf(":");
  if (lastColon !== -1) {
    const potentialIpv4 = cleaned.slice(lastColon + 1);
    if (potentialIpv4.includes(".")) {
      const ipv4Normalized = normalizeIpv4(potentialIpv4);
      if (!ipv4Normalized) return null;

      const prefix = cleaned.slice(0, lastColon).toLowerCase();
      if (
        prefix === "::ffff" ||
        prefix === "0:0:0:0:0:ffff" ||
        prefix === "::ffff:0" ||
        prefix === ":ffff"
      ) {
        return ipv4Normalized;
      }

      // Convert dotted decimal into two 16-bit hex blocks
      const [o1, o2, o3, o4] = ipv4Normalized.split(".").map(Number);
      const b1 = ((o1 << 8) | o2).toString(16);
      const b2 = ((o3 << 8) | o4).toString(16);
      cleaned = `${cleaned.slice(0, lastColon)}:${b1}:${b2}`;
    }
  }

  // Check general IPv6 structure
  if (cleaned.split("::").length > 2) return null; // At most one '::' is allowed

  let blocks: string[];
  if (cleaned.includes("::")) {
    const [leftStr, rightStr] = cleaned.split("::");
    const leftBlocks = leftStr ? leftStr.split(":").filter(Boolean) : [];
    const rightBlocks = rightStr ? rightStr.split(":").filter(Boolean) : [];
    const missingCount = 8 - (leftBlocks.length + rightBlocks.length);
    if (missingCount < 1) return null;
    const zeros = new Array(missingCount).fill("0");
    blocks = [...leftBlocks, ...zeros, ...rightBlocks];
  } else {
    blocks = cleaned.split(":");
  }

  if (blocks.length !== 8) return null;

  // Convert each block to an integer (0 to 0xffff)
  const numbers: number[] = [];
  for (const b of blocks) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(b)) return null;
    const num = parseInt(b, 16);
    if (Number.isNaN(num) || num < 0 || num > 0xffff) return null;
    numbers.push(num);
  }

  // Check if it's an IPv4-mapped address in pure hex (e.g. 0:0:0:0:0:ffff:c000:201)
  if (
    numbers[0] === 0 &&
    numbers[1] === 0 &&
    numbers[2] === 0 &&
    numbers[3] === 0 &&
    numbers[4] === 0 &&
    numbers[5] === 0xffff
  ) {
    const octet1 = (numbers[6] >> 8) & 0xff;
    const octet2 = numbers[6] & 0xff;
    const octet3 = (numbers[7] >> 8) & 0xff;
    const octet4 = numbers[7] & 0xff;
    return `${octet1}.${octet2}.${octet3}.${octet4}`;
  }

  // Find longest run of consecutive 0s per RFC 5952
  let maxZeroStart = -1;
  let maxZeroLen = 0;
  let curZeroStart = -1;
  let curZeroLen = 0;

  for (let i = 0; i < 8; i++) {
    if (numbers[i] === 0) {
      if (curZeroStart === -1) {
        curZeroStart = i;
        curZeroLen = 1;
      } else {
        curZeroLen++;
      }
    } else {
      if (curZeroLen > maxZeroLen) {
        maxZeroLen = curZeroLen;
        maxZeroStart = curZeroStart;
      }
      curZeroStart = -1;
      curZeroLen = 0;
    }
  }
  if (curZeroLen > maxZeroLen) {
    maxZeroLen = curZeroLen;
    maxZeroStart = curZeroStart;
  }

  // RFC 5952: A single 0 must NOT be compressed to ::
  if (maxZeroLen < 2) {
    maxZeroStart = -1;
    maxZeroLen = 0;
  }

  const hexStrings = numbers.map((n) => n.toString(16));

  if (maxZeroStart !== -1) {
    const left = hexStrings.slice(0, maxZeroStart).join(":");
    const right = hexStrings.slice(maxZeroStart + maxZeroLen).join(":");
    return `${left}::${right}`;
  }

  return hexStrings.join(":");
}

/**
 * Normalizes any valid IPv4 or IPv6 string into a canonical, equivalent-proof representation.
 * Returns null if the string is not a valid IP address.
 */
export function normalizeIp(rawIp: string): string | null {
  if (!rawIp || typeof rawIp !== "string") return null;
  const trimmed = rawIp.trim();
  if (!trimmed) return null;

  // Try IPv4 first
  const ipv4 = normalizeIpv4(trimmed);
  if (ipv4 && isIP(ipv4) === 4) {
    return ipv4;
  }

  // Try IPv6
  const ipv6 = normalizeIpv6(trimmed);
  if (ipv6) {
    if (isIP(ipv6) === 4) return ipv6;
    if (isIP(ipv6) === 6) return ipv6;
  }

  return null;
}

/**
 * SHA-256 hash of normalized IP for storage in rp_limits or log identifiers.
 */
export function hashIp(normalizedIp: string): string {
  return createHash("sha256").update(normalizedIp).digest("hex");
}

/**
 * Masks an IP address for safe logging without storing sensitive user network identity.
 * IPv4: 192.168.1.5 -> 192.168.***.***
 * IPv6: 2001:db8::1 -> 2001:db8:****:****
 */
export function maskIp(ip: string | null): string {
  if (!ip) return "unverified-origin";
  if (isIP(ip) === 4) {
    const parts = ip.split(".");
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  if (isIP(ip) === 6) {
    const parts = ip.split(":");
    return `${parts.slice(0, 2).join(":")}:****:****`;
  }
  return "unverified-origin";
}

/**
 * Extracts and validates the client IP from an incoming HTTP Request.
 * 
 * Strict Trust Model:
 * 1. `x-vercel-forwarded-for`: Authoritatively injected by Vercel Edge.
 * 2. `cf-connecting-ip`: ONLY trusted if `TRUST_CLOUDFLARE_PROXY === "true"`.
 * 3. Non-production / test fallback: If running in test or local development,
 *    allows simulated proxy headers (`x-forwarded-for`), but strictly flags `isReliable: false`.
 * 4. No trusted IP found: Returns `null` normalizedIp and `isReliable: false`.
 *    NEVER returns `127.0.0.1` as a fictitious identity for external clients.
 */
export function extractClientIp(request: Request): ClientIpInfo {
  const headers = request.headers;
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  const trustCloudflare = process.env.TRUST_CLOUDFLARE_PROXY === "true";

  // 1. Vercel Authoritative Header (Primary on Vercel infrastructure)
  const vercelHeader = headers.get("x-vercel-forwarded-for");
  if (vercelHeader) {
    // Vercel edge guarantees the client IP. In multi-proxy chains, take the client IP (first element)
    const candidate = vercelHeader.split(",")[0]?.trim();
    if (candidate) {
      const normalized = normalizeIp(candidate);
      if (normalized) {
        return {
          ip: candidate,
          normalizedIp: normalized,
          sourceHeader: "x-vercel-forwarded-for",
          isReliable: true,
          ipHash: hashIp(normalized),
          maskedIp: maskIp(normalized),
        };
      }
    }
  }

  // 2. Cloudflare Connecting IP (ONLY when explicitly configured via environment variable)
  if (trustCloudflare) {
    const cfHeader = headers.get("cf-connecting-ip");
    if (cfHeader) {
      const normalized = normalizeIp(cfHeader);
      if (normalized) {
        return {
          ip: cfHeader,
          normalizedIp: normalized,
          sourceHeader: "cf-connecting-ip",
          isReliable: true,
          ipHash: hashIp(normalized),
          maskedIp: maskIp(normalized),
        };
      }
    }
  }

  // 3. Non-production / Test Environment Simulation
  // In development or local unit tests without Vercel Edge, allow testing with x-forwarded-for / x-real-ip
  // but strictly mark isReliable: false so production never relies on client-supplied values.
  if (!isProduction) {
    const realIp = headers.get("x-real-ip");
    if (realIp) {
      const normalized = normalizeIp(realIp);
      if (normalized) {
        return {
          ip: realIp,
          normalizedIp: normalized,
          sourceHeader: "x-real-ip",
          isReliable: false,
          ipHash: hashIp(normalized),
          maskedIp: maskIp(normalized),
        };
      }
    }

    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
      const candidate = forwarded.split(",")[0]?.trim();
      if (candidate) {
        const normalized = normalizeIp(candidate);
        if (normalized) {
          return {
            ip: candidate,
            normalizedIp: normalized,
            sourceHeader: "x-forwarded-for",
            isReliable: false,
            ipHash: hashIp(normalized),
            maskedIp: maskIp(normalized),
          };
        }
      }
    }
  }

  // 4. Absence of reliable client IP
  // Crucial: Do NOT assign 127.0.0.1. Return null to allow conservative rate limiting
  return {
    ip: null,
    normalizedIp: null,
    sourceHeader: null,
    isReliable: false,
    ipHash: null,
    maskedIp: "unverified-origin",
  };
}
