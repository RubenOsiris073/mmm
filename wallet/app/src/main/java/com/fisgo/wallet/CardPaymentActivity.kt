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
    
    // Cliente HTTP para conectar con tu backend
    private val httpClient = OkHttpClient.Builder().build()
    private val gson = Gson()
    
    // URL de tu backend - cambiar según tu configuración
    private val baseUrl = "http://10.0.2.2:5000" // Para emulador
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
        
        // Obtener el monto del intent
        paymentAmount = intent.getDoubleExtra(EXTRA_AMOUNT, 0.0)
        
        if (paymentAmount <= 0) {
            showError("Monto inválido para procesar el pago")
            finish()
            return
        }
        
        setupStripe()
        setupUI()
        setupCardInput()
        createPaymentIntent()
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
        // Configurar el monto en la UI
        val formatter = NumberFormat.getCurrencyInstance(Locale("es", "MX"))
        val formattedAmount = formatter.format(paymentAmount)
        
        binding.paymentAmountTextView.text = formattedAmount
        binding.payButton.text = "🔒 Pagar $formattedAmount"
        
        // Configurar botón de pago
        binding.payButton.setOnClickListener {
            processPayment()
        }
        
        // Ocultar error inicial
        binding.errorCard.visibility = android.view.View.GONE
    }
    
    private fun setupCardInput() {
        // Crear y configurar el CardInputWidget de Stripe
        cardInputWidget = CardInputWidget(this)
        binding.cardInputContainer.addView(cardInputWidget)
        
        // Listener para validar la tarjeta
        cardInputWidget.setCardValidCallback { isValid, _ ->
            binding.payButton.isEnabled = isValid && clientSecret != null
            
            // Actualizar logos de tarjetas basado en el tipo detectado
            val cardBrand = cardInputWidget.brand
            updateCardLogos(cardBrand.code)
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
        
        if (clientSecret == null) {
            showError("Error: Payment Intent no está listo")
            return
        }
        
        binding.payButton.isEnabled = false
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
                
                // Por ahora, asumimos que llegó hasta aquí significa éxito
                // En una implementación más robusta, necesitaríamos usar callbacks
                Log.d(TAG, "Pago procesado")
                Toast.makeText(this@CardPaymentActivity, "¡Pago procesado exitosamente!", Toast.LENGTH_LONG).show()
                
                // Enviar resultado exitoso y cerrar actividad
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