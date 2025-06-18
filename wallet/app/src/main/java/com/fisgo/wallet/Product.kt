package com.fisgo.wallet

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class Product(
    val id: String = "",
    val nombre: String = "",
    val precio: Double = 0.0,
    val cantidad: Int = 0,
    val categoria: String = "",
    val codigo: String = "",
    val descripcion: String = "",
    val stockMinimo: Int = 5,
    val unidadMedida: String = "unidad",
    val proveedor: String = "",
    val fechaCaducidad: String = "",
    val ubicacion: String = "Bodega principal"
) : Parcelable {
    
    // Propiedades computadas útiles para la UI
    val stockStatus: StockStatus
        get() = when {
            cantidad == 0 -> StockStatus.SIN_STOCK
            cantidad <= stockMinimo -> StockStatus.STOCK_BAJO
            cantidad <= stockMinimo * 2 -> StockStatus.STOCK_MEDIO
            else -> StockStatus.STOCK_ALTO
        }
    
    val precioFormateado: String
        get() = "$${String.format("%.2f", precio)}"
        
    val categoriaFormateada: String
        get() = categoria.replaceFirstChar { it.uppercase() }
        
    // Icono emoji basado en categoría (similar al frontend)
    val iconoCategoria: String
        get() = when (categoria.lowercase()) {
            "bebidas" -> "🥤"
            "alimentos" -> "🍽️"
            "snacks", "botanas" -> "🍿"
            "dulces", "chocolates" -> "🍬"
            "panadería", "galletas" -> "🍪"
            "lácteos" -> "🥛"
            "frutas", "verduras" -> "🥕"
            "carnes" -> "🥩"
            "limpieza" -> "🧽"
            "cuidado personal" -> "🧴"
            "medicamentos" -> "💊"
            "abarrotes básicos" -> "🛒"
            "enlatados", "conservas" -> "🥫"
            else -> "📦"
        }
}

enum class StockStatus {
    SIN_STOCK,
    STOCK_BAJO,
    STOCK_MEDIO,
    STOCK_ALTO
}