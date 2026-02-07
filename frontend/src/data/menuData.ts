// Antipasti images
import bruschetta from "@/assets/menu/antipasti-bruschetta.jpg";
import carpaccio from "@/assets/menu/antipasti-carpaccio.jpg";
import burrata from "@/assets/menu/antipasti-burrata.jpg";

// Primi images
import tagliatelle from "@/assets/menu/primi-tagliatelle.jpg";
import risotto from "@/assets/menu/primi-risotto.jpg";
import vongole from "@/assets/menu/primi-vongole.jpg";

// Secondi images
import ossobuco from "@/assets/menu/secondi-ossobuco.jpg";
import branzino from "@/assets/menu/secondi-branzino.jpg";
import saltimbocca from "@/assets/menu/secondi-saltimbocca.jpg";

// Dolci images
import tiramisu from "@/assets/menu/dolci-tiramisu.jpg";
import pannacotta from "@/assets/menu/dolci-pannacotta.jpg";
import cannoli from "@/assets/menu/dolci-cannoli.jpg";

// Wine images
import chianti from "@/assets/menu/wine-chianti.jpg";
import barolo from "@/assets/menu/wine-barolo.jpg";
import pinotGrigio from "@/assets/menu/wine-pinotgrigio.jpg";
import prosecco from "@/assets/menu/wine-prosecco.jpg";

export interface MenuItem {
  name: string;
  description: string;
  fullDescription: string;
  price: string;
  image: string;
  allergens: string[];
  ingredients: string[];
}

export interface MenuCategory {
  id: string;
  title: string;
  subtitle: string;
  items: MenuItem[];
}

