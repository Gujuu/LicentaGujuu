/* eslint-disable no-console */

const path = require('path');
const fs = require('fs/promises');
const { initDatabase, query } = require('../config/database');
const { getStorageDriver, putObject, getPublicUrlForKey, slugify } = require('../config/mediaStorage');

const args = new Set(process.argv.slice(2));
const SHOULD_RESET = args.has('--reset') || args.has('--fresh');

const STATIC_MENU = [
  {
    name: 'Antipasti',
    description: 'Starters',
    imageFile: null,
    items: [
      {
        name: 'Bruschetta Classica',
        short_description: 'Grilled bread rubbed with garlic, topped with fresh tomatoes, basil, and extra virgin olive oil',
        full_description:
          'Our bruschetta starts with rustic Tuscan bread, grilled to perfection and rubbed with fresh garlic while still warm. Topped generously with vine-ripened tomatoes, fragrant basil leaves, and finished with a drizzle of our finest Sicilian extra virgin olive oil. A timeless Italian classic that showcases the beauty of simple, quality ingredients.',
        price: 28,
        imageFile: 'antipasti-bruschetta.jpg',
        allergens: ['Gluten'],
        ingredients: ['Tuscan bread', 'Roma tomatoes', 'Fresh basil', 'Garlic', 'Extra virgin olive oil', 'Sea salt'],
      },
      {
        name: 'Carpaccio di Manzo',
        short_description:
          'Thinly sliced raw beef with wild arugula, Parmigiano-Reggiano shavings, and aged balsamic',
        full_description:
          'Premium beef tenderloin, hand-sliced paper-thin and arranged artfully on a bed of peppery wild arugula. Crowned with shavings of 24-month aged Parmigiano-Reggiano and finished with drops of 12-year aged balsamic from Modena. Each bite melts on your tongue with a perfect balance of savory and tangy notes.',
        price: 52,
        imageFile: 'antipasti-carpaccio.jpg',
        allergens: ['Dairy'],
        ingredients: ['Beef tenderloin', 'Wild arugula', 'Parmigiano-Reggiano DOP', 'Aged balsamic vinegar', 'Extra virgin olive oil', 'Black pepper'],
      },
      {
        name: 'Burrata con Pomodorini',
        short_description:
          'Creamy burrata cheese with cherry tomatoes, fresh basil pesto, and crusty bread',
        full_description:
          'Fresh burrata from Puglia, its creamy stracciatella center flowing onto the plate when cut. Surrounded by sweet Datterini cherry tomatoes and dollops of our house-made basil pesto with pine nuts. Served with warm, crusty bread to capture every delicious morsel. A celebration of Italian dairy craftsmanship.',
        price: 48,
        imageFile: 'antipasti-burrata.jpg',
        allergens: ['Dairy', 'Gluten', 'Tree Nuts'],
        ingredients: ['Burrata cheese', 'Datterini tomatoes', 'Fresh basil', 'Pine nuts', 'Garlic', 'Crusty bread', 'Extra virgin olive oil'],
      },
    ],
  },
  {
    name: 'Primi',
    description: 'First Courses',
    imageFile: null,
    items: [
      {
        name: 'Tagliatelle al Tartufo',
        short_description:
          'Fresh egg pasta with black truffle, Parmigiano cream, and shaved truffle',
        full_description:
          'Silky ribbons of fresh egg tagliatelle, made daily in our kitchen, tossed in a luxurious cream sauce infused with black truffle and aged Parmigiano. Generously topped with shavings of fresh seasonal truffle that release their intoxicating aroma at the table. A dish that embodies the essence of Italian luxury.',
        price: 78,
        imageFile: 'primi-tagliatelle.jpg',
        allergens: ['Gluten', 'Eggs', 'Dairy'],
        ingredients: ['Fresh egg pasta', 'Black truffle', 'Parmigiano-Reggiano', 'Heavy cream', 'Butter', 'White wine', 'Shallots'],
      },
      {
        name: 'Risotto ai Funghi Porcini',
        short_description:
          'Carnaroli rice slow-cooked with wild porcini mushrooms, white wine, and aged Parmigiano',
        full_description:
          "Creamy Carnaroli rice from the Po Valley, patiently stirred and ladled with rich mushroom broth. Wild porcini mushrooms, foraged from Italian forests, add their earthy depth. Finished with butter and 36-month aged Parmigiano for the perfect 'all'onda' wave consistency that defines a masterful risotto.",
        price: 62,
        imageFile: 'primi-risotto.jpg',
        allergens: ['Dairy', 'Sulphites'],
        ingredients: ['Carnaroli rice', 'Porcini mushrooms', 'Vegetable broth', 'White wine', 'Parmigiano-Reggiano', 'Butter', 'Shallots', 'Fresh thyme'],
      },
      {
        name: 'Spaghetti alle Vongole',
        short_description:
          'Spaghetti with fresh clams in white wine sauce, garlic, chili, and fresh parsley',
        full_description:
          'Al dente spaghetti embraced by the briny sweetness of fresh Adriatic clams, opened just moments before in a fragrant bath of white wine, garlic, and a whisper of Calabrian chili. Finished with a shower of fresh parsley and a drizzle of the finest olive oil. The taste of the Italian coast on your plate.',
        price: 68,
        imageFile: 'primi-vongole.jpg',
        allergens: ['Gluten', 'Shellfish', 'Sulphites'],
        ingredients: ['Spaghetti', 'Fresh clams', 'White wine', 'Garlic', 'Calabrian chili', 'Fresh parsley', 'Extra virgin olive oil'],
      },
    ],
  },
  {
    name: 'Secondi',
    description: 'Main Courses',
    imageFile: null,
    items: [
      {
        name: 'Ossobuco alla Milanese',
        short_description:
          'Slow-braised veal shank with saffron risotto and traditional gremolata',
        full_description:
          'Cross-cut veal shank, braised for hours until the meat surrenders to your fork. The marrow melts into the rich tomato and wine sauce, creating depth of flavor that can only come from time and tradition. Served atop creamy saffron risotto and crowned with bright gremolata of lemon zest, garlic, and parsley.',
        price: 98,
        imageFile: 'secondi-ossobuco.jpg',
        allergens: ['Dairy', 'Sulphites'],
        ingredients: ['Veal shank', 'Saffron risotto', 'Tomatoes', 'White wine', 'Beef broth', 'Lemon zest', 'Garlic', 'Fresh parsley', 'Celery', 'Carrots', 'Onion'],
      },
      {
        name: 'Branzino al Forno',
        short_description:
          'Whole Mediterranean sea bass baked with herbs, lemon, and seasonal vegetables',
        full_description:
          'A whole Mediterranean sea bass, sourced daily from trusted fishermen, roasted to golden perfection with sprigs of rosemary, thyme, and slices of fresh lemon nestled inside. Accompanied by a medley of seasonal vegetables kissed by the same fragrant cooking juices. Presented whole and filleted tableside.',
        price: 112,
        imageFile: 'secondi-branzino.jpg',
        allergens: ['Fish'],
        ingredients: ['Whole sea bass', 'Fresh rosemary', 'Thyme', 'Lemon', 'Seasonal vegetables', 'Extra virgin olive oil', 'White wine', 'Garlic'],
      },
      {
        name: 'Saltimbocca alla Romana',
        short_description:
          'Veal cutlets wrapped in prosciutto and sage, finished with white wine butter sauce',
        full_description:
          "Tender veal escalopes, each lovingly wrapped with a slice of prosciutto di Parma and a fresh sage leaf. Pan-seared until the prosciutto crisps and the sage releases its aromatic oils, then finished with a silky white wine and butter sauce. The name means 'jumps in the mouth' – and you'll understand why with the first bite.",
        price: 88,
        imageFile: 'secondi-saltimbocca.jpg',
        allergens: ['Dairy'],
        ingredients: ['Veal escalopes', 'Prosciutto di Parma', 'Fresh sage', 'White wine', 'Butter', 'Black pepper'],
      },
    ],
  },
  {
    name: 'Dolci',
    description: 'Desserts',
    imageFile: null,
    items: [
      {
        name: 'Tiramisù',
        short_description:
          'Classic layers of espresso-soaked savoiardi, mascarpone cream, and cocoa powder',
        full_description:
          'Our signature tiramisù follows a treasured family recipe. Delicate savoiardi biscuits, soaked in freshly brewed espresso and a touch of Marsala, layered with clouds of mascarpone cream enriched with egg yolks and sugar. Rested overnight to marry the flavors, then dusted with premium cocoa. Pure Italian comfort.',
        price: 32,
        imageFile: 'dolci-tiramisu.jpg',
        allergens: ['Gluten', 'Eggs', 'Dairy', 'Alcohol'],
        ingredients: ['Mascarpone cheese', 'Savoiardi biscuits', 'Espresso coffee', 'Eggs', 'Sugar', 'Marsala wine', 'Cocoa powder'],
      },
      {
        name: 'Panna Cotta',
        short_description: 'Silky vanilla cream with seasonal berry coulis and fresh berries',
        full_description:
          "A quivering dome of Piedmontese cream, gently set with just enough gelatin to hold its shape while melting on your tongue. Infused with vanilla from Madagascar and topped with a vibrant coulis of seasonal berries and fresh fruit. Simple, elegant, and utterly addictive – the essence of Italian dessert philosophy.",
        price: 28,
        imageFile: 'dolci-pannacotta.jpg',
        allergens: ['Dairy'],
        ingredients: ['Heavy cream', 'Vanilla bean', 'Sugar', 'Gelatin', 'Seasonal berries', 'Lemon juice'],
      },
      {
        name: 'Cannoli Siciliani',
        short_description:
          'Crispy pastry tubes filled with sweet ricotta, pistachios, and chocolate chips',
        full_description:
          'Crispy, golden pastry shells imported from Sicily, filled to order with fresh ricotta cream sweetened with powdered sugar and studded with dark chocolate chips. The ends are dipped in crushed Bronte pistachios, their vibrant green color a signature of authenticity. A crunchy, creamy tribute to Sicilian tradition.',
        price: 34,
        imageFile: 'dolci-cannoli.jpg',
        allergens: ['Gluten', 'Dairy', 'Tree Nuts'],
        ingredients: ['Cannoli shells', 'Fresh ricotta', 'Powdered sugar', 'Dark chocolate chips', 'Bronte pistachios', 'Candied orange peel'],
      },
    ],
  },
];

