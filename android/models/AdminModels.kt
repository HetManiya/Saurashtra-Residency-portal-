package com.saurashtra.residency.data.models

import java.util.Date

/**
 * Data classes for Admin Summary
 */

data class AdminSummary(
    val totalCollected: Double,
    val totalPending: Double,
    val openComplaints: Int,
    val activeVisitors: Int
)

data class RecentComplaint(
    val id: String,
    val residentName: String,
    val flatId: String,
    val subject: String,
    val createdAt: Date
)

data class AdminDashboardResponse(
    val summary: AdminSummary,
    val recentComplaints: List<RecentComplaint>
)

sealed class AdminUiState {
    object Loading : AdminUiState()
    data class Success(val data: AdminDashboardResponse) : AdminUiState()
    data class Error(val message: String) : AdminUiState()
}
