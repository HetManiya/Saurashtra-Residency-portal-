package com.saurashtra.residency.ui.payment

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.saurashtra.residency.data.models.PaymentOrderRequest
import com.saurashtra.residency.data.models.PaymentUiState
import com.saurashtra.residency.network.ApiService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel managing the Payment Flow
 */
class PaymentViewModel(private val apiService: ApiService) : ViewModel() {

    private val _paymentState = MutableStateFlow<PaymentUiState>(PaymentUiState.Idle)
    val paymentState: StateFlow<PaymentUiState> = _paymentState.asStateFlow()

    /**
     * Step 1: Initialize the payment on the server
     */
    fun startPayment(maintenanceId: String) {
        viewModelScope.launch {
            _paymentState.value = PaymentUiState.Loading
            try {
                val response = apiService.createPaymentOrder(PaymentOrderRequest(maintenanceId))
                if (response.isSuccessful && response.body() != null) {
                    _paymentState.value = PaymentUiState.ReadyToPay(response.body()!!)
                } else {
                    _paymentState.value = PaymentUiState.Error("Failed to initialize payment")
                }
            } catch (e: Exception) {
                _paymentState.value = PaymentUiState.Error("Network error: ${e.localizedMessage}")
            }
        }
    }

    /**
     * Step 2: Update state after SDK callback
     */
    fun onPaymentResult(isSuccess: Boolean) {
        if (isSuccess) {
            _paymentState.value = PaymentUiState.Success
        } else {
            _paymentState.value = PaymentUiState.Error("Payment failed or cancelled")
        }
    }

    fun resetState() {
        _paymentState.value = PaymentUiState.Idle
    }
}
