package com.fisgo.wallet

import android.content.Intent
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton

class MainActivity : AppCompatActivity() {

    private lateinit var balanceAmountText: TextView
    private lateinit var addFundsButton: MaterialButton
    private lateinit var syncCard: LinearLayout
    private lateinit var transactionHistoryCard: LinearLayout
    private lateinit var settingsCard: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupListeners()
        loadWalletData()
    }

    private fun initViews() {
        balanceAmountText = findViewById(R.id.balanceAmountText)
        addFundsButton = findViewById(R.id.addFundsButton)
        syncCard = findViewById(R.id.syncCard)
        transactionHistoryCard = findViewById(R.id.transactionHistoryCard)
        settingsCard = findViewById(R.id.settingsCard)
    }

    private fun setupListeners() {
        // Sync with POS
        syncCard.setOnClickListener {
            val intent = Intent(this, SyncCodeActivity::class.java)
            startActivity(intent)
        }

        // Transaction History
        transactionHistoryCard.setOnClickListener {
            showMessage("Funcionalidad de Historial de Transacciones próximamente")
        }

        // Settings
        settingsCard.setOnClickListener {
            showMessage("Funcionalidad de Configuración próximamente")
        }

        // Quick action buttons
        addFundsButton.setOnClickListener {
            showMessage("Funcionalidad de Agregar Fondos próximamente")
        }
    }

    private fun loadWalletData() {
        // Simular la carga del saldo de la billetera
        // En una implementación real, esto vendría de una API o base de datos
        val currentBalance = 1250.00
        balanceAmountText.text = String.format("%.2f", currentBalance)
    }

    private fun showMessage(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }

    override fun onResume() {
        super.onResume()
        // Actualizar el balance cuando se regrese a la actividad
        loadWalletData()
    }
}