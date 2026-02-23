package com.saurashtra.residency.ui.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import com.saurashtra.residency.data.models.ChatMessage
import com.saurashtra.residency.data.models.ChatRole
import com.saurashtra.residency.data.models.ChatUiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

import com.saurashtra.residency.data.utils.AiContextBuilder
import com.saurashtra.residency.data.models.ResidentInfo
import com.saurashtra.residency.data.models.MaintenanceRecord
import com.saurashtra.residency.data.utils.ComplaintTicket

/**
 * ViewModel for the Gemini-powered Smart Assistant with Personalized Context
 */
class ChatViewModel(private val apiKey: String) : ViewModel() {

    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    // We store the context string here
    private var residentContext: String = ""

    /**
     * Call this when the app loads the resident's data from the database.
     * It builds the "knowledge" for the AI.
     */
    fun updateResidentContext(
        resident: ResidentInfo,
        bills: List<MaintenanceRecord>,
        complaints: List<ComplaintTicket>
    ) {
        residentContext = AiContextBuilder.buildResidentContext(resident, bills, complaints)
    }

    // Function to create the model with personalized instructions
    private fun getPersonalizedModel(): GenerativeModel {
        return GenerativeModel(
            modelName = "gemini-2.5-flash",
            apiKey = apiKey,
            systemInstruction = content {
                text("""
                    You are 'Saurashtra Bot', the official assistant for Saurashtra Residency.
                    
                    $residentContext
                    
                    INSTRUCTIONS:
                    1. Use the 'CURRENT RESIDENT PROFILE' above to personalize your answers. 
                       (e.g., If they ask "What is my flat number?", answer using the provided data).
                    2. If they ask about maintenance, refer to the 'MAINTENANCE STATUS' section.
                    3. If they ask about complaints, refer to 'RECENT COMPLAINTS'.
                    4. Follow all previous safety and topic restrictions.
                """.trimIndent())
            }
        )
    }

    // We create the chat session lazily or update it when context changes
    private var chatSession = getPersonalizedModel().startChat()

    fun sendMessage(userText: String) {
        if (userText.isBlank()) return
        
        // If context was updated, we might want to refresh the session 
        // (In a real app, you'd handle session persistence carefully)

        val userMessage = ChatMessage(content = userText, role = ChatRole.USER)
        _uiState.update { it.copy(
            messages = it.messages + userMessage,
            isLoading = true
        ) }

        viewModelScope.launch {
            try {
                val response = chatSession.sendMessage(userText)
                val aiResponse = response.text ?: "I'm sorry, I couldn't process that."
                val aiMessage = ChatMessage(content = aiResponse, role = ChatRole.AI)
                
                _uiState.update { it.copy(
                    messages = it.messages + aiMessage,
                    isLoading = false
                ) }
            } catch (e: Exception) {
                _uiState.update { it.copy(
                    isLoading = false,
                    error = "Error: ${e.localizedMessage}"
                ) }
            }
        }
    }
}
