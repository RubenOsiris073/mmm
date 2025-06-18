package com.fisgo.wallet

import android.content.Context
import android.content.SharedPreferences

/**
 * Clase para gestionar el saldo de la wallet del usuario
 */
object WalletManager {
    private const val PREFS_NAME = "wallet_preferences"
    private const val KEY_BALANCE = "wallet_balance"
    private const val DEFAULT_BALANCE = 200.0 // Saldo inicial de 200 pesos
    
    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
    
    /**
     * Obtener el saldo actual de la wallet
     */
    fun getBalance(context: Context): Double {
        val prefs = getPrefs(context)
        return prefs.getFloat(KEY_BALANCE, DEFAULT_BALANCE.toFloat()).toDouble()
    }
    
    /**
     * Establecer un nuevo saldo en la wallet
     */
    fun setBalance(context: Context, balance: Double) {
        getPrefs(context).edit().putFloat(KEY_BALANCE, balance.toFloat()).apply()
    }
    
    /**
     * Restar un monto del saldo actual
     * @return true si hay suficiente saldo y se realizó la operación, false en caso contrario
     */
    fun deductAmount(context: Context, amount: Double): Boolean {
        val currentBalance = getBalance(context)
        
        if (currentBalance >= amount) {
            setBalance(context, currentBalance - amount)
            return true
        }
        
        return false
    }
    
    /**
     * Añadir un monto al saldo actual
     */
    fun addAmount(context: Context, amount: Double) {
        val currentBalance = getBalance(context)
        setBalance(context, currentBalance + amount)
    }
    
    /**
     * Resetear el saldo al valor por defecto (útil para pruebas)
     */
    fun resetBalance(context: Context) {
        setBalance(context, DEFAULT_BALANCE)
    }
    
    /**
     * Limpiar todos los datos de la wallet (para eliminación de cuenta)
     */
    fun clearAllData(context: Context) {
        getPrefs(context).edit().clear().apply()
    }
}