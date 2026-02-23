package com.saurashtra.residency.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.saurashtra.residency.data.models.AdminSummary
import com.saurashtra.residency.data.models.AdminUiState
import com.saurashtra.residency.data.models.RecentComplaint

/**
 * Admin Dashboard Screen - Command Center for Society Secretary
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminDashboardScreen(viewModel: AdminViewModel) {
    val state by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Admin Console", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = { viewModel.fetchAdminSummary() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when (state) {
                is AdminUiState.Loading -> CircularProgressIndicator(Modifier.align(Alignment.Center))
                is AdminUiState.Success -> {
                    val data = (state as AdminUiState.Success).data
                    AdminContent(
                        summary = data.summary,
                        recentComplaints = data.recentComplaints,
                        onResolve = { viewModel.resolveComplaint(it) }
                    )
                }
                is AdminUiState.Error -> {
                    Text(
                        (state as AdminUiState.Error).message,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            }
        }
    }
}

@Composable
fun AdminContent(
    summary: AdminSummary,
    recentComplaints: List<RecentComplaint>,
    onResolve: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        // 1. Statistics Grid
        item {
            Text("Financial Overview", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(12.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard(
                    label = "Collected",
                    value = "₹${summary.totalCollected}",
                    icon = Icons.Default.AccountBalanceWallet,
                    color = Color(0xFF4CAF50),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    label = "Pending",
                    value = "₹${summary.totalPending}",
                    icon = Icons.Default.PendingActions,
                    color = Color(0xFFF44336),
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // 2. Operational Stats
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatCard(
                    label = "Open Complaints",
                    value = "${summary.openComplaints}",
                    icon = Icons.Default.ReportProblem,
                    color = Color(0xFFFF9800),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    label = "Visitors In",
                    value = "${summary.activeVisitors}",
                    icon = Icons.Default.PersonSearch,
                    color = Color(0xFF2196F3),
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // 3. Quick Actions
        item {
            Text("Quick Actions", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(12.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                ActionButton("Notice", Icons.Default.Campaign, Modifier.weight(1f)) {}
                ActionButton("Complaints", Icons.Default.Assignment, Modifier.weight(1f)) {}
                ActionButton("Gate", Icons.Default.DoorSliding, Modifier.weight(1f)) {}
            }
        }

        // 4. Recent Complaints
        item {
            Text("Recent Complaints", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }

        if (recentComplaints.isEmpty()) {
            item {
                Text("No pending complaints!", color = Color.Gray, modifier = Modifier.padding(vertical = 16.dp))
            }
        } else {
            items(recentComplaints) { complaint ->
                ComplaintItem(complaint, onResolve)
            }
        }
    }
}

@Composable
fun StatCard(label: String, value: String, icon: ImageVector, color: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(24.dp))
            Spacer(Modifier.height(8.dp))
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.Black, color = color)
            Text(label, fontSize = 12.sp, color = color.copy(alpha = 0.8f))
        }
    }
}

@Composable
fun ActionButton(label: String, icon: ImageVector, modifier: Modifier = Modifier, onClick: () -> Unit) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.height(80.dp),
        shape = RoundedCornerShape(16.dp),
        contentPadding = PaddingValues(8.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(icon, contentDescription = null)
            Spacer(Modifier.height(4.dp))
            Text(label, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun ComplaintItem(complaint: RecentComplaint, onResolve: (String) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(complaint.subject, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text("${complaint.residentName} (${complaint.flatId})", fontSize = 12.sp, color = Color.Gray)
            }
            Button(
                onClick = { onResolve(complaint.id) },
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50))
            ) {
                Text("Resolve", fontSize = 10.sp)
            }
        }
    }
}
