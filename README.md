# InFocus CineLog V2 (Conductor Architecture)

Dies ist ein Proof-of-Concept für eine robuste React-Architektur, die UI und Logik strikt trennt.

## Architektur-Diagramm

```mermaid
graph LR
    User(User) -- Klickt Button --> UI[React UI]
    UI -- 1. Dispatch Intent --> Conductor[Movie Conductor]
    Conductor -- 2. Request Data --> Adapter[Supabase Service]
    Adapter -- 3. SQL Query --> DB[(Supabase Cloud)]
    DB -- 4. JSON Data --> Adapter
    Adapter -- 5. Mapped Objects --> Conductor
    Conductor -- 6. Update State --> UI
    style Conductor fill:#f9f,stroke:#333,stroke-width:2px
    style DB fill:#bbf,stroke:#333,stroke-width:2px