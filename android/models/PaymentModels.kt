package com.saurashtra.residency.data.models

/**
 * Data classes for Payment Flow
 */

data class PaymentOrderRequest(
    val maintenanceId: String
)

data class PaymentOrderResponse(
    val clientSecret: String,
    val publishableKey: String,
    val amount: Double,
    val currency: String
)

sealed class PaymentUiState {
    object Idle : PaymentUiState()
    object Loading : PaymentUiState()
    data class ReadyToPay(val order: PaymentOrderResponse) : PaymentUiState()
    object Processing : PaymentUiState()
    object Success : PaymentUiState()
    data class Error(val message: String) : PaymentUiState()
}
