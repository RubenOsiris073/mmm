package com.fisgo.wallet

import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.fisgo.wallet.databinding.ActivityCardPaymentBinding
import com.google.gson.Gson
import com.stripe.android.PaymentConfiguration
import com.stripe.android.Stripe
import com.stripe.android.model.ConfirmPaymentIntentParams
import com.stripe.android.model.PaymentMethodCreateParams
import com.stripe.android.view.CardInputWidget
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.text.NumberFormat
import java.util.*

class CardPaymentActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityCardPaymentBinding
    private lateinit var stripe: Stripe
    private lateinit var cardInputWidget: CardInputWidget
    private var paymentAmount: Double = 0.0
    private var clientSecret: String? = null
    private var paymentIntentId: String? = null
    private var isSetupMode: Boolean = false // Nuevo: para distinguir entre configuración y pago
    
    // Cliente HTTP para conectar con tu backend
    private val httpClient = OkHttpClient.Builder().build()
    private val gson = Gson()
    
    // URL de tu backend - cambiar según tu configuración
    private val baseUrl = "https://psychic-bassoon-j65x4rxrvj4c5p54-3000.app.github.dev/api/pay" // Para emulador
    // private val baseUrl = "http://192.168.1.100:5000" // Para dispositivo físico
    
    companion object {
        const val EXTRA_AMOUNT = "extra_amount"
        const val EXTRA_CART_ITEMS = "extra_cart_items"
        private const val TAG = "CardPaymentActivity"
        
        // Stripe Publishable Key - DEBE coincidir con el del POS
        private const val STRIPE_PUBLISHABLE_KEY = "pk_test_51RWijCPEaFxf0UGvEJPvJ1BGfYDGz2BBD00uOn2M4CoFGFIqDgjKXpfPavm6ZLyazfhDDdJlfrmsW62Cs9zmsSsv003fY9V2B7"
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCardPaymentBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Obtener el monto y modo del intent
        paymentAmount = intent.getDoubleExtra(EXTRA_AMOUNT, 0.0)
        isSetupMode = intent.getBooleanExtra("setup_mode", false)
        
        // DEBUGGING: Log detallado de lo que recibe
        Log.d(TAG, "onCreate - Received amount: $paymentAmount")
        Log.d(TAG, "onCreate - Received setup_mode: $isSetupMode")
        Log.d(TAG, "onCreate - Intent extras: ${intent.extras}")
        
        if (paymentAmount <= 0) {
            Log.e(TAG, "Invalid payment amount: $paymentAmount")
            showError("Monto inválido para procesar el pago")
            finish()
            return
        }
        
        setupStripe()
        setupUI()
        setupCardInput()
        
        // Solo crear Payment Intent si no es modo configuración
        if (!isSetupMode) {
            createPaymentIntent()
        } else {
            // En modo configuración, habilitar el botón inmediatamente cuando la tarjeta sea válida
            binding.payButton.text = "Save Card"
            binding.payButton.isEnabled = false
        }
    }
    
    private fun setupStripe() {
        try {
            PaymentConfiguration.init(
                applicationContext,
                STRIPE_PUBLISHABLE_KEY
            )
            stripe = Stripe(applicationContext, STRIPE_PUBLISHABLE_KEY)
            Log.d(TAG, "Stripe inicializado correctamente")
        } catch (e: Exception) {
            Log.e(TAG, "Error inicializando Stripe: ${e.message}")
            showError("Error de configuración: ${e.message}")
        }
    }
    
    private fun setupUI() {
        // DEBUGGING: Verificar si hay inconsistencias en el monto
        if (paymentAmount <= 1.0 && !isSetupMode) {
            Log.w(TAG, "WARNING: Received suspiciously low amount ($paymentAmount) in payment mode")
            Log.w(TAG, "This might indicate a data transfer issue")
        }
        
        // Configurar el monto en la UI con formato correcto
        val formatter = NumberFormat.getCurrencyInstance(Locale("es", "MX"))
        val formattedAmount = formatter.format(paymentAmount)
        
        binding.paymentAmountTextView.text = formattedAmount
        
        // Configurar texto del botón según el modo
        if (isSetupMode) {
            binding.payButton.text = "Save Card"
            binding.payButton.isEnabled = false
        } else {
            binding.payButton.text = "🔒 Pagar $formattedAmount"
            binding.payButton.isEnabled = false
        }
        
        // Configurar botón de pago
        binding.payButton.setOnClickListener {
            processPayment()
        }
        
        // Ocultar error inicial
        binding.errorCard.visibility = android.view.View.GONE
        
        // Log para debugging
        Log.d(TAG, "setupUI - Amount: $paymentAmount, Formatted: $formattedAmount, SetupMode: $isSetupMode")
        Log.d(TAG, "setupUI - Button text: ${binding.payButton.text}")
    }
    
    private fun setupCardInput() {
        // Crear y configurar el CardInputWidget de Stripe
        cardInputWidget = CardInputWidget(this)
        binding.cardInputContainer.addView(cardInputWidget)
        
        // Listener para validar la tarjeta
        cardInputWidget.setCardValidCallback { isValid, _ ->
            // En modo setup, solo requerimos que la tarjeta sea válida
            // En modo pago, requerimos tarjeta válida Y clientSecret
            binding.payButton.isEnabled = if (isSetupMode) {
                isValid
            } else {
                isValid && clientSecret != null
            }
            
            // Actualizar logos de tarjetas basado en el tipo detectado
            val cardBrand = cardInputWidget.brand
            updateCardLogos(cardBrand.code)
            
            // Log para debugging
            Log.d(TAG, "Card validation - Valid: $isValid, ClientSecret: ${clientSecret != null}, SetupMode: $isSetupMode, Button enabled: ${binding.payButton.isEnabled}")
        }
    }
    
    private fun updateCardLogos(cardBrand: String) {
        // Resetear opacidad de todos los logos
        binding.visaLogoImageView.alpha = 0.4f
        binding.mastercardLogoImageView.alpha = 0.4f
        binding.amexLogoImageView.alpha = 0.4f
        
        // Resaltar el logo de la tarjeta detectada
        when (cardBrand) {
            "visa" -> binding.visaLogoImageView.alpha = 1.0f
            "mastercard" -> binding.mastercardLogoImageView.alpha = 1.0f
            "amex" -> binding.amexLogoImageView.alpha = 1.0f
        }
    }
    
    private fun createPaymentIntent() {
        lifecycleScope.launch {
            try {
                val response = createPaymentIntentRequest()
                if (response.success) {
                    clientSecret = response.data.clientSecret
                    paymentIntentId = response.data.paymentIntentId
                    
                    // Mostrar ID del payment intent (últimos 8 caracteres)
                    paymentIntentId?.let { id ->
                        binding.paymentIdTextView.text = "ID: ${id.takeLast(8)}"
                        binding.paymentIdTextView.visibility = android.view.View.VISIBLE
                    }
                    
                    // Habilitar botón si la tarjeta es válida
                    binding.payButton.isEnabled = cardInputWidget.cardParams != null
                    
                    Log.d(TAG, "Payment Intent creado: $paymentIntentId")
                } else {
                    showError("Error preparando el pago: ${response.error}")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error creando Payment Intent: ${e.message}")
                showError("Error preparando el pago: ${e.message}")
            }
        }
    }
    
    private suspend fun createPaymentIntentRequest(): PaymentIntentResponse {
        return withContext(Dispatchers.IO) {
            val requestBody = PaymentIntentRequest(
                amount = paymentAmount,
                currency = "mxn",
                metadata = mapOf(
                    "source" to "android-wallet",
                    "timestamp" to System.currentTimeMillis().toString()
                )
            )
            
            val json = gson.toJson(requestBody)
            val body = json.toRequestBody("application/json".toMediaType())
            
            val request = Request.Builder()
                .url("$baseUrl/api/stripe/create-payment-intent")
                .post(body)
                .build()
            
            val response = httpClient.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""
            
            if (response.isSuccessful) {
                gson.fromJson(responseBody, PaymentIntentResponse::class.java)
            } else {
                PaymentIntentResponse(false, error = "Error del servidor: ${response.code}")
            }
        }
    }
    
    private fun processPayment() {
        val cardParams = cardInputWidget.cardParams
        if (cardParams == null) {
            showError("Por favor, ingresa una tarjeta válida")
            return
        }
        
        binding.payButton.isEnabled = false
        
        if (isSetupMode) {
            // Modo configuración: solo guardar información de la tarjeta
            binding.payButton.text = "Guardando tarjeta..."
            
            lifecycleScope.launch {
                try {
                    // Simular un pequeño delay para UX
                    kotlinx.coroutines.delay(1000)
                    
                    // Guardar información de la tarjeta
                    val cardBrand = cardInputWidget.brand.displayName
                    // En modo configuración, generamos un lastFour simulado para demo
                    val lastFour = generateMockLastFour()
                    
                    PaymentMethodManager.saveCardInfo(
                        this@CardPaymentActivity,
                        lastFour,
                        cardBrand
                    )
                    
                    Log.d(TAG, "Tarjeta configurada: $cardBrand **** $lastFour")
                    Toast.makeText(this@CardPaymentActivity, "¡Tarjeta guardada exitosamente!", Toast.LENGTH_LONG).show()
                    
                    // Enviar resultado exitoso con flag de setup mode
                    val resultIntent = android.content.Intent()
                    resultIntent.putExtra("setup_mode", true)
                    setResult(RESULT_OK, resultIntent)
                    finish()
                    
                } catch (e: Exception) {
                    Log.e(TAG, "Error guardando tarjeta: ${e.message}")
                    showError("Error guardando la tarjeta: ${e.message}")
                    
                    binding.payButton.isEnabled = true
                    binding.payButton.text = "Save Card"
                }
            }
        } else {
            // Modo pago real: procesar pago con Stripe
            if (clientSecret == null) {
                showError("Error: Payment Intent no está listo")
                binding.payButton.isEnabled = true
                return
            }
            
            binding.payButton.text = "Procesando pago..."
            
            lifecycleScope.launch {
                try {
                    // Crear PaymentMethodCreateParams correctamente para Stripe Android
                    val paymentMethodParams = PaymentMethodCreateParams.createCard(cardParams)
                    val confirmParams = ConfirmPaymentIntentParams.createWithPaymentMethodCreateParams(
                        paymentMethodCreateParams = paymentMethodParams,
                        clientSecret = clientSecret!!
                    )
                    
                    // Confirmamos el pago usando el cliente de Stripe
                    stripe.confirmPayment(this@CardPaymentActivity, confirmParams)
                    
                    // Guardar información de la tarjeta al completar exitosamente
                    val cardBrand = cardInputWidget.brand.displayName
                    val lastFour = generateMockLastFour() // Simulado por seguridad
                    
                    PaymentMethodManager.saveCardInfo(
                        this@CardPaymentActivity,
                        lastFour,
                        cardBrand
                    )
                    
                    Log.d(TAG, "Pago procesado exitosamente")
                    Toast.makeText(this@CardPaymentActivity, "¡Pago procesado exitosamente!", Toast.LENGTH_LONG).show()
                    
                    // Enviar resultado exitoso sin flag de setup mode (pago real)
                    setResult(RESULT_OK)
                    finish()
                    
                } catch (e: Exception) {
                    Log.e(TAG, "Error procesando pago: ${e.message}")
                    showError("Error procesando el pago: ${e.message}")
                    
                    binding.payButton.isEnabled = true
                    val formatter = NumberFormat.getCurrencyInstance(Locale("es", "MX"))
                    binding.payButton.text = "🔒 Pagar ${formatter.format(paymentAmount)}"
                }
            }
        }
    }
    
    private fun generateMockLastFour(): String {
        // Por seguridad, Stripe no expone el número real de la tarjeta
        // Generamos un mock para demo purposes
        return (1000..9999).random().toString()
    }
    
    private fun showError(message: String) {
        binding.errorTextView.text = "⚠️ $message"
        binding.errorCard.visibility = android.view.View.VISIBLE
        
        // Ocultar error después de 5 segundos
        binding.errorCard.postDelayed({
            binding.errorCard.visibility = android.view.View.GONE
        }, 5000)
    }
    
    // Data classes para la comunicación con el backend
    data class PaymentIntentRequest(
        val amount: Double,
        val currency: String,
        val metadata: Map<String, String>
    )
    
    data class PaymentIntentResponse(
        val success: Boolean,
        val data: PaymentIntentData = PaymentIntentData(),
        val error: String? = null
    )
    
    data class PaymentIntentData(
        val clientSecret: String = "",
        val paymentIntentId: String = "",
        val amount: Int = 0,
        val currency: String = "",
        val status: String = ""
    )
}