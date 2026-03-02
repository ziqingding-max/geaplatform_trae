import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";

// Initialize S3 Client (compatible with Alibaba Cloud OSS)
const s3Client = new S3Client({
  region: ENV.ossRegion || "oss-cn-hangzhou",
  endpoint: ENV.ossEndpoint || `https://oss-cn-hangzhou.aliyuncs.com`,
  credentials: {
    accessKeyId: ENV.ossAccessKeyId,
    secretAccessKey: ENV.ossAccessKeySecret,
  },
  forcePathStyle: false, // OSS usually supports virtual-hosted style, but some private clouds need true
});

const BUCKET_NAME = ENV.ossBucket;

/**
 * Upload a file to Alibaba Cloud OSS (S3 Compatible)
 * Returns the object key and a public URL (if bucket is public) or just the key.
 * For private buckets, use storageGet() to retrieve a signed URL.
 */
export async function storagePut(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  if (!ENV.ossAccessKeyId || !ENV.ossAccessKeySecret || !BUCKET_NAME) {
    throw new Error("OSS credentials or bucket not configured");
  }

  // Ensure key doesn't start with slash
  const normalizedKey = key.replace(/^\/+/, "");

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: normalizedKey,
    Body: body,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
    
    // Construct a direct URL (assuming public read or for reference)
    // Note: For private buckets, this URL won't be accessible directly without signing.
    // We return it here to maintain compatibility with the previous interface.
    // Real access should go through storageGet() which signs the URL.
    const endpoint = ENV.ossEndpoint || `https://${ENV.ossRegion}.aliyuncs.com`;
    // Clean up endpoint to be just the hostname if it includes protocol
    const endpointHost = endpoint.replace(/^https?:\/\//, "");
    const url = `https://${BUCKET_NAME}.${endpointHost}/${normalizedKey}`;

    return { key: normalizedKey, url };
  } catch (error) {
    console.error("[Storage] Upload failed:", error);
    throw new Error(`Storage upload failed: ${error}`);
  }
}

/**
 * Get a signed URL for downloading a file from Alibaba Cloud OSS
 */
export async function storageGet(key: string): Promise<{ key: string; url: string }> {
  if (!ENV.ossAccessKeyId || !ENV.ossAccessKeySecret || !BUCKET_NAME) {
    throw new Error("OSS credentials or bucket not configured");
  }

  const normalizedKey = key.replace(/^\/+/, "");

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: normalizedKey,
  });

  try {
    // Generate a signed URL valid for 1 hour (3600 seconds)
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return { key: normalizedKey, url };
  } catch (error) {
    console.error("[Storage] Get signed URL failed:", error);
    throw new Error(`Storage get failed: ${error}`);
  }
}
