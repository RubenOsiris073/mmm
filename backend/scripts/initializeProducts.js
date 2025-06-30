const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Importar solo Firestore, no Auth
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Configuración de Firebase sin Auth
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Inicializar Firebase y Firestore directamente
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Colecciones
const COLLECTIONS = {
  PRODUCTS: 'products',
  SALES: 'sales',
  INVENTORY: 'inventory'
};

// Función para generar fechas de caducidad aleatorias
function generarFechaCaducidad(perecedero, categoria) {
  const hoy = new Date();
  let diasAleatorios;
  
  if (!perecedero) {
    // Productos no perecederos: 6 meses a 3 años
    diasAleatorios = Math.floor(Math.random() * (1095 - 180 + 1)) + 180;
  } else {
    // Productos perecederos según categoría
    switch (categoria) {
      case 'Bebidas':
        diasAleatorios = Math.floor(Math.random() * (90 - 30 + 1)) + 30; // 1-3 meses
        break;
      case 'Panadería y Galletas':
        diasAleatorios = Math.floor(Math.random() * (15 - 3 + 1)) + 3; // 3-15 días
        break;
      case 'Abarrotes Básicos':
        if (categoria.includes('Tortillas')) {
          diasAleatorios = Math.floor(Math.random() * (7 - 1 + 1)) + 1; // 1-7 días
        } else {
          diasAleatorios = Math.floor(Math.random() * (60 - 15 + 1)) + 15; // 15-60 días
        }
        break;
      case 'Lácteos':
        diasAleatorios = Math.floor(Math.random() * (14 - 3 + 1)) + 3; // 3-14 días
        break;
      case 'Carnes y Embutidos':
        diasAleatorios = Math.floor(Math.random() * (21 - 5 + 1)) + 5; // 5-21 días
        break;
      case 'Frutas y Verduras':
        diasAleatorios = Math.floor(Math.random() * (10 - 2 + 1)) + 2; // 2-10 días
        break;
      case 'Helados y Congelados':
        diasAleatorios = Math.floor(Math.random() * (180 - 30 + 1)) + 30; // 1-6 meses
        break;
      default:
        diasAleatorios = Math.floor(Math.random() * (30 - 7 + 1)) + 7; // 7-30 días
    }
  }
  
  const fechaCaducidad = new Date(hoy);
  fechaCaducidad.setDate(hoy.getDate() + diasAleatorios);
  return fechaCaducidad;
}

