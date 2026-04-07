# DocuFlux System Architecture

Here is the system architecture for **DocuFlux**, depicting the structure, flow, and key modules of the system.

```mermaid
graph TD
    %% Define Styles
    classDef frontend fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff;
    classDef backend fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#fff;
    classDef api fill:#f1c40f,stroke:#f39c12,stroke-width:2px,color:#fff;
    classDef tools fill:#e74c3c,stroke:#c0392b,stroke-width:2px,color:#fff;
    classDef storage fill:#9b59b6,stroke:#8e44ad,stroke-width:2px,color:#fff;

    %% Client Layer
    Client["Web Browser<br/>(End User)"]

    %% Frontend Layer
    subgraph "Frontend Layer"
        Templates["Jinja Templates (HTML)"]:::frontend
        Static["Static Assets (CSS/JS)"]:::frontend
    end

    %% Application Layer
    subgraph "Backend - Flask Application"
        App["app.py<br/>(Routing, Error Handling)"]:::backend
        
        subgraph "Modular Utilities (utils/)"
            Validator["validators.py<br/>(Input Validation)"]:::backend
            FileHand["file_handler.py<br/>(Uploads & Cleanup)"]:::backend
            DBMan["db_manager.py<br/>(Auth & Queries)"]:::backend
            PDFConv["pdf_converter.py<br/>(PDF Manipulations)"]:::backend
        end
        
        AdvEngine["libreoffice_converter.py<br/>(Advanced Multi-Strategy)"]:::tools
    end

    %% External System / Processes Layer
    subgraph "External Systems / Processing"
        LibreOffice["LibreOffice CLI<br/>(Professional Conversions)"]:::tools
        PythonLibs["Python Libraries<br/>(PyPDF, pdf2docx, openpyxl, etc)"]:::api
    end

    %% Storage Layer
    subgraph "Storage Layer"
        DB[("users.db<br/>(SQLite)")]:::storage
        Uploads[/"uploads<br/>(Temporary File Storage)"/]:::storage
    end

    %% Relationships
    Client -->|HTTP GET/POST| App
    App <-->|Renders| Templates
    App <-->|Serves| Static
    App -->|Validates Data| Validator
    App -->|Handles Files| FileHand
    App -->|Authenticates/Fetches Users| DBMan
    App -->|Triggers PDF Utilities| PDFConv
    App -->|High-Accuracy Conversions| AdvEngine
    
    FileHand -->|Saves / Deletes| Uploads
    DBMan -->|Read / Write| DB
    
    PDFConv -->|Python Logic| PythonLibs
    AdvEngine -->|Spawns Subprocess| LibreOffice
    AdvEngine -->|Fallback Strategy| PythonLibs
```

### Component Breakdown

1. **Frontend Layer**: Represents the statically served files and rendering engine (Jinja templates) acting as the user interface.
2. **Backend Application (`app.py`)**: The central entry point for all HTTP requests, passing validated requests to appropriate sub-modules.
3. **Utility Modules (`utils/`)**: A clean structural approach that splits business logic into:
    * `file_handler.py`: Secures user uploads and orchestrates disk cleanup to prevent bloat.
    * `validators.py`: Checks things like email format and file typing limits.
    * `db_manager.py`: Abstraction over the database commands.
    * `pdf_converter.py`: Executes PDF splits, merges, compressions, and typical structure manipulations.
4. **Advanced Conversion Engine (`libreoffice_converter.py`)**: Dedicated standalone component ensuring highly accurate fallback tools and LibreOffice usage (especially for Word-PDF pipelines).
5. **Storage Layer**: Encompasses temporary working directories (`/uploads`) and persistent relational data (`users.db`).
