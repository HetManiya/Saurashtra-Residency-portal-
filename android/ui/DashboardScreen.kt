package com.saurashtra.residency.ui.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.saurashtra.residency.data.models.Announcement
import com.saurashtra.residency.data.models.DashboardResponse
import com.saurashtra.residency.data.models.DashboardUiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(viewModel: DashboardViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Saurashtra Residency", style = MaterialTheme.typography.titleMedium)
                        if (uiState is DashboardUiState.Success) {
                            Text(
                                "Welcome, ${(uiState as DashboardUiState.Success).data.resident.name}",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when (val state = uiState) {
                is DashboardUiState.Loading -> CircularProgressIndicator(Modifier.align(Alignment.Center))
                is DashboardUiState.Error -> ErrorView(state.message) { viewModel.fetchDashboardData() }
                is DashboardUiState.Success -> DashboardContent(state.data)
            }
        }
    }
}

@Composable
fun DashboardContent(data: DashboardResponse) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Maintenance Dues Card
        item {
            MaintenanceCard(data.maintenance.totalPending)
        }

        // 2. Quick Actions Row
        item {
            Text("Quick Actions", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                item { QuickActionIcon("Complaints", Icons.Default.Feedback) }
                item { QuickActionIcon("Amenities", Icons.Default.Pool) }
                item { QuickActionIcon("Visitors", Icons.Default.PersonAdd) }
                item { QuickActionIcon("SOS", Icons.Default.Warning) }
            }
        }

        // 3. Recent Announcements
        item {
            Text("Recent Announcements", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }
        items(data.announcements) { announcement ->
            AnnouncementCard(announcement)
        }
    }
}

@Composable
fun MaintenanceCard(amount: Double) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Pending Maintenance", style = MaterialTheme.typography.labelLarge)
            Text(
                "₹${String.format("%.2f", amount)}",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = if (amount > 0) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
            )
            Spacer(Modifier.height(8.dp))
            Button(
                onClick = { /* Navigate to Payment */ },
                modifier = Modifier.align(Alignment.End),
                enabled = amount > 0
            ) {
                Text("Pay Now")
            }
        }
    }
}

@Composable
fun QuickActionIcon(label: String, icon: ImageVector) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        FilledTonalIconButton(onClick = { /* Action */ }, modifier = Modifier.size(64.dp)) {
            Icon(icon, contentDescription = label)
        }
        Text(label, style = MaterialTheme.typography.labelSmall, modifier = Modifier.padding(top = 4.dp))
    }
}

@Composable
fun AnnouncementCard(announcement: Announcement) {
    OutlinedCard(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Badge(containerColor = if (announcement.category == "Urgent") MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary) {
                    Text(announcement.category)
                }
                Spacer(Modifier.weight(1f))
                Text(announcement.date, style = MaterialTheme.typography.labelSmall)
            }
            Spacer(Modifier.height(4.dp))
            Text(announcement.title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            Text(announcement.content, style = MaterialTheme.typography.bodyMedium, maxLines = 2)
        }
    }
}

@Composable
fun ErrorView(message: String, onRetry: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(message, color = MaterialTheme.colorScheme.error)
        Button(onClick = onRetry) { Text("Retry") }
    }
}
