package com.fisgo.wallet

import android.util.Log
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.*

class TransactionService {
    private val client = OkHttpClient()
    private val gson = Gson()
    // Actualizar URL para coincidir con el backend
    private val baseUrl = "https://psychic-bassoon-j65x4rxrvj4c5p54-5000.app.github.dev" // Para emulador Android

    suspend fun getUserTransactions(userId: String): Result<List<Transaction>> {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url("$baseUrl/api/transactions/user/$userId")
                    .get()
                    .build()
                
                val response = client.newCall(request).execute()
                
                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    Log.d("TransactionService", "Response: $responseBody")
                    
                    if (responseBody != null) {
                        // Parsear la respuesta que viene en formato {success: true, transactions: [...]}
                        val jsonResponse = JSONObject(responseBody)
                        if (jsonResponse.getBoolean("success")) {
                            val transactionsArray = jsonResponse.getJSONArray("transactions")
                            val transactions = mutableListOf<Transaction>()
                            
                            for (i in 0 until transactionsArray.length()) {
                                val transactionJson = transactionsArray.getJSONObject(i)
                                
                                // Convertir timestamp a Date
                                val timestampStr = transactionJson.optString("timestamp", "")
                                val createdAt = if (timestampStr.isNotEmpty()) {
                                    try {
                                        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()).parse(timestampStr) ?: Date()
                                    } catch (e: Exception) {
                                        Date() // Fallback a fecha actual
                                    }
                                } else {
                                    Date()
                                }
                                
                                val transaction = Transaction(
                                    id = transactionJson.getString("id"),
                                    amount = transactionJson.getDouble("amount"),
                                    status = transactionJson.optString("status", "completed"),
                                    type = transactionJson.optString("type", "payment"),
                                    createdAt = createdAt,
                                    description = transactionJson.optString("description", "Transacción"),
                                    merchantName = transactionJson.optString("merchantName", null),
                                    paymentMethod = transactionJson.optString("paymentMethod", null)
                                )
                                transactions.add(transaction)
                            }
                            
                            Result.success(transactions)
                        } else {
                            Result.failure(Exception(jsonResponse.optString("error", "Error desconocido")))
                        }
                    } else {
                        Result.failure(Exception("Empty response body"))
                    }
                } else {
                    Result.failure(Exception("HTTP ${response.code}: ${response.message}"))
                }
            } catch (e: IOException) {
                Log.e("TransactionService", "Network error", e)
                Result.failure(e)
            } catch (e: Exception) {
                Log.e("TransactionService", "Error getting transactions", e)
                Result.failure(e)
            }
        }
    }
    
    suspend fun getTransactionById(transactionId: String): Result<Transaction> {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url("$baseUrl/api/transactions/$transactionId")
                    .get()
                    .build()
                
                val response = client.newCall(request).execute()
                
                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    Log.d("TransactionService", "Transaction detail response: $responseBody")
                    
                    if (responseBody != null) {
                        // Parsear la respuesta que viene en formato {success: true, transaction: {...}}
                        val jsonResponse = JSONObject(responseBody)
                        if (jsonResponse.getBoolean("success")) {
                            val transactionJson = jsonResponse.getJSONObject("transaction")
                            
                            // Convertir timestamp a Date
                            val timestampStr = transactionJson.optString("timestamp", "")
                            val createdAt = if (timestampStr.isNotEmpty()) {
                                try {
                                    SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()).parse(timestampStr) ?: Date()
                                } catch (e: Exception) {
                                    Date() // Fallback a fecha actual
                                }
                            } else {
                                Date()
                            }
                            
                            val transaction = Transaction(
                                id = transactionJson.getString("id"),
                                amount = transactionJson.getDouble("amount"),
                                status = transactionJson.optString("status", "completed"),
                                type = transactionJson.optString("type", "payment"),
                                createdAt = createdAt,
                                description = transactionJson.optString("description", "Transacción"),
                                merchantName = transactionJson.optString("merchantName", null),
                                paymentMethod = transactionJson.optString("paymentMethod", null)
                            )
                            
                            Result.success(transaction)
                        } else {
                            Result.failure(Exception(jsonResponse.optString("error", "Error desconocido")))
                        }
                    } else {
                        Result.failure(Exception("Empty response body"))
                    }
                } else {
                    Result.failure(Exception("HTTP ${response.code}: ${response.message}"))
                }
            } catch (e: IOException) {
                Log.e("TransactionService", "Network error", e)
                Result.failure(e)
            } catch (e: Exception) {
                Log.e("TransactionService", "Error getting transaction detail", e)
                Result.failure(e)
            }
        }
    }
    
    suspend fun getTransactionsByType(userId: String, type: String): Result<List<Transaction>> {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url("$baseUrl/api/transactions/user/$userId?type=$type")
                    .get()
                    .build()
                
                val response = client.newCall(request).execute()
                
                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    Log.d("TransactionService", "Filtered transactions response: $responseBody")
                    
                    if (responseBody != null) {
                        val type = object : TypeToken<List<Transaction>>() {}.type
                        val transactions = gson.fromJson<List<Transaction>>(responseBody, type)
                        Result.success(transactions)
                    } else {
                        Result.failure(Exception("Empty response body"))
                    }
                } else {
                    Result.failure(Exception("HTTP ${response.code}: ${response.message}"))
                }
            } catch (e: IOException) {
                Log.e("TransactionService", "Network error", e)
                Result.failure(e)
            } catch (e: Exception) {
                Log.e("TransactionService", "Error getting filtered transactions", e)
                Result.failure(e)
            }
        }
    }
    
    suspend fun requestRefund(transactionId: String, reason: String = ""): Result<RefundResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val requestBody = JSONObject().apply {
                    put("reason", reason)
                }
                
                val request = Request.Builder()
                    .url("$baseUrl/api/transactions/$transactionId/refund")
                    .post(requestBody.toString().toRequestBody("application/json".toMediaType()))
                    .build()
                
                val response = client.newCall(request).execute()
                
                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    Log.d("TransactionService", "Refund response: $responseBody")
                    
                    if (responseBody != null) {
                        val jsonResponse = JSONObject(responseBody)
                        if (jsonResponse.getBoolean("success")) {
                            val refundData = jsonResponse.getJSONObject("refund")
                            val refundResponse = RefundResponse(
                                success = true,
                                refundId = refundData.getString("id"),
                                message = jsonResponse.optString("message", "Reembolso procesado exitosamente")
                            )
                            Result.success(refundResponse)
                        } else {
                            Result.failure(Exception(jsonResponse.optString("error", "Error procesando reembolso")))
                        }
                    } else {
                        Result.failure(Exception("Empty response body"))
                    }
                } else {
                    val errorBody = response.body?.string()
                    val errorMessage = try {
                        JSONObject(errorBody ?: "").optString("error", "Error desconocido")
                    } catch (e: Exception) {
                        "HTTP ${response.code}: ${response.message}"
                    }
                    Result.failure(Exception(errorMessage))
                }
            } catch (e: IOException) {
                Log.e("TransactionService", "Network error requesting refund", e)
                Result.failure(e)
            } catch (e: Exception) {
                Log.e("TransactionService", "Error requesting refund", e)
                Result.failure(e)
            }
        }
    }

    fun getTransactionSummary(transactions: List<Transaction>): TransactionSummary {
        val currentMonth = Calendar.getInstance().get(Calendar.MONTH)
        val currentYear = Calendar.getInstance().get(Calendar.YEAR)
        
        val monthlyTransactions = transactions.filter { transaction ->
            val calendar = Calendar.getInstance()
            calendar.time = transaction.createdAt
            calendar.get(Calendar.MONTH) == currentMonth && 
            calendar.get(Calendar.YEAR) == currentYear
        }
        
        val totalSpent = monthlyTransactions
            .filter { it.type == "payment" && it.status == "completed" }
            .sumOf { it.amount }
        
        val transactionCount = monthlyTransactions.size
        
        return TransactionSummary(
            totalSpent = totalSpent,
            transactionCount = transactionCount,
            monthlyTransactions = monthlyTransactions
        )
    }
}

data class TransactionSummary(
    val totalSpent: Double,
    val transactionCount: Int,
    val monthlyTransactions: List<Transaction>
)

data class RefundResponse(
    val success: Boolean,
    val refundId: String = "",
    val message: String = ""
)