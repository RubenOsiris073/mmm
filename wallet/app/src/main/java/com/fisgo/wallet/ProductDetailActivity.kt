package com.fisgo.wallet

import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import java.text.NumberFormat
import java.util.*

class ProductDetailActivity : AppCompatActivity() {

    private lateinit var backButton: ImageView
    private lateinit var categoryIcon: TextView
    private lateinit var productName: TextView
    private lateinit var productPrice: TextView
    private lateinit var productCode: TextView
    private lateinit var productDescription: TextView
    private lateinit var productCategory: TextView
    private lateinit var stockStatus: TextView
    private lateinit var stockQuantity: TextView
    private lateinit var stockIndicator: TextView
    private lateinit var productUnit: TextView
    private lateinit var productLocation: TextView
    private lateinit var productSupplier: TextView
    private lateinit var stockMinimum: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_product_detail)

        initViews()
        setupListeners()
        loadProductData()
    }

    private fun initViews() {
        backButton = findViewById(R.id.backButton)
        categoryIcon = findViewById(R.id.categoryIcon)
        productName = findViewById(R.id.productName)
        productPrice = findViewById(R.id.productPrice)
        productCode = findViewById(R.id.productCode)
        productDescription = findViewById(R.id.productDescription)
        productCategory = findViewById(R.id.productCategory)
        stockStatus = findViewById(R.id.stockStatus)
        stockQuantity = findViewById(R.id.stockQuantity)
        stockIndicator = findViewById(R.id.stockIndicator)
        productUnit = findViewById(R.id.productUnit)
        productLocation = findViewById(R.id.productLocation)
        productSupplier = findViewById(R.id.productSupplier)
        stockMinimum = findViewById(R.id.stockMinimum)
    }

    private fun setupListeners() {
        backButton.setOnClickListener {
            finish()
        }
    }

    private fun loadProductData() {
        val product = intent.getParcelableExtra<Product>("product")
        
        if (product != null) {
            displayProductInfo(product)
        } else {
            finish() // Cerrar si no hay producto
        }
    }

    private fun displayProductInfo(product: Product) {
        // Icono de categoría
        categoryIcon.text = product.iconoCategoria
        
        // Información básica
        productName.text = product.nombre
        productPrice.text = formatCurrency(product.precio)
        
        // Código del producto
        if (product.codigo.isNotEmpty()) {
            productCode.text = product.codigo
        } else {
            productCode.text = "Sin código"
        }
        
        // Descripción
        if (product.descripcion.isNotEmpty()) {
            productDescription.text = product.descripcion
        } else {
            productDescription.text = "Sin descripción disponible"
        }
        
        // Categoría
        productCategory.text = product.categoriaFormateada
        
        // Estado del stock
        val (stockColor, statusText) = when (product.stockStatus) {
            StockStatus.SIN_STOCK -> {
                Pair(ContextCompat.getColor(this, R.color.stock_empty), "Sin Stock")
            }
            StockStatus.STOCK_BAJO -> {
                Pair(ContextCompat.getColor(this, R.color.stock_low), "Stock Bajo")
            }
            StockStatus.STOCK_MEDIO -> {
                Pair(ContextCompat.getColor(this, R.color.stock_medium), "Stock Normal")
            }
            StockStatus.STOCK_ALTO -> {
                Pair(ContextCompat.getColor(this, R.color.stock_high), "Stock Alto")
            }
        }
        
        stockStatus.text = statusText
        stockStatus.setTextColor(stockColor)
        stockIndicator.setBackgroundColor(stockColor)
        
        // Cantidad en stock
        stockQuantity.text = "${product.cantidad}"
        productUnit.text = product.unidadMedida
        
        // Información adicional
        productLocation.text = if (product.ubicacion.isNotEmpty()) {
            product.ubicacion
        } else {
            "No especificada"
        }
        
        productSupplier.text = if (product.proveedor.isNotEmpty()) {
            product.proveedor
        } else {
            "No especificado"
        }
        
        stockMinimum.text = "${product.stockMinimo} ${product.unidadMedida}"
    }

    private fun formatCurrency(amount: Double): String {
        val format = NumberFormat.getCurrencyInstance(Locale("es", "MX"))
        return format.format(amount).replace("MX$", "$")
    }
}