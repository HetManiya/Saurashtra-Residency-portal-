package com.saurashtra.residency.ui.payment

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Payment
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.saurashtra.residency.data.models.MaintenanceRecord
import com.saurashtra.residency.data.models.PaymentUiState

@Composable
fun PaymentScreen(
    bill: MaintenanceRecord,
    viewModel: PaymentViewModel,
    onLaunchStripe: (clientSecret: String, publishableKey: String) -> Unit
) {
    val state by viewModel.paymentState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        when (state) {
            is PaymentUiState.Idle -> BillDetails(bill) { viewModel.startPayment(bill.id) }
            is PaymentUiState.Loading -> CircularProgressIndicator()
            is PaymentUiState.ReadyToPay -> {
                val order = (state as PaymentUiState.ReadyToPay).order
                // In a real app, this would trigger the Stripe SDK Launcher
                LaunchedEffect(order) {
                    onLaunchStripe(order.clientSecret, order.publishableKey)
                }
                Text("Redirecting to Secure Payment...")
            }
            is PaymentUiState.Processing -> {
                CircularProgressIndicator()
                Text("Verifying Payment...")
            }
            is PaymentUiState.Success -> PaymentSuccessView { viewModel.resetState() }
            is PaymentUiState.Error -> {
                Text((state as PaymentUiState.Error).message, color = MaterialTheme.colorScheme.error)
                Button(onClick = { viewModel.resetState() }) { Text("Try Again") }
            }
        }
    }
}

@Composable
fun BillDetails(bill: MaintenanceRecord, onPay: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(24.dp)) {
            Text("Maintenance Bill", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(16.dp))
            
            DetailRow("Month", "${bill.month} ${bill.year}")
            DetailRow("Amount", "₹${bill.amount}")
            DetailRow("Status", bill.status)
            
            Spacer(Modifier.height(24.dp))
            
            Button(
                onClick = onPay,
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(16.dp)
            ) {
                Icon(Icons.Default.Payment, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Proceed to Pay")
            }
        }
    }
}

@Composable
fun DetailRow(label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, color = Color.Gray)
        Text(value, fontWeight = FontWeight.Medium)
    }
}

@Composable
fun PaymentSuccessView(onDone: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF4CAF50), modifier = Modifier.size(80.dp))
        Spacer(Modifier.height(16.dp))
        Text("Payment Successful!", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Text("Your maintenance record has been updated.", color = Color.Gray)
        Spacer(Modifier.height(24.dp))
        Button(onClick = onDone) { Text("Back to Dashboard") }
    }
}