export interface WineItem {
  name: string;
  region: string;
  description: string;
  fullDescription: string;
  priceGlass: string;
  priceBottle: string;
  image: string;
  grape: string;
  pairing: string[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: "antipasti",
    title: "Antipasti",
    subtitle: "Starters",
    items: [
      {
        name: "Bruschetta Classica",
        description: "Grilled bread rubbed with garlic, topped with fresh tomatoes, basil, and extra virgin olive oil",
        fullDescription: "Our bruschetta starts with rustic Tuscan bread, grilled to perfection and rubbed with fresh garlic while still warm. Topped generously with vine-ripened tomatoes, fragrant basil leaves, and finished with a drizzle of our finest Sicilian extra virgin olive oil. A timeless Italian classic that showcases the beauty of simple, quality ingredients.",
        price: "28 RON",
        image: bruschetta,
        allergens: ["Gluten"],
        ingredients: ["Tuscan bread", "Roma tomatoes", "Fresh basil", "Garlic", "Extra virgin olive oil", "Sea salt"],
      },
      {
        name: "Carpaccio di Manzo",
        description: "Thinly sliced raw beef with wild arugula, Parmigiano-Reggiano shavings, and aged balsamic",
        fullDescription: "Premium beef tenderloin, hand-sliced paper-thin and arranged artfully on a bed of peppery wild arugula. Crowned with shavings of 24-month aged Parmigiano-Reggiano and finished with drops of 12-year aged balsamic from Modena. Each bite melts on your tongue with a perfect balance of savory and tangy notes.",
        price: "52 RON",
        image: carpaccio,
        allergens: ["Dairy"],
        ingredients: ["Beef tenderloin", "Wild arugula", "Parmigiano-Reggiano DOP", "Aged balsamic vinegar", "Extra virgin olive oil", "Black pepper"],
      },
      {
        name: "Burrata con Pomodorini",
        description: "Creamy burrata cheese with cherry tomatoes, fresh basil pesto, and crusty bread",
        fullDescription: "Fresh burrata from Puglia, its creamy stracciatella center flowing onto the plate when cut. Surrounded by sweet Datterini cherry tomatoes and dollops of our house-made basil pesto with pine nuts. Served with warm, crusty bread to capture every delicious morsel. A celebration of Italian dairy craftsmanship.",
        price: "48 RON",
        image: burrata,
        allergens: ["Dairy", "Gluten", "Tree Nuts"],
        ingredients: ["Burrata cheese", "Datterini tomatoes", "Fresh basil", "Pine nuts", "Garlic", "Crusty bread", "Extra virgin olive oil"],
      },
    ],
  },
  {
    id: "primi",
    title: "Primi",
    subtitle: "First Courses",
    items: [
      {
        name: "Tagliatelle al Tartufo",
        description: "Fresh egg pasta with black truffle, Parmigiano cream, and shaved truffle",
        fullDescription: "Silky ribbons of fresh egg tagliatelle, made daily in our kitchen, tossed in a luxurious cream sauce infused with black truffle and aged Parmigiano. Generously topped with shavings of fresh seasonal truffle that release their intoxicating aroma at the table. A dish that embodies the essence of Italian luxury.",
        price: "78 RON",
        image: tagliatelle,
        allergens: ["Gluten", "Eggs", "Dairy"],
        ingredients: ["Fresh egg pasta", "Black truffle", "Parmigiano-Reggiano", "Heavy cream", "Butter", "White wine", "Shallots"],
      },
      {
        name: "Risotto ai Funghi Porcini",
        description: "Carnaroli rice slow-cooked with wild porcini mushrooms, white wine, and aged Parmigiano",
        fullDescription: "Creamy Carnaroli rice from the Po Valley, patiently stirred and ladled with rich mushroom broth. Wild porcini mushrooms, foraged from Italian forests, add their earthy depth. Finished with butter and 36-month aged Parmigiano for the perfect 'all'onda' wave consistency that defines a masterful risotto.",
        price: "62 RON",
        image: risotto,
        allergens: ["Dairy", "Sulphites"],
        ingredients: ["Carnaroli rice", "Porcini mushrooms", "Vegetable broth", "White wine", "Parmigiano-Reggiano", "Butter", "Shallots", "Fresh thyme"],
      },
      {
        name: "Spaghetti alle Vongole",
        description: "Spaghetti with fresh clams in white wine sauce, garlic, chili, and fresh parsley",
        fullDescription: "Al dente spaghetti embraced by the briny sweetness of fresh Adriatic clams, opened just moments before in a fragrant bath of white wine, garlic, and a whisper of Calabrian chili. Finished with a shower of fresh parsley and a drizzle of the finest olive oil. The taste of the Italian coast on your plate.",
        price: "68 RON",
        image: vongole,
        allergens: ["Gluten", "Shellfish", "Sulphites"],
        ingredients: ["Spaghetti", "Fresh clams", "White wine", "Garlic", "Calabrian chili", "Fresh parsley", "Extra virgin olive oil"],
      },
    ],
  },
  {
    id: "secondi",
    title: "Secondi",
    subtitle: "Main Courses",
    items: [
      {
        name: "Ossobuco alla Milanese",
        description: "Slow-braised veal shank with saffron risotto and traditional gremolata",
        fullDescription: "Cross-cut veal shank, braised for hours until the meat surrenders to your fork. The marrow melts into the rich tomato and wine sauce, creating depth of flavor that can only come from time and tradition. Served atop creamy saffron risotto and crowned with bright gremolata of lemon zest, garlic, and parsley.",
        price: "98 RON",
        image: ossobuco,
        allergens: ["Dairy", "Sulphites"],
        ingredients: ["Veal shank", "Saffron risotto", "Tomatoes", "White wine", "Beef broth", "Lemon zest", "Garlic", "Fresh parsley", "Celery", "Carrots", "Onion"],
      },
      {
        name: "Branzino al Forno",
        description: "Whole Mediterranean sea bass baked with herbs, lemon, and seasonal vegetables",
        fullDescription: "A whole Mediterranean sea bass, sourced daily from trusted fishermen, roasted to golden perfection with sprigs of rosemary, thyme, and slices of fresh lemon nestled inside. Accompanied by a medley of seasonal vegetables kissed by the same fragrant cooking juices. Presented whole and filleted tableside.",
        price: "112 RON",
        image: branzino,
        allergens: ["Fish"],
        ingredients: ["Whole sea bass", "Fresh rosemary", "Thyme", "Lemon", "Seasonal vegetables", "Extra virgin olive oil", "White wine", "Garlic"],
      },
      {
        name: "Saltimbocca alla Romana",
        description: "Veal cutlets wrapped in prosciutto and sage, finished with white wine butter sauce",
        fullDescription: "Tender veal escalopes, each lovingly wrapped with a slice of prosciutto di Parma and a fresh sage leaf. Pan-seared until the prosciutto crisps and the sage releases its aromatic oils, then finished with a silky white wine and butter sauce. The name means 'jumps in the mouth' – and you'll understand why with the first bite.",
        price: "88 RON",
        image: saltimbocca,
        allergens: ["Dairy"],
        ingredients: ["Veal escalopes", "Prosciutto di Parma", "Fresh sage", "White wine", "Butter", "Black pepper"],
      },
    ],
  },
  {
    id: "dolci",
    title: "Dolci",
    subtitle: "Desserts",
    items: [
      {
        name: "Tiramisù",
        description: "Classic layers of espresso-soaked savoiardi, mascarpone cream, and cocoa powder",
        fullDescription: "Our signature tiramisù follows a treasured family recipe. Delicate savoiardi biscuits, soaked in freshly brewed espresso and a touch of Marsala, layered with clouds of mascarpone cream enriched with egg yolks and sugar. Rested overnight to marry the flavors, then dusted with premium cocoa. Pure Italian comfort.",
        price: "32 RON",
        image: tiramisu,
        allergens: ["Gluten", "Eggs", "Dairy", "Alcohol"],
        ingredients: ["Mascarpone cheese", "Savoiardi biscuits", "Espresso coffee", "Eggs", "Sugar", "Marsala wine", "Cocoa powder"],
      },
      {
        name: "Panna Cotta",
        description: "Silky vanilla cream with seasonal berry coulis and fresh berries",
        fullDescription: "A quivering dome of Piedmontese cream, gently set with just enough gelatin to hold its shape while melting on your tongue. Infused with vanilla from Madagascar and topped with a vibrant coulis of seasonal berries and fresh fruit. Simple, elegant, and utterly addictive – the essence of Italian dessert philosophy.",
        price: "28 RON",
        image: pannacotta,
        allergens: ["Dairy"],
        ingredients: ["Heavy cream", "Vanilla bean", "Sugar", "Gelatin", "Seasonal berries", "Lemon juice"],
      },
      {
        name: "Cannoli Siciliani",
        description: "Crispy pastry tubes filled with sweet ricotta, pistachios, and chocolate chips",
        fullDescription: "Crispy, golden pastry shells imported from Sicily, filled to order with fresh ricotta cream sweetened with powdered sugar and studded with dark chocolate chips. The ends are dipped in crushed Bronte pistachios, their vibrant green color a signature of authenticity. A crunchy, creamy tribute to Sicilian tradition.",
        price: "34 RON",
        image: cannoli,
        allergens: ["Gluten", "Dairy", "Tree Nuts"],
        ingredients: ["Cannoli shells", "Fresh ricotta", "Powdered sugar", "Dark chocolate chips", "Bronte pistachios", "Candied orange peel"],
      },
    ],
  },
];

