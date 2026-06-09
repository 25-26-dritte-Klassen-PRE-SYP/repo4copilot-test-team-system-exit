# Test Structure

This directory contains all test implementations for the project, organized according to test type and functionality.

## Directory Structure

```
test-environment/tests/
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
├── IntegrationTests/
│   ├── Windows/
│   │   ├── GlobalHotKeyRegistrationTests.cs
│   │   └── MediaFrameworkIntegrationTests.cs
│   └── FileSystem/
│       └── FileSystemHandlerTests.cs
├── Fixtures/
│   ├── TestConfigurationFixture.cs
│   └── TestDataFixture.cs
└── README.md (this file)
```

## Test Categories

### Unit Tests (`UnitTests/`)
- **Business/** - Tests for business logic (shortcuts, playlist management, media control)
- **SystemIntegration/** - Tests for integration layers without external dependencies
- **DataPersistence/** - Tests for configuration and file operations

### Integration Tests (`IntegrationTests/`)
- **Windows/** - Windows API integration tests (hotkeys, media framework)
- **FileSystem/** - File system operation tests

### Fixtures (`Fixtures/`)
- Reusable test data and setup/teardown logic
- Shared test configurations

## Running Tests

```bash
# Run all tests
dotnet test

# Run specific test category
dotnet test --filter "Category=Unit"
dotnet test --filter "Category=Integration"

# Run with code coverage
dotnet test /p:CollectCoverage=true /p:CoverageFormat=cobertura

# Run specific test file
dotnet test --filter "ClassName=MyApplication.Tests.UnitTests.Business.ShortcutConfigurationTests"
```

## Test Traits

Tests are organized using xUnit traits for filtering:

```csharp
[Trait("Category", "Unit")]      // For unit tests
[Trait("Category", "Integration")] // For integration tests
[Trait("Platform", "Windows")]    // For Windows-specific tests
[Trait("Speed", "Fast")]          // For fast-running tests
[Trait("Speed", "Slow")]          // For slow-running tests
```

## Best Practices

1. **AAA Pattern (Arrange-Act-Assert)**
   ```csharp
   // Arrange - Setup test data
   var input = new Input();
   
   // Act - Execute the method under test
   var result = MethodUnderTest(input);
   
   // Assert - Verify the result
   Assert.Equal(expected, result);
   ```

2. **Meaningful Test Names**
   ```csharp
   public void LoadConfiguration_WithValidFile_ReturnsConfiguration()
   ```

3. **Use Fixtures for Reusable Setup**
   ```csharp
   public class MyTests : IClassFixture<TestConfigurationFixture>
   {
       private readonly TestConfigurationFixture _fixture;
   }
   ```

4. **Mock External Dependencies**
   ```csharp
   var mockService = new Mock<IService>();
   mockService.Setup(s => s.GetData()).Returns(testData);
   ```

## See Also

- [CI/CD Setup Guide](../docs/CI_CD_SETUP_GUIDE.md)
- [Testing Documentation](../docs/TESTING.md)
- [xUnit Documentation](https://xunit.net/)