const STATIC_WINES = [
  {
    name: 'Chianti Classico DOCG',
    region: 'Tuscany',
    description:
      'Medium-bodied red with notes of cherry, plum, and subtle earthy undertones. Perfect with pasta and grilled meats.',
    full_description:
      "From the heart of Tuscany's Chianti Classico region, this wine embodies centuries of winemaking tradition. The Sangiovese grapes, grown on sun-drenched hillsides, produce a wine with vibrant acidity, silky tannins, and a bouquet of cherry, violet, and hints of leather. Aged in oak barrels to develop complexity while maintaining the fresh fruit character that makes Chianti so food-friendly.",
    price_glass: 28,
    price_bottle: 145,
    imageFile: 'wine-chianti.jpg',
    grape: 'Sangiovese',
    pairing: ['Tagliatelle al Tartufo', 'Saltimbocca alla Romana', 'Bruschetta Classica'],
    is_available: true,
  },
  {
    name: 'Barolo DOCG',
    region: 'Piedmont',
    description:
      "Full-bodied, elegant red with aromas of roses, tar, and dark fruit. The 'King of Wines' pairs beautifully with rich dishes.",
    full_description:
      "Rightfully called the 'King of Wines', this Barolo comes from the prestigious Langhe hills of Piedmont. Made from 100% Nebbiolo grapes and aged for a minimum of 38 months, it offers an extraordinarily complex profile: dried roses, tar, truffle, and dark cherries unfold in layers. Firm tannins promise decades of aging potential, yet it's already approachable with rich, hearty dishes.",
    price_glass: 48,
    price_bottle: 285,
    imageFile: 'wine-barolo.jpg',
    grape: 'Nebbiolo',
    pairing: ['Ossobuco alla Milanese', 'Risotto ai Funghi Porcini', 'Carpaccio di Manzo'],
    is_available: true,
  },
  {
    name: 'Pinot Grigio DOC',
    region: 'Alto Adige',
    description:
      'Crisp, refreshing white with hints of citrus, green apple, and white flowers. Ideal with seafood and light appetizers.',
    full_description:
      "From the cool, alpine vineyards of Alto Adige, where crisp mountain air and dramatic temperature swings create wines of exceptional freshness and minerality. This Pinot Grigio displays a pale straw color with delicate aromas of white peach, citrus zest, and almond blossom. Clean and refreshing on the palate with a lingering mineral finish that makes it an ideal aperitivo or seafood companion.",
    price_glass: 24,
    price_bottle: 115,
    imageFile: 'wine-pinotgrigio.jpg',
    grape: 'Pinot Grigio',
    pairing: ['Branzino al Forno', 'Spaghetti alle Vongole', 'Burrata con Pomodorini'],
    is_available: true,
  },
  {
    name: 'Prosecco DOCG',
    region: 'Veneto',
    description:
      'Lively sparkling wine with delicate bubbles and notes of pear, apple, and acacia. Perfect for celebrations or as an aperitivo.',
    full_description:
      "From the steep hills of Valdobbiadene, where the finest Prosecco is crafted, comes this elegant sparkling wine. The Glera grapes are hand-harvested and gently pressed to preserve their delicate aromatics. Fine, persistent bubbles carry notes of green apple, white pear, and acacia flowers to the palate. Dry yet fruity, it's the perfect way to begin a meal or toast a special moment.",
    price_glass: 26,
    price_bottle: 125,
    imageFile: 'wine-prosecco.jpg',
    grape: 'Glera',
    pairing: ['Antipasti', 'Light appetizers', 'Celebrations'],
    is_available: true,
  },
];

