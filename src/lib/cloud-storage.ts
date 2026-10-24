import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createHash } from "node:crypto";
import { Readable } from "node:stream";

export interface R2Config {
  endpoint: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

let s3ClientInstance: S3Client | null = null;
let mockStorageStore: Map<string, { buffer: Buffer; sha256: string; size: number }> | null = null;

/**
 * Checks if the Cloudflare R2 environment variables are configured.
 */
export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ENDPOINT &&
    process.env.R2_BUCKET &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
  );
}

/**
 * Enables in-memory mock storage mode for automated tests when R2 credentials are not set.
 */
export function enableMockStorage(enable = true): void {
  if (enable) {
    if (!mockStorageStore) {
      mockStorageStore = new Map();
    }
  } else {
    mockStorageStore = null;
  }
}

export function isMockStorageEnabled(): boolean {
  return mockStorageStore !== null;
}

/**
 * Returns the S3Client instance configured for Cloudflare R2.
 */
export function getR2Client(): S3Client {
  if (s3ClientInstance) {
    return s3ClientInstance;
  }

  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const region = process.env.R2_REGION || "auto";

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Cloudflare R2 não está configurado no servidor.");
  }

  // Ensure base endpoint does not accidentally contain bucket path
  const parsed = new URL(endpoint);
  parsed.pathname = "";

  s3ClientInstance = new S3Client({
    region,
    endpoint: parsed.origin,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });

  return s3ClientInstance;
}

export function getR2BucketName(): string {
  const bucket = process.env.R2_BUCKET || "renplay01";
  return bucket;
}

/**
 * Generates a presigned PUT URL for direct-to-R2 upload with short TTL.
 */
export async function createPresignedUploadUrl(
  objectKey: string,
  sizeBytes: number,
  expiresInSeconds = 120
): Promise<string> {
  if (mockStorageStore) {
    // In mock mode, return a local mock URL
    return `https://mock-r2.local/${encodeURIComponent(objectKey)}?expires=${expiresInSeconds}&size=${sizeBytes}`;
  }

  const client = getR2Client();
  const bucket = getR2BucketName();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentLength: sizeBytes,
    ContentType: "application/octet-stream"
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generates a presigned GET URL for direct-from-R2 download with short TTL.
 */
export async function createPresignedDownloadUrl(
  objectKey: string,
  expiresInSeconds = 120
): Promise<string> {
  if (mockStorageStore) {
    return `https://mock-r2.local/download/${encodeURIComponent(objectKey)}?expires=${expiresInSeconds}`;
  }

  const client = getR2Client();
  const bucket = getR2BucketName();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: objectKey
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Computes the SHA-256 hash of a readable stream.
 */
async function computeStreamSha256(stream: Readable): Promise<{ hash: string; bytesRead: number }> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    let bytesRead = 0;

    stream.on("data", (chunk: Buffer) => {
      bytesRead += chunk.length;
      hash.update(chunk);
    });

    stream.on("end", () => {
      resolve({ hash: hash.digest("hex"), bytesRead });
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Verifies object existence, actual size, and SHA-256 integrity,
 * then promotes it from temporary prefix to permanent object key.
 */
export async function verifyAndPromoteObject(
  temporaryKey: string,
  finalKey: string,
  expectedSize: number,
  expectedSha256: string
): Promise<{ verifiedSize: number; verifiedSha256: string }> {
  if (mockStorageStore) {
    const item = mockStorageStore.get(temporaryKey);
    if (!item) {
      throw new Error("Arquivo temporário não encontrado no armazenamento.");
    }
    if (item.size !== expectedSize) {
      throw new Error(`Tamanho do arquivo (${item.size}) difere do esperado (${expectedSize}).`);
    }
    if (item.sha256.toLowerCase() !== expectedSha256.toLowerCase()) {
      throw new Error("Checksum SHA-256 do arquivo difere do esperado.");
    }
    mockStorageStore.set(finalKey, item);
    mockStorageStore.delete(temporaryKey);
    return { verifiedSize: item.size, verifiedSha256: item.sha256 };
  }

  const client = getR2Client();
  const bucket = getR2BucketName();

  // 1. Check head object to verify it exists and verify ContentLength
  const head = await client.send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: temporaryKey
    })
  );

  const actualSize = head.ContentLength ?? 0;
  if (actualSize !== expectedSize) {
    // Delete invalid temporary object
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: temporaryKey })).catch(() => undefined);
    throw new Error(`Tamanho do arquivo (${actualSize}) difere do esperado (${expectedSize}).`);
  }

  // 2. Stream object to compute SHA-256
  const getObj = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: temporaryKey
    })
  );

  if (!getObj.Body) {
    throw new Error("Não foi possível ler o corpo do arquivo no armazenamento.");
  }

  const stream = getObj.Body as Readable;
  const { hash: actualHash, bytesRead } = await computeStreamSha256(stream);

  if (bytesRead !== expectedSize) {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: temporaryKey })).catch(() => undefined);
    throw new Error(`Contagem de bytes lidos (${bytesRead}) difere do esperado (${expectedSize}).`);
  }

  if (actualHash.toLowerCase() !== expectedSha256.toLowerCase()) {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: temporaryKey })).catch(() => undefined);
    throw new Error("Checksum SHA-256 do arquivo difere do esperado.");
  }

  // 3. Promote to permanent key
  await client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${temporaryKey}`,
      Key: finalKey
    })
  );

  // 4. Delete temporary object
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: temporaryKey
    })
  );

  return { verifiedSize: actualSize, verifiedSha256: actualHash };
}

/**
 * Deletes an object from R2 storage.
 */
export async function deleteObject(objectKey: string): Promise<boolean> {
  if (mockStorageStore) {
    return mockStorageStore.delete(objectKey);
  }

  const client = getR2Client();
  const bucket = getR2BucketName();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: objectKey
    })
  );

  return true;
}

/**
 * Mock helper for test suites: injects a file into mock store.
 */
export function mockUploadFile(key: string, buffer: Buffer): void {
  if (!mockStorageStore) {
    mockStorageStore = new Map();
  }
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  mockStorageStore.set(key, { buffer, sha256, size: buffer.length });
}
