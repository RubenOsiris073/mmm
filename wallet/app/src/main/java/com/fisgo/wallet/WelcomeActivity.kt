package com.fisgo.wallet

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.fisgo.wallet.databinding.ActivityWelcomeBinding
import com.fisgo.wallet.databinding.ModalCartBinding
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase
import java.text.NumberFormat
import java.util.Locale
import java.util.UUID

class WelcomeActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityWelcomeBinding
    private lateinit var auth: FirebaseAuth
    private lateinit var cartBottomSheetDialog: BottomSheetDialog
    private lateinit var cartBinding: ModalCartBinding
    private lateinit var sharedPreferences: SharedPreferences
    
    // Lista de productos de ejemplo
    private val cartItems = mutableListOf<CartItem>()
    
    // Adaptador para el RecyclerView del carrito
    private lateinit var cartAdapter: CartAdapter
    
    // ID de sesión
    private val sessionId = UUID.randomUUID().toString()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityWelcomeBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Inicializar Firebase Auth
        auth = Firebase.auth
        
        // Inicializar SharedPreferences para guardar el método de pago seleccionado
        sharedPreferences = getSharedPreferences("wallet_prefs", Context.MODE_PRIVATE)
        
        // Configurar la toolbar
        setSupportActionBar(binding.toolbar)
        
        setupUI()
        setupCartBottomSheet()
        setupListeners()
        loadSampleCartItems() // Cargar algunos productos de ejemplo
    }
    
    private fun setupUI() {
        // Obtener el usuario actual
        val user = auth.currentUser
        
        if (user != null) {
            // Determinar si el usuario inició sesión con Google
            val isGoogleUser = user.providerData.any { 
                it.providerId == GoogleAuthProvider.PROVIDER_ID 
            }
            
            // Mostrar nombre o email del usuario según corresponda
            val displayName = if (user.displayName.isNullOrEmpty()) {
                user.email ?: "Usuario"
            } else {
                user.displayName
            }
            
            binding.emailTextView.text = user.email ?: "Sin correo"
            binding.welcomeTextView.text = "¡Bienvenido, ${displayName?.split(" ")?.firstOrNull() ?: "Usuario"}!"
            
            // Mostrar ID de sesión
            binding.sessionIdTextView.text = "ID: $sessionId"
        }
        
        // Cargar el método de pago previamente seleccionado
        val savedPaymentMethod = sharedPreferences.getString("payment_method", "credit_card")
        when (savedPaymentMethod) {
            "credit_card" -> binding.creditCardRadioButton.isChecked = true
            "debit_card" -> binding.debitCardRadioButton.isChecked = true
            "cash" -> binding.cashRadioButton.isChecked = true
        }
    }
    
    private fun setupCartBottomSheet() {
        // Inicializar el BottomSheetDialog para el carrito
        cartBottomSheetDialog = BottomSheetDialog(this)
        cartBinding = ModalCartBinding.inflate(layoutInflater)
        cartBottomSheetDialog.setContentView(cartBinding.root)
        
        // Configurar el RecyclerView del carrito
        cartAdapter = CartAdapter(cartItems, 
            onQuantityChanged = { updateCartTotals() },
            onItemRemoved = { position -> 
                cartItems.removeAt(position)
                cartAdapter.notifyItemRemoved(position)
                updateCartTotals()
                checkEmptyCart()
            }
        )
        
        cartBinding.cartItemsRecyclerView.apply {
            layoutManager = LinearLayoutManager(this@WelcomeActivity)
            adapter = cartAdapter
        }
        
        // Botones del carrito
        cartBinding.closeCartButton.setOnClickListener {
            cartBottomSheetDialog.dismiss()
        }
        
        cartBinding.checkoutCartButton.setOnClickListener {
            if (cartItems.isEmpty()) {
                Toast.makeText(this, "Agrega productos al carrito antes de continuar", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            cartBottomSheetDialog.dismiss()
            Toast.makeText(this, "Procesando pago...", Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun setupListeners() {
        // Botón para ver el carrito
        binding.viewCartButton.setOnClickListener {
            showCartBottomSheet()
        }
        
        // FAB para ver el carrito
        binding.cartFab.setOnClickListener {
            showCartBottomSheet()
        }
        
        // Botón de finalizar compra
        binding.checkoutButton.setOnClickListener {
            if (cartItems.isEmpty()) {
                Toast.makeText(this, "Agrega productos al carrito antes de continuar", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            // Guardar el método de pago seleccionado
            val editor = sharedPreferences.edit()
            val selectedPaymentMethod = when {
                binding.creditCardRadioButton.isChecked -> "credit_card"
                binding.debitCardRadioButton.isChecked -> "debit_card"
                binding.cashRadioButton.isChecked -> "cash"
                else -> "credit_card"
            }
            editor.putString("payment_method", selectedPaymentMethod)
            editor.apply()
            
            Toast.makeText(this, "Procesando pago con $selectedPaymentMethod...", Toast.LENGTH_SHORT).show()
        }
        
        // Botón para agregar método de pago
        binding.addPaymentMethodButton.setOnClickListener {
            Toast.makeText(this, "Función para agregar método de pago en desarrollo", Toast.LENGTH_SHORT).show()
        }
        
        // Configurar el botón de logout
        binding.logoutButton.setOnClickListener {
            // Cerrar sesión en Firebase
            auth.signOut()
            
            // Regresar a la pantalla de login
            val intent = Intent(this, LoginActivity::class.java)
            startActivity(intent)
            finish() // Cerrar esta actividad
        }
    }
    
    private fun showCartBottomSheet() {
        updateCartTotals()
        checkEmptyCart()
        cartBottomSheetDialog.show()
    }
    
    private fun updateCartTotals() {
        val subtotal = cartItems.sumOf { it.price * it.quantity }
        val tax = subtotal * 0.16
        val total = subtotal + tax
        
        val formatter = NumberFormat.getCurrencyInstance(Locale("es", "MX"))
        
        cartBinding.subtotalValueTextView.text = formatter.format(subtotal)
        cartBinding.taxValueTextView.text = formatter.format(tax)
        cartBinding.totalValueTextView.text = formatter.format(total)
    }
    
    private fun checkEmptyCart() {
        if (cartItems.isEmpty()) {
            cartBinding.emptyCartTextView.visibility = View.VISIBLE
            cartBinding.cartItemsRecyclerView.visibility = View.GONE
            cartBinding.divider2.visibility = View.GONE
        } else {
            cartBinding.emptyCartTextView.visibility = View.GONE
            cartBinding.cartItemsRecyclerView.visibility = View.VISIBLE
            cartBinding.divider2.visibility = View.VISIBLE
        }
    }
    
    private fun loadSampleCartItems() {
        // Agregar algunos productos de ejemplo al carrito
        cartItems.addAll(listOf(
            CartItem(1, "Camiseta de algodón", 249.99, 1),
            CartItem(2, "Jeans clásicos", 599.99, 1),
            CartItem(3, "Zapatillas deportivas", 999.99, 1)
        ))
    }
    
    // Clase para los items del carrito
    data class CartItem(
        val id: Int,
        val name: String,
        val price: Double,
        var quantity: Int
    )
    
    // Adaptador para el RecyclerView del carrito
    inner class CartAdapter(
        private val items: MutableList<CartItem>,
        private val onQuantityChanged: () -> Unit,
        private val onItemRemoved: (Int) -> Unit
    ) : RecyclerView.Adapter<CartAdapter.CartViewHolder>() {
        
        inner class CartViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val productImageView: ImageView = itemView.findViewById(R.id.productImageView)
            val productNameTextView: TextView = itemView.findViewById(R.id.productNameTextView)
            val productPriceTextView: TextView = itemView.findViewById(R.id.productPriceTextView)
            val quantityTextView: TextView = itemView.findViewById(R.id.quantityTextView)
            val itemQuantityTextView: TextView = itemView.findViewById(R.id.itemQuantityTextView)
            val decreaseQuantityButton: ImageButton = itemView.findViewById(R.id.decreaseQuantityButton)
            val increaseQuantityButton: ImageButton = itemView.findViewById(R.id.increaseQuantityButton)
            val removeItemButton: ImageButton = itemView.findViewById(R.id.removeItemButton)
        }
        
        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CartViewHolder {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_cart, parent, false)
            return CartViewHolder(view)
        }
        
        override fun onBindViewHolder(holder: CartViewHolder, position: Int) {
            val item = items[position]
            val formatter = NumberFormat.getCurrencyInstance(Locale("es", "MX"))
            
            holder.productNameTextView.text = item.name
            holder.productPriceTextView.text = formatter.format(item.price)
            holder.quantityTextView.text = "x${item.quantity}"
            holder.itemQuantityTextView.text = item.quantity.toString()
            
            holder.decreaseQuantityButton.setOnClickListener {
                if (item.quantity > 1) {
                    item.quantity--
                    holder.itemQuantityTextView.text = item.quantity.toString()
                    holder.quantityTextView.text = "x${item.quantity}"
                    onQuantityChanged()
                }
            }
            
            holder.increaseQuantityButton.setOnClickListener {
                item.quantity++
                holder.itemQuantityTextView.text = item.quantity.toString()
                holder.quantityTextView.text = "x${item.quantity}"
                onQuantityChanged()
            }
            
            holder.removeItemButton.setOnClickListener {
                onItemRemoved(position)
            }
        }
        
        override fun getItemCount() = items.size
    }
}