const guessContentType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
};

const getSeedKeyForImage = (imageFile, categoryName) => {
  if (!imageFile) return null;
  const prefix = process.env.S3_PREFIX || 'media';
  const cat = categoryName ? slugify(categoryName) : 'misc';
  const lower = String(imageFile).toLowerCase();
  if (lower.startsWith('wine-')) return `${prefix}/wines/${imageFile}`;
  return `${prefix}/menu/items/${cat}/${imageFile}`;
};

const ensureMediaUploaded = async () => {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const fromDir = path.join(repoRoot, 'frontend', 'src', 'assets', 'menu');

  const files = await fs.readdir(fromDir);
  const driver = getStorageDriver();

  if (driver === 'local') {
    const toDir = path.join(repoRoot, 'backend', 'uploads');
    await fs.mkdir(toDir, { recursive: true });

    for (const file of files) {
      const src = path.join(fromDir, file);
      const dst = path.join(toDir, file);

      try {
        await fs.copyFile(src, dst);
      } catch (error) {
        console.warn(`Failed copying ${file}:`, error?.message || error);
      }
    }

    console.log(`Copied ${files.length} menu images to ${toDir}`);
    return;
  }

  // S3 mode: upload static assets using stable keys for easy browsing
  for (const file of files) {
    const src = path.join(fromDir, file);
    const body = await fs.readFile(src);
    const contentType = guessContentType(file);

    // Derive folder from filename: wine-* => wines, otherwise first segment before '-' => category
    const lower = String(file).toLowerCase();
    const categoryFromFilename = lower.includes('-') ? lower.split('-')[0] : 'misc';
    const cat = lower.startsWith('wine-') ? undefined : categoryFromFilename;
    const key = getSeedKeyForImage(file, cat);
    if (!key) continue;

    try {
      await putObject({ key, body, contentType });
    } catch (error) {
      console.warn(`Failed uploading ${file} to S3:`, error?.message || error);
    }
  }

  console.log(`Uploaded ${files.length} menu images to S3 under ${process.env.S3_PREFIX || 'media'}/`);
};

