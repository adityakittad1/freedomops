@echo off
setlocal enabledelayedexpansion

echo ========================================
echo       FREEDOMOPS LAUNCHER
echo ========================================
echo.

:: Status tracking for final summary
set "STATUS_OLLAMA=ERROR"
set "STATUS_QWEN3=ERROR"
set "STATUS_PODMAN=ERROR"
set "STATUS_FASTAPI=ERROR"
set "STATUS_TUNNEL=NOT DETECTED"
set "ACTIVE_TUNNEL_URL="

:: 1. Check Ollama
echo [1/5] Checking Ollama on Windows...
curl -s -m 2 http://127.0.0.1:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo Ollama is not running. Attempting to start server...
    start "" /b ollama serve >nul 2>&1
    echo Waiting for Ollama to start...
    
    set "OLLAMA_STARTED=0"
    for /L %%A in (1,1,10) do (
        if "!OLLAMA_STARTED!"=="0" (
            timeout /t 2 >nul
            curl -s -m 2 http://127.0.0.1:11434/api/tags >nul 2>&1
            if !errorlevel! equ 0 set "OLLAMA_STARTED=1"
        )
    )
    
    if "!OLLAMA_STARTED!"=="0" (
        echo ERROR: Failed to start Ollama. Please start it manually.
        goto :print_summary
    )
)

:: Verify qwen3 is available
curl -s http://127.0.0.1:11434/api/tags | findstr "qwen3" >nul
if %errorlevel% neq 0 (
    echo ERROR: Model 'qwen3' is not available in Ollama.
    echo Please run: ollama pull qwen3
    goto :print_summary
)
echo Ollama is running and qwen3 is available.

:: 2. Check freedomops-api Container
echo [2/5] Checking Podman container...
set "CONTAINER_STATE=missing"
for /f "usebackq tokens=*" %%i in (`wsl -d FedoraLinux-44 -e bash -c "podman inspect -f '{{.State.Status}}' freedomops-api 2>/dev/null || echo missing"`) do set "CONTAINER_STATE=%%i"

if "%CONTAINER_STATE%"=="missing" (
    echo ERROR: Container 'freedomops-api' does not exist!
    echo Please create/build it first.
    goto :print_summary
)

if "%CONTAINER_STATE%"=="running" (
    echo Container freedomops-api is already running.
) else (
    echo Container freedomops-api is %CONTAINER_STATE%. Checking port 8080...
    
    :: Check if port 8080 is occupied
    set "PORT_OCCUPIED=0"
    netstat -ano | findstr ":8080 " | findstr "LISTENING" >nul
    if !errorlevel! equ 0 set "PORT_OCCUPIED=1"
    
    :: Check if the app is already responding properly on port 8080
    set "CURL_HEALTHY=0"
    curl -s -m 2 http://127.0.0.1:8080/ | findstr "FreedomOps API is healthy" >nul
    if !errorlevel! equ 0 set "CURL_HEALTHY=1"

    if "!CURL_HEALTHY!"=="1" (
        echo Application is already reachable on port 8080.
    ) else (
        if "!PORT_OCCUPIED!"=="1" (
            echo ERROR: Port 8080 is occupied by another process.
            echo FreedomOps API cannot safely start.
            echo No process was killed.
            exit /b 1
        ) else (
            echo Starting freedomops-api...
            wsl -d FedoraLinux-44 -e bash -c "podman start freedomops-api >/dev/null"
        )
    )
)

:: 3. Verify Container Health
echo [3/5] Verifying application container health...
set "APP_HEALTH=0"
echo Waiting for application to become healthy...
for /L %%A in (1,1,15) do (
    if "!APP_HEALTH!"=="0" (
        curl -s -m 2 http://127.0.0.1:8080/ | findstr "FreedomOps API is healthy" >nul
        if !errorlevel! equ 0 (
            set "APP_HEALTH=1"
        ) else (
            timeout /t 1 >nul
        )
    )
)

if "!APP_HEALTH!"=="0" (
    echo ERROR: Container is running but not returning healthy response on port 8080.
) else (
    echo Container is healthy.
    set "STATUS_PODMAN=RUNNING :8080"
)

:: 4. Check FastAPI
echo [4/5] Checking FastAPI backend...
set "API_HEALTH=0"
for /f "usebackq tokens=*" %%i in (`wsl -d FedoraLinux-44 -e bash -c "curl -s http://127.0.0.1:8000/api/health | grep -c 'FreedomOps backend is running'"`) do set "API_HEALTH=%%i"

