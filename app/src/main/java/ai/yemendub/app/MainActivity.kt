package ai.yemendub.app

import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); setContent { YemenDubTheme { YemenDubApp() } } }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable fun YemenDubApp(vm: MainViewModel = viewModel()) {
    val state by vm.state.collectAsState(); var dialect by remember { mutableStateOf("صنعاني") }; var url by remember { mutableStateOf("") }; var subtitles by remember { mutableStateOf(true) }; var showUrl by remember { mutableStateOf(false) }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { it?.let { uri: Uri -> vm.createFromFile(uri, dialect, subtitles) } }
    Scaffold(topBar = { TopAppBar(title = { Text("YemenDub AI", style = MaterialTheme.typography.headlineSmall) }, colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) }) { pad ->
        LazyColumn(Modifier.padding(pad).padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            item { Text("دبلج فيديوهاتك بلهجتك اليمنية", style = MaterialTheme.typography.headlineMedium); Text("ارفع فيديو أو استخدم رابطاً تملك حق استخدامه.") }
            item { OutlinedButton(onClick = { picker.launch("video/*") }, modifier = Modifier.fillMaxWidth(), enabled = !state.loading) { Icon(Icons.Default.VideoLibrary, null); Spacer(Modifier.width(8.dp)); Text("اختيار فيديو من الجهاز") } }
            item { OutlinedButton(onClick = { showUrl = !showUrl }, modifier = Modifier.fillMaxWidth()) { Icon(Icons.Default.Link, null); Spacer(Modifier.width(8.dp)); Text("إدخال رابط فيديو قانوني") } }
            if (showUrl) item { Column(verticalArrangement = Arrangement.spacedBy(8.dp)) { OutlinedTextField(url, { url = it }, Modifier.fillMaxWidth(), label = { Text("رابط الفيديو") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri)); Button(onClick = { vm.createFromUrl(url, dialect, subtitles) }, enabled = url.startsWith("http") && !state.loading, modifier = Modifier.fillMaxWidth()) { Text("استيراد الرابط") } } }
            item { DialectMenu(dialect) { dialect = it } }
            item { Row(verticalAlignment = Alignment.CenterVertically) { Checkbox(subtitles, { subtitles = it }); Text("إضافة ترجمة مكتوبة للفيديو النهائي") } }
            state.error?.let { error -> item { Text(error, color = MaterialTheme.colorScheme.error) } }
            state.message?.let { item { Text(it, color = MaterialTheme.colorScheme.primary) } }
            if (state.loading) item { LinearProgressIndicator(Modifier.fillMaxWidth()) }
            state.project?.let { project ->
                item { ProjectActions(project, vm, subtitles) }
                items(project.segments, key = { it.id }) { segment -> SegmentEditor(segment) { vm.update(it) } }
            }
        }
    }
}

@Composable private fun DialectMenu(selected: String, onSelect: (String) -> Unit) { var expanded by remember { mutableStateOf(false) }; val dialects = listOf("صنعاني", "عدني", "تعزي", "حضرمية", "تهامي", "عربية فصحى"); Box { OutlinedButton(onClick = { expanded = true }, modifier = Modifier.fillMaxWidth()) { Text("اللهجة: $selected") }; DropdownMenu(expanded, { expanded = false }) { dialects.forEach { DropdownMenuItem({ Text(it) }, { onSelect(it); expanded = false }) } } } }

@Composable private fun ProjectActions(project: ai.yemendub.app.data.Project, vm: MainViewModel, subtitles: Boolean) { Column(verticalArrangement = Arrangement.spacedBy(8.dp)) { Text("حالة المشروع: ${project.status} (${project.progress}%)", style = MaterialTheme.typography.titleMedium); if (project.status == "UPLOADED") Button({ vm.start() }, Modifier.fillMaxWidth()) { Text("بدء التحليل والدبلجة") }; if (project.segments.isNotEmpty()) Button({ vm.export(subtitles) }, Modifier.fillMaxWidth()) { Icon(Icons.Default.Download, null); Spacer(Modifier.width(8.dp)); Text("تصدير الفيديو النهائي") } } }

@Composable private fun SegmentEditor(segment: ai.yemendub.app.data.Segment, onSave: (ai.yemendub.app.data.Segment) -> Unit) { var text by remember(segment.text) { mutableStateOf(segment.text) }; Card(Modifier.fillMaxWidth()) { Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) { Text("${segment.speaker ?: "المتحدث"} • ${segment.startMs / 1000.0}s - ${segment.endMs / 1000.0}s", style = MaterialTheme.typography.labelMedium); OutlinedTextField(text, { text = it }, Modifier.fillMaxWidth(), label = { Text("النص المدبلج") }); TextButton(onClick = { onSave(segment.copy(text = text)) }) { Text("حفظ وإعادة توليد الصوت") } } } }

@Composable fun YemenDubTheme(content: @Composable () -> Unit) { MaterialTheme(colorScheme = lightColorScheme(primary = androidx.compose.ui.graphics.Color(0xFF00695C), secondary = androidx.compose.ui.graphics.Color(0xFFD9902F)), content = content) }
