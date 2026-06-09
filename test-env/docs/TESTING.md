# Testing-Dokumentation

## Übersicht

Dieses Dokument beschreibt die Test-Strategie und -Ausführung für das Projekt gemäß SolutionDesign.md.

## Test-Architektur

```
┌──────────────────────────────────────────┐
│          Test-Strategie                  │
├──────────────────────────────────────────┤
│  Unit Tests (xUnit)                      │
│  - Business Logic (Shortcut Config)      │
│  - Media Controller Logic                │
│  - File System Operations                │
│  - Playlist Management                   │
├──────────────────────────────────────────┤
│  Integration Tests (xUnit)               │
│  - Windows Hotkey Registration           │
│  - Media Framework Communication         │
│  - File System Handler                   │
├──────────────────────────────────────────┤
│  System Tests                            │
│  - UI Interaction (optional)             │
│  - Full Application Flow                 │
└──────────────────────────────────────────┘
```

## Test-Framework

**Framework:** xUnit (gemäß SolutionDesign.md)

### Installation

```bash
dotnet add package xunit
dotnet add package xunit.runner.visualstudio
dotnet add package xunit.runner.console
dotnet add package Moq  # Für Mocking
```

## Unit Tests - Struktur

### Namenskonvention

```
<ProjectName>.Tests/
├── UnitTests/
│   ├── Business/
│   │   ├── ShortcutConfigurationTests.cs
│   │   ├── PlaylistManagementTests.cs
│   │   └── MediaControllerTests.cs
│   ├── SystemIntegration/
│   │   ├── HotKeyHandlerTests.cs
│   │   └── MediaFrameworkTests.cs
│   └── DataPersistence/
│       ├── ConfigurationStorageTests.cs
│       └── FileAccessTests.cs
└── Fixtures/
    ├── TestConfigurationFixture.cs
    └── TestDataFixture.cs
```

## Test-Beispiele

### 1. Business Logic Test

```csharp
using Xunit;
using Moq;
using MyApplication.Business;
using MyApplication.Models;

namespace MyApplication.Tests.UnitTests.Business
{
    public class ShortcutConfigurationTests
    {
        private readonly ShortcutConfigurationHandler _handler;
        
        public ShortcutConfigurationTests()
        {
            _handler = new ShortcutConfigurationHandler();
        }
        
        [Fact]
        public void CreateShortcut_WithValidData_ReturnsConfigured()
        {
            // Arrange
            var config = new ShortcutConfiguration
            {
                Name = "Play/Pause",
                Keys = KeyModifier.Control | KeyModifier.Alt,
                Action = MediaAction.PlayPause
            };
            
            // Act
            var result = _handler.ConfigureShortcut(config);
            
            // Assert
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Configuration);
            Assert.Equal("Play/Pause", result.Configuration.Name);
        }
        
        [Theory]
        [InlineData(null)]
        [InlineData("")]
        public void CreateShortcut_WithInvalidName_ThrowsException(string name)
        {
            // Arrange
            var config = new ShortcutConfiguration { Name = name };
            
            // Act & Assert
            Assert.Throws<ArgumentException>(() => _handler.ConfigureShortcut(config));
        }
        
        [Fact]
        public void LoadConfiguration_FromJsonFile_ParsesCorrectly()
        {
            // Arrange
            var testConfigPath = "test-config.json";
            var handler = new ShortcutConfigurationHandler();
            
            // Act
            var config = handler.LoadConfigurationFromFile(testConfigPath);
            
            // Assert
            Assert.NotNull(config);
            Assert.IsType<ShortcutConfiguration>(config);
        }
    }
}
```

### 2. Media Controller Test

