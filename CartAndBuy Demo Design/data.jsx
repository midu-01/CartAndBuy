// MIDU — product catalog + reviews + cart seed data
// Solid-color blocks stand in for garment photography.

const MIDU_PRODUCTS = [
  { id: 'p01', name: 'Stratus Wool Overcoat',     cat: 'Outerwear', price: 1280, colors: ['#3a3833','#e8e3d6','#252423'], swatch: '#3a3833', tag: 'New' },
  { id: 'p02', name: 'Halden Cashmere Cardigan',  cat: 'Knitwear',  price: 640,  colors: ['#c9beae','#7a6e5a','#2a2620'], swatch: '#c9beae' },
  { id: 'p03', name: 'Atrium Pleated Trouser',    cat: 'Trousers',  price: 380,  colors: ['#1a1a18','#52483a','#bcb5a4'], swatch: '#1a1a18' },
  { id: 'p04', name: 'Linea Silk Blouse',         cat: 'Shirts',    price: 295,  colors: ['#f4f1ea','#1d1c17','#9a8e74'], swatch: '#f4f1ea' },
  { id: 'p05', name: 'Mira Slip Dress',           cat: 'Dresses',   price: 520,  colors: ['#2a2620','#7d6f54','#cdc1a8'], swatch: '#2a2620', tag: 'Bestseller' },
  { id: 'p06', name: 'Vega Leather Derby',        cat: 'Footwear',  price: 540,  colors: ['#1a1612','#5a3a2a'], swatch: '#1a1612' },
  { id: 'p07', name: 'Corso Belted Trench',       cat: 'Outerwear', price: 1480, colors: ['#a89880','#3c3a33'], swatch: '#a89880' },
  { id: 'p08', name: 'Nordal Merino Crew',        cat: 'Knitwear',  price: 310,  colors: ['#e8e3d6','#1a1a18','#c9beae'], swatch: '#e8e3d6' },
  { id: 'p09', name: 'Avon Wide-Leg Denim',       cat: 'Trousers',  price: 340,  colors: ['#3a4250','#1d2026'], swatch: '#3a4250' },
  { id: 'p10', name: 'Helio Oxford Shirt',        cat: 'Shirts',    price: 245,  colors: ['#f1ede2','#cdc1a8','#2a2620'], swatch: '#f1ede2' },
  { id: 'p11', name: 'Sabine Wrap Dress',         cat: 'Dresses',   price: 460,  colors: ['#7d2a2a','#1a1a18'], swatch: '#7d2a2a' },
  { id: 'p12', name: 'Larkin Suede Loafer',       cat: 'Footwear',  price: 480,  colors: ['#3a2a22','#1a1612'], swatch: '#3a2a22', tag: 'New' },
  { id: 'p13', name: 'Rivet Field Jacket',        cat: 'Outerwear', price: 780,  colors: ['#3f4035','#1d1e1a'], swatch: '#3f4035' },
  { id: 'p14', name: 'Petra Mohair Sweater',      cat: 'Knitwear',  price: 520,  colors: ['#bca085','#1a1612'], swatch: '#bca085' },
  { id: 'p15', name: 'Marais Tailored Pant',      cat: 'Trousers',  price: 360,  colors: ['#2a261f','#cdc1a8'], swatch: '#2a261f' },
  { id: 'p16', name: 'Eira Cotton Poplin',        cat: 'Shirts',    price: 220,  colors: ['#ffffff','#0c0c0a'], swatch: '#fafaf6' },
  { id: 'p17', name: 'Solace Midi Dress',         cat: 'Dresses',   price: 580,  colors: ['#1a1a18','#9d8a6e'], swatch: '#1a1a18' },
  { id: 'p18', name: 'Onda Heeled Sandal',        cat: 'Footwear',  price: 420,  colors: ['#1a1612','#cdc1a8'], swatch: '#cdc1a8' },
  { id: 'p19', name: 'Boreal Down Puffer',        cat: 'Outerwear', price: 920,  colors: ['#1a1a18','#a89880'], swatch: '#1a1a18' },
  { id: 'p20', name: 'Cala Alpaca Turtleneck',    cat: 'Knitwear',  price: 410,  colors: ['#cdc1a8','#3a3833'], swatch: '#cdc1a8' },
  { id: 'p21', name: 'Forge Pleated Skirt',       cat: 'Trousers',  price: 320,  colors: ['#2a2620','#7d6f54'], swatch: '#7d6f54' },
  { id: 'p22', name: 'Tessa Silk Camisole',       cat: 'Shirts',    price: 195,  colors: ['#cdc1a8','#1a1a18'], swatch: '#e8d8b8' },
  { id: 'p23', name: 'Verra Knit Dress',          cat: 'Dresses',   price: 490,  colors: ['#3a3833','#a89880'], swatch: '#a89880' },
  { id: 'p24', name: 'Mont Leather Ankle Boot',   cat: 'Footwear',  price: 620,  colors: ['#1a1612','#3a2a22'], swatch: '#1a1612', tag: 'Bestseller' },
  { id: 'p25', name: 'Aleo Linen Blazer',         cat: 'Outerwear', price: 690,  colors: ['#e8e3d6','#a89880'], swatch: '#e8e3d6' },
  { id: 'p26', name: 'Klein Cashmere Beanie',     cat: 'Accessories', price: 160, colors: ['#1a1a18','#cdc1a8','#7d2a2a'], swatch: '#7d2a2a' },
  { id: 'p27', name: 'Selva Wool Scarf',          cat: 'Accessories', price: 240, colors: ['#3a3833','#bca085'], swatch: '#bca085' },
  { id: 'p28', name: 'Otis Leather Tote',         cat: 'Accessories', price: 880, colors: ['#1a1612','#3a2a22'], swatch: '#3a2a22' },
  { id: 'p29', name: 'Pala Pleated Midi',         cat: 'Dresses',    price: 540, colors: ['#1a1a18','#cdc1a8'], swatch: '#cdc1a8' },
  { id: 'p30', name: 'Brae Tencel Shirt-Dress',   cat: 'Dresses',    price: 380, colors: ['#9d8a6e','#1a1a18'], swatch: '#9d8a6e' },
];

