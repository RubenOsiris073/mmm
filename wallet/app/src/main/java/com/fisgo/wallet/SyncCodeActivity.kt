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
import androidx.appcompat.app.AlertDialog
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
import android.os.Parcelable
import kotlinx.parcelize.Parcelize

class SyncCodeActivity : AppCompatActivity() {
    
    private lateinit var syncCodeInput: EditText
    private lateinit var syncButton: Button
    private lateinit var progressBar: ProgressBar
    private lateinit var errorText: TextView
    private lateinit var cartContainer: LinearLayout
    private lateinit var cartRecyclerView: RecyclerView
    private lateinit var totalText: TextView
    private lateinit var payButton: Button
    private lateinit var confirmPurchaseButton: Button
    private lateinit var auth: FirebaseAuth
    
    private var cartItems = mutableListOf<CartItem>()
    private var cartTotal = 0.0
    private var sessionId: String? = null
    
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    
    // Request code para el pago con tarjeta
    companion object {
        private const val CARD_PAYMENT_REQUEST_CODE = 1001
    }
    
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
        confirmPurchaseButton = findViewById(R.id.confirmPurchaseButton)  // Inicializar el nuevo botón
        
        // Configuración inicial
        cartRecyclerView.layoutManager = LinearLayoutManager(this)
        
        // Asegurar que el botón de confirmación sea visible y llamativo
        confirmPurchaseButton.visibility = View.VISIBLE
        confirmPurchaseButton.text = "💳 CONFIRMAR COMPRA"
        confirmPurchaseButton.setBackgroundResource(android.R.color.holo_green_dark)
        confirmPurchaseButton.setTextColor(getColor(android.R.color.white))
        