const upsertCategory = async (name, description, image_url) => {
  const existing = await query('SELECT id FROM menu_categories WHERE name = ? ORDER BY id LIMIT 1', [name]);
  if (existing.length > 0) {
    const id = existing[0].id;
    await query('UPDATE menu_categories SET description = ?, image_url = ? WHERE id = ?', [description || null, image_url || null, id]);
    return id;
  }

  const result = await query('INSERT INTO menu_categories (name, description, image_url) VALUES (?, ?, ?)', [name, description || null, image_url || null]);
  return result.insertId;
};

const upsertItem = async (categoryId, categoryName, item) => {
  const existing = await query(
    'SELECT id FROM menu_items WHERE category_id = ? AND name = ? ORDER BY id LIMIT 1',
    [categoryId, item.name]
  );

  const imageUrl = item.imageFile
    ? (getStorageDriver() === 's3'
        ? getPublicUrlForKey(getSeedKeyForImage(item.imageFile, categoryName) || `${process.env.S3_PREFIX || 'media'}/menu/items/misc/${item.imageFile}`)
        : `/uploads/${item.imageFile}`)
    : null;
  const allergensJson = JSON.stringify(item.allergens ?? []);
  const ingredientsJson = JSON.stringify(item.ingredients ?? []);

  if (existing.length > 0) {
    const id = existing[0].id;
    await query(
      `UPDATE menu_items
       SET description = ?, short_description = ?, full_description = ?, allergens = ?, ingredients = ?, price = ?, image_url = ?, is_available = ?
       WHERE id = ?`,
      [
        item.short_description || null,
        item.short_description || null,
        item.full_description || null,
        allergensJson,
        ingredientsJson,
        item.price,
        imageUrl,
        1,
        id,
      ]
    );
    return id;
  }

  const result = await query(
    'INSERT INTO menu_items (category_id, name, description, short_description, full_description, allergens, ingredients, price, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      categoryId,
      item.name,
      item.short_description || null,
      item.short_description || null,
      item.full_description || null,
      allergensJson,
      ingredientsJson,
      item.price,
      imageUrl,
      1,
    ]
  );

  return result.insertId;
};

