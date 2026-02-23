package com.saurashtra.residency.data.models

/**
 * Represents a single message in the chat history
 */
data class ChatMessage(
    val content: String,
    val role: ChatRole,
    val timestamp: Long = System.currentTimeMillis()
)

enum class ChatRole {
    USER,
    AI
}

/**
 * UI State for the Chat Screen
 */
data class ChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)
