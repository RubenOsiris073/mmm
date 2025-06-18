const { db, COLLECTIONS } = require('../config/firebase');
const { collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Productos organizados por categorías
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

  // SNACKS Y BOTANAS
  {
    nombre: "Papas fritas clásicas",
    descripcion: "45 g, Sabritas",
    marca: "Sabritas",
    categoria: "Snacks y Botanas",
    subcategoria: "Papas fritas",
    precio: 15.00,
    codigo: "SAB001",
    unidadMedida: "pieza",
    peso: "45 g",
    stockMinimo: 30,
    ubicacion: "Estante central",
    perecedero: false,
    notas: "Producto popular, rotar inventario"
  },
  {
    nombre: "Chicles sin azúcar",
    descripcion: "16 g, Clorets",
    marca: "Clorets",
    categoria: "Snacks y Botanas",
    subcategoria: "Dulces y chicles",
    precio: 8.50,
    codigo: "CLO001",
    unidadMedida: "pieza",
    peso: "16 g",
    stockMinimo: 25,
    ubicacion: "Caja registradora",
    perecedero: false,
    notas: "Producto impulso, ubicar cerca de la caja"
  },
  {
    nombre: "Chicharrones preparados",
    descripcion: "35 g, Barcel",
    marca: "Barcel",
    categoria: "Snacks y Botanas",
    subcategoria: "Botanas mexicanas",
    precio: 13.00,
    codigo: "BAR001",
    unidadMedida: "pieza",
    peso: "35 g",
    stockMinimo: 35,
    ubicacion: "Estante botanas",
    perecedero: false,
    notas: "Botana mexicana muy popular"
  },
  {
    nombre: "Cacahuates japoneses",
    descripcion: "45 g, Mafer",
    marca: "Mafer",
    categoria: "Snacks y Botanas",
    subcategoria: "Frutos secos",
    precio: 16.00,
    codigo: "MAF001",
    unidadMedida: "pieza",
    peso: "45 g",
    stockMinimo: 25,
    ubicacion: "Estante botanas",
    perecedero: false,
    notas: "Botana crujiente muy popular"
  },
  {
    nombre: "Churritos con chile",
    descripcion: "62 g, Cheetos Torciditos",
    marca: "Cheetos",
    categoria: "Snacks y Botanas",
    subcategoria: "Botanas con chile",
    precio: 18.00,
    codigo: "CHE001",
    unidadMedida: "pieza",
    peso: "62 g",
    stockMinimo: 30,
    ubicacion: "Estante botanas",
    perecedero: false,
    notas: "Sabor mexicano picante"
  },
  {
    nombre: "Palomitas de maíz",
    descripcion: "40 g, Totis",
    marca: "Totis",
    categoria: "Snacks y Botanas",
    subcategoria: "Maíz inflado",
    precio: 12.00,
    codigo: "TOT001",
    unidadMedida: "pieza",
    peso: "40 g",
    stockMinimo: 25,
    ubicacion: "Estante botanas",
    perecedero: false,
    notas: "Snack ligero y crujiente"
  },

  // PANADERÍA Y GALLETAS
  {
    nombre: "Galletas María",
    descripcion: "170 g, Gamesa",
    marca: "Gamesa",
    categoria: "Panadería y Galletas",
    subcategoria: "Galletas dulces",
    precio: 12.00,
    codigo: "GAM001",
    unidadMedida: "pieza",
    peso: "170 g",
    stockMinimo: 20,
    ubicacion: "Estante galletas",
    perecedero: false,
    notas: "Verificar fecha de caducidad"
  },
  {
    nombre: "Pan de caja blanco",
    descripcion: "680 g, Bimbo",
    marca: "Bimbo",
    categoria: "Panadería y Galletas",
    subcategoria: "Pan de caja",
    precio: 32.00,
    codigo: "BIM001",
    unidadMedida: "pieza",
    peso: "680 g",
    stockMinimo: 10,
    ubicacion: "Estante pan",
    perecedero: true,
    notas: "Producto perecedero, rotar inventario frecuentemente"
  },
  {
    nombre: "Conchas mixtas",
    descripcion: "6 piezas, Wonder",
    marca: "Wonder",
    categoria: "Panadería y Galletas",
    subcategoria: "Pan dulce",
    precio: 28.00,
    codigo: "WON001",
    unidadMedida: "paquete",
    peso: "360 g",
    stockMinimo: 15,
    ubicacion: "Estante pan dulce",
    perecedero: true,
    notas: "Pan dulce mexicano tradicional"
  },
  {
    nombre: "Galletas de animalitos",
    descripcion: "100 g, Gamesa",
    marca: "Gamesa",
    categoria: "Panadería y Galletas",
    subcategoria: "Galletas infantiles",
    precio: 10.00,
    codigo: "GAM002",
    unidadMedida: "pieza",
    peso: "100 g",
    stockMinimo: 30,
    ubicacion: "Estante galletas",
    perecedero: false,
    notas: "Popular entre niños"
  },
  {
    nombre: "Roles de canela",
    descripcion: "4 piezas, Marinela",
    marca: "Marinela",
    categoria: "Panadería y Galletas",
    subcategoria: "Pan dulce",
    precio: 22.00,
    codigo: "MAR002",
    unidadMedida: "paquete",
    peso: "280 g",
    stockMinimo: 20,
    ubicacion: "Estante pan dulce",
    perecedero: true,
    notas: "Pan dulce con canela"
  },
  {
    nombre: "Donas azucaradas",
    descripcion: "6 piezas, Bimbo",
    marca: "Bimbo",
    categoria: "Panadería y Galletas",
    subcategoria: "Donas",
    precio: 26.00,
    codigo: "BIM002",
    unidadMedida: "paquete",
    peso: "300 g",
    stockMinimo: 18,
    ubicacion: "Estante pan dulce",
    perecedero: true,
    notas: "Producto popular para desayuno"
  },

  // DULCES Y CHOCOLATES
  {
    nombre: "Chocolate en barra",
    descripcion: "18 g, Carlos V",
    marca: "Carlos V",
    categoria: "Dulces y Chocolates",
    subcategoria: "Chocolates",
    precio: 6.50,
    codigo: "CAR001",
    unidadMedida: "pieza",
    peso: "18 g",
    stockMinimo: 40,
    ubicacion: "Exhibidor dulces",
    perecedero: false,
    notas: "Evitar exposición a altas temperaturas"
  },
  {
    nombre: "Dulce de tamarindo con chile",
    descripcion: "14 g, Pulparindo",
    marca: "Pulparindo",
    categoria: "Dulces y Chocolates",
    subcategoria: "Dulces enchilados",
    precio: 4.50,
    codigo: "PUL001",
    unidadMedida: "pieza",
    peso: "14 g",
    stockMinimo: 50,
    ubicacion: "Exhibidor dulces",
    perecedero: false,
    notas: "Producto muy popular"
  },
  {
    nombre: "Mazapán de cacahuate",
    descripcion: "28 g, De la Rosa",
    marca: "De la Rosa",
    categoria: "Dulces y Chocolates",
    subcategoria: "Dulces tradicionales",
    precio: 5.00,
    codigo: "ROS001",
    unidadMedida: "pieza",
    peso: "28 g",
    stockMinimo: 45,
    ubicacion: "Exhibidor dulces",
    perecedero: false,
    notas: "Dulce mexicano tradicional"
  },
  {
    nombre: "Chocolate Abuelita",
    descripcion: "90 g, Nestlé",
    marca: "Nestlé",
    categoria: "Dulces y Chocolates",
    subcategoria: "Chocolate para bebidas",
    precio: 18.00,
    codigo: "NES001",
    unidadMedida: "pieza",
    peso: "90 g",
    stockMinimo: 20,
    ubicacion: "Estante chocolates",
    perecedero: false,
    notas: "Chocolate tradicional mexicano"
  },
  {
    nombre: "Paleta de chile",
    descripcion: "20 g, Vero Mango",
    marca: "Vero",
    categoria: "Dulces y Chocolates",
    subcategoria: "Paletas enchiladas",
    precio: 3.50,
    codigo: "VER001",
    unidadMedida: "pieza",
    peso: "20 g",
    stockMinimo: 60,
    ubicacion: "Exhibidor dulces",
    perecedero: false,
    notas: "Paleta mexicana con chile"
  },
  {
    nombre: "Chamoy líquido",
    descripcion: "250 ml, Miguelito",
    marca: "Miguelito",
    categoria: "Dulces y Chocolates",
    subcategoria: "Salsas dulces",
    precio: 15.00,
    codigo: "MIG001",
    unidadMedida: "pieza",
    volumen: "250 ml",
    stockMinimo: 25,
    ubicacion: "Estante condimentos",
    perecedero: false,
    notas: "Salsa agridulce mexicana"
  },
  {
    nombre: "Alegría de amaranto",
    descripcion: "35 g, Dulces Tradicionales",
    marca: "Dulces Tradicionales",
    categoria: "Dulces y Chocolates",
    subcategoria: "Dulces artesanales",
    precio: 8.00,
    codigo: "DUL001",
    unidadMedida: "pieza",
    peso: "35 g",
    stockMinimo: 30,
    ubicacion: "Exhibidor dulces",
    perecedero: false,
    notas: "Dulce prehispánico mexicano"
  },

  // ALIMENTOS INSTANTÁNEOS
  {
    nombre: "Sopa instantánea sabor camarón",
    descripcion: "64 g, Maruchan",
    marca: "Maruchan",
    categoria: "Alimentos Instantáneos",
    subcategoria: "Sopas instantáneas",
    precio: 14.00,
    codigo: "MAR001",
    unidadMedida: "pieza",
    peso: "64 g",
    stockMinimo: 25,
    ubicacion: "Estante instantáneos",
    perecedero: false,
    notas: "Verificar fecha de caducidad"
  },
  {
    nombre: "Harina preparada para hot cakes",
    descripcion: "500 g, Maizena",
    marca: "Maizena",
    categoria: "Alimentos Instantáneos",
    subcategoria: "Harinas preparadas",
    precio: 28.00,
    codigo: "MAI001",
    unidadMedida: "pieza",
    peso: "500 g",
    stockMinimo: 15,
    ubicacion: "Estante harinas",
    perecedero: false,
    notas: "Mantener en lugar seco"
  },
  {
    nombre: "Sopa de pasta instantánea",
    descripcion: "85 g, Knorr",
    marca: "Knorr",
    categoria: "Alimentos Instantáneos",
    subcategoria: "Sopas instantáneas",
    precio: 16.00,
    codigo: "KNO001",
    unidadMedida: "pieza",
    peso: "85 g",
    stockMinimo: 20,
    ubicacion: "Estante instantáneos",
    perecedero: false,
    notas: "Sopa rápida y nutritiva"
  },
  {
    nombre: "Avena instantánea",
    descripcion: "400 g, Quaker",
    marca: "Quaker",
    categoria: "Alimentos Instantáneos",
    subcategoria: "Cereales instantáneos",
    precio: 35.00,
    codigo: "QUA001",
    unidadMedida: "pieza",
    peso: "400 g",
    stockMinimo: 15,
    ubicacion: "Estante cereales",
    perecedero: false,
    notas: "Desayuno saludable y rápido"
  },
  {
    nombre: "Puré de papa instantáneo",
    descripcion: "125 g, Maggi",
    marca: "Maggi",
    categoria: "Alimentos Instantáneos",
    subcategoria: "Purés instantáneos",
    precio: 22.00,
    codigo: "MAG001",
    unidadMedida: "pieza",
    peso: "125 g",
    stockMinimo: 18,
    ubicacion: "Estante instantáneos",
    perecedero: false,
    notas: "Acompañamiento fácil de preparar"
  },

  // ACEITES Y CONDIMENTOS
  {
    nombre: "Aceite vegetal",
    descripcion: "946 ml (1 L), Nutrioli",
    marca: "Nutrioli",
    categoria: "Aceites y Condimentos",
    subcategoria: "Aceites",
    precio: 42.00,
    codigo: "NUT001",
    unidadMedida: "litro",
    volumen: "946 ml",
    stockMinimo: 10,
    ubicacion: "Estante aceites",
    perecedero: false,
    notas: "Mantener en lugar fresco y seco"
  },
  {
    nombre: "Salsa picante",
    descripcion: "370 ml, Valentina",
    marca: "Valentina",
    categoria: "Aceites y Condimentos",
    subcategoria: "Salsas",
    precio: 22.00,
    codigo: "VAL001",
    unidadMedida: "pieza",
    volumen: "370 ml",
    stockMinimo: 15,
    ubicacion: "Estante condimentos",
    perecedero: false,
    notas: "Producto mexicano popular"
  },
  {
    nombre: "Salsa verde",
    descripcion: "210 g, Herdez",
    marca: "Herdez",
    categoria: "Aceites y Condimentos",
    subcategoria: "Salsas mexicanas",
    precio: 18.00,
    codigo: "HER001",
    unidadMedida: "pieza",
    peso: "210 g",
    stockMinimo: 20,
    ubicacion: "Estante condimentos",
    perecedero: false,
    notas: "Salsa tradicional mexicana"
  },
  {
    nombre: "Consomé de pollo",
    descripcion: "240 g, Knorr",
    marca: "Knorr",
    categoria: "Aceites y Condimentos",
    subcategoria: "Cubos y polvos",
    precio: 25.00,
    codigo: "KNO002",
    unidadMedida: "pieza",
    peso: "240 g",
    stockMinimo: 15,
    ubicacion: "Estante condimentos",
    perecedero: false,
    notas: "Condimento básico para cocinar"
  },
  {
    nombre: "Chile piquín molido",
    descripcion: "40 g, McCormick",
    marca: "McCormick",
    categoria: "Aceites y Condimentos",
    subcategoria: "Especias mexicanas",
    precio: 16.00,
    codigo: "MCC001",
    unidadMedida: "pieza",
    peso: "40 g",
    stockMinimo: 25,
    ubicacion: "Estante especias",
    perecedero: false,
    notas: "Especia mexicana picante"
  },
  {
    nombre: "Vinagre blanco",
    descripcion: "500 ml, Clemente Jacques",
    marca: "Clemente Jacques",
    categoria: "Aceites y Condimentos",
    subcategoria: "Vinagres",
    precio: 14.00,
    codigo: "CLE001",
    unidadMedida: "pieza",
    volumen: "500 ml",
    stockMinimo: 20,
    ubicacion: "Estante condimentos",
    perecedero: false,
    notas: "Condimento básico para cocinar"
  },

  // ENLATADOS Y CONSERVAS
  {
    nombre: "Chiles jalapeños en escabeche",
    descripcion: "220 g, La Costeña",
    marca: "La Costeña",
    categoria: "Enlatados y Conservas",
    subcategoria: "Vegetales enlatados",
    precio: 18.50,
    codigo: "COS001",
    unidadMedida: "pieza",
    peso: "220 g",
    stockMinimo: 20,
    ubicacion: "Estante enlatados",
    perecedero: false,
    notas: "Verificar fecha de caducidad"
  },
  {
    nombre: "Atún en agua",
    descripcion: "140 g, Dolores",
    marca: "Dolores",
    categoria: "Enlatados y Conservas",
    subcategoria: "Pescados y mariscos",
    precio: 16.00,
    codigo: "DOL001",
    unidadMedida: "pieza",
    peso: "140 g",
    stockMinimo: 25,
    ubicacion: "Estante enlatados",
    perecedero: false,
    notas: "Producto básico, mantener stock"
  },
  {
    nombre: "Frijoles refritos negros",
    descripcion: "430 g, La Sierra",
    marca: "La Sierra",
    categoria: "Enlatados y Conservas",
    subcategoria: "Legumbres",
    precio: 24.00,
    codigo: "SIE001",
    unidadMedida: "pieza",
    peso: "430 g",
    stockMinimo: 15,
    ubicacion: "Estante enlatados",
    perecedero: false,
    notas: "Producto básico mexicano"
  },
  {
    nombre: "Sardinas en tomate",
    descripcion: "425 g, Calmex",
    marca: "Calmex",
    categoria: "Enlatados y Conservas",
    subcategoria: "Pescados y mariscos",
    precio: 22.00,
    codigo: "CAL001",
    unidadMedida: "pieza",
    peso: "425 g",
    stockMinimo: 20,
    ubicacion: "Estante enlatados",
    perecedero: false,
    notas: "Rico en proteínas y omega 3"
  },
  {
    nombre: "Elote dulce en grano",
    descripcion: "410 g, Del Monte",
    marca: "Del Monte",
    categoria: "Enlatados y Conservas",
    subcategoria: "Vegetales enlatados",
    precio: 26.00,
    codigo: "DEL002",
    unidadMedida: "pieza",
    peso: "410 g",
    stockMinimo: 18,
    ubicacion: "Estante enlatados",
    perecedero: false,
    notas: "Ingrediente versátil para ensaladas"
  },
  {
    nombre: "Chiles chipotles adobados",
    descripcion: "215 g, San Marcos",
    marca: "San Marcos",
    categoria: "Enlatados y Conservas",
    subcategoria: "Chiles procesados",
    precio: 20.00,
    codigo: "SAN001",
    unidadMedida: "pieza",
    peso: "215 g",
    stockMinimo: 15,
    ubicacion: "Estante enlatados",
    perecedero: false,
    notas: "Chile mexicano ahumado"
  },
  {
    nombre: "Frijoles bayos enteros",
    descripcion: "560 g, La Costeña",
    marca: "La Costeña",
    categoria: "Enlatados y Conservas",
    subcategoria: "Legumbres",
    precio: 28.00,
    codigo: "COS002",
    unidadMedida: "pieza",
    peso: "560 g",
    stockMinimo: 12,
    ubicacion: "Estante enlatados",
    perecedero: false,
    notas: "Frijoles mexicanos tradicionales"
  },

  // ABARROTES BÁSICOS
  {
    nombre: "Tortillas de maíz",
    descripcion: "1 kg, Marca local / tortillería",
    marca: "Tortillería Local",
    categoria: "Abarrotes Básicos",
    subcategoria: "Tortillas",
    precio: 18.00,
    codigo: "TOR001",
    unidadMedida: "kilogramo",
    peso: "1 kg",
    stockMinimo: 20,
    ubicacion: "Refrigerador",
    perecedero: true,
    notas: "Producto perecedero, consumir preferentemente el mismo día"
  },
  {
    nombre: "Arroz pulido",
    descripcion: "1 kg, Verde Valle",
    marca: "Verde Valle",
    categoria: "Abarrotes Básicos",
    subcategoria: "Cereales",
    precio: 22.00,
    codigo: "VER001",
    unidadMedida: "kilogramo",
    peso: "1 kg",
    stockMinimo: 12,
    ubicacion: "Estante cereales",
    perecedero: false,
    notas: "Mantener en recipiente cerrado"
  },
  {
    nombre: "Azúcar estándar",
    descripcion: "1 kg, Zulka",
    marca: "Zulka",
    categoria: "Abarrotes Básicos",
    subcategoria: "Endulzantes",
    precio: 20.00,
    codigo: "ZUL001",
    unidadMedida: "kilogramo",
    peso: "1 kg",
    stockMinimo: 10,
    ubicacion: "Estante abarrotes",
    perecedero: false,
    notas: "Mantener en lugar seco"
  },
  {
    nombre: "Sal refinada",
    descripcion: "750 g, La Fina",
    marca: "La Fina",
    categoria: "Abarrotes Básicos",
    subcategoria: "Condimentos básicos",
    precio: 8.00,
    codigo: "FIN001",
    unidadMedida: "pieza",
    peso: "750 g",
    stockMinimo: 15,
    ubicacion: "Estante condimentos",
    perecedero: false,
    notas: "Producto básico, siempre tener disponible"
  },
  {
    nombre: "Frijol negro seco",
    descripcion: "900 g, Verde Valle",
    marca: "Verde Valle",
    categoria: "Abarrotes Básicos",
    subcategoria: "Legumbres secas",
    precio: 32.00,
    codigo: "VER002",
    unidadMedida: "pieza",
    peso: "900 g",
    stockMinimo: 15,
    ubicacion: "Estante legumbres",
    perecedero: false,
    notas: "Legumbre básica mexicana"
  },
  {
    nombre: "Harina de maíz",
    descripcion: "1 kg, Maseca",
    marca: "Maseca",
    categoria: "Abarrotes Básicos",
    subcategoria: "Harinas",
    precio: 24.00,
    codigo: "MAS001",
    unidadMedida: "kilogramo",
    peso: "1 kg",
    stockMinimo: 20,
    ubicacion: "Estante harinas",
    perecedero: false,
    notas: "Harina para tortillas y tamales"
  },
  {
    nombre: "Lentejas secas",
    descripcion: "500 g, Verde Valle",
    marca: "Verde Valle",
    categoria: "Abarrotes Básicos",
    subcategoria: "Legumbres secas",
    precio: 28.00,
    codigo: "VER003",
    unidadMedida: "pieza",
    peso: "500 g",
    stockMinimo: 12,
    ubicacion: "Estante legumbres",
    perecedero: false,
    notas: "Rica en proteínas vegetales"
  },
  {
    nombre: "Pasta para sopa",
    descripcion: "200 g, La Moderna",
    marca: "La Moderna",
    categoria: "Abarrotes Básicos",
    subcategoria: "Pastas",
    precio: 14.00,
    codigo: "MOD001",
    unidadMedida: "pieza",
    peso: "200 g",
    stockMinimo: 25,
    ubicacion: "Estante pastas",
    perecedero: false,
    notas: "Pasta mexicana tradicional"
  },

  // BEBIDAS CALIENTES
  {
    nombre: "Café soluble clásico",
    descripcion: "100 g, Legal",
    marca: "Legal",
    categoria: "Bebidas Calientes",
    subcategoria: "Café",
    precio: 45.00,
    codigo: "LEG001",
    unidadMedida: "pieza",
    peso: "100 g",
    stockMinimo: 12,
    ubicacion: "Estante bebidas calientes",
    perecedero: false,
    notas: "Mantener en lugar seco, alejado de la humedad"
  },
  {
    nombre: "Té de manzanilla",
    descripcion: "25 sobres, McCormick",
    marca: "McCormick",
    categoria: "Bebidas Calientes",
    subcategoria: "Tés e infusiones",
    precio: 18.00,
    codigo: "MCC002",
    unidadMedida: "caja",
    peso: "37.5 g",
    stockMinimo: 15,
    ubicacion: "Estante tés",
    perecedero: false,
    notas: "Infusión relajante tradicional"
  },
  {
    nombre: "Canela en polvo",
    descripcion: "60 g, McCormick",
    marca: "McCormick",
    categoria: "Bebidas Calientes",
    subcategoria: "Especias para bebidas",
    precio: 22.00,
    codigo: "MCC003",
    unidadMedida: "pieza",
    peso: "60 g",
    stockMinimo: 20,
    ubicacion: "Estante especias",
    perecedero: false,
    notas: "Especia tradicional mexicana"
  },
  {
    nombre: "Chocolate en polvo",
    descripcion: "400 g, Ibarra",
    marca: "Ibarra",
    categoria: "Bebidas Calientes",
    subcategoria: "Chocolate para bebidas",
    precio: 35.00,
    codigo: "IBA001",
    unidadMedida: "pieza",
    peso: "400 g",
    stockMinimo: 10,
    ubicacion: "Estante chocolates",
    perecedero: false,
    notas: "Chocolate mexicano tradicional"
  },

  // PRODUCTOS DE LIMPIEZA
  {
    nombre: "Jabón para trastes",
    descripcion: "500 ml, Axion",
    marca: "Axion",
    categoria: "Productos de Limpieza",
    subcategoria: "Limpieza de cocina",
    precio: 18.00,
    codigo: "AXI001",
    unidadMedida: "pieza",
    volumen: "500 ml",
    stockMinimo: 15,
    ubicacion: "Estante limpieza",
    perecedero: false,
    notas: "Producto de limpieza básico"
  },
  {
    nombre: "Cloro blanqueador",
    descripcion: "1 L, Cloralex",
    marca: "Cloralex",
    categoria: "Productos de Limpieza",
    subcategoria: "Desinfectantes",
    precio: 22.00,
    codigo: "CLO002",
    unidadMedida: "litro",
    volumen: "1 L",
    stockMinimo: 12,
    ubicacion: "Estante limpieza",
    perecedero: false,
    notas: "Mantener fuera del alcance de niños"
  },
  {
    nombre: "Suavizante de telas",
    descripcion: "850 ml, Suavitel",
    marca: "Suavitel",
    categoria: "Productos de Limpieza",
    subcategoria: "Cuidado de ropa",
    precio: 28.00,
    codigo: "SUA001",
    unidadMedida: "pieza",
    volumen: "850 ml",
    stockMinimo: 10,
    ubicacion: "Estante limpieza",
    perecedero: false,
    notas: "Deja ropa suave y perfumada"
  },

  // CUIDADO PERSONAL
  {
    nombre: "Champú anticaspa",
    descripcion: "400 ml, Head & Shoulders",
    marca: "Head & Shoulders",
    categoria: "Cuidado Personal",
    subcategoria: "Cuidado del cabello",
    precio: 45.00,
    codigo: "HEA001",
    unidadMedida: "pieza",
    volumen: "400 ml",
    stockMinimo: 8,
    ubicacion: "Estante cuidado personal",
    perecedero: false,
    notas: "Tratamiento especializado"
  },
  {
    nombre: "Pasta dental",
    descripcion: "100 ml, Colgate",
    marca: "Colgate",
    categoria: "Cuidado Personal",
    subcategoria: "Higiene bucal",
    precio: 32.00,
    codigo: "COL001",
    unidadMedida: "pieza",
    volumen: "100 ml",
    stockMinimo: 15,
    ubicacion: "Estante cuidado personal",
    perecedero: false,
    notas: "Cuidado dental básico"
  },
  {
    nombre: "Jabón de tocador",
    descripcion: "150 g, Palmolive",
    marca: "Palmolive",
    categoria: "Cuidado Personal",
    subcategoria: "Higiene corporal",
    precio: 12.00,
    codigo: "PAL001",
    unidadMedida: "pieza",
    peso: "150 g",
    stockMinimo: 20,
    ubicacion: "Estante cuidado personal",
    perecedero: false,
    notas: "Jabón suave para toda la familia"
  }
];

