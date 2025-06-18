package com.fisgo.wallet

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView

class ProductListAdapter(
    private val products: List<Product>,
    private val onProductClick: (Product) -> Unit
) : RecyclerView.Adapter<ProductListAdapter.ProductViewHolder>() {

    class ProductViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val categoryIconText: TextView = view.findViewById(R.id.categoryIconText)
        val productNameText: TextView = view.findViewById(R.id.productNameText)
        val productCodeText: TextView = view.findViewById(R.id.productCodeText)
        val productDescriptionText: TextView = view.findViewById(R.id.productDescriptionText)
        val productPriceText: TextView = view.findViewById(R.id.productPriceText)
        val stockStatusIndicator: View = view.findViewById(R.id.stockStatusIndicator)
        val stockStatusText: TextView = view.findViewById(R.id.stockStatusText)
        val stockQuantityText: TextView = view.findViewById(R.id.stockQuantityText)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_product, parent, false)
        return ProductViewHolder(view)
    }

    override fun onBindViewHolder(holder: ProductViewHolder, position: Int) {
        val product = products[position]
        val context = holder.itemView.context
        
        // Icono de categoría
        holder.categoryIconText.text = product.iconoCategoria
        
        // Información del producto
        holder.productNameText.text = product.nombre
        
        // Código del producto
        if (product.codigo.isNotEmpty()) {
            holder.productCodeText.text = "Código: ${product.codigo}"
            holder.productCodeText.visibility = View.VISIBLE
        } else {
            holder.productCodeText.visibility = View.GONE
        }
        
        // Descripción
        if (product.descripcion.isNotEmpty()) {
            holder.productDescriptionText.text = product.descripcion
            holder.productDescriptionText.visibility = View.VISIBLE
        } else {
            holder.productDescriptionText.text = "Categoría: ${product.categoriaFormateada}"
        }
        
        // Precio
        holder.productPriceText.text = product.precioFormateado
        
        // Estado del stock
        val (stockColor, stockText) = when (product.stockStatus) {
            StockStatus.SIN_STOCK -> {
                Pair(ContextCompat.getColor(context, R.color.stock_empty), "Sin Stock")
            }
            StockStatus.STOCK_BAJO -> {
                Pair(ContextCompat.getColor(context, R.color.stock_low), "Stock Bajo")
            }
            StockStatus.STOCK_MEDIO -> {
                Pair(ContextCompat.getColor(context, R.color.stock_medium), "Stock Normal")
            }
            StockStatus.STOCK_ALTO -> {
                Pair(ContextCompat.getColor(context, R.color.stock_high), "Stock Alto")
            }
        }
        
        holder.stockStatusIndicator.background = 
            ContextCompat.getDrawable(context, R.drawable.stock_indicator)?.apply {
                setTint(stockColor)
            }
        
        holder.stockStatusText.text = stockText
        holder.stockStatusText.setTextColor(stockColor)
        
        // Cantidad en stock
        holder.stockQuantityText.text = "${product.cantidad} ${product.unidadMedida}"
        
        // Click listener
        holder.itemView.setOnClickListener {
            onProductClick(product)
        }
    }

    override fun getItemCount() = products.size
}