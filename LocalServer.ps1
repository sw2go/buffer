param(
    [int]$Port = 8080
)

# Create HttpListener
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Server running at http://localhost:$Port"
Write-Host "Press Ctrl+C to stop."

# Handle Ctrl+C
$stopRequested = $false
$null = Register-EngineEvent ConsoleCancel -Action {
    Write-Host "`nStopping server..."
    $stopRequested = $true
    $listener.Stop()
}

while ($listener.IsListening -and -not $stopRequested) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Determine file path
        $localPath = $request.Url.LocalPath.TrimStart("/")
        if ([string]::IsNullOrEmpty($localPath)) { $localPath = "index3.html" }
        $filePath = Join-Path (Get-Location) $localPath

        if (Test-Path $filePath) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            # Basic MIME type handling
            switch -Regex ($filePath) {
                '\.html$' { $response.ContentType = "text/html" }
                '\.js$'   { $response.ContentType = "application/javascript" }
                '\.css$'  { $response.ContentType = "text/css" }
                '\.mp4$'  { $response.ContentType = "video/mp4" }
                '\.enc$'  { $response.ContentType = "application/octet-stream" }
                default   { $response.ContentType = "application/octet-stream" }
            }
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $error = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found")
            $response.OutputStream.Write($error, 0, $error.Length)
        }

        $response.Close()
    } catch {
        if ($stopRequested) { break }
    }
}

Write-Host "Server stopped."