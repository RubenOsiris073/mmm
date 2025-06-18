package com.fisgo.wallet

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import com.google.android.material.button.MaterialButton

class PaymentMethodsActivity : AppCompatActivity() {

    private lateinit var backButton: ImageView
    private lateinit var cardPaymentCard: CardView
    private lateinit var cardPaymentContainer: LinearLayout
    private lateinit var savedCardText: TextView
    private lateinit var addCardButton: MaterialButton
    private lateinit var addNewCardButton: MaterialButton
    private lateinit var changeCardButton: MaterialButton
    private lateinit var deleteCardButton: MaterialButton
    private lateinit var cardActionsContainer: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_payment_method)
        
        initViews()
        setupListeners()
        loadCardData()
    }
    
    private fun initViews() {
        backButton = findViewById(R.id.backButton)
        cardPaymentCard = findViewById(R.id.cardPaymentCard)
        cardPaymentContainer = findViewById(R.id.cardPaymentContainer)
        
        // Buscar elementos de tarjeta guardada en el layout
        savedCardText = findViewById(R.id.savedCardText)
        addCardButton = findViewById(R.id.addCardButton)
        addNewCardButton = findViewById(R.id.addNewCardButton)
        changeCardButton = findViewById(R.id.changeCardButton)
        deleteCardButton = findViewById(R.id.deleteCardButton)
        cardActionsContainer = findViewById(R.id.cardActionsContainer)
        
        // Ocultar elementos relacionados con montos y wallet
        hidePaymentElements()
    }
    
    private fun hidePaymentElements() {
        // Ocultar la sección de wallet payment card
        findViewById<CardView>(R.id.walletPaymentCard).visibility = View.GONE
        
        // Ocultar el botón de proceder
        findViewById<MaterialButton>(R.id.proceedButton).visibility = View.GONE
        
        // Ocultar toda la sección de información del monto navegando correctamente por la jerarquía
        try {
            // Navegar desde amountText hacia el contenedor principal del monto
            val amountText = findViewById<TextView>(R.id.amountText)
            var parent = amountText.parent
            while (parent != null && parent !is LinearLayout) {
                parent = parent.parent
            }
            if (parent != null) {
                (parent as LinearLayout).visibility = View.GONE
            }
        } catch (e: Exception) {
            // Si hay algún problema con la navegación, ocultar solo el texto del monto
            findViewById<TextView>(R.id.amountText).visibility = View.GONE
        }
        
        // Cambiar el título
        findViewById<TextView>(R.id.titleText).text = "Mis Tarjetas"
    }
    
    private fun setupListeners() {
        backButton.setOnClickListener {
            finish()
        }
        
        addCardButton.setOnClickListener {
            launchCardSetup()
        }
        
        addNewCardButton.setOnClickListener {
            launchCardSetup()
        }
        
        changeCardButton.setOnClickListener {
            launchCardSetup()
        }
        
        deleteCardButton.setOnClickListener {
            deleteCard()
        }
        
        cardPaymentContainer.setOnClickListener {
            if (!PaymentMethodManager.hasSavedCard(this)) {
                launchCardSetup()
            }
        }
    }
    
    private fun loadCardData() {
        val hasCard = PaymentMethodManager.hasSavedCard(this)
        
        if (hasCard) {
            // Mostrar información de tarjeta guardada
            val lastFour = PaymentMethodManager.getSavedCardLastFour(this)
            val cardType = PaymentMethodManager.getSavedCardType(this)
            
            savedCardText.text = "${cardType?.uppercase()} •••• $lastFour"
            savedCardText.visibility = View.VISIBLE
            
            // Mostrar botones de gestión
            cardActionsContainer.visibility = View.VISIBLE
            addCardButton.visibility = View.GONE
            
            // Cambiar el texto del contenedor
            val cardTitle = cardPaymentContainer.findViewById<TextView>(R.id.cardTitle)
            cardTitle?.text = "Tarjeta Guardada"
            
            val cardSubtitle = cardPaymentContainer.findViewById<TextView>(R.id.cardSubtitle)
            cardSubtitle?.text = "Toca para gestionar tu tarjeta"
            
        } else {
            // No hay tarjeta guardada
            savedCardText.visibility = View.GONE
            cardActionsContainer.visibility = View.GONE
            addCardButton.visibility = View.VISIBLE
            
            // Cambiar el texto del contenedor
            val cardTitle = cardPaymentContainer.findViewById<TextView>(R.id.cardTitle)
            cardTitle?.text = "Agregar Tarjeta"
            
            val cardSubtitle = cardPaymentContainer.findViewById<TextView>(R.id.cardSubtitle)
            cardSubtitle?.text = "Visa, MasterCard, American Express"
        }
    }
    
    private fun launchCardSetup() {
        val intent = Intent(this, CardPaymentActivity::class.java)
        intent.putExtra("setup_mode", true)
        intent.putExtra(CardPaymentActivity.EXTRA_AMOUNT, 1.0) // Monto mínimo para setup
        startActivityForResult(intent, CARD_SETUP_REQUEST_CODE)
    }
    
    private fun deleteCard() {
        // Mostrar confirmación antes de eliminar
        val builder = androidx.appcompat.app.AlertDialog.Builder(this)
        builder.setTitle("Eliminar Tarjeta")
        builder.setMessage("¿Estás seguro de que quieres eliminar esta tarjeta? Esta acción no se puede deshacer.")
        builder.setPositiveButton("Eliminar") { _, _ ->
            PaymentMethodManager.clearSavedCard(this)
            showMessage("Tarjeta eliminada exitosamente")
            loadCardData() // Recargar la vista
        }
        builder.setNegativeButton("Cancelar", null)
        builder.show()
    }
    
    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (requestCode == CARD_SETUP_REQUEST_CODE && resultCode == RESULT_OK) {
            // Tarjeta configurada exitosamente
            showMessage("¡Tarjeta configurada exitosamente!")
            loadCardData() // Recargar la vista
        }
    }
    
    private fun showMessage(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
    
    companion object {
        private const val CARD_SETUP_REQUEST_CODE = 1001
    }
}