package com.saurashtra.residency.data.utils

import com.saurashtra.residency.data.models.ResidentInfo
import com.saurashtra.residency.data.models.MaintenanceRecord

/**
 * Data class for Complaint Tickets (Add this to your models folder)
 */
data class ComplaintTicket(
    val id: String,
    val subject: String,
    val status: String,
    val date: String
)

/**
 * Utility object to build a text-based summary of a resident's data.
 * This summary is fed to the AI so it "knows" who it is talking to.
 */
object AiContextBuilder {

    /**
     * Formats database objects into a single string for the AI's context.
     */
    fun buildResidentContext(
        resident: ResidentInfo,
        bills: List<MaintenanceRecord>,
        complaints: List<ComplaintTicket>
    ): String {
        // Start with basic resident info
        val sb = StringBuilder()
        sb.append("CURRENT RESIDENT PROFILE:\n")
        sb.append("- Name: ${resident.name}\n")
        sb.append("- Flat Number: ${resident.flatId}\n")
        sb.append("- Role: ${resident.role}\n\n")

        // Add Maintenance Dues info
        sb.append("MAINTENANCE STATUS:\n")
        if (bills.isEmpty()) {
            sb.append("- No maintenance records found.\n")
        } else {
            bills.forEach { bill ->
                sb.append("- ${bill.month} ${bill.year}: ₹${bill.amount} (${bill.status})\n")
            }
        }
        sb.append("\n")

        // Add Complaint history
        sb.append("RECENT COMPLAINTS:\n")
        if (complaints.isEmpty()) {
            sb.append("- No active complaints.\n")
        } else {
            complaints.forEach { ticket ->
                sb.append("- [${ticket.id}] ${ticket.subject}: ${ticket.status} (Filed on ${ticket.date})\n")
            }
        }

        return sb.toString()
    }
}