const MIDU_CATEGORIES = ['New In', 'Outerwear', 'Knitwear', 'Shirts', 'Trousers', 'Dresses', 'Footwear', 'Accessories'];

const MIDU_REVIEWS = [
  { id: 'r1', author: 'Imogen R.', loc: 'London', rating: 5, date: '14 May 2026',
    title: 'Quietly exceptional',
    body: 'The fabric has real weight to it. Fit runs slightly relaxed in the shoulder — I sized down and it sits perfectly.' },
  { id: 'r2', author: 'Daniel K.', loc: 'Copenhagen', rating: 5, date: '02 May 2026',
    title: 'A piece I will keep',
    body: 'Stitching is immaculate and the finish at the hem is the kind of detail you only notice when you wear it.' },
  { id: 'r3', author: 'Aria H.', loc: 'New York', rating: 4, date: '18 Apr 2026',
    title: 'Beautiful, slightly long',
    body: 'Colour is exactly as shown. Sleeves a touch long for me at 5\u20194\u201D — tailor will fix.' },
  { id: 'r4', author: 'Marcel V.', loc: 'Paris', rating: 5, date: '06 Apr 2026',
    title: 'Worth every euro',
    body: 'I expected good. I received better. The drape on this is rare at this price.' },
];

const MIDU_RATING_BREAKDOWN = { count: 247, avg: 4.8, breakdown: [78, 17, 3, 1, 1] }; // % per 5..1

// helper: format USD
const fmt = (n) => '$' + n.toLocaleString('en-US');

Object.assign(window, {
  MIDU_PRODUCTS, MIDU_CATEGORIES, MIDU_REVIEWS, MIDU_RATING_BREAKDOWN, fmt,
});
