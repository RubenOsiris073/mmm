package com.fisgo.wallet

import java.util.*

data class Transaction(
    val id: String,
    val amount: Double,
    val status: String, // "completed", "pending", "failed"
    val type: String, // "payment", "refund", "transfer"
    val createdAt: Date, // Cambiar de 'date' a 'createdAt' para coincidir con el backend
    val description: String,
    val merchantName: String? = null,
    val items: List<CartItem>? = null,
    val paymentMethod: String? = null,
    val reference: String? = null
)

data class TransactionResponse(
    val success: Boolean,
    val transactions: List<Transaction>,
    val message: String? = null
)