export const wineList: WineItem[] = [
  {
    name: "Chianti Classico DOCG",
    region: "Tuscany",
    description: "Medium-bodied red with notes of cherry, plum, and subtle earthy undertones. Perfect with pasta and grilled meats.",
    fullDescription: "From the heart of Tuscany's Chianti Classico region, this wine embodies centuries of winemaking tradition. The Sangiovese grapes, grown on sun-drenched hillsides, produce a wine with vibrant acidity, silky tannins, and a bouquet of cherry, violet, and hints of leather. Aged in oak barrels to develop complexity while maintaining the fresh fruit character that makes Chianti so food-friendly.",
    priceGlass: "28 RON",
    priceBottle: "145 RON",
    image: chianti,
    grape: "Sangiovese",
    pairing: ["Tagliatelle al Tartufo", "Saltimbocca alla Romana", "Bruschetta Classica"],
  },
  {
    name: "Barolo DOCG",
    region: "Piedmont",
    description: "Full-bodied, elegant red with aromas of roses, tar, and dark fruit. The 'King of Wines' pairs beautifully with rich dishes.",
    fullDescription: "Rightfully called the 'King of Wines', this Barolo comes from the prestigious Langhe hills of Piedmont. Made from 100% Nebbiolo grapes and aged for a minimum of 38 months, it offers an extraordinarily complex profile: dried roses, tar, truffle, and dark cherries unfold in layers. Firm tannins promise decades of aging potential, yet it's already approachable with rich, hearty dishes.",
    priceGlass: "48 RON",
    priceBottle: "285 RON",
    image: barolo,
    grape: "Nebbiolo",
    pairing: ["Ossobuco alla Milanese", "Risotto ai Funghi Porcini", "Carpaccio di Manzo"],
  },
  {
    name: "Pinot Grigio DOC",
    region: "Alto Adige",
    description: "Crisp, refreshing white with hints of citrus, green apple, and white flowers. Ideal with seafood and light appetizers.",
    fullDescription: "From the cool, alpine vineyards of Alto Adige, where crisp mountain air and dramatic temperature swings create wines of exceptional freshness and minerality. This Pinot Grigio displays a pale straw color with delicate aromas of white peach, citrus zest, and almond blossom. Clean and refreshing on the palate with a lingering mineral finish that makes it an ideal aperitivo or seafood companion.",
    priceGlass: "24 RON",
    priceBottle: "115 RON",
    image: pinotGrigio,
    grape: "Pinot Grigio",
    pairing: ["Branzino al Forno", "Spaghetti alle Vongole", "Burrata con Pomodorini"],
  },
  {
    name: "Prosecco DOCG",
    region: "Veneto",
    description: "Lively sparkling wine with delicate bubbles and notes of pear, apple, and acacia. Perfect for celebrations or as an aperitivo.",
    fullDescription: "From the steep hills of Valdobbiadene, where the finest Prosecco is crafted, comes this elegant sparkling wine. The Glera grapes are hand-harvested and gently pressed to preserve their delicate aromatics. Fine, persistent bubbles carry notes of green apple, white pear, and acacia flowers to the palate. Dry yet fruity, it's the perfect way to begin a meal or toast a special moment.",
    priceGlass: "26 RON",
    priceBottle: "125 RON",
    image: prosecco,
    grape: "Glera",
    pairing: ["Antipasti", "Light appetizers", "Celebrations"],
  },
];