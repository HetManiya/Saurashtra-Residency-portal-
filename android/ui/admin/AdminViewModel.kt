package com.saurashtra.residency.ui.admin

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.saurashtra.residency.data.models.AdminDashboardResponse
import com.saurashtra.residency.data.models.AdminUiState
import com.saurashtra.residency.network.ApiService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel for the Admin Dashboard
 * Handles fetching summary data and resolving complaints.
 */
class AdminViewModel(private val apiService: ApiService) : ViewModel() {

    private val _uiState = MutableStateFlow<AdminUiState>(AdminUiState.Loading)
    val uiState: StateFlow<AdminUiState> = _uiState.asStateFlow()

    init {
        fetchAdminSummary()
    }

    /**
     * Fetches the dashboard summary from the backend.
     * Note: The JWT token is usually handled by a Retrofit Interceptor.
     */
    fun fetchAdminSummary() {
        viewModelScope.launch {
            _uiState.value = AdminUiState.Loading
            try {
                val response = apiService.getAdminSummary()
                if (response.isSuccessful && response.body() != null) {
                    _uiState.value = AdminUiState.Success(response.body()!!)
                } else {
                    _uiState.value = AdminUiState.Error("Failed to load admin data")
                }
            } catch (e: Exception) {
                _uiState.value = AdminUiState.Error("Network error: ${e.localizedMessage}")
            }
        }
    }

    /**
     * Quickly resolves a complaint from the dashboard list.
     */
    fun resolveComplaint(complaintId: String) {
        viewModelScope.launch {
            try {
                val response = apiService.resolveComplaint(complaintId)
                if (response.isSuccessful) {
                    // Refresh the summary to update the list
                    fetchAdminSummary()
                }
            } catch (e: Exception) {
                // Handle error (e.g., show toast)
            }
        }
    }
}