```csharp
public class MediaControllerTests
{
    private readonly Mock<IMediaFramework> _mediaFrameworkMock;
    private readonly MediaController _controller;
    
    public MediaControllerTests()
    {
        _mediaFrameworkMock = new Mock<IMediaFramework>();
        _controller = new MediaController(_mediaFrameworkMock.Object);
    }
    
    [Fact]
    public void PlayMedia_WithValidPath_StartsPlayback()
    {
        // Arrange
        var filePath = @"C:\Music\song.mp3";
        _mediaFrameworkMock.Setup(m => m.Load(filePath)).Returns(true);
        
        // Act
        var result = _controller.Play(filePath);
        
        // Assert
        Assert.True(result);
        _mediaFrameworkMock.Verify(m => m.Load(filePath), Times.Once);
    }
    
    [Fact]
    public void PauseMedia_WhenPlaying_PausesPlayback()
    {
        // Arrange
        _mediaFrameworkMock.Setup(m => m.IsPlaying()).Returns(true);
        
        // Act
        _controller.Pause();
        
        // Assert
        _mediaFrameworkMock.Verify(m => m.Pause(), Times.Once);
    }
}
```

### 3. File System Handler Test

```csharp
public class FileSystemHandlerTests
{
    private readonly FileSystemHandler _handler;
    private readonly string _testDirectory;
    
    public FileSystemHandlerTests()
    {
        _handler = new FileSystemHandler();
        _testDirectory = Path.Combine(Path.GetTempPath(), "FileSystemTest");
    }
    
    [Fact]
    public void ReadPlaylist_WithValidFile_ReturnsPlaylistItems()
    {
        // Arrange
        var playlistPath = Path.Combine(_testDirectory, "playlist.json");
        var expectedCount = 5;
        
        // Act
        var items = _handler.ReadPlaylist(playlistPath);
        
        // Assert
        Assert.NotNull(items);
        Assert.Equal(expectedCount, items.Count);
    }
    
    [Fact]
    public void SavePlaylist_WithValidData_CreatesFile()
    {
        // Arrange
        var playlist = new List<MediaItem>
        {
            new MediaItem { Path = @"C:\song1.mp3" },
            new MediaItem { Path = @"C:\song2.mp3" }
        };
        
        // Act
        var savePath = Path.Combine(_testDirectory, "saved-playlist.json");
        _handler.SavePlaylist(playlist, savePath);
        
        // Assert
        Assert.True(File.Exists(savePath));
    }
}
```

## Integration Tests - Windows APIs

```csharp
[Collection("Windows API Tests")]
public class HotKeyRegistrationTests
{
    private readonly GlobalHotKeyHandler _handler;
    
    public HotKeyRegistrationTests()
    {
        _handler = new GlobalHotKeyHandler();
    }
    
    [Fact]
    [Trait("Category", "Integration")]
    [Trait("Platform", "Windows")]
    public void RegisterHotKey_CtrlAltP_ReturnsSuccess()
    {
        // Arrange
        var modifiers = KeyModifier.Control | KeyModifier.Alt;
        var key = Keys.P;
        
        // Act
        var result = _handler.RegisterHotKey(modifiers, key);
        
        // Assert
        Assert.True(result);
        
        // Cleanup
        _handler.UnregisterHotKey(modifiers, key);
    }
    
    [Fact]
    [Trait("Category", "Integration")]
    [Trait("Platform", "Windows")]
    public void UnregisterHotKey_AfterRegistration_ReturnsSuccess()
    {
        // Arrange
        var modifiers = KeyModifier.Control | KeyModifier.Alt;
        var key = Keys.M;
        _handler.RegisterHotKey(modifiers, key);
        
        // Act
        var result = _handler.UnregisterHotKey(modifiers, key);
        
        // Assert
        Assert.True(result);
    }
}
```

## Fixtures für Test-Daten

```csharp
public class ShortcutConfigurationFixture : IDisposable
{
    public ShortcutConfiguration ValidConfiguration { get; }
    public string TestConfigPath { get; }
    
    public ShortcutConfigurationFixture()
    {
        ValidConfiguration = new ShortcutConfiguration
        {
            Name = "TestShortcut",
            Keys = KeyModifier.Control | KeyModifier.Alt,
            Action = MediaAction.PlayPause
        };
        
        TestConfigPath = Path.Combine(
            Path.GetTempPath(),
            "test-config-" + Guid.NewGuid() + ".json"
        );
    }
    
    public void Dispose()
    {
        if (File.Exists(TestConfigPath))
            File.Delete(TestConfigPath);
    }
}

public class ShortcutConfigurationTestsWithFixture : IClassFixture<ShortcutConfigurationFixture>
{
    private readonly ShortcutConfigurationFixture _fixture;
    
    public ShortcutConfigurationTestsWithFixture(ShortcutConfigurationFixture fixture)
    {
        _fixture = fixture;
    }
    
    [Fact]
    public void SaveAndLoad_Configuration_PreservesData()
    {
        // Arrange
        var handler = new ShortcutConfigurationHandler();
        
        // Act
        handler.SaveConfiguration(_fixture.TestConfigPath, _fixture.ValidConfiguration);
        var loaded = handler.LoadConfigurationFromFile(_fixture.TestConfigPath);
        
        // Assert
        Assert.Equal(_fixture.ValidConfiguration.Name, loaded.Name);
    }
}
```