// Función principal para inicializar productos
async function initializeProducts() {
  try {
    console.log('Iniciando inicialización de productos...');
    
    // Primero, limpiar productos existentes (opcional)
    console.log('Limpiando productos existentes...');
    const existingProducts = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    const deletePromises = existingProducts.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log(`Se eliminaron ${existingProducts.size} productos existentes`);
    
    // Agregar productos nuevos
    console.log('Agregando nuevos productos...');
    const addPromises = productos.map(async (producto, index) => {
      try {
        const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
          ...producto,
          createdAt: new Date(),
          updatedAt: new Date(),
          activo: true,
          detectionId: null, // Para futuras detecciones de IA
          precisionDeteccion: null
        });
        
        console.log(`Producto agregado: ${producto.nombre} (ID: ${docRef.id})`);
        return { id: docRef.id, ...producto };
      } catch (error) {
        console.error(`Error agregando producto ${producto.nombre}:`, error);
        throw error;
      }
    });
    
    const productosAgregados = await Promise.all(addPromises);
    
    // Resumen por categorías
    const categorias = [...new Set(productos.map(p => p.categoria))];
    console.log('\n RESUMEN POR CATEGORÍAS:');
    categorias.forEach(categoria => {
      const productosCategoria = productos.filter(p => p.categoria === categoria);
      console.log(`  ${categoria}: ${productosCategoria.length} productos`);
      productosCategoria.forEach(p => {
        console.log(`    - ${p.nombre} ($${p.precio})`);
      });
    });
    
    console.log(`\n¡Inicialización completada exitosamente!`);
    console.log(`Total de productos agregados: ${productosAgregados.length}`);
    console.log(`Total de categorías: ${categorias.length}`);
    
    return {
      success: true,
      productosAgregados: productosAgregados.length,
      categorias: categorias.length,
      productos: productosAgregados
    };
    
  } catch (error) {
    console.error('Error durante la inicialización:', error);
    throw error;
  }
}

// Ejecutar el script solo si se llama directamente
if (require.main === module) {
  initializeProducts()
    .then(result => {
      console.log('\n Script completado exitosamente:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { initializeProducts, productos };