const upsertWine = async (wine) => {
  const existing = await query('SELECT id FROM wines WHERE name = ? ORDER BY id LIMIT 1', [wine.name]);

  const imageUrl = wine.imageFile
    ? (getStorageDriver() === 's3'
        ? getPublicUrlForKey(`${process.env.S3_PREFIX || 'media'}/wines/${wine.imageFile}`)
        : `/uploads/${wine.imageFile}`)
    : null;
  const pairingJson = JSON.stringify(wine.pairing ?? []);

  if (existing.length > 0) {
    const id = existing[0].id;
    await query(
      `UPDATE wines
       SET region = ?, description = ?, full_description = ?, price_glass = ?, price_bottle = ?, image_url = ?, grape = ?, pairing = ?, is_available = ?
       WHERE id = ?`,
      [
        wine.region ?? null,
        wine.description ?? null,
        wine.full_description ?? null,
        wine.price_glass ?? null,
        wine.price_bottle ?? null,
        imageUrl,
        wine.grape ?? null,
        pairingJson,
        wine.is_available ? 1 : 0,
        id,
      ]
    );
    return id;
  }

  const result = await query(
    `INSERT INTO wines
      (name, region, description, full_description, price_glass, price_bottle, image_url, grape, pairing, is_available)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      wine.name,
      wine.region ?? null,
      wine.description ?? null,
      wine.full_description ?? null,
      wine.price_glass ?? null,
      wine.price_bottle ?? null,
      imageUrl,
      wine.grape ?? null,
      pairingJson,
      wine.is_available ? 1 : 0,
    ]
  );
  return result.insertId;
};

const main = async () => {
  await initDatabase();

  if (SHOULD_RESET) {
    console.log('Reset requested: truncating menu/categories/wines tables...');
    await query('SET FOREIGN_KEY_CHECKS = 0');
    await query('TRUNCATE TABLE menu_items');
    await query('TRUNCATE TABLE menu_categories');
    await query('TRUNCATE TABLE wines');
    await query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Reset complete. Seeding fresh data...');
  }

  await ensureMediaUploaded();

  for (const category of STATIC_MENU) {
    const catId = await upsertCategory(category.name, category.description, category.imageFile ? `/uploads/${category.imageFile}` : null);
    for (const item of category.items) {
      await upsertItem(catId, category.name, item);
    }
  }

  for (const wine of STATIC_WINES) {
    await upsertWine(wine);
  }

  console.log(`Menu seed complete.${SHOULD_RESET ? ' (fresh reset)' : ''}`);
  process.exit(0);
};

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