// Productos organizados por categorías (100 PRODUCTOS NUEVOS AGREGADOS)
const productos = [
  // BEBIDAS
  {
    nombre: "Refresco de cola",
    descripcion: "355 ml, Coca-Cola",
    marca: "Coca-Cola",
    categoria: "Bebidas",
    subcategoria: "Refrescos",
    precio: 18.00,
    codigo: "COC001",
    unidadMedida: "pieza",
    volumen: "355 ml",
    stockMinimo: 20,
    ubicacion: "Refrigerador",
    perecedero: false,
    notas: "Mantener refrigerado"
  },
  {
    nombre: "Leche entera ultrapasteurizada",
    descripcion: "1 L, Lala",
    marca: "Lala",
    categoria: "Bebidas",
    subcategoria: "Lácteos",
    precio: 24.50,
    codigo: "LAL001",
    unidadMedida: "litro",
    volumen: "1 L",
    stockMinimo: 15,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Mantener refrigerado, verificar fecha de caducidad"
  },
  {
    nombre: "Agua Jamaica",
    descripcion: "500 ml, Del Valle",
    marca: "Del Valle",
    categoria: "Bebidas",
    subcategoria: "Aguas frescas",
    precio: 15.00,
    codigo: "DEL001",
    unidadMedida: "pieza",
    volumen: "500 ml",
    stockMinimo: 25,
    ubicacion: "Refrigerador",
    perecedero: false,
    notas: "Bebida tradicional mexicana"
  },
  {
    nombre: "Refresco de tamarindo",
    descripcion: "355 ml, Jarritos",
    marca: "Jarritos",
    categoria: "Bebidas",
    subcategoria: "Refrescos",
    precio: 16.00,
    codigo: "JAR001",
    unidadMedida: "pieza",
    volumen: "355 ml",
    stockMinimo: 30,
    ubicacion: "Refrigerador",
    perecedero: false,
    notas: "Refresco mexicano tradicional"
  },
  {
    nombre: "Horchata",
    descripcion: "240 ml, Coronado",
    marca: "Coronado",
    categoria: "Bebidas",
    subcategoria: "Bebidas tradicionales",
    precio: 12.00,
    codigo: "COR001",
    unidadMedida: "pieza",
    volumen: "240 ml",
    stockMinimo: 20,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Bebida tradicional mexicana"
  },
  {
    nombre: "Agua de coco",
    descripcion: "330 ml, Zico",
    marca: "Zico",
    categoria: "Bebidas",
    subcategoria: "Aguas naturales",
    precio: 25.00,
    codigo: "ZIC001",
    unidadMedida: "pieza",
    volumen: "330 ml",
    stockMinimo: 15,
    ubicacion: "Refrigerador",
    perecedero: false,
    notas: "Bebida natural e hidratante"
  },
  {
    nombre: "Agua natural",
    descripcion: "600 ml, Bonafont",
    marca: "Bonafont",
    categoria: "Bebidas",
    subcategoria: "Agua embotellada",
    precio: 12.00,
    codigo: "BON001",
    unidadMedida: "pieza",
    volumen: "600 ml",
    stockMinimo: 50,
    ubicacion: "Refrigerador",
    perecedero: false,
    notas: "Agua purificada"
  },
  {
    nombre: "Jugo de naranja",
    descripcion: "1 L, Jumex",
    marca: "Jumex",
    categoria: "Bebidas",
    subcategoria: "Jugos",
    precio: 28.00,
    codigo: "JUM001",
    unidadMedida: "litro",
    volumen: "1 L",
    stockMinimo: 20,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Jugo natural mexicano"
  },
  {
    nombre: "Cerveza Tecate",
    descripcion: "355 ml, Tecate",
    marca: "Tecate",
    categoria: "Bebidas",
    subcategoria: "Cerveza",
    precio: 18.00,
    codigo: "TEC001",
    unidadMedida: "pieza",
    volumen: "355 ml",
    stockMinimo: 30,
    ubicacion: "Refrigerador",
    perecedero: false,
    notas: "Cerveza mexicana"
  },
  {
    nombre: "Pulque natural",
    descripcion: "500 ml, La Flor",
    marca: "La Flor",
    categoria: "Bebidas",
    subcategoria: "Bebidas tradicionales",
    precio: 25.00,
    codigo: "FLO001",
    unidadMedida: "pieza",
    volumen: "500 ml",
    stockMinimo: 15,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Bebida prehispánica mexicana"
  },
  {
    nombre: "Agua de sabor guayaba",
    descripcion: "500 ml, Boing",
    marca: "Boing",
    categoria: "Bebidas",
    subcategoria: "Aguas frescas",
    precio: 14.00,
    codigo: "BOI001",
    unidadMedida: "pieza",
    volumen: "500 ml",
    stockMinimo: 25,
    ubicacion: "Refrigerador",
    perecedero: false,
    notas: "Agua fresca mexicana"
  },

  // LÁCTEOS Y DERIVADOS
  {
    nombre: "Queso Oaxaca",
    descripcion: "400 g, Lala",
    marca: "Lala",
    categoria: "Lácteos",
    subcategoria: "Quesos",
    precio: 55.00,
    codigo: "LAL002",
    unidadMedida: "pieza",
    peso: "400 g",
    stockMinimo: 12,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Queso artesanal mexicano"
  },
  {
    nombre: "Crema ácida",
    descripcion: "200 ml, Lala",
    marca: "Lala",
    categoria: "Lácteos",
    subcategoria: "Cremas",
    precio: 18.00,
    codigo: "LAL003",
    unidadMedida: "pieza",
    volumen: "200 ml",
    stockMinimo: 15,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Para acompañar comida mexicana"
  },
  {
    nombre: "Yogurt natural",
    descripcion: "1 L, Danone",
    marca: "Danone",
    categoria: "Lácteos",
    subcategoria: "Yogures",
    precio: 32.00,
    codigo: "DAN001",
    unidadMedida: "litro",
    volumen: "1 L",
    stockMinimo: 18,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Yogurt natural sin azúcar"
  },
  {
    nombre: "Mantequilla sin sal",
    descripcion: "90 g, Gloria",
    marca: "Gloria",
    categoria: "Lácteos",
    subcategoria: "Mantequillas",
    precio: 22.00,
    codigo: "GLO001",
    unidadMedida: "pieza",
    peso: "90 g",
    stockMinimo: 20,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Mantequilla para cocinar"
  },
  {
    nombre: "Queso panela",
    descripcion: "400 g, Alpura",
    marca: "Alpura",
    categoria: "Lácteos",
    subcategoria: "Quesos frescos",
    precio: 48.00,
    codigo: "ALP001",
    unidadMedida: "pieza",
    peso: "400 g",
    stockMinimo: 10,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Queso fresco mexicano"
  },

  // CARNES Y EMBUTIDOS
  {
    nombre: "Salchicha de pavo",
    descripcion: "500 g, FUD",
    marca: "FUD",
    categoria: "Carnes y Embutidos",
    subcategoria: "Salchichas",
    precio: 45.00,
    codigo: "FUD001",
    unidadMedida: "pieza",
    peso: "500 g",
    stockMinimo: 15,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Mantener refrigerado"
  },
  {
    nombre: "Jamón de pavo",
    descripcion: "200 g, San Rafael",
    marca: "San Rafael",
    categoria: "Carnes y Embutidos",
    subcategoria: "Jamones",
    precio: 38.00,
    codigo: "SRA001",
    unidadMedida: "pieza",
    peso: "200 g",
    stockMinimo: 12,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Jamón rebanado"
  },
  {
    nombre: "Chorizo mexicano",
    descripcion: "400 g, Campestre",
    marca: "Campestre",
    categoria: "Carnes y Embutidos",
    subcategoria: "Chorizos",
    precio: 42.00,
    codigo: "CAM001",
    unidadMedida: "pieza",
    peso: "400 g",
    stockMinimo: 18,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Chorizo tradicional mexicano"
  },
  {
    nombre: "Tocino ahumado",
    descripcion: "250 g, Kir",
    marca: "Kir",
    categoria: "Carnes y Embutidos",
    subcategoria: "Tocino",
    precio: 52.00,
    codigo: "KIR001",
    unidadMedida: "pieza",
    peso: "250 g",
    stockMinimo: 10,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Tocino ahumado premium"
  },
  {
    nombre: "Longaniza roja",
    descripcion: "300 g, Regional",
    marca: "Regional",
    categoria: "Carnes y Embutidos",
    subcategoria: "Embutidos mexicanos",
    precio: 35.00,
    codigo: "REG001",
    unidadMedida: "pieza",
    peso: "300 g",
    stockMinimo: 15,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Embutido mexicano tradicional"
  },

  // FRUTAS Y VERDURAS
  {
    nombre: "Plátano macho",
    descripcion: "1 kg, Fresco",
    marca: "Local",
    categoria: "Frutas y Verduras",
    subcategoria: "Frutas tropicales",
    precio: 25.00,
    codigo: "PLA001",
    unidadMedida: "kilogramo",
    peso: "1 kg",
    stockMinimo: 8,
    ubicacion: "Exhibidor frutas",
    perecedero: true,
    notas: "Fruta tropical mexicana"
  },
  {
    nombre: "Limón con sal",
    descripcion: "1 kg, Fresco",
    marca: "Local",
    categoria: "Frutas y Verduras",
    subcategoria: "Cítricos",
    precio: 30.00,
    codigo: "LIM001",
    unidadMedida: "kilogramo",
    peso: "1 kg",
    stockMinimo: 10,
    ubicacion: "Exhibidor frutas",
    perecedero: true,
    notas: "Limón mexicano"
  },
  {
    nombre: "Chile jalapeño fresco",
    descripcion: "250 g, Fresco",
    marca: "Local",
    categoria: "Frutas y Verduras",
    subcategoria: "Chiles frescos",
    precio: 18.00,
    codigo: "CJA001",
    unidadMedida: "pieza",
    peso: "250 g",
    stockMinimo: 15,
    ubicacion: "Refrigerador verduras",
    perecedero: true,
    notas: "Chile mexicano picante"
  },
  {
    nombre: "Cebolla blanca",
    descripcion: "1 kg, Fresco",
    marca: "Local",
    categoria: "Frutas y Verduras",
    subcategoria: "Verduras básicas",
    precio: 22.00,
    codigo: "CEB001",
    unidadMedida: "kilogramo",
    peso: "1 kg",
    stockMinimo: 12,
    ubicacion: "Exhibidor verduras",
    perecedero: true,
    notas: "Verdura básica mexicana"
  },
  {
    nombre: "Tomate rojo",
    descripcion: "1 kg, Fresco",
    marca: "Local",
    categoria: "Frutas y Verduras",
    subcategoria: "Verduras básicas",
    precio: 28.00,
    codigo: "TOM001",
    unidadMedida: "kilogramo",
    peso: "1 kg",
    stockMinimo: 15,
    ubicacion: "Exhibidor verduras",
    perecedero: true,
    notas: "Tomate fresco"
  },

  // SALSAS Y CONDIMENTOS MEXICANOS
  {
    nombre: "Salsa Huichol",
    descripcion: "150 ml, Huichol",
    marca: "Huichol",
    categoria: "Aceites y Condimentos",
    subcategoria: "Salsas picantes",
    precio: 15.00,
    codigo: "HUI001",
    unidadMedida: "pieza",
    volumen: "150 ml",
    stockMinimo: 25,
    ubicacion: "Estante condimentos",
    perecedero: false,
    notas: "Salsa picante mexicana"
  },
  {
    nombre: "Adobo para asar",
    descripcion: "100 g, Maggi",
    marca: "Maggi",
    categoria: "Aceites y Condimentos",
    subcategoria: "Adobos",
    precio: 20.00,
    codigo: "MAG002",
    unidadMedida: "pieza",
    peso: "100 g",
    stockMinimo: 20,
    ubicacion: "Estante condimentos",
    perecedero: false,
    notas: "Condimento para carnes"
  },
  {
    nombre: "Mole poblano",
    descripcion: "250 g, Doña María",
    marca: "Doña María",
    categoria: "Aceites y Condimentos",
    subcategoria: "Moles",
    precio: 45.00,
    codigo: "MAR003",
    unidadMedida: "pieza",
    peso: "250 g",
    stockMinimo: 15,
    ubicacion: "Estante condimentos",
    perecedero: false,
    notas: "Mole tradicional mexicano"
  },
  {
    nombre: "Recado rojo",
    descripcion: "100 g, Yucateco",
    marca: "Yucateco",
    categoria: "Aceites y Condimentos",
    subcategoria: "Recados yucatecos",
    precio: 18.00,
    codigo: "YUC001",
    unidadMedida: "pieza",
    peso: "100 g",
    stockMinimo: 20,
    ubicacion: "Estante condimentos",
    perecedero: false,
    notas: "Condimento yucateco"
  },
  {
    nombre: "Achiote en pasta",
    descripcion: "80 g, El Mexicano",
    marca: "El Mexicano",
    categoria: "Aceites y Condimentos",
    subcategoria: "Condimentos regionales",
    precio: 16.00,
    codigo: "MEX001",
    unidadMedida: "pieza",
    peso: "80 g",
    stockMinimo: 18,
    ubicacion: "Estante condimentos",
    perecedero: false,
    notas: "Condimento mexicano tradicional"
  },

  // TORTILLAS Y PRODUCTOS DE MAÍZ
  {
    nombre: "Tortillas de harina",
    descripcion: "500 g, TIA ROSA",
    marca: "TIA ROSA",
    categoria: "Abarrotes Básicos",
    subcategoria: "Tortillas",
    precio: 22.00,
    codigo: "TIA001",
    unidadMedida: "pieza",
    peso: "500 g",
    stockMinimo: 25,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Tortillas de harina norteñas"
  },
  {
    nombre: "Tostadas horneadas",
    descripcion: "160 g, Charras",
    marca: "Charras",
    categoria: "Abarrotes Básicos",
    subcategoria: "Productos de maíz",
    precio: 18.00,
    codigo: "CHA001",
    unidadMedida: "pieza",
    peso: "160 g",
    stockMinimo: 30,
    ubicacion: "Estante tortillas",
    perecedero: false,
    notas: "Tostadas mexicanas crujientes"
  },
  {
    nombre: "Totopos naturales",
    descripcion: "200 g, Don Chendo",
    marca: "Don Chendo",
    categoria: "Snacks y Botanas",
    subcategoria: "Totopos",
    precio: 25.00,
    codigo: "CHE002",
    unidadMedida: "pieza",
    peso: "200 g",
    stockMinimo: 20,
    ubicacion: "Estante botanas",
    perecedero: false,
    notas: "Totopos artesanales"
  },
  {
    nombre: "Gorditas de maíz",
    descripcion: "300 g, Doña Chonita",
    marca: "Doña Chonita",
    categoria: "Abarrotes Básicos",
    subcategoria: "Productos de maíz",
    precio: 20.00,
    codigo: "CHO001",
    unidadMedida: "pieza",
    peso: "300 g",
    stockMinimo: 15,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Gorditas mexicanas tradicionales"
  },
  {
    nombre: "Sopes de maíz",
    descripcion: "250 g, La Cocinera",
    marca: "La Cocinera",
    categoria: "Abarrotes Básicos",
    subcategoria: "Productos de maíz",
    precio: 18.00,
    codigo: "COC001",
    unidadMedida: "pieza",
    peso: "250 g",
    stockMinimo: 20,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Sopes mexicanos listos para rellenar"
  },

  // DULCES MEXICANOS TRADICIONALES
  {
    nombre: "Cocada de coco",
    descripcion: "40 g, Artesanal",
    marca: "Dulces Tradicionales",
    categoria: "Dulces y Chocolates",
    subcategoria: "Dulces artesanales",
    precio: 8.00,
    codigo: "DUL002",
    unidadMedida: "pieza",
    peso: "40 g",
    stockMinimo: 35,
    ubicacion: "Exhibidor dulces",
    perecedero: false,
    notas: "Dulce mexicano tradicional"
  },
  {
    nombre: "Pepitorias de cacahuate",
    descripcion: "30 g, Regional",
    marca: "Dulces Tradicionales",
    categoria: "Dulces y Chocolates",
    subcategoria: "Dulces artesanales",
    precio: 6.00,
    codigo: "DUL003",
    unidadMedida: "pieza",
    peso: "30 g",
    stockMinimo: 40,
    ubicacion: "Exhibidor dulces",
    perecedero: false,
    notas: "Dulce regional mexicano"
  },
  {
    nombre: "Muéganos de piloncillo",
    descripcion: "50 g, Huasteca",
    marca: "Dulces Tradicionales",
    categoria: "Dulces y Chocolates",
    subcategoria: "Dulces regionales",
    precio: 10.00,
    codigo: "DUL004",
    unidadMedida: "pieza",
    peso: "50 g",
    stockMinimo: 25,
    ubicacion: "Exhibidor dulces",
    perecedero: false,
    notas: "Dulce huasteco tradicional"
  },
  {
    nombre: "Palanquetas de cacahuate",
    descripcion: "35 g, Regional",
    marca: "Dulces Tradicionales",
    categoria: "Dulces y Chocolates",
    subcategoria: "Dulces artesanales",
    precio: 7.00,
    codigo: "DUL005",
    unidadMedida: "pieza",
    peso: "35 g",
    stockMinimo: 30,
    ubicacion: "Exhibidor dulces",
    perecedero: false,
    notas: "Dulce de cacahuate tradicional"
  },
  {
    nombre: "Jamoncillo de leche",
    descripcion: "45 g, Celaya",
    marca: "Dulces Tradicionales",
    categoria: "Dulces y Chocolates",
    subcategoria: "Dulces de leche",
    precio: 12.00,
    codigo: "DUL006",
    unidadMedida: "pieza",
    peso: "45 g",
    stockMinimo: 20,
    ubicacion: "Exhibidor dulces",
    perecedero: false,
    notas: "Dulce de leche de Celaya"
  },

  // CHILES Y ESPECIAS
  {
    nombre: "Chile de árbol seco",
    descripcion: "50 g, McCormick",
    marca: "McCormick",
    categoria: "Aceites y Condimentos",
    subcategoria: "Chiles secos",
    precio: 22.00,
    codigo: "MCC004",
    unidadMedida: "pieza",
    peso: "50 g",
    stockMinimo: 25,
    ubicacion: "Estante especias",
    perecedero: false,
    notas: "Chile mexicano muy picante"
  },
  {
    nombre: "Chile ancho seco",
    descripcion: "75 g, McCormick",
    marca: "McCormick",
    categoria: "Aceites y Condimentos",
    subcategoria: "Chiles secos",
    precio: 28.00,
    codigo: "MCC005",
    unidadMedida: "pieza",
    peso: "75 g",
    stockMinimo: 20,
    ubicacion: "Estante especias",
    perecedero: false,
    notas: "Chile para moles y guisos"
  },
  {
    nombre: "Comino molido",
    descripcion: "40 g, McCormick",
    marca: "McCormick",
    categoria: "Aceites y Condimentos",
    subcategoria: "Especias",
    precio: 18.00,
    codigo: "MCC006",
    unidadMedida: "pieza",
    peso: "40 g",
    stockMinimo: 30,
    ubicacion: "Estante especias",
    perecedero: false,
    notas: "Especia esencial mexicana"
  },
  {
    nombre: "Orégano mexicano",
    descripcion: "30 g, McCormick",
    marca: "McCormick",
    categoria: "Aceites y Condimentos",
    subcategoria: "Hierbas secas",
    precio: 16.00,
    codigo: "MCC007",
    unidadMedida: "pieza",
    peso: "30 g",
    stockMinimo: 25,
    ubicacion: "Estante especias",
    perecedero: false,
    notas: "Orégano mexicano auténtico"
  },
  {
    nombre: "Pimienta negra molida",
    descripcion: "45 g, McCormick",
    marca: "McCormick",
    categoria: "Aceites y Condimentos",
    subcategoria: "Especias básicas",
    precio: 24.00,
    codigo: "MCC008",
    unidadMedida: "pieza",
    peso: "45 g",
    stockMinimo: 20,
    ubicacion: "Estante especias",
    perecedero: false,
    notas: "Especia básica de cocina"
  },

  // PRODUCTOS INSTANTÁNEOS MEXICANOS
  {
    nombre: "Atole de chocolate",
    descripcion: "240 g, Maizena",
    marca: "Maizena",
    categoria: "Alimentos Instantáneos",
    subcategoria: "Atoles instantáneos",
    precio: 32.00,
    codigo: "MAI002",
    unidadMedida: "pieza",
    peso: "240 g",
    stockMinimo: 18,
    ubicacion: "Estante instantáneos",
    perecedero: false,
    notas: "Bebida caliente mexicana"
  },
  {
    nombre: "Pozole instantáneo",
    descripcion: "180 g, Knorr",
    marca: "Knorr",
    categoria: "Alimentos Instantáneos",
    subcategoria: "Sopas mexicanas",
    precio: 35.00,
    codigo: "KNO003",
    unidadMedida: "pieza",
    peso: "180 g",
    stockMinimo: 15,
    ubicacion: "Estante instantáneos",
    perecedero: false,
    notas: "Pozole tradicional mexicano"
  },
  {
    nombre: "Mole instantáneo",
    descripcion: "120 g, Doña María",
    marca: "Doña María",
    categoria: "Alimentos Instantáneos",
    subcategoria: "Moles instantáneos",
    precio: 28.00,
    codigo: "MAR004",
    unidadMedida: "pieza",
    peso: "120 g",
    stockMinimo: 20,
    ubicacion: "Estante instantáneos",
    perecedero: false,
    notas: "Mole mexicano fácil de preparar"
  },
  {
    nombre: "Menudo instantáneo",
    descripcion: "95 g, Knorr",
    marca: "Knorr",
    categoria: "Alimentos Instantáneos",
    subcategoria: "Sopas mexicanas",
    precio: 22.00,
    codigo: "KNO004",
    unidadMedida: "pieza",
    peso: "95 g",
    stockMinimo: 25,
    ubicacion: "Estante instantáneos",
    perecedero: false,
    notas: "Menudo tradicional mexicano"
  },
  {
    nombre: "Champurrado instantáneo",
    descripcion: "200 g, Abuelita",
    marca: "Abuelita",
    categoria: "Alimentos Instantáneos",
    subcategoria: "Bebidas calientes",
    precio: 30.00,
    codigo: "ABU001",
    unidadMedida: "pieza",
    peso: "200 g",
    stockMinimo: 15,
    ubicacion: "Estante instantáneos",
    perecedero: false,
    notas: "Champurrado mexicano tradicional"
  },

  // PRODUCTOS DE HIGIENE PERSONAL MEXICANOS
  {
    nombre: "Jabón Zote rosa",
    descripcion: "200 g, Zote",
    marca: "Zote",
    categoria: "Productos de Limpieza",
    subcategoria: "Jabones para ropa",
    precio: 8.00,
    codigo: "ZOT001",
    unidadMedida: "pieza",
    peso: "200 g",
    stockMinimo: 30,
    ubicacion: "Estante limpieza",
    perecedero: false,
    notas: "Jabón mexicano tradicional"
  },
  {
    nombre: "Detergente Roma",
    descripcion: "1 kg, Roma",
    marca: "Roma",
    categoria: "Productos de Limpieza",
    subcategoria: "Detergentes",
    precio: 35.00,
    codigo: "ROM001",
    unidadMedida: "kilogramo",
    peso: "1 kg",
    stockMinimo: 15,
    ubicacion: "Estante limpieza",
    perecedero: false,
    notas: "Detergente mexicano económico"
  },
  {
    nombre: "Pinol desinfectante",
    descripcion: "1 L, Pinol",
    marca: "Pinol",
    categoria: "Productos de Limpieza",
    subcategoria: "Desinfectantes",
    precio: 28.00,
    codigo: "PIN001",
    unidadMedida: "litro",
    volumen: "1 L",
    stockMinimo: 18,
    ubicacion: "Estante limpieza",
    perecedero: false,
    notas: "Desinfectante con aroma a pino"
  },
  {
    nombre: "Fabuloso lavanda",
    descripcion: "1 L, Fabuloso",
    marca: "Fabuloso",
    categoria: "Productos de Limpieza",
    subcategoria: "Limpiadores multiusos",
    precio: 25.00,
    codigo: "FAB001",
    unidadMedida: "litro",
    volumen: "1 L",
    stockMinimo: 20,
    ubicacion: "Estante limpieza",
    perecedero: false,
    notas: "Limpiador multiusos aromático"
  },
  {
    nombre: "Maestro Limpio",
    descripcion: "500 ml, Mr. Músculo",
    marca: "Mr. Músculo",
    categoria: "Productos de Limpieza",
    subcategoria: "Limpiadores de baño",
    precio: 32.00,
    codigo: "MRM001",
    unidadMedida: "pieza",
    volumen: "500 ml",
    stockMinimo: 15,
    ubicacion: "Estante limpieza",
    perecedero: false,
    notas: "Limpiador antibacterial"
  },

  // PRODUCTOS VARIOS Y MISCELÁNEOS
  {
    nombre: "Cigarros Marlboro",
    descripcion: "20 piezas, Marlboro",
    marca: "Marlboro",
    categoria: "Varios",
    subcategoria: "Cigarrillos",
    precio: 75.00,
    codigo: "MAR005",
    unidadMedida: "cajetilla",
    peso: "20 g",
    stockMinimo: 25,
    ubicacion: "Mostrador",
    perecedero: false,
    notas: "Producto para mayores de edad"
  },
  {
    nombre: "Encendedor desechable",
    descripcion: "1 pieza, BIC",
    marca: "BIC",
    categoria: "Varios",
    subcategoria: "Encendedores",
    precio: 12.00,
    codigo: "BIC001",
    unidadMedida: "pieza",
    peso: "20 g",
    stockMinimo: 50,
    ubicacion: "Caja registradora",
    perecedero: false,
    notas: "Producto de impulso"
  },
  {
    nombre: "Pilas AA alcalinas",
    descripcion: "4 piezas, Duracell",
    marca: "Duracell",
    categoria: "Varios",
    subcategoria: "Pilas",
    precio: 45.00,
    codigo: "DUR001",
    unidadMedida: "paquete",
    peso: "80 g",
    stockMinimo: 20,
    ubicacion: "Estante varios",
    perecedero: false,
    notas: "Pilas de larga duración"
  },
  {
    nombre: "Papel higiénico",
    descripcion: "4 rollos, Pétalo",
    marca: "Pétalo",
    categoria: "Cuidado Personal",
    subcategoria: "Papel higiénico",
    precio: 28.00,
    codigo: "PET001",
    unidadMedida: "paquete",
    peso: "400 g",
    stockMinimo: 25,
    ubicacion: "Estante papel",
    perecedero: false,
    notas: "Papel suave y absorbente"
  },
  {
    nombre: "Servilletas de papel",
    descripcion: "100 piezas, Kleenex",
    marca: "Kleenex",
    categoria: "Varios",
    subcategoria: "Servilletas",
    precio: 18.00,
    codigo: "KLE001",
    unidadMedida: "paquete",
    peso: "150 g",
    stockMinimo: 30,
    ubicacion: "Estante papel",
    perecedero: false,
    notas: "Servilletas suaves"
  },

  // HELADOS Y PRODUCTOS CONGELADOS
  {
    nombre: "Paleta de hielo sabor limón",
    descripcion: "100 ml, Holanda",
    marca: "Holanda",
    categoria: "Helados y Congelados",
    subcategoria: "Paletas de agua",
    precio: 8.00,
    codigo: "HOL001",
    unidadMedida: "pieza",
    volumen: "100 ml",
    stockMinimo: 40,
    ubicacion: "Congelador",
    perecedero: true,
    notas: "Mantener congelado"
  },
  {
    nombre: "Helado de vainilla",
    descripcion: "1 L, Holanda",
    marca: "Holanda",
    categoria: "Helados y Congelados",
    subcategoria: "Helados",
    precio: 65.00,
    codigo: "HOL002",
    unidadMedida: "litro",
    volumen: "1 L",
    stockMinimo: 12,
    ubicacion: "Congelador",
    perecedero: true,
    notas: "Helado cremoso familiar"
  },
  {
    nombre: "Esquimal de chocolate",
    descripcion: "80 ml, Nestlé",
    marca: "Nestlé",
    categoria: "Helados y Congelados",
    subcategoria: "Paletas de crema",
    precio: 15.00,
    codigo: "NES002",
    unidadMedida: "pieza",
    volumen: "80 ml",
    stockMinimo: 35,
    ubicacion: "Congelador",
    perecedero: true,
    notas: "Paleta de crema con chocolate"
  },
  {
    nombre: "Nieve de garrafa sabor fresa",
    descripcion: "500 ml, Artesanal",
    marca: "Local",
    categoria: "Helados y Congelados",
    subcategoria: "Nieves artesanales",
    precio: 25.00,
    codigo: "NIE001",
    unidadMedida: "pieza",
    volumen: "500 ml",
    stockMinimo: 15,
    ubicacion: "Congelador",
    perecedero: true,
    notas: "Nieve artesanal mexicana"
  },
  {
    nombre: "Mamey con chile",
    descripcion: "120 ml, Regional",
    marca: "Regional",
    categoria: "Helados y Congelados",
    subcategoria: "Paletas mexicanas",
    precio: 12.00,
    codigo: "MAM001",
    unidadMedida: "pieza",
    volumen: "120 ml",
    stockMinimo: 25,
    ubicacion: "Congelador",
    perecedero: true,
    notas: "Paleta mexicana tradicional"
  },

  // PRODUCTOS PARA BEBÉS
  {
    nombre: "Pañales desechables",
    descripcion: "40 piezas, Huggies",
    marca: "Huggies",
    categoria: "Cuidado Personal",
    subcategoria: "Productos para bebé",
    precio: 185.00,
    codigo: "HUG001",
    unidadMedida: "paquete",
    peso: "1.2 kg",
    stockMinimo: 8,
    ubicacion: "Estante bebé",
    perecedero: false,
    notas: "Pañales etapa 3"
  },
  {
    nombre: "Toallitas húmedas",
    descripcion: "80 piezas, Huggies",
    marca: "Huggies",
    categoria: "Cuidado Personal",
    subcategoria: "Productos para bebé",
    precio: 45.00,
    codigo: "HUG002",
    unidadMedida: "paquete",
    peso: "400 g",
    stockMinimo: 15,
    ubicacion: "Estante bebé",
    perecedero: false,
    notas: "Toallitas suaves para bebé"
  },
  {
    nombre: "Fórmula infantil",
    descripcion: "400 g, Similac",
    marca: "Similac",
    categoria: "Lácteos",
    subcategoria: "Fórmulas infantiles",
    precio: 285.00,
    codigo: "SIM001",
    unidadMedida: "lata",
    peso: "400 g",
    stockMinimo: 6,
    ubicacion: "Estante bebé",
    perecedero: false,
    notas: "Fórmula láctea para bebé"
  }
];