        // Aplicar elevación para efecto 3D
        confirmPurchaseButton.elevation = 12f
    }
    
    private fun setupListeners() {
        syncButton.setOnClickListener {
            handleSyncCart()
        }
        
        confirmPurchaseButton.setOnClickListener {
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
        
        // Mostrar diálogo para elegir método de pago
        showPaymentMethodDialog()
    }
    
    private fun showPaymentMethodDialog() {
        val currentBalance = WalletManager.getBalance(this)
        
        val options = mutableListOf<String>()
        val methods = mutableListOf<String>()
        
        // Siempre mostrar opción de tarjeta
        options.add("💳 Pagar con Tarjeta de Crédito")
        methods.add("card")
        
        // Solo mostrar opción de wallet si hay saldo suficiente
        if (currentBalance >= cartTotal) {
            options.add("💰 Pagar con Saldo de Wallet (\$${String.format("%.2f", currentBalance)} disponible)")
            methods.add("wallet")
        }
        
        val builder = AlertDialog.Builder(this)
        builder.setTitle("Selecciona método de pago")
        builder.setIcon(android.R.drawable.ic_dialog_info)
        
        if (options.isEmpty()) {
            // No hay métodos disponibles
            builder.setMessage("No tienes saldo suficiente en tu wallet (\$${String.format("%.2f", currentBalance)}) y necesitas \$${String.format("%.2f", cartTotal)}.\n\nPuedes usar tu tarjeta de crédito para completar la compra.")
            builder.setPositiveButton("Pagar con Tarjeta") { _, _ ->
                processCardPayment()
            }
        } else {
            builder.setItems(options.toTypedArray()) { _, which ->
                when (methods[which]) {
                    "card" -> processCardPayment()
                    "wallet" -> processWalletPayment()
                }
            }
        }
        
        builder.setNegativeButton("Cancelar", null)
        builder.show()
    }
    
    private fun processCardPayment() {
        // Abrir la actividad de pago con tarjeta - solo pasar el monto
        val intent = Intent(this, CardPaymentActivity::class.java)
        intent.putExtra(CardPaymentActivity.EXTRA_AMOUNT, cartTotal)
        // Removemos el paso de cartItems que puede causar el crash
        startActivityForResult(intent, CARD_PAYMENT_REQUEST_CODE)
    }
    
    private fun processWalletPayment() {
        val currentBalance = WalletManager.getBalance(this)
        
        if (currentBalance < cartTotal) {
            showError("Saldo insuficiente: \$${String.format("%.2f", currentBalance)} disponible. Necesitas \$${String.format("%.2f", cartTotal)}")
            return
        }
        
        // Mejorar feedback visual durante el proceso
        confirmPurchaseButton.text = "⏳ Procesando pago con wallet..."
        confirmPurchaseButton.isEnabled = false
        showLoading(true)
        
        scope.launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    processPaymentWithBackend("wallet")
                }
                
                if (result.success) {
                    // Restar el monto del saldo de la wallet
                    WalletManager.deductAmount(this@SyncCodeActivity, cartTotal)
                    
                    // Mostrar feedback de éxito
                    confirmPurchaseButton.text = "✅ ¡Pago exitoso!"
                    showMessage("¡Compra realizada exitosamente con wallet!")
                    
                    val intent = Intent(this@SyncCodeActivity, PaymentSuccessActivity::class.java)
                    intent.putExtra("amount", cartTotal)
                    intent.putExtra("transactionId", result.transactionId)
                    intent.putExtra("paymentMethod", "Saldo de Wallet")
                    startActivity(intent)
                    finish()
                } else {
                    showError(result.error ?: "Error al procesar el pago")
                    resetPaymentButton()
                }
            } catch (e: Exception) {
                showError("Error de conexión: ${e.message}")
                resetPaymentButton()
            } finally {
                showLoading(false)
            }
        }
    }
    
    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (requestCode == CARD_PAYMENT_REQUEST_CODE) {
            if (resultCode == RESULT_OK) {
                // Pago con tarjeta exitoso
                scope.launch {
                    try {
                        // Notificar al backend que el pago fue exitoso
                        val result = withContext(Dispatchers.IO) {
                            processPaymentWithBackend("card")
                        }
                        
                        if (result.success) {
                            showMessage("¡Compra realizada exitosamente con tarjeta!")
                            
                            val intent = Intent(this@SyncCodeActivity, PaymentSuccessActivity::class.java)
                            intent.putExtra("amount", cartTotal)
                            intent.putExtra("transactionId", result.transactionId)
                            intent.putExtra("paymentMethod", "Tarjeta de Crédito")
                            startActivity(intent)
                            finish()
                        } else {
                            showError("Error al confirmar el pago: ${result.error}")
                            resetPaymentButton()
                        }
                    } catch (e: Exception) {
                        showError("Error confirmando el pago: ${e.message}")
                        resetPaymentButton()
                    }
                }
            } else {
                // Pago cancelado o falló
                showError("Pago con tarjeta cancelado")
                resetPaymentButton()
            }
        }
    }
    
    private fun resetPaymentButton() {
        confirmPurchaseButton.text = "💳 CONFIRMAR COMPRA - \$${String.format("%.2f", cartTotal)}"
        confirmPurchaseButton.isEnabled = true
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
    
    private suspend fun processPaymentWithBackend(paymentMethod: String): PaymentResult {
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
                    put("paymentMethod", paymentMethod)
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
        cartContainer.visibility = View.VISIBLE
        syncButton.visibility = View.GONE
        
        val adapter = CartAdapter(cartItems)
        cartRecyclerView.adapter = adapter
        
        totalText.text = "Total: $${String.format("%.2f", cartTotal)}"
        
        // Asegurar que el botón de pago sea completamente visible y llamativo
        confirmPurchaseButton.visibility = View.VISIBLE
        confirmPurchaseButton.isEnabled = true
        confirmPurchaseButton.text = "💳 CONFIRMAR COMPRA - $${String.format("%.2f", cartTotal)}"
        
        // Aplicar estilos adicionales para llamar la atención
        confirmPurchaseButton.setBackgroundResource(android.R.color.holo_green_dark)
        confirmPurchaseButton.setTextColor(getColor(android.R.color.white))
        
        // Animar el botón para que sea más visible
        confirmPurchaseButton.animate()
            .scaleX(1.1f)
            .scaleY(1.1f)
            .setDuration(300)
            .withEndAction {
                confirmPurchaseButton.animate()
                    .scaleX(1.0f)
                    .scaleY(1.0f)
                    .setDuration(200)
                    .start()
            }
            .start()
            
        // Para depuración
        Log.d("SyncCodeActivity", "Contenedor de carrito visible: ${cartContainer.visibility == View.VISIBLE}")
        Log.d("SyncCodeActivity", "Botón de pago visible: ${confirmPurchaseButton.visibility == View.VISIBLE}")
        
        // Mostrar un mensaje para guiar al usuario
        Toast.makeText(
            this,
            "Carrito sincronizado. Haz clic en CONFIRMAR COMPRA para completar la transacción",
            Toast.LENGTH_LONG
        ).show()
    }
    
    private fun showLoading(show: Boolean) {
        progressBar.visibility = if (show) android.view.View.VISIBLE else android.view.View.GONE
        syncButton.isEnabled = !show
        if (!show || sessionId == null) {
            confirmPurchaseButton.isEnabled = !show && sessionId != null
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
    @Parcelize
    data class CartItem(
        val id: String,
        val nombre: String,
        val precio: Double,
        val quantity: Int
    ) : Parcelable
}