## Test-Ausführung

### Lokal

```bash
# Alle Tests ausführen
dotnet test

# Mit Code Coverage
dotnet test /p:CollectCoverage=true /p:CoverageFormat=cobertura

# Spezifische Test-Klasse
dotnet test --filter "ClassName=MyApplication.Tests.ShortcutConfigurationTests"

# Nach Trait filtern
dotnet test --filter "Category=Integration"
```

### Via CI/CD Pipeline

Tests werden automatisch ausgelöst bei:
- Push auf `dev` Branch
- Pull Requests gegen `dev` Branch
- Manuelle Trigger via `workflow_dispatch`

Siehe `.github/workflows/test-pipeline.yml` für Details.

## Test-Abdeckung (Code Coverage)

**Ziel:** Mindestens 80% Code Coverage für kritische Module

```xml
<!-- .editorconfig oder test-configuration -->
[*.Test.cs]
# Minimum coverage thresholds
SonarAnalyzer.Supported = true
```

## Best Practices

### 1. AAA-Pattern (Arrange-Act-Assert)

```csharp
[Fact]
public void MethodUnderTest_Scenario_ExpectedResult()
{
    // Arrange - Vorbereitung der Test-Daten
    var input = new Input();
    var expected = new Expected();
    
    // Act - Ausführen der zu testenden Funktion
    var actual = MethodUnderTest(input);
    
    // Assert - Überprüfung des Ergebnisses
    Assert.Equal(expected, actual);
}
```

### 2. Daten-getriebene Tests (Theory)

```csharp
[Theory]
[InlineData(1, 2, 3)]
[InlineData(0, 0, 0)]
[InlineData(-1, 1, 0)]
public void Add_WithVariousInputs_ReturnsCorrectSum(int a, int b, int expected)
{
    // Test-Implementierung
}
```

### 3. Mocking für Abhängigkeiten

```csharp
var mockService = new Mock<IService>();
mockService.Setup(s => s.GetData())
    .Returns(new List<Item> { /* test data */ });

var systemUnderTest = new ClassUnderTest(mockService.Object);
```

### 4. Aussagekräftige Fehlermeldungen

```csharp
Assert.True(result, $"Expected success, but got: {result.ErrorMessage}");
```

## Continuous Integration Requirements

### GitHub Actions Checks

- ✅ Build erfolgreich
- ✅ Unit Tests bestanden
- ✅ Code Coverage >80% (für kritische Module)
- ✅ No Build Warnings
- ✅ Integration Tests erfolgreich

### Merge-Anforderungen (Branch Protection)

- Mindestens 1 Review erforderlich
- Alle Checks müssen erfolgreich sein
- Code Coverage nicht unter 80%
- Branches müssen up-to-date sein

## Troubleshooting

### Test schlägt lokal fehl, aber in CI erfolgreich (oder umgekehrt)

- Prüfe .NET Version Unterschiede
- Überprüfe Umgebungsvariablen
- Stelle sicher, dass Test-Daten vorhanden sind

### Windows API Tests in GitHub Actions schlagen fehl

- Verwende selbstgehostete Runner (siehe TestEnvironmentGuide.md)
- Oder nutze Conditional Traits: `[Trait("Platform", "Windows")]`

## Referenzen

- [xUnit.net Documentation](https://xunit.net/)
- [Moq - Mocking Library](https://github.com/moq/moq)
- [Microsoft Testing Best Practices](https://docs.microsoft.com/en-us/dotnet/core/testing/)

---

**Status:** Vollständige Testinfrastruktur für Production-ready Anwendung
