package ai.yemendub.app

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import ai.yemendub.app.data.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AppState(val loading: Boolean = false, val project: Project? = null, val error: String? = null, val message: String? = null)

class MainViewModel(app: Application) : AndroidViewModel(app) {
    private val repo = ProjectRepository(app)
    private val _state = MutableStateFlow(AppState())
    val state: StateFlow<AppState> = _state.asStateFlow()
    private var pollJob: Job? = null

    fun createFromFile(uri: Uri, dialect: String, subtitles: Boolean) = run { _state.value = AppState(loading = true); viewModelScope.launch { call { repo.upload(uri, dialect, subtitles) } } }
    fun createFromUrl(url: String, dialect: String, subtitles: Boolean) = viewModelScope.launch { _state.value = AppState(loading = true); call { repo.importUrl(url, dialect, subtitles) } }
    fun start() { val id = _state.value.project?.id ?: return; viewModelScope.launch { try { repo.process(id); poll(id) } catch (e: Exception) { fail(e) } } }
    fun update(segment: Segment) { val id = _state.value.project?.id ?: return; viewModelScope.launch { try { repo.edit(id, segment); refresh(id) } catch (e: Exception) { fail(e) } } }
    fun export(subtitles: Boolean) { val id = _state.value.project?.id ?: return; viewModelScope.launch { try { repo.export(id, subtitles); _state.value = _state.value.copy(message = "بدأ تجهيز الملف النهائي") } catch (e: Exception) { fail(e) } } }
    private suspend fun call(action: suspend () -> Project) { try { val p = action(); _state.value = AppState(project = p, message = "تم رفع الفيديو، اضغط بدء التحليل") } catch (e: Exception) { fail(e) } }
    private suspend fun poll(id: String) { pollJob?.cancel(); pollJob = viewModelScope.launch { while (true) { refresh(id); if (_state.value.project?.status in listOf("READY", "FAILED")) break; delay(2000) } } }
    private suspend fun refresh(id: String) { try { _state.value = _state.value.copy(project = repo.project(id), loading = false) } catch (e: Exception) { fail(e) } }
    private fun fail(e: Exception) { _state.value = _state.value.copy(loading = false, error = e.message ?: "حدث خطأ غير متوقع") }
}
