# Testumgebung CI/CD Pipeline - Anleitung

## Übersicht
Diese Anleitung beschreibt die Einrichtung einer remote Windows-Testumgebung mit automatisierter CI/CD-Pipeline für die Testausführung bei jedem Commit auf dem `dev` Branch.

## 1. Testumgebung-Architektur

### Komponenten

```
┌─────────────────────────────────────────────┐
│         GitHub Repository (dev Branch)      │
│              ↓ (Webhook Trigger)            │
├─────────────────────────────────────────────┤
│     GitHub Actions CI/CD Pipeline           │
│  - Build (.NET Project)                     │
│  - Unit Tests (xUnit)                       │
│  - Integration Tests                        │
│  - Code Quality Analysis                    │
├─────────────────────────────────────────────┤
│    Windows Self-Hosted Runner               │
│  (Windows 10+ mit .NET & Visual Studio)     │
│  - Führt CI/CD-Jobs aus                     |
|  - Zugriff auf Windows-APIs                 |
|  - Media-Player-Framework                   │
│                                             |
└─────────────────────────────────────────────┘
```

## 2. Voraussetzungen

### Systemanforderungen (für Test-Runner)

- **OS:** Windows 10 oder Windows Server 2019+
- **RAM:** Mindestens 8GB
- **CPU:** Multi-Core Prozessor
- **.NET Framework:** .NET 6.0+ oder .NET Framework 4.8+
- **Visual Studio:** 2022+ oder nur Build Tools installieren

### Erforderliche Software

```powershell
# PowerShell (Admin):

# 1. .NET SDK installieren
# Download von: https://dotnet.microsoft.com/download

# 2. Git installieren
# Download von: https://git-scm.com/

# 3. Visual Studio Build Tools (oder VS 2022 Community)
# Download von: https://visualstudio.microsoft.com/downloads/
# Erforderliche Workloads:
# - .NET Desktop Development
# - .NET Framework Development
```

## 3. GitHub Actions Runner Installation

### Schritt 1: Runner Vorbereitung

```powershell
# 1. Neues Verzeichnis für Runner erstellen
mkdir C:\actions-runner
cd C:\actions-runner

# 2. Runner-Version herunterladen (GitHub erforderlich)
# Siehe: https://github.com/actions/runner/releases
# Beispiel für x64:
Invoke-WebRequest -Uri "https://github.com/actions/runner/releases/download/v2.x.x/actions-runner-win-x64-2.x.x.zip" -OutFile "actions-runner.zip"

# 3. Entpacken
Expand-Archive -Path "actions-runner.zip" -DestinationPath .
```

### Schritt 2: Runner-Konfiguration

```powershell
# 1. Navigiere zum Repository unter GitHub Settings
# Settings → Actions → Runners → New self-hosted runner

# 2. Folge den Anweisungen für Windows
# oder führe aus:
.\config.cmd --url https://github.com/25-26-dritte-Klassen-PRE-SYP/repo4copilot-test-team-system-exit-0 --token <YOUR_TOKEN>

# 3. Runner als Dienst installieren (optional aber empfohlen)
.\svc.cmd install

# 4. Dienst starten
.\svc.cmd start
```

### Schritt 3: Verifizierung

- Prüfe unter Repository → Settings → Actions → Runners
- Runner sollte als "Idle" angezeigt werden

## 4. CI/CD Pipeline Konfiguration

### GitHub Actions Workflow erstellen

Erstelle die Datei `.github/workflows/test-pipeline.yml`:

```yaml
name: Test Pipeline - CI/CD

on:
  push:
    branches:
      - dev
  pull_request:
    branches:
      - dev

jobs:
  build-and-test:
    runs-on: windows-latest
    # oder: runs-on: [self-hosted, windows]
    # für selbstgehostete Runner
    
    steps:
      # 1. Code auschecken
      - name: Checkout Code
        uses: actions/checkout@v4
      
      # 2. .NET SDK Setup
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '6.0.x'
      
      # 3. Abhängigkeiten wiederherstellen
      - name: Restore NuGet Packages
        run: dotnet restore
      
      # 4. Projekt bauen
      - name: Build Solution
        run: dotnet build --configuration Release --no-restore
      
      # 5. Unit Tests (xUnit) ausführen
      - name: Run Unit Tests
        run: dotnet test --configuration Release --no-build --verbosity normal --logger "trx;LogFileName=test-results.trx"
      
      # 6. Test Results hochladen
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: '**/test-results.trx'
      
      # 7. Code Coverage (optional)
      - name: Generate Code Coverage
        run: dotnet test --configuration Release --no-build /p:CollectCoverage=true /p:CoverageFormat=cobertura
      
      # 8. Build-Artefakte hochladen
      - name: Upload Build Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: '**/bin/Release/**'
```

