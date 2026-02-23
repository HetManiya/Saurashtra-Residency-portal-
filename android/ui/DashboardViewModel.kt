package com.saurashtra.residency.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.saurashtra.residency.data.models.DashboardUiState
import com.saurashtra.residency.network.ApiService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel managing the Resident Dashboard state using UDF (Unidirectional Data Flow)
 */
class DashboardViewModel(private val apiService: ApiService) : ViewModel() {

    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        fetchDashboardData()
    }

    fun fetchDashboardData() {
        viewModelScope.launch {
            _uiState.value = DashboardUiState.Loading
            try {
                val response = apiService.getResidentDashboard()
                if (response.isSuccessful && response.body() != null) {
                    _uiState.value = DashboardUiState.Success(response.body()!!)
                } else {
                    _uiState.value = DashboardUiState.Error("Failed to load dashboard: ${response.message()}")
                }
            } catch (e: Exception) {
                _uiState.value = DashboardUiState.Error("Network error: ${e.localizedMessage}")
            }
        }
    }
}
