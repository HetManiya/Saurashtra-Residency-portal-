package com.residency.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * EXPERT ANDROID DEVELOPER REFERENCE
 * 
 * This file demonstrates the proper way to handle state in Jetpack Compose
 * to ensure the UI updates immediately after a creation action.
 */

data class Meeting(
    val id: String = java.util.UUID.randomUUID().toString(),
    val title: String,
    val description: String,
    val date: Long = System.currentTimeMillis()
)

class ResidencyViewModel(private val repository: ResidencyRepository) : ViewModel() {

    // 1. Private mutable state (Source of Truth)
    private val _meetings = MutableStateFlow<List<Meeting>>(emptyList())
    
    // 2. Public immutable state (What the UI observes)
    val meetings: StateFlow<List<Meeting>> = _meetings.asStateFlow()

    init {
        loadMeetings()
    }

    private fun loadMeetings() {
        viewModelScope.launch {
            // Initial fetch from DB/API
            val result = repository.getMeetings()
            _meetings.value = result
        }
    }

    /**
     * The Create Action Logic
     * 
     * Key: We update the local state IMMEDIATELY after a successful repository save.
     * We use .update {} to ensure thread safety.
     */
    fun createMeeting(title: String, description: String) {
        viewModelScope.launch {
            val newMeeting = Meeting(title = title, description = description)
            
            // Step A: Save to Database/API
            val success = repository.saveMeeting(newMeeting)
            
            if (success) {
                // Step B: IMMEDIATE UI UPDATE
                // We use .update {} to ensure thread safety and trigger recomposition.
                // Creating a NEW list instance (currentList + newMeeting) is CRITICAL
                // so that StateFlow detects the change.
                _meetings.update { currentList ->
                    currentList + newMeeting 
                }
            }
        }
    }
}

/**
 * Repository Interface for reference
 */
interface ResidencyRepository {
    suspend fun getMeetings(): List<Meeting>
    suspend fun saveMeeting(meeting: Meeting): Boolean
}

/**
 * COMPOSE UI REFERENCE
 */
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun MeetingListScreen(viewModel: ResidencyViewModel) {
    // 1. Collect the state from ViewModel using lifecycle-aware collector
    val meetings by viewModel.meetings.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text(text = "Society Meetings", style = MaterialTheme.typography.headlineMedium)
        
        Spacer(modifier = Modifier.height(16.dp))

        // 2. Create Button
        Button(
            onClick = { 
                viewModel.createMeeting("New Meeting", "Discussing maintenance") 
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Create Meeting")
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 3. The List (Automatically updates when 'meetings' changes)
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            items(meetings) { meeting ->
                MeetingItem(meeting)
            }
        }
    }
}

@Composable
fun MeetingItem(meeting: Meeting) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = meeting.title, style = MaterialTheme.typography.titleMedium)
            Text(text = meeting.description, style = MaterialTheme.typography.bodyMedium)
        }
    }
}