if "%API_HEALTH%"=="0" (
    echo FastAPI is not running or not healthy. Starting FastAPI...
    :: We use start to open a new terminal window for the backend
    start "FreedomOps FastAPI" wsl -d FedoraLinux-44 -e bash -c "cd ~/freedomops && ./start-freedomops.sh; echo 'Backend process ended.'; read -p 'Press Enter to close...'"
    echo Waiting for FastAPI to start...
    for /L %%A in (1,1,15) do (
        if "!API_HEALTH!"=="0" (
            timeout /t 1 >nul
            for /f "usebackq tokens=*" %%i in (`wsl -d FedoraLinux-44 -e bash -c "curl -s http://127.0.0.1:8000/api/health | grep -c 'FreedomOps backend is running'"`) do (
                if "%%i"=="1" set "API_HEALTH=1"
            )
        )
    )
) else (
    echo FastAPI is already running and healthy.
)

if "%API_HEALTH%"=="1" set "STATUS_FASTAPI=RUNNING :8000"

:: 5. Check Ollama from WSL
echo [5/5] Verifying WSL to Windows Ollama connectivity...
set "OLLAMA_WSL=0"
for /f "usebackq tokens=*" %%i in (`wsl -d FedoraLinux-44 -e bash -c "curl -s http://$(ip route | awk '/default/ {print $3}'):11434/api/tags | grep -c qwen3"`) do set "OLLAMA_WSL=%%i"
if "%OLLAMA_WSL%"=="0" (
    echo WARNING: Cannot verify qwen3 from WSL via default route.
) else (
    echo WSL can reach Ollama and qwen3.
    set "STATUS_OLLAMA=RUNNING"
    set "STATUS_QWEN3=AVAILABLE"
)

:: 6. Auto-detect Cloudflare tunnel and update Vercel config
echo [6/6] Detecting active Cloudflare tunnel and syncing Vercel config...
set "TUNNEL_DETECTED=0"
for /f "usebackq tokens=*" %%i in (`wsl -d FedoraLinux-44 -e bash -c "ss -ltnp 2>/dev/null | grep cloudflared | grep -oP '127\.0\.0\.1:\K\d+' | head -1"`) do set "METRICS_PORT=%%i"
if defined METRICS_PORT (
    for /f "usebackq tokens=*" %%i in (`wsl -d FedoraLinux-44 -e bash -c "curl -s --max-time 2 http://127.0.0.1:!METRICS_PORT!/quicktunnel 2>/dev/null | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get(\"hostname\",\"\"))' 2>/dev/null || echo """`) do set "TUNNEL_HOST=%%i"
    if defined TUNNEL_HOST (
        set "ACTIVE_TUNNEL_URL=https://!TUNNEL_HOST!"
        echo Detected tunnel: !ACTIVE_TUNNEL_URL!
        :: Verify it responds
        for /f "usebackq tokens=*" %%s in (`wsl -d FedoraLinux-44 -e bash -c "curl -s -o /dev/null -w '%{http_code}' --max-time 6 https://!TUNNEL_HOST!/api/health 2>/dev/null || echo 000"`) do set "TUNNEL_HTTP=%%s"
        if "!TUNNEL_HTTP!"=="200" (
            echo Tunnel is live ^(HTTP 200^).
            set "TUNNEL_DETECTED=1"
            set "STATUS_TUNNEL=LIVE:  !ACTIVE_TUNNEL_URL!"
            :: Run the auto-update script to push config.js if URL changed
            wsl -d FedoraLinux-44 -e bash /mnt/c/Users/adity/freedomops/scripts/update-tunnel-config.sh
            if !errorlevel! equ 0 (
                echo Vercel config.js updated and pushed.
            ) else (
                echo WARNING: update-tunnel-config.sh encountered an issue.
            )
        ) else (
            echo WARNING: Tunnel detected but returned HTTP !TUNNEL_HTTP! - may still be starting.
            set "STATUS_TUNNEL=DETECTED BUT HTTP !TUNNEL_HTTP!"
        )
    ) else (
        echo WARNING: cloudflared is running but could not extract tunnel hostname.
    )
) else (
    echo WARNING: No cloudflared process found.
    echo Start the tunnel with: cloudflared tunnel --url http://127.0.0.1:8000
)

:print_summary
echo.
echo ========================================
echo          FREEDOMOPS IS READY
echo ========================================
echo.
echo Ollama:       %STATUS_OLLAMA%
echo Qwen3:        %STATUS_QWEN3%
echo Podman API:   %STATUS_PODMAN%
echo FastAPI:      %STATUS_FASTAPI%
echo Tunnel:       %STATUS_TUNNEL%
echo.
echo Local Backend:
echo   http://127.0.0.1:8000/api/health
echo.
echo Application Container:
echo   http://127.0.0.1:8080
echo.
echo Deployed Frontend:
echo   https://freedomops.vercel.app/app/assistant
echo.
echo No duplicate processes.
echo No duplicate containers.
echo No unnecessary restarts.
echo.
echo Press any key to close this launcher...
pause >nul
