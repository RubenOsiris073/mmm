plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    id("com.google.gms.google-services")
    id("kotlin-parcelize") // Agregar plugin para Parcelize
}

// Configuración de desencriptación de credenciales
val walletEncryptionPassword = project.findProperty("WALLET_ENCRYPTION_PASSWORD") as String? 
    ?: System.getenv("WALLET_ENCRYPTION_PASSWORD") 
    ?: "fisgo-wallet-2025-secure-key"

// Tarea para desencriptar credenciales antes del build
tasks.register("decryptCredentials") {
    description = "Desencripta las credenciales de Firebase si es necesario"
    group = "build setup"
    
    doLast {
        println("🔐 Verificando credenciales de Firebase...")
        CredentialsDecryptor.decryptCredentialsIfNeeded(project.projectDir.parent, walletEncryptionPassword)
    }
}

// Ejecutar desencriptación antes de procesar google-services
tasks.whenTaskAdded {
    if (name == "processDebugGoogleServices" || name == "processReleaseGoogleServices") {
        dependsOn("decryptCredentials")
    }
}

android {
    namespace = "com.fisgo.wallet"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.fisgo.wallet"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    
    kotlinOptions {
        jvmTarget = "11"
    }
    
    buildFeatures {
        viewBinding = true
    }
    
    // Configuración de Lint para evitar que falle el build por warnings
    lint {
        abortOnError = false
        warningsAsErrors = false
        checkReleaseBuilds = false
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.lifecycle.livedata.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.ktx)
    implementation(libs.androidx.navigation.fragment.ktx)
    implementation(libs.androidx.navigation.ui.ktx)
    
    // Firebase dependencies
    implementation(platform("com.google.firebase:firebase-bom:32.7.0"))
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-analytics-ktx")
    
    // Google Auth
    implementation("com.google.android.gms:play-services-auth:21.0.0")
    
    // Material Design components for attractive UI
    implementation("com.google.android.material:material:1.11.0")
    
    // Stripe SDK para pagos con tarjeta - NUEVO
    implementation("com.stripe:stripe-android:20.37.0")
    
    // Networking para API calls
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.google.code.gson:gson:2.10.1")
    
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}