// Función principal para inicializar productos
async function initializeProducts() {
  try {
    console.log('🚀 Iniciando inicialización de productos...');
    console.log('📅 Generando fechas de caducidad automáticas...');
    
    // Primero, limpiar productos existentes (opcional)
    console.log('🧹 Limpiando productos existentes...');
    const existingProducts = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    const deletePromises = existingProducts.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log(`✅ Se eliminaron ${existingProducts.size} productos existentes`);
    
    // Agregar productos nuevos con fechas de caducidad
    console.log('📦 Agregando nuevos productos con fechas de caducidad...');
    const addPromises = productos.map(async (producto, index) => {
      try {
        // Generar fecha de caducidad automáticamente
        const fechaCaducidad = generarFechaCaducidad(producto.perecedero, producto.categoria);
        
        const productoConFecha = {
          ...producto,
          fechaCaducidad: fechaCaducidad,
          diasParaCaducar: Math.ceil((fechaCaducidad - new Date()) / (1000 * 60 * 60 * 24)),
          createdAt: new Date(),
          updatedAt: new Date(),
          activo: true,
          stock: Math.floor(Math.random() * 50) + producto.stockMinimo, // Stock aleatorio
          detectionId: null, // Para futuras detecciones de IA
          precisionDeteccion: null
        };
        
        const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), productoConFecha);
        
        console.log(`✅ ${index + 1}/${productos.length} - ${producto.nombre} (Caduca: ${fechaCaducidad.toLocaleDateString('es-MX')})`);
        return { id: docRef.id, ...productoConFecha };
      } catch (error) {
        console.error(`❌ Error agregando producto ${producto.nombre}:`, error);
        throw error;
      }
    });
    
    const productosAgregados = await Promise.all(addPromises);
    
    // Resumen por categorías
    const categorias = [...new Set(productos.map(p => p.categoria))];
    console.log('\n📊 RESUMEN POR CATEGORÍAS:');
    categorias.forEach(categoria => {
      const productosCategoria = productos.filter(p => p.categoria === categoria);
      console.log(`  📁 ${categoria}: ${productosCategoria.length} productos`);
      productosCategoria.forEach(p => {
        console.log(`    • ${p.nombre} ($${p.precio})`);
      });
    });
    
    // Resumen de fechas de caducidad
    const productosPereceseros = productosAgregados.filter(p => p.perecedero);
    const productosNoPereceseros = productosAgregados.filter(p => !p.perecedero);
    
    console.log('\n📅 RESUMEN DE FECHAS DE CADUCIDAD:');
    console.log(`  🟢 Productos perecederos: ${productosPereceseros.length}`);
    console.log(`  🔵 Productos no perecederos: ${productosNoPereceseros.length}`);
    
    // Productos que caducan pronto (menos de 30 días)
    const productosProximosACaducar = productosAgregados.filter(p => p.diasParaCaducar <= 30);
    console.log(`  ⚠️  Productos que caducan en 30 días o menos: ${productosProximosACaducar.length}`);
    
    console.log(`\n🎉 ¡Inicialización completada exitosamente!`);
    console.log(`📦 Total de productos agregados: ${productosAgregados.length}`);
    console.log(`📁 Total de categorías: ${categorias.length}`);
    console.log(`📅 Fechas de caducidad generadas automáticamente`);
    
    return {
      success: true,
      productosAgregados: productosAgregados.length,
      categorias: categorias.length,
      productosPereceseros: productosPereceseros.length,
      productosNoPereceseros: productosNoPereceseros.length,
      productosProximosACaducar: productosProximosACaducar.length,
      productos: productosAgregados
    };
    
  } catch (error) {
    console.error('💥 Error durante la inicialización:', error);
    throw error;
  }
}

// Ejecutar el script solo si se llama directamente
if (require.main === module) {
  initializeProducts()
    .then(result => {
      console.log('\n🏆 Script completado exitosamente:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { initializeProducts, productos };