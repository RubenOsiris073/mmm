import java.io.FileInputStream
import java.security.MessageDigest
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec
import java.util.Base64
import java.io.File
import com.google.gson.Gson
import com.google.gson.JsonObject

/**
 * Utilidad para desencriptar credenciales de Firebase durante el build de Android
 */
object CredentialsDecryptor {
    
    private const val ALGORITHM = "AES/CBC/PKCS5Padding"
    private const val KEY_ALGORITHM = "AES"
    private const val SALT = "salt-fisgo-wallet"
    
    data class EncryptedData(
        val iv: String,
        val encrypted: String,
        val algorithm: String,
        val timestamp: String,
        val app: String
    )
    
    /**
     * Genera clave de encriptación desde password
     */
    private fun generateKey(password: String): ByteArray {
        val digest = MessageDigest.getInstance("SHA-256")
        val combined = "$password$SALT".toByteArray()
        return digest.digest(combined).sliceArray(0..31) // 32 bytes para AES-256
    }
    
    /**
     * Desencripta archivo google-services.json
     */
    fun decryptGoogleServicesFile(encryptedFilePath: String, outputFilePath: String, password: String): Boolean {
        return try {
            println("🔓 Desencriptando: $encryptedFilePath")
            
            // Leer archivo encriptado
            val encryptedContent = File(encryptedFilePath).readText()
            val gson = Gson()
            val encryptedData = gson.fromJson(encryptedContent, EncryptedData::class.java)
            
            // Desencriptar
            val key = generateKey(password)
            val secretKey = SecretKeySpec(key, KEY_ALGORITHM)
            val ivBytes = Base64.getDecoder().decode(encryptedData.iv)
            val ivSpec = IvParameterSpec(ivBytes)
            
            val cipher = Cipher.getInstance(ALGORITHM)
            cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec)
            
            val encryptedBytes = Base64.getDecoder().decode(encryptedData.encrypted)
            val decryptedBytes = cipher.doFinal(encryptedBytes)
            val decryptedJson = String(decryptedBytes)
            
            // Escribir archivo desencriptado
            File(outputFilePath).writeText(decryptedJson)
            
            println("✅ Archivo desencriptado: $outputFilePath")
            true
        } catch (e: Exception) {
            println("❌ Error desencriptando $encryptedFilePath: ${e.message}")
            false
        }
    }
    
    /**
     * Desencripta credenciales si existen archivos encriptados
     */
    fun decryptCredentialsIfNeeded(projectDir: String, password: String) {
        val encryptedFile = File(projectDir, "app/google-services.encrypted.json")
        val outputFile = File(projectDir, "app/google-services.json")
        
        if (encryptedFile.exists() && !outputFile.exists()) {
            println("🔐 Detectado archivo encriptado, desencriptando credenciales...")
            decryptGoogleServicesFile(encryptedFile.absolutePath, outputFile.absolutePath, password)
        }
    }
}