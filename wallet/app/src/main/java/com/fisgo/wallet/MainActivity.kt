package com.fisgo.wallet

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.google.firebase.auth.FirebaseAuth
import java.text.NumberFormat
import java.util.*

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

        // Transaction History - Conectar con TransactionHistoryActivity
        transactionHistoryCard.setOnClickListener {
            val intent = Intent(this, TransactionHistoryActivity::class.java)
            startActivity(intent)
        }

        // Settings
        settingsCard.setOnClickListener {
            val intent = Intent(this, SettingsActivity::class.java)
            startActivity(intent)
        }

        // Quick action buttons
        addFundsButton.setOnClickListener {
            showMessage("Funcionalidad de Agregar Fondos próximamente")
        }
    }

    private fun loadWalletData() {
        val balance = WalletManager.getBalance(this)

        // Formato mejorado de moneda mexicana sin doble $
        val currencyFormat = NumberFormat.getCurrencyInstance(Locale("es", "MX"))
        val formattedBalance = currencyFormat.format(balance)
            .replace("MX$", "$")  // Quitar MX$ pero mantener $
            .replace("$", "")     // Quitar el $ del formato
            .trim()               // Limpiar espacios

        balanceAmountText.text = "$$formattedBalance"  // Agregar solo un $ al inicio
    }

    private fun showMessage(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }

    override fun onResume() {
        super.onResume()
        // Actualizar el balance cuando se regrese a la actividad (importante para reembolsos)
        loadWalletData()

        // TEMPORAL: Mostrar el ID del usuario en logs
        val auth = FirebaseAuth.getInstance()
        val currentUser = auth.currentUser
        if (currentUser != null) {
            Log.d("USER_ID", "=== TU ID DE USUARIO ES: ${currentUser.uid} ===")
            println("=== TU ID DE USUARIO ES: ${currentUser.uid} ===")
        } else {
            Log.d("USER_ID", "No hay usuario autenticado")
        }
    }
}