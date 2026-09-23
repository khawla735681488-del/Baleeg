package ai.yemendub.app.data

import com.google.gson.annotations.SerializedName

data class Project(@SerializedName("id") val id: String, @SerializedName("name") val name: String, @SerializedName("status") val status: String, @SerializedName("progress") val progress: Int = 0, @SerializedName("segments") val segments: List<Segment> = emptyList(), @SerializedName("outputUrl") val outputUrl: String? = null)
data class Segment(val id: String, var text: String, val startMs: Long, val endMs: Long, val speaker: String? = null, val audioUrl: String? = null)
data class CreateProjectResponse(val project: Project)
data class JobResponse(val jobId: String, val status: String, val progress: Int)
data class UrlRequest(val url: String, val dialect: String, val addSubtitles: Boolean)
data class UpdateSegmentRequest(val text: String, val startMs: Long, val endMs: Long)
