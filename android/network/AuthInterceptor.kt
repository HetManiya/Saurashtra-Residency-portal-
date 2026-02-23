package com.saurashtra.residency.network

import okhttp3.Interceptor
import okhttp3.Response

/**
 * Interceptor to automatically add JWT token to every request header.
 * The token would typically be retrieved from EncryptedSharedPreferences or DataStore.
 */
class AuthInterceptor(private val tokenProvider: () -> String?) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val token = tokenProvider()

        return if (token != null) {
            val authenticatedRequest = originalRequest.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
            chain.proceed(authenticatedRequest)
        } else {
            chain.proceed(originalRequest)
        }
    }
}

/* 
Best Practice Explanation:
Storing JWT tokens on Android should be done using:
1. EncryptedSharedPreferences: Part of the Jetpack Security library. It encrypts keys and values using the Android Keystore system.
2. Preferences DataStore: A modern replacement for SharedPreferences that uses Coroutines and Flow, providing a more robust and reactive way to handle data.
*/
