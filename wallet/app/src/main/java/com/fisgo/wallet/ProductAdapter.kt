package com.fisgo.wallet

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView

class ProductAdapter(
    private val products: List<Product>,
    private val onProductClick: (Product) -> Unit
) : RecyclerView.Adapter<ProductAdapter.ProductViewHolder>() {

    class ProductViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val categoryIcon: TextView = view.findViewById(R.id.categoryIcon)
        val productName: TextView = view.findViewById(R.id.productName)
        val productPrice: TextView = view.findViewById(R.id.productPrice)
        val stockBadge: TextView = view.findViewById(R.id.stockBadge)
        val productCode: TextView = view.findViewById(R.id.productCode)
        val stockIndicator: View = view.findViewById(R.id.stockIndicator)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_product_card, parent, false)
        return ProductViewHolder(view)
    }

    override fun onBindViewHolder(holder: ProductViewHolder, position: Int) {
        val product = products[position]
        val context = holder.itemView.context
        
        // Icono de categoría
        holder.categoryIcon.text = product.iconoCategoria
        
        // Nombre del producto
        holder.productName.text = product.nombre
        
        // Precio
        holder.productPrice.text = product.precioFormateado
        
        // Stock badge
        holder.stockBadge.text = "Stock: ${product.cantidad} ${product.unidadMedida}"
        
        // Código del producto (opcional)
        if (product.codigo.isNotEmpty()) {
            holder.productCode.text = product.codigo
            holder.productCode.visibility = View.VISIBLE
        } else {
            holder.productCode.visibility = View.GONE
        }
        
        // Configurar colores según el estado del stock
        val (backgroundColor, textColor) = when (product.stockStatus) {
            StockStatus.SIN_STOCK -> {
                Pair(ContextCompat.getColor(context, android.R.color.holo_red_light),
                     ContextCompat.getColor(context, android.R.color.white))
            }
            StockStatus.STOCK_BAJO -> {
                Pair(ContextCompat.getColor(context, android.R.color.holo_orange_light),
                     ContextCompat.getColor(context, android.R.color.white))
            }
            StockStatus.STOCK_MEDIO -> {
                Pair(ContextCompat.getColor(context, android.R.color.holo_blue_light),
                     ContextCompat.getColor(context, android.R.color.white))
            }
            StockStatus.STOCK_ALTO -> {
                Pair(ContextCompat.getColor(context, android.R.color.holo_green_light),
                     ContextCompat.getColor(context, android.R.color.white))
            }
        }
        
        holder.stockBadge.setBackgroundColor(backgroundColor)
        holder.stockBadge.setTextColor(textColor)
        
        // Indicador visual de stock
        holder.stockIndicator.setBackgroundColor(backgroundColor)
        
        // Click listener
        holder.itemView.setOnClickListener {
            onProductClick(product)
        }
    }

    override fun getItemCount() = products.size
}