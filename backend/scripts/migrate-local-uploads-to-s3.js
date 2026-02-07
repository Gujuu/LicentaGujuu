/* eslint-disable no-console */

const fs = require('fs/promises');
const path = require('path');
const { initDatabase, query } = require('../config/database');
const {
  getStorageDriver,
  getPublicUrlForKey,
  sanitizeFolder,
  slugify,
  putObject,
} = require('../config/mediaStorage');

const args = new Set(process.argv.slice(2));
const DELETE_LOCAL = args.has('--delete-local');

const guessContentType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
};

const uploadLocalFile = async ({ localPath, folder, originalName }) => {
  const body = await fs.readFile(localPath);
  const contentType = guessContentType(originalName);

  // keep original names for migrated assets (easier to search)
  const safeFolder = sanitizeFolder(folder);
  const safeName = `${slugify(path.basename(originalName, path.extname(originalName)))}${path.extname(originalName).toLowerCase()}`;
  const key = [process.env.S3_PREFIX || 'media', safeFolder, safeName].filter(Boolean).join('/');

  const url = await putObject({ key, body, contentType });
  return { key, url };
};

const main = async () => {
  await initDatabase();

  if (getStorageDriver() !== 's3') {
    throw new Error('S3 is not enabled. Set STORAGE_DRIVER=s3 and required AWS env vars.');
  }

  const repoRoot = path.resolve(__dirname, '..', '..');
  const uploadsDir = path.join(repoRoot, 'backend', 'uploads');

  console.log('Scanning DB for local /uploads/* URLs...');

  const menuRows = await query(
    `SELECT i.id as item_id, i.image_url, c.name as category_name
     FROM menu_items i
     JOIN menu_categories c ON c.id = i.category_id
     WHERE i.image_url LIKE '/uploads/%'`
  );

  const wineRows = await query(`SELECT id as wine_id, image_url FROM wines WHERE image_url LIKE '/uploads/%'`);

  let migrated = 0;

  for (const row of menuRows) {
    const filename = String(row.image_url).replace('/uploads/', '');
    const localPath = path.join(uploadsDir, filename);

    try {
      const folder = `menu/items/${row.category_name}`;
      const { url } = await uploadLocalFile({ localPath, folder, originalName: filename });
      await query('UPDATE menu_items SET image_url = ? WHERE id = ?', [url, row.item_id]);
      migrated++;
      if (DELETE_LOCAL) {
        await fs.unlink(localPath).catch(() => undefined);
      }
      console.log(`Menu item ${row.item_id}: ${filename} -> ${url}`);
    } catch (error) {
      console.warn(`Skipping menu item ${row.item_id} (${filename}): ${error?.message || error}`);
    }
  }

  for (const row of wineRows) {
    const filename = String(row.image_url).replace('/uploads/', '');
    const localPath = path.join(uploadsDir, filename);

    try {
      const folder = 'wines';
      const { url } = await uploadLocalFile({ localPath, folder, originalName: filename });
      await query('UPDATE wines SET image_url = ? WHERE id = ?', [url, row.wine_id]);
      migrated++;
      if (DELETE_LOCAL) {
        await fs.unlink(localPath).catch(() => undefined);
      }
      console.log(`Wine ${row.wine_id}: ${filename} -> ${url}`);
    } catch (error) {
      console.warn(`Skipping wine ${row.wine_id} (${filename}): ${error?.message || error}`);
    }
  }

  console.log(`Done. Migrated ${migrated} image references.`);
  console.log('Example public URL format:', getPublicUrlForKey(`${process.env.S3_PREFIX || 'media'}/wines/example.jpg`));
  process.exit(0);
};

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
