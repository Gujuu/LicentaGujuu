const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');

const isMeaningfulEnvValue = (value) => {
  if (!value) return false;
  const v = String(value).trim();
  if (!v) return false;

  // Common placeholder patterns from .env.example files
  const lower = v.toLowerCase();
  if (lower.startsWith('your_')) return false;
  if (lower === 'changeme' || lower === 'change_me') return false;
  if (lower === 'example' || lower === 'example_value') return false;
  if (lower === 'dummy' || lower === 'dummy_key' || lower === 'dummy_secret') return false;

  return true;
};

const getStorageDriver = () => {
  const forced = (process.env.STORAGE_DRIVER || '').toLowerCase().trim();
  if (forced === 's3' || forced === 'local') return forced;

  const hasS3 =
    isMeaningfulEnvValue(process.env.S3_BUCKET_NAME) &&
    isMeaningfulEnvValue(process.env.AWS_REGION) &&
    isMeaningfulEnvValue(process.env.AWS_ACCESS_KEY_ID) &&
    isMeaningfulEnvValue(process.env.AWS_SECRET_ACCESS_KEY);

  return hasS3 ? 's3' : 'local';
};

const getS3Prefix = () => {
  const prefix = (process.env.S3_PREFIX || 'media').trim();
  return prefix.replace(/^\/+|\/+$/g, '');
};

const slugify = (value) => {
  if (!value) return 'unknown';
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'unknown';
};

const toPascalCase = (value) => {
  if (!value) return '';
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^A-Za-z0-9]+/g)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join('');
};

const sanitizeFolder = (folder) => {
  if (!folder) return '';

  const cleaned = String(folder)
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .map((segment) => String(segment).trim())
    .filter(Boolean)
    .map((segment) =>
      segment
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\.+/g, '')
        .replace(/[^A-Za-z0-9_-]+/g, '')
        .slice(0, 80)
    )
    .filter(Boolean)
    .join('/');

  return cleaned;
};

const sanitizeFileBaseName = (value) => {
  if (!value) return '';
  const ext = path.extname(String(value));
  const withoutExt = ext ? String(value).slice(0, -ext.length) : String(value);
  return withoutExt
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '')
    .slice(0, 120);
};

const buildObjectKey = ({ folder, originalName, desiredBaseName }) => {
  const ext = path.extname(originalName || '').toLowerCase() || '.jpg';
  const prefix = getS3Prefix();
  const safeFolder = sanitizeFolder(folder);

  const requestedBase = sanitizeFileBaseName(desiredBaseName);
  if (requestedBase) {
    return [prefix, safeFolder, `${requestedBase}${ext}`].filter(Boolean).join('/');
  }

  const base = path.basename(originalName || 'image', ext);
  const safeName = `${slugify(base)}${ext}`;
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  const parts = [prefix];
  if (safeFolder) parts.push(safeFolder);
  parts.push(`${unique}-${safeName}`);
  return parts.join('/');
};

const ensureFolderPlaceholder = async (folder) => {
  const safeFolder = sanitizeFolder(folder);
  if (!safeFolder) return false;

  const key = `${getS3Prefix()}/${safeFolder.replace(/\/+$/g, '')}/`;
  const s3 = createS3Client();

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: '',
      ContentType: 'application/x-directory',
    })
  );

  return true;
};

const createS3Client = () => {
  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: (process.env.AWS_SESSION_TOKEN || '').trim() || undefined,
    },
  });
};

const getPublicUrlForKey = (key) => {
  const base = (process.env.S3_PUBLIC_BASE_URL || '').trim();
  if (base) {
    return `${base.replace(/\/+$/g, '')}/${key.replace(/^\/+/, '')}`;
  }

  const bucket = process.env.S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  if (!bucket || !region) return key;

  if (region === 'us-east-1') {
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

const extractKeyFromUrlOrKey = (urlOrKey) => {
  if (!urlOrKey) return null;
  const raw = String(urlOrKey).trim();
  if (!raw) return null;

  // If it already looks like a key (contains no scheme), just return it
  if (!/^https?:\/\//i.test(raw)) {
    return raw.replace(/^\/+/, '');
  }

  try {
    const u = new URL(raw);
    return u.pathname.replace(/^\/+/, '');
  } catch {
    // fallback: last resort
    return raw.split('?')[0].replace(/^\/+/, '');
  }
};

const putObject = async ({ key, body, contentType }) => {
  const s3 = createS3Client();
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: body,
  };

  if (contentType) params.ContentType = contentType;

  // Optional ACL (some buckets disable ACLs)
  const acl = (process.env.S3_OBJECT_ACL || '').trim();
  if (acl) params.ACL = acl;

  await s3.send(new PutObjectCommand(params));
  return getPublicUrlForKey(key);
};

const deleteObject = async (urlOrKey) => {
  const key = extractKeyFromUrlOrKey(urlOrKey);
  if (!key) return false;

  const s3 = createS3Client();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    })
  );
  return true;
};

module.exports = {
  getStorageDriver,
  getS3Prefix,
  slugify,
  toPascalCase,
  sanitizeFolder,
  buildObjectKey,
  createS3Client,
  getPublicUrlForKey,
  extractKeyFromUrlOrKey,
  putObject,
  deleteObject,
  ensureFolderPlaceholder,
};
