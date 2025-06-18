package com.fisgo.wallet

import android.content.Context
import android.content.SharedPreferences

/**
 * Clase para gestionar los métodos de pago guardados del usuario
 */
object PaymentMethodManager {
    private const val PREFS_NAME = "payment_methods_preferences"
    private const val KEY_SAVED_CARD_LAST_FOUR = "saved_card_last_four"
    private const val KEY_SAVED_CARD_TYPE = "saved_card_type"
    private const val KEY_HAS_SAVED_CARD = "has_saved_card"
    private const val KEY_PREFERRED_METHOD = "preferred_payment_method" // "wallet" or "card"
    
    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
    
    /**
     * Guardar información de tarjeta
     */
    fun saveCardInfo(context: Context, lastFour: String, cardType: String) {
        getPrefs(context).edit()
            .putString(KEY_SAVED_CARD_LAST_FOUR, lastFour)
            .putString(KEY_SAVED_CARD_TYPE, cardType)
            .putBoolean(KEY_HAS_SAVED_CARD, true)
            .apply()
    }
    
    /**
     * Obtener últimos 4 dígitos de la tarjeta guardada
     */
    fun getSavedCardLastFour(context: Context): String? {
        return getPrefs(context).getString(KEY_SAVED_CARD_LAST_FOUR, null)
    }
    
    /**
     * Obtener tipo de tarjeta guardada (Visa, MasterCard, etc.)
     */
    fun getSavedCardType(context: Context): String? {
        return getPrefs(context).getString(KEY_SAVED_CARD_TYPE, null)
    }
    
    /**
     * Verificar si hay una tarjeta guardada
     */
    fun hasSavedCard(context: Context): Boolean {
        return getPrefs(context).getBoolean(KEY_HAS_SAVED_CARD, false)
    }
    
    /**
     * Obtener método de pago preferido
     */
    fun getPreferredPaymentMethod(context: Context): String {
        return getPrefs(context).getString(KEY_PREFERRED_METHOD, "wallet") ?: "wallet"
    }
    
    /**
     * Guardar método de pago preferido
     */
    fun setPreferredPaymentMethod(context: Context, method: String) {
        getPrefs(context).edit()
            .putString(KEY_PREFERRED_METHOD, method)
            .apply()
    }
    
    /**
     * Limpiar información de tarjeta guardada
     */
    fun clearSavedCard(context: Context) {
        getPrefs(context).edit()
            .remove(KEY_SAVED_CARD_LAST_FOUR)
            .remove(KEY_SAVED_CARD_TYPE)
            .putBoolean(KEY_HAS_SAVED_CARD, false)
            .apply()
    }
}