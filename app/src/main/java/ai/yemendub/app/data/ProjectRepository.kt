package ai.yemendub.app.data

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File

class ProjectRepository(private val context: Context, private val api: YemenDubApi = ApiProvider.api) {
    suspend fun upload(uri: Uri, dialect: String, subtitles: Boolean): Project = withContext(Dispatchers.IO) {
        val file = File(context.cacheDir, "upload-${System.currentTimeMillis()}.mp4")
        context.contentResolver.openInputStream(uri).use { input -> requireNotNull(input) { "تعذر قراءة الملف" }.copyTo(file.outputStream()) }
        val body = file.asRequestBody("video/*".toMediaType())
        val part = MultipartBody.Part.createFormData("video", displayName(uri), body)
        try { api.uploadVideo(part, dialect.toRequestBody("text/plain".toMediaType()), subtitles.toString().toRequestBody("text/plain".toMediaType())).project }
        finally { file.delete() }
    }
    suspend fun importUrl(url: String, dialect: String, subtitles: Boolean) = api.importUrl(UrlRequest(url, dialect, subtitles)).project
    suspend fun project(id: String) = api.getProject(id)
    suspend fun process(id: String) = api.startProcessing(id)
    suspend fun edit(projectId: String, segment: Segment) = api.updateSegment(projectId, segment.id, UpdateSegmentRequest(segment.text, segment.startMs, segment.endMs))
    suspend fun export(id: String, subtitles: Boolean) = api.export(id, subtitles)
    private fun displayName(uri: Uri): String = context.contentResolver.query(uri, null, null, null, null)?.use { c -> val i = c.getColumnIndex(OpenableColumns.DISPLAY_NAME); if (c.moveToFirst() && i >= 0) c.getString(i) else "video.mp4" } ?: "video.mp4"
}
