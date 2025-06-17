package com.fisgo.wallet

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class PaymentSuccessActivity : AppCompatActivity() {
    
    private lateinit var amountText: TextView
    private lateinit var transactionIdText: TextView
    private lateinit var remainingBalanceText: TextView  // Nuevo TextView para el saldo restante
    private lateinit var closeButton: Button
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_payment_success)
        
        initViews()
        loadPaymentData()
        setupListeners()
    }
    
    private fun initViews() {
        amountText = findViewById(R.id.amountText)
        transactionIdText = findViewById(R.id.transactionIdText)
        remainingBalanceText = findViewById(R.id.remainingBalanceText)  // Inicializar el nuevo TextView
        closeButton = findViewById(R.id.closeButton)
    }
    
    private fun loadPaymentData() {
        val amount = intent.getDoubleExtra("amount", 0.0)
        val transactionId = intent.getStringExtra("transactionId") ?: ""
        val paymentMethod = intent.getStringExtra("paymentMethod") ?: "Desconocido"
        
        // Obtener el saldo restante después de la compra
        val remainingBalance = WalletManager.getBalance(this)
        
        amountText.text = "$${String.format("%.2f", amount)}"
        transactionIdText.text = "ID de Transacción: $transactionId"
        remainingBalanceText.text = "Saldo disponible: $${String.format("%.2f", remainingBalance)}"
        
        // Mostrar el método de pago usado (nuevo)
        if (paymentMethod != "Desconocido") {
            // Agregar información del método de pago si no existe en el layout
            val methodText = TextView(this)
            methodText.text = "Método de pago: $paymentMethod"
            methodText.textSize = 14f
            methodText.setTextColor(resources.getColor(android.R.color.darker_gray, null))
            methodText.gravity = android.view.Gravity.CENTER
            
            // Encontrar el contenedor principal y agregar el TextView
            val mainContainer = findViewById<LinearLayout>(R.id.mainContainer) 
            if (mainContainer != null) {
                val layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
                layoutParams.setMargins(0, 0, 0, 16)
                methodText.layoutParams = layoutParams
                
                // Insertarlo antes del saldo restante
                val remainingBalanceIndex = mainContainer.indexOfChild(remainingBalanceText)
                mainContainer.addView(methodText, remainingBalanceIndex)
            }
        }
    }
    
    private fun setupListeners() {
        closeButton.setOnClickListener {
            val intent = Intent(this, MainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
            startActivity(intent)
            finish()
        }
    }
    
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        super.onBackPressed()
        // Prevenir que el usuario regrese a la pantalla de pago
        val intent = Intent(this, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
        startActivity(intent)
        finish()
    }
}