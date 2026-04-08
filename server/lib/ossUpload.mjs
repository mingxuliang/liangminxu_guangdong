import { createReadStream, createWriteStream } from 'node:fs';
import { promises as fsp } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { GetObjectCommand, S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

function getClient() {
  const endpoint = process.env.OSS_ENDPOINT?.trim();
  const accessKeyId = process.env.OSS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.OSS_SECRET_ACCESS_KEY?.trim();
  if (!endpoint || !accessKeyId || !secretAccessKey) return null;

  return new S3Client({
    region: process.env.OSS_REGION?.trim() || 'us-east-1',
    endpoint: endpoint.replace(/\/$/, ''),
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: Boolean(process.env.OSS_FORCE_PATH_STYLE !== '0'),
  });
}

export function isOssConfigured() {
  return Boolean(getClient() && process.env.OSS_BUCKET?.trim());
}

export function getOssPrefix() {
  const explicit = process.env.OSS_PREFIX?.trim().replace(/^\/+|\/+$/g, '');
  if (explicit) return explicit;
  return process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
}

export function withOssPrefix(objectKey) {
  const cleanKey = String(objectKey || '').replace(/^\/+/, '');
  const prefix = getOssPrefix();
  return prefix ? `${prefix}/${cleanKey}` : cleanKey;
}

/**
 * 上传本地文件到 Sealos 等 S3 兼容对象存储。
 * @returns {{ bucket: string, key: string } | null} 未配置 OSS 时返回 null
 */
export async function putLocalFileToOss({ localPath, objectKey, contentType }) {
  const client = getClient();
  const bucket = process.env.OSS_BUCKET?.trim();
  if (!client || !bucket) return null;

  const finalKey = withOssPrefix(objectKey);
  const stream = createReadStream(localPath);
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: finalKey,
      Body: stream,
      ContentType: contentType || 'application/octet-stream',
    })
  );

  return { bucket, key: finalKey };
}

export async function downloadOssFileToLocal({ bucket, objectKey, localPath }) {
  const client = getClient();
  const targetBucket = bucket || process.env.OSS_BUCKET?.trim();
  if (!client || !targetBucket) {
    throw new Error('对象存储未配置，无法下载文件');
  }

  await fsp.mkdir(path.dirname(localPath), { recursive: true });

  const res = await client.send(
    new GetObjectCommand({
      Bucket: targetBucket,
      Key: objectKey,
    })
  );

  if (!res.Body) {
    throw new Error(`对象存储返回空内容: ${objectKey}`);
  }

  if (typeof res.Body.pipe === 'function') {
    await pipeline(res.Body, createWriteStream(localPath));
    return localPath;
  }

  if (typeof res.Body.transformToByteArray === 'function') {
    const bytes = await res.Body.transformToByteArray();
    await fsp.writeFile(localPath, Buffer.from(bytes));
    return localPath;
  }

  throw new Error(`不支持的对象存储响应体类型: ${objectKey}`);
}
