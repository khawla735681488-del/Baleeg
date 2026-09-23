package ai.yemendub.app.data

import ai.yemendub.app.BuildConfig
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiProvider {
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS).readTimeout(60, TimeUnit.SECONDS)
        .addInterceptor { chain ->
            val request = chain.request().newBuilder()
            if (BuildConfig.API_TOKEN.isNotBlank()) request.addHeader("Authorization", "Bearer ${BuildConfig.API_TOKEN}")
            chain.proceed(request.build())
        }.addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC }).build()

    val api: YemenDubApi = Retrofit.Builder().baseUrl(BuildConfig.API_BASE_URL).client(client).addConverterFactory(GsonConverterFactory.create()).build().create(YemenDubApi::class.java)
}
