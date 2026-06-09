# Solution Design

## System Architecture
- Single-process architecture
- UI Layer: WPF
- Shortcut Handler: Global hotkey registration and event handling
- Media Controller: Direct communication with media playback framework
- File System Handler: File access and management

## Software Architecture
- Layered architecture
- Presentation Layer: UI components
- Business Logic Layer: Shortcut configuration, playlist management, media control logic
- System Integration Layer: OS API integration, media framework communication
- Data Persistence Layer: Configuration and template storage

## Technologies
- **Platform:** Windows 10+
- **Language:** C# / .NET Framework
- **UI Framework:** WPF
- **Media Framework:** Windows Media Player API
- **Global Hotkeys:** Windows API (RegisterHotKey)
- **Storage:** JSON configuration files

## Conventions
- C# naming conventions (PascalCase for classes, camelCase for properties)
- Error handling with try-catch patterns
- XML documentation for public methods and classes
- Standardized Editor-Config File

## Persistence
- Shortcut templates saved as JSON configuration files
- Application settings stored in JSON
- Data saved to Windows user's AppData directory

## Security
- Application runs with user privileges (no admin required)
- Keyboard input only registered when shortcuts match configured keys
- File access restricted to user-selected files
- No network communication required

## Development Tools
- **IDE:** Visual Studio 2026
- **Version Control:** Git and GitHub
- **Build Tool:** Visual Studio Build Tools
- **Testing Framework:** xUnit
