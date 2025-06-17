package com.fisgo.wallet

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.*
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class SyncCodeActivity : AppCompatActivity() {
    
    private lateinit var syncCodeInput: EditText
    private lateinit var syncButton: Button
    private lateinit var progressBar: ProgressBar
    private lateinit var errorText: TextView
    private lateinit var cartContainer: LinearLayout
    private lateinit var cartRecyclerView: RecyclerView
    private lateinit var totalText: TextView
    private lateinit var payButton: Button
    private lateinit var auth: FirebaseAuth
    
    private var cartItems = mutableListOf<CartItem>()
    private var cartTotal = 0.0
    private var sessionId: String? = null
    
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sync_code)
        
        auth = Firebase.auth
        initViews()
        setupListeners()
    }
    
    private fun initViews() {
        syncCodeInput = findViewById(R.id.syncCodeInput)
        syncButton = findViewById(R.id.syncButton)
        progressBar = findViewById(R.id.progressBar)
        errorText = findViewById(R.id.errorText)
        cartContainer = findViewById(R.id.cartContainer)
        cartRecyclerView = findViewById(R.id.cartRecyclerView)
        totalText = findViewById(R.id.totalText)
        payButton = findViewById(R.id.payButton)
        
        cartRecyclerView.layoutManager = LinearLayoutManager(this)
    }
    
    private fun setupListeners() {
        syncButton.setOnClickListener {
            handleSyncCart()
        }
        
        payButton.setOnClickListener {
            handleProcessPayment()
        }
    }
    
    private fun handleSyncCart() {
        val syncCode = syncCodeInput.text.toString().trim().uppercase()
        
        if (syncCode.isEmpty()) {
            showError("Por favor ingresa un código de sincronización")
            return
        }
        
        if (syncCode.length != 6) {
            showError("El código debe tener exactamente 6 caracteres")
            return
        }
        
        showLoading(true)
        hideError()
        
        scope.launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    syncCartWithBackend(syncCode)
                }
                
                if (result.success) {
                    cartItems.clear()
                    cartItems.addAll(result.items)
                    cartTotal = result.total
                    sessionId = result.sessionId
                    showCartItems()
                    showMessage("¡Sincronización exitosa!")
                } else {
                    showError(result.error ?: "Error al sincronizar carrito")
                }
            } catch (e: Exception) {
                showError("Error de conexión: ${e.message}")
            } finally {
                showLoading(false)
            }
        }
    }
    
    private fun handleProcessPayment() {
        if (sessionId == null) {
            showError("Error: No hay sesión activa")
            return
        }
        
        // Verificar si hay suficiente saldo
        val currentBalance = WalletManager.getBalance(this)
        
        if (currentBalance < cartTotal) {
            showError("Saldo insuficiente: $${String.format("%.2f", currentBalance)} disponible. Necesitas $${String.format("%.2f", cartTotal)}")
            return
        }
        
        // Mejorar feedback visual durante el proceso
        payButton.text = "⏳ Procesando pago..."
        payButton.isEnabled = false
        showLoading(true)
        
        scope.launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    processPaymentWithBackend()
                }
                
                if (result.success) {
                    // Restar el monto del saldo de la wallet
                    WalletManager.deductAmount(this@SyncCodeActivity, cartTotal)
                    
                    // Mostrar feedback de éxito
                    payButton.text = "✅ ¡Pago exitoso!"
                    showMessage("¡Compra realizada exitosamente!")
                    
                    val intent = Intent(this@SyncCodeActivity, PaymentSuccessActivity::class.java)
                    intent.putExtra("amount", cartTotal)
                    intent.putExtra("transactionId", result.transactionId)
                    startActivity(intent)
                    finish()
                } else {
                    showError(result.error ?: "Error al procesar el pago")
                    payButton.text = "💳 Realizar Compra - $${String.format("%.2f", cartTotal)}"
                    payButton.isEnabled = true
                }
            } catch (e: Exception) {
                showError("Error de conexión: ${e.message}")
                payButton.text = "💳 Realizar Compra - $${String.format("%.2f", cartTotal)}"
                payButton.isEnabled = true
            } finally {
                showLoading(false)
            }
        }
    }
    
    private suspend fun syncCartWithBackend(code: String): SyncResult {
        return withContext(Dispatchers.IO) {
            try {
                val url = URL("http://10.0.2.2:5000/api/cart/sync/$code")
                val connection = url.openConnection() as HttpURLConnection
                
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.doOutput = true
                connection.connectTimeout = 10000
                connection.readTimeout = 10000
                
                // Enviar datos del usuario
                val requestData = JSONObject().apply {
                    put("userId", auth.currentUser?.uid ?: "anonymous")
                }
                
                OutputStreamWriter(connection.outputStream).use { writer ->
                    writer.write(requestData.toString())
                    writer.flush()
                }
                
                val responseCode = connection.responseCode
                val inputStream = if (responseCode == HttpURLConnection.HTTP_OK) {
                    connection.inputStream
                } else {
                    connection.errorStream
                }
                
                val response = BufferedReader(InputStreamReader(inputStream)).use { reader ->
                    reader.readText()
                }
                
                val jsonResponse = JSONObject(response)
                
                if (jsonResponse.getBoolean("success")) {
                    val data = jsonResponse.getJSONObject("data")
                    val itemsArray = data.getJSONArray("items")
                    val items = mutableListOf<CartItem>()
                    
                    for (i in 0 until itemsArray.length()) {
                        val item = itemsArray.getJSONObject(i)
                        items.add(
                            CartItem(
                                id = item.getString("id"),  // Cambiado de getInt a getString
                                nombre = item.getString("nombre"),
                                precio = item.getDouble("precio"),
                                quantity = item.getInt("quantity")
                            )
                        )
                    }
                    
                    SyncResult(
                        success = true,
                        items = items,
                        total = data.getDouble("total"),
                        sessionId = data.getString("sessionId")
                    )
                } else {
                    SyncResult(
                        success = false,
                        error = jsonResponse.getString("error")
                    )
                }
            } catch (e: Exception) {
                SyncResult(
                    success = false,
                    error = "Error de conexión: ${e.message}"
                )
            }
        }
    }
    
    private suspend fun processPaymentWithBackend(): PaymentResult {
        return withContext(Dispatchers.IO) {
            try {
                val url = URL("http://10.0.2.2:5000/api/cart/process-payment")
                val connection = url.openConnection() as HttpURLConnection
                
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.doOutput = true
                connection.connectTimeout = 10000
                connection.readTimeout = 10000
                
                // Enviar datos del pago
                val requestData = JSONObject().apply {
                    put("sessionId", sessionId)
                    put("userId", auth.currentUser?.uid ?: "anonymous")
                    put("amount", cartTotal)
                }
                
                OutputStreamWriter(connection.outputStream).use { writer ->
                    writer.write(requestData.toString())
                    writer.flush()
                }
                
                val responseCode = connection.responseCode
                val inputStream = if (responseCode == HttpURLConnection.HTTP_OK) {
                    connection.inputStream
                } else {
                    connection.errorStream
                }
                
                val response = BufferedReader(InputStreamReader(inputStream)).use { reader ->
                    reader.readText()
                }
                
                val jsonResponse = JSONObject(response)
                
                if (jsonResponse.getBoolean("success")) {
                    val data = jsonResponse.getJSONObject("data")
                    PaymentResult(
                        success = true,
                        transactionId = data.optString("transactionId", sessionId ?: "")
                    )
                } else {
                    PaymentResult(
                        success = false,
                        error = jsonResponse.getString("error")
                    )
                }
            } catch (e: Exception) {
                PaymentResult(
                    success = false,
                    error = "Error de conexión: ${e.message}"
                )
            }
        }
    }
    
    private fun showCartItems() {
        // Asegurar que el contenedor del carrito sea visible
        cartContainer.visibility = View.VISIBLE  // Usar View en lugar de android.view.View
        syncButton.visibility = View.GONE
        
        val adapter = CartAdapter(cartItems)
        cartRecyclerView.adapter = adapter
        
        totalText.text = "Total: $${String.format("%.2f", cartTotal)}"
        
        // Asegurar que el botón de pago sea visible y habilitado
        payButton.visibility = View.VISIBLE
        payButton.isEnabled = true
        payButton.text = "💳 Realizar Compra - $${String.format("%.2f", cartTotal)}"
        
        // Animar el botón para que sea más visible
        payButton.animate()
            .scaleX(1.05f)
            .scaleY(1.05f)
            .setDuration(300)
            .withEndAction {
                payButton.animate()
                    .scaleX(1.0f)
                    .scaleY(1.0f)
                    .setDuration(200)
                    .start()
            }
            .start()
            
        // Para depuración
        Log.d("SyncCodeActivity", "Contenedor de carrito visible: ${cartContainer.visibility == View.VISIBLE}")
        Log.d("SyncCodeActivity", "Botón de pago visible: ${payButton.visibility == View.VISIBLE}")
    }
    
    private fun showLoading(show: Boolean) {
        progressBar.visibility = if (show) android.view.View.VISIBLE else android.view.View.GONE
        syncButton.isEnabled = !show
        if (!show || sessionId == null) {
            payButton.isEnabled = !show && sessionId != null
        }
    }
    
    private fun showError(message: String) {
        errorText.text = message
        errorText.visibility = android.view.View.VISIBLE
    }
    
    private fun hideError() {
        errorText.visibility = android.view.View.GONE
    }
    
    private fun showMessage(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
    
    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
    }
    
    // Data classes
    data class SyncResult(
        val success: Boolean,
        val items: List<CartItem> = emptyList(),
        val total: Double = 0.0,
        val sessionId: String = "",
        val error: String = ""
    )
    
    data class PaymentResult(
        val success: Boolean,
        val transactionId: String = "",
        val error: String = ""
    )
    
    // Adaptador para el RecyclerView
    private class CartAdapter(private val items: List<CartItem>) : 
        RecyclerView.Adapter<CartAdapter.ViewHolder>() {
        
        class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val nameText: TextView = view.findViewById(R.id.itemNameText)
            val priceText: TextView = view.findViewById(R.id.itemPriceText)
            val quantityText: TextView = view.findViewById(R.id.itemQuantityText)
            val totalText: TextView = view.findViewById(R.id.itemTotalText)
        }
        
        override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): ViewHolder {
            val view = android.view.LayoutInflater.from(parent.context)
                .inflate(R.layout.item_cart_sync, parent, false)
            return ViewHolder(view)
        }
        
        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = items[position]
            holder.nameText.text = item.nombre
            holder.priceText.text = "$${String.format("%.2f", item.precio)}"
            holder.quantityText.text = "x${item.quantity}"
            holder.totalText.text = "$${String.format("%.2f", item.precio * item.quantity)}"
        }
        
        override fun getItemCount() = items.size
    }
    
    // Data classes
    data class CartItem(
        val id: String,  // Cambiado de Int a String
        val nombre: String,
        val precio: Double,
        val quantity: Int
    )
}