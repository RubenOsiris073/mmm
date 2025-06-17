package com.fisgo.wallet

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView

class MainActivity : AppCompatActivity() {

    private lateinit var balanceCard: CardView
    private lateinit var balanceAmountText: TextView
    private lateinit var syncCard: CardView
    private lateinit var syncButton: Button
    private lateinit var transactionHistoryButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupListeners()
        loadWalletData()
    }

    private fun initViews() {
        balanceCard = findViewById(R.id.balanceCard)
        balanceAmountText = findViewById(R.id.balanceAmountText)
        syncCard = findViewById(R.id.syncCard)
        syncButton = findViewById(R.id.syncButton)
        transactionHistoryButton = findViewById(R.id.transactionHistoryButton)
    }

    private fun setupListeners() {
        syncButton.setOnClickListener {
            val intent = Intent(this, SyncCodeActivity::class.java)
            startActivity(intent)
        }

        transactionHistoryButton.setOnClickListener {
            // TODO: Implementar historial de transacciones
            showMessage("Funcionalidad próximamente disponible")
        }

        balanceCard.setOnClickListener {
            // Navegar a WelcomeActivity para ver funcionalidad completa del carrito
            val intent = Intent(this, WelcomeActivity::class.java)
            startActivity(intent)
        }
    }

    private fun loadWalletData() {
        // Usar el WalletManager para obtener el saldo dinámico
        val currentBalance = WalletManager.getBalance(this)
        balanceAmountText.text = "$${String.format("%.2f", currentBalance)}"
    }

    private fun showMessage(message: String) {
        android.widget.Toast.makeText(this, message, android.widget.Toast.LENGTH_SHORT).show()
    }

    override fun onResume() {
        super.onResume()
        // Recargar datos cuando regresemos a esta pantalla
        loadWalletData()
    }
}