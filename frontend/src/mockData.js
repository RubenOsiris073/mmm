// Datos de prueba para uso en modo offline o cuando falla Firebase

export const mockProducts = [
  { id: "1", name: "Smartphone Galaxy S21", price: 799.99, category: "Electrónica", stock: 15, image: "https://via.placeholder.com/150" },
  { id: "2", name: "Laptop HP Pavilion", price: 999.99, category: "Computadoras", stock: 8, image: "https://via.placeholder.com/150" },
  { id: "3", name: "Auriculares Bluetooth", price: 59.99, category: "Accesorios", stock: 25, image: "https://via.placeholder.com/150" },
  { id: "4", name: "Mouse Logitech", price: 29.99, category: "Periféricos", stock: 30, image: "https://via.placeholder.com/150" },
  { id: "5", name: "Monitor LG 27\"", price: 249.99, category: "Monitores", stock: 12, image: "https://via.placeholder.com/150" }
];

export const mockSales = [
  {
    id: "s1",
    date: new Date().toISOString(),
    customer: "Cliente 1",
    items: [
      { productId: "1", name: "Smartphone Galaxy S21", price: 799.99, quantity: 1 },
      { productId: "3", name: "Auriculares Bluetooth", price: 59.99, quantity: 1 }
    ],
    total: 859.98,
    paymentMethod: "Tarjeta de crédito"
  },
  {
    id: "s2",
    date: new Date(Date.now() - 86400000).toISOString(), // Ayer
    customer: "Cliente 2",
    items: [
      { productId: "2", name: "Laptop HP Pavilion", price: 999.99, quantity: 1 }
    ],
    total: 999.99,
    paymentMethod: "Efectivo"
  }
];

export const mockInventory = [
  { id: "i1", productId: "1", quantity: 15, location: "Almacén Principal" },
  { id: "i2", productId: "2", quantity: 8, location: "Almacén Principal" },
  { id: "i3", productId: "3", quantity: 25, location: "Estantería A" },
  { id: "i4", productId: "4", quantity: 30, location: "Estantería B" },
  { id: "i5", productId: "5", quantity: 12, location: "Almacén Secundario" }
];