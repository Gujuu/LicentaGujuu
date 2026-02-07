/* eslint-disable no-console */

const path = require('path');
const {
  S3Client,
  CopyObjectCommand,
} = require('@aws-sdk/client-s3');

const { initDatabase, query } = require('../config/database');
const {
  getStorageDriver,
  getS3Prefix,
  getPublicUrlForKey,
  extractKeyFromUrlOrKey,
  buildObjectKey,
  toPascalCase,
  ensureFolderPlaceholder,
  deleteObject,
} = require('../config/mediaStorage');

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const DELETE_OLD = args.has('--delete-old');

const bucket = process.env.S3_BUCKET_NAME;

const createS3Client = () => {
  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
};

const shouldReorganizeKey = (key) => {
  if (!key) return false;
  const prefix = getS3Prefix();
  if (!key.startsWith(`${prefix}/`)) return false;

  // Already in the desired structure
  if (key.startsWith(`${prefix}/site/`)) return false;

  return true;
};

const safeExtFromKey = (key) => {
  const ext = path.extname(key || '').toLowerCase();
  if (!ext) return '.jpg';
  if (ext === '.jpeg' || ext === '.jpg' || ext === '.png' || ext === '.gif' || ext === '.webp') return ext;
  return '.jpg';
};

const copyObject = async ({ fromKey, toKey }) => {
  const s3 = createS3Client();

  const params = {
    Bucket: bucket,
    CopySource: `${bucket}/${fromKey}`,
    Key: toKey,
  };

  const acl = (process.env.S3_OBJECT_ACL || '').trim();
  if (acl) params.ACL = acl;

  await s3.send(new CopyObjectCommand(params));
};

const computeMenuItemTargetKey = ({ categoryName, itemName, oldKey }) => {
  const categoryPascal = toPascalCase(categoryName);
  const itemPascal = toPascalCase(itemName);

  const folder = `site/${categoryPascal || 'Unknown'}`;
  const ext = safeExtFromKey(oldKey);
  const baseName = `${categoryPascal || 'Unknown'}${itemPascal || 'Item'}`;

  return buildObjectKey({
    folder,
    originalName: `image${ext}`,
    desiredBaseName: baseName,
  });
};

const computeCategoryTargetKey = ({ categoryName, oldKey }) => {
  const categoryPascal = toPascalCase(categoryName);
  const folder = `site/${categoryPascal || 'Unknown'}`;
  const ext = safeExtFromKey(oldKey);
  const baseName = `${categoryPascal || 'Unknown'}Category`;

  return buildObjectKey({
    folder,
    originalName: `image${ext}`,
    desiredBaseName: baseName,
  });
};

const computeWineTargetKey = ({ wineName, oldKey }) => {
  const winePascal = toPascalCase(wineName);
  const folder = 'site/Vino';
  const ext = safeExtFromKey(oldKey);
  const baseName = `Vino${winePascal || 'Wine'}`;

  return buildObjectKey({
    folder,
    originalName: `image${ext}`,
    desiredBaseName: baseName,
  });
};

const main = async () => {
  await initDatabase();

  if (getStorageDriver() !== 's3') {
    throw new Error('S3 is not enabled. Set STORAGE_DRIVER=s3 and required AWS env vars.');
  }
  if (!bucket) {
    throw new Error('Missing S3_BUCKET_NAME in env.');
  }

  console.log(`Reorganizing S3 media (mode: ${APPLY ? 'APPLY' : 'DRY-RUN'})...`);
  console.log(`Bucket: ${bucket}`);
  console.log(`Prefix: ${getS3Prefix()}`);

  const menuItems = await query(
    `SELECT i.id as item_id, i.name as item_name, i.image_url, c.name as category_name
     FROM menu_items i
     JOIN menu_categories c ON c.id = i.category_id
     WHERE i.image_url IS NOT NULL
       AND i.image_url <> ''
       AND i.image_url NOT LIKE '/uploads/%'`
  );

  const categories = await query(
    `SELECT id as category_id, name as category_name, image_url
     FROM menu_categories
     WHERE image_url IS NOT NULL
       AND image_url <> ''
       AND image_url NOT LIKE '/uploads/%'`
  );

  const wines = await query(
    `SELECT id as wine_id, name as wine_name, image_url
     FROM wines
     WHERE image_url IS NOT NULL
       AND image_url <> ''
       AND image_url NOT LIKE '/uploads/%'`
  );

  let planned = 0;
  let updated = 0;

  const maybeMove = async ({ type, id, oldUrl, targetKey, updateSql, updateParams }) => {
    const oldKey = extractKeyFromUrlOrKey(oldUrl);
    if (!oldKey) return;

    if (!shouldReorganizeKey(oldKey)) return;

    if (oldKey === targetKey) return;

    planned++;
    const newUrl = getPublicUrlForKey(targetKey);

    console.log(`${type} ${id}:`);
    console.log(`  from: ${oldKey}`);
    console.log(`  to:   ${targetKey}`);
    console.log(`  url:  ${newUrl}`);

    if (!APPLY) return;

    const folder = targetKey.split('/').slice(0, -1).join('/').replace(`${getS3Prefix()}/`, '');
    await ensureFolderPlaceholder(folder).catch(() => undefined);

    await copyObject({ fromKey: oldKey, toKey: targetKey });
    await query(updateSql, updateParams(newUrl));

    if (DELETE_OLD) {
      await deleteObject(oldKey).catch(() => undefined);
    }

    updated++;
  };

  for (const row of menuItems) {
    const oldKey = extractKeyFromUrlOrKey(row.image_url);
    if (!oldKey) continue;

    const targetKey = computeMenuItemTargetKey({
      categoryName: row.category_name,
      itemName: row.item_name,
      oldKey,
    });

    await maybeMove({
      type: 'menu_item',
      id: row.item_id,
      oldUrl: row.image_url,
      targetKey,
      updateSql: 'UPDATE menu_items SET image_url = ? WHERE id = ?',
      updateParams: (newUrl) => [newUrl, row.item_id],
    });
  }

  for (const row of categories) {
    const oldKey = extractKeyFromUrlOrKey(row.image_url);
    if (!oldKey) continue;

    const targetKey = computeCategoryTargetKey({
      categoryName: row.category_name,
      oldKey,
    });

    await maybeMove({
      type: 'menu_category',
      id: row.category_id,
      oldUrl: row.image_url,
      targetKey,
      updateSql: 'UPDATE menu_categories SET image_url = ? WHERE id = ?',
      updateParams: (newUrl) => [newUrl, row.category_id],
    });
  }

  for (const row of wines) {
    const oldKey = extractKeyFromUrlOrKey(row.image_url);
    if (!oldKey) continue;

    const targetKey = computeWineTargetKey({
      wineName: row.wine_name,
      oldKey,
    });

    await maybeMove({
      type: 'wine',
      id: row.wine_id,
      oldUrl: row.image_url,
      targetKey,
      updateSql: 'UPDATE wines SET image_url = ? WHERE id = ?',
      updateParams: (newUrl) => [newUrl, row.wine_id],
    });
  }

  console.log('---');
  console.log(`Planned moves: ${planned}`);
  console.log(`DB updated:    ${updated}`);

  if (!APPLY) {
    console.log('Dry-run only. Re-run with --apply to perform changes.');
    console.log('Optional: add --delete-old to remove old random objects after copying.');
  }

  process.exit(0);
};

main().catch((err) => {
  console.error('Reorg failed:', err);
  process.exit(1);
});
