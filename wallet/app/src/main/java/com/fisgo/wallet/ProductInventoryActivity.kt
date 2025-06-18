package com.fisgo.wallet

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.SearchView
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

class ProductInventoryActivity : AppCompatActivity() {

    private lateinit var backButton: ImageView
    private lateinit var searchView: SearchView
    private lateinit var categoryChipGroup: ChipGroup
    private lateinit var productsRecyclerView: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var emptyStateText: LinearLayout
    private lateinit var refreshFab: ImageView
    
    private lateinit var productAdapter: ProductListAdapter
    private var allProducts = mutableListOf<Product>()
    private var filteredProducts = mutableListOf<Product>()
    private var selectedCategory = "all"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_product_inventory)

        initViews()
        setupRecyclerView()
        setupListeners()
        loadProducts()
    }

    private fun initViews() {
        backButton = findViewById(R.id.backButton)
        searchView = findViewById(R.id.searchView)
        categoryChipGroup = findViewById(R.id.categoryChipGroup)
        productsRecyclerView = findViewById(R.id.productsRecyclerView)
        progressBar = findViewById(R.id.progressBar)
        emptyStateText = findViewById(R.id.emptyStateText)
        refreshFab = findViewById(R.id.refreshFab)
    }

    private fun setupRecyclerView() {
        productAdapter = ProductListAdapter(filteredProducts) { product ->
            // Manejar click en producto - mostrar detalles
            showProductDetails(product)
        }
        
        productsRecyclerView.apply {
            layoutManager = LinearLayoutManager(this@ProductInventoryActivity)
            adapter = productAdapter
        }
    }

    private fun setupListeners() {
        backButton.setOnClickListener {
            finish()
        }

        refreshFab.setOnClickListener {
            loadProducts()
        }

        searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                return false
            }

            override fun onQueryTextChange(newText: String?): Boolean {
                filterProducts(newText ?: "", selectedCategory)
                return true
            }
        })

        categoryChipGroup.setOnCheckedStateChangeListener { _, checkedIds ->
            if (checkedIds.isNotEmpty()) {
                val chip = findViewById<Chip>(checkedIds[0])
                selectedCategory = chip.tag as String? ?: "all"
            } else {
                selectedCategory = "all"
            }
            filterProducts(searchView.query.toString(), selectedCategory)
        }
    }

    private fun loadProducts() {
        showLoading(true)
        
        lifecycleScope.launch {
            try {
                val products = withContext(Dispatchers.IO) {
                    fetchProductsFromAPI()
                }
                allProducts.clear()
                allProducts.addAll(products)
                
                setupCategoryChips()
                filterProducts("", "all")
                
                showLoading(false)
                Log.d("ProductInventory", "Loaded ${products.size} products")
                
            } catch (e: Exception) {
                Log.e("ProductInventory", "Error loading products", e)
                showError("Error al cargar productos: ${e.message}")
                showLoading(false)
            }
        }
    }

    private suspend fun fetchProductsFromAPI(): List<Product> {
        return try {
            val url = URL("http://10.0.2.2:5000/api/products")
            val connection = url.openConnection() as HttpURLConnection
            
            connection.requestMethod = "GET"
            connection.setRequestProperty("Content-Type", "application/json")
            connection.connectTimeout = 10000
            connection.readTimeout = 10000
            
            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val response = BufferedReader(InputStreamReader(connection.inputStream)).use { 
                    it.readText() 
                }
                
                parseProductsFromJSON(response)
            } else {
                throw Exception("Error del servidor: $responseCode")
            }
        } catch (e: Exception) {
            Log.e("ProductInventory", "Error fetching products", e)
            throw e
        }
    }

    private fun parseProductsFromJSON(jsonString: String): List<Product> {
        val products = mutableListOf<Product>()
        
        try {
            val jsonResponse = JSONObject(jsonString)
            val success = jsonResponse.optBoolean("success", false)
            
            if (success) {
                val dataArray = jsonResponse.optJSONArray("data") ?: JSONArray()
                
                for (i in 0 until dataArray.length()) {
                    val item = dataArray.getJSONObject(i)
                    
                    val product = Product(
                        id = item.optString("id", ""),
                        nombre = item.optString("nombre", item.optString("name", "Producto sin nombre")),
                        precio = item.optDouble("precio", item.optDouble("price", 0.0)),
                        cantidad = item.optInt("cantidad", item.optInt("stock", 0)),
                        categoria = item.optString("categoria", item.optString("category", "sin-categoria")),
                        codigo = item.optString("codigo", ""),
                        descripcion = item.optString("descripcion", item.optString("notas", "")),
                        stockMinimo = item.optInt("stockMinimo", 5)
                    )
                    
                    products.add(product)
                }
            }
        } catch (e: Exception) {
            Log.e("ProductInventory", "Error parsing JSON", e)
        }
        
        return products
    }

    private fun setupCategoryChips() {
        categoryChipGroup.removeAllViews()
        
        // Chip "Todos"
        val allChip = Chip(this).apply {
            text = "Todos"
            tag = "all"
            isCheckable = true
            isChecked = true
        }
        categoryChipGroup.addView(allChip)
        
        // Obtener categorías únicas
        val categories = allProducts.map { it.categoria }.distinct().sorted()
        
        categories.forEach { category ->
            val chip = Chip(this).apply {
                text = category.replaceFirstChar { it.uppercase() }
                tag = category
                isCheckable = true
            }
            categoryChipGroup.addView(chip)
        }
    }

    private fun filterProducts(searchText: String, category: String) {
        filteredProducts.clear()
        
        var filtered = if (category == "all") {
            allProducts
        } else {
            allProducts.filter { it.categoria == category }
        }
        
        if (searchText.isNotEmpty()) {
            filtered = filtered.filter { product ->
                product.nombre.contains(searchText, ignoreCase = true) ||
                product.codigo.contains(searchText, ignoreCase = true)
            }
        }
        
        filteredProducts.addAll(filtered)
        productAdapter.notifyDataSetChanged()
        
        // Mostrar/ocultar estado vacío
        if (filteredProducts.isEmpty()) {
            showEmptyState()
        } else {
            hideEmptyState()
        }
    }

    private fun showLoading(show: Boolean) {
        progressBar.visibility = if (show) View.VISIBLE else View.GONE
        productsRecyclerView.visibility = if (show) View.GONE else View.VISIBLE
    }

    private fun showEmptyState() {
        emptyStateText.visibility = View.VISIBLE
        productsRecyclerView.visibility = View.GONE
        // El texto ya está definido en el layout XML, no necesitamos cambiarlo dinámicamente
    }

    private fun hideEmptyState() {
        emptyStateText.visibility = View.GONE
        productsRecyclerView.visibility = View.VISIBLE
    }

    private fun showError(message: String) {
        // Puedes implementar un Toast o Snackbar aquí
        Log.e("ProductInventory", message)
    }

    private fun showProductDetails(product: Product) {
        // Crear intent para abrir detalles del producto
        val intent = Intent(this, ProductDetailActivity::class.java)
        intent.putExtra("product", product)
        startActivity(intent)
    }
}