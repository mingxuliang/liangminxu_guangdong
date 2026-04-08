# Sealos Production Storage

## Overview

The knowledge extraction backend now supports two session storage drivers:

- `file`: local JSON files under `server/data/sessions`
- `postgres`: PostgreSQL-backed persistence for production

When `KE_STORAGE_DRIVER` is not set, the server auto-selects:

- `postgres` if `DATABASE_URL` or `PGHOST`/`PGDATABASE`/`PGUSER` is configured
- `file` otherwise

Uploaded assets also support Sealos S3-compatible object storage.

## Recommended Production Settings

### Session Storage

Use PostgreSQL in production:

```env
KE_STORAGE_DRIVER=postgres
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_SSL=0
```

If your Sealos PostgreSQL endpoint requires SSL:

```env
DATABASE_SSL=1
```

The backend auto-creates these tables on startup:

- `ke_sessions`
- `ke_assets`

### Object Storage

Use Sealos object storage in production:

```env
OSS_ENDPOINT=https://objectstorageapi.hzh.sealos.run
OSS_ACCESS_KEY_ID=your-access-key
OSS_SECRET_ACCESS_KEY=your-secret-key
OSS_BUCKET=your-bucket
OSS_REGION=us-east-1
OSS_PREFIX=prod
OSS_FORCE_PATH_STYLE=1
```

## Environment Isolation

Do not mix development and production data in the same path prefix.

Recommended prefixes:

- local/devbox: `OSS_PREFIX=dev`
- production: `OSS_PREFIX=prod`

If local and production share one PostgreSQL instance, use separate databases or schemas.

## Audio Handling

Audio files are uploaded to object storage when OSS is configured.

During transcription:

1. The backend downloads the audio to a temporary local path.
2. The ASR pipeline reads that temporary file.
3. The temporary file is deleted immediately after transcription.

This avoids production dependence on persistent local disks.

## Health Check

`GET /api/health` now includes:

- `session_storage`
- `postgres_configured`
- `object_storage`
- `oss_prefix`

Use this endpoint after deployment to verify the runtime configuration.
