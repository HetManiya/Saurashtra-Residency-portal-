package com.saurashtra.residency.data.models

import java.util.Date

/**
 * Data classes representing the Dashboard API response
 */

data class DashboardResponse(
    val resident: ResidentInfo,
    val maintenance: MaintenanceInfo,
    val announcements: List<Announcement>
)

data class ResidentInfo(
    val name: String,
    val flatId: String,
    val role: String
)

data class MaintenanceInfo(
    val totalPending: Double,
    val currency: String,
    val pendingRecords: List<MaintenanceRecord>
)

data class MaintenanceRecord(
    val month: String,
    val year: Int,
    val amount: Double,
    val status: String
)

data class Announcement(
    val id: String,
    val title: String,
    val content: String,
    val category: String,
    val date: String
)

/**
 * UI State for the Dashboard
 */
sealed class DashboardUiState {
    object Loading : DashboardUiState()
    data class Success(val data: DashboardResponse) : DashboardUiState()
    data class Error(val message: String) : DashboardUiState()
}
