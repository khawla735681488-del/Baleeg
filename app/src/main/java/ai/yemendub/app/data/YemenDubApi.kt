package ai.yemendub.app.data

import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.*

interface YemenDubApi {
    @Multipart
    @POST("v1/projects/upload")
    suspend fun uploadVideo(@Part video: MultipartBody.Part, @Part("dialect") dialect: RequestBody, @Part("addSubtitles") subtitles: RequestBody): CreateProjectResponse

    @POST("v1/projects/from-url")
    suspend fun importUrl(@Body request: UrlRequest): CreateProjectResponse

    @GET("v1/projects/{id}")
    suspend fun getProject(@Path("id") id: String): Project

    @POST("v1/projects/{id}/process")
    suspend fun startProcessing(@Path("id") id: String): JobResponse

    @PATCH("v1/projects/{projectId}/segments/{segmentId}")
    suspend fun updateSegment(@Path("projectId") projectId: String, @Path("segmentId") segmentId: String, @Body request: UpdateSegmentRequest): Segment

    @POST("v1/projects/{id}/export")
    suspend fun export(@Path("id") id: String, @Query("addSubtitles") addSubtitles: Boolean): JobResponse
}