## 5. Test-Strategie

### Unit Tests (xUnit)

Erstelle Testprojekt-Struktur:

```
MyApplication.Tests/
├── UnitTests/
│   ├── ShortcutConfigurationTests.cs
│   ├── MediaControllerTests.cs
│   ├── FileSystemHandlerTests.cs
│   └── PlaylistManagementTests.cs
├── IntegrationTests/
│   ├── HotKeyRegistrationTests.cs
│   └── MediaPlaybackTests.cs
└── MyApplication.Tests.csproj
```

### Beispiel: Unit Test

```csharp
using Xunit;
using MyApplication.Business;

namespace MyApplication.Tests.UnitTests
{
    public class ShortcutConfigurationTests
    {
        [Fact]
        public void LoadConfiguration_ValidJsonFile_ReturnsConfiguration()
        {
            // Arrange
            var configPath = "test-config.json";
            var handler = new ShortcutConfigurationHandler();
            
            // Act
            var config = handler.LoadConfiguration(configPath);
            
            // Assert
            Assert.NotNull(config);
            Assert.True(config.Shortcuts.Count > 0);
        }
        
        [Theory]
        [InlineData("")]
        [InlineData(null)]
        public void SaveConfiguration_InvalidPath_ThrowsException(string path)
        {
            // Arrange
            var handler = new ShortcutConfigurationHandler();
            var config = new ShortcutConfiguration();
            
            // Act & Assert
            Assert.Throws<ArgumentException>(() => handler.SaveConfiguration(path, config));
        }
    }
}
```

## 6. Windows-spezifische Tests

Da die Anwendung Windows-APIs verwendet, müssen Tests auf Windows-Umgebung laufen:

### Hotkey-Registrierung Test

```csharp
[Fact]
[OSFact(OSType.Windows)]
public void RegisterHotKey_ValidKeys_ReturnsSuccess()
{
    // Arrange
    var hotKeyHandler = new GlobalHotKeyHandler();
    
    // Act
    var result = hotKeyHandler.RegisterHotKey(KeyModifier.Control | KeyModifier.Alt, Keys.P);
    
    // Assert
    Assert.True(result);
}
```

## 7. Testumgebung
## Cloud-basierte Windows Umgebung

- GitHub-gehostete Windows Runner (`windows-latest`)

## 8. CI/CD Pipeline-Trigger

### Automatische Ausführung

```yaml
# Trigger bei Push auf dev Branch
on:
  push:
    branches:
      - dev
  pull_request:
    branches:
      - dev
```

### Manuelle Ausführung

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Test Environment'
        required: true
        default: 'staging'
```

## 9. Monitoring und Reporting

### Test-Ergebnisse anzeigen

1. **GitHub Actions Dashboard**
   - Repository → Actions → Test Pipeline
   - Detaillierte Logs und Artefakte

2. **Workflow Artefakte**
   - Test Results (TRX-Format)
   - Code Coverage Reports
   - Build Logs

3. **Benachrichtigungen**
   - Automatische E-Mails bei Fehlern
   - Slack/Teams Integration (optional)

## 10. Fehlerbehebung

### Runner verbindet sich nicht

```powershell
# Logs prüfen
Get-Content C:\actions-runner\_diag\*.log

# Runner neu konfigurieren
.\config.cmd --url <URL> --token <TOKEN>

# Dienst neu starten
Restart-Service "GitHub Actions Runner"
```

### Tests schlagen fehl

1. **Lokale Ausführung testen:**
   ```powershell
   dotnet test --configuration Release
   ```

2. **Runner-Logs überprüfen:**
   - GitHub Actions UI → Workflow Run → Logs

3. **Abhängigkeiten verifizieren:**
   ```powershell
   dotnet --version
   dotnet nuget list source
   ```
