# 🔒 Diagramas de Segurança - Mestres Café Enterprise

## Visão Geral

Esta seção contém todos os diagramas relacionados à arquitetura de segurança do sistema Mestres Café Enterprise, incluindo fluxos de autenticação, autorização, proteção de dados e compliance.

## 1. Arquitetura de Segurança Geral

### Camadas de Segurança

```mermaid
graph TB
    subgraph "Perimeter Security"
        WAF[Web Application Firewall]
        DDoS[DDoS Protection]
        CDN[CDN with Security]
        LB[Load Balancer]
    end

    subgraph "Network Security"
        VPC[Virtual Private Cloud]
        Subnets[Private/Public Subnets]
        Security_Groups[Security Groups]
        NACLs[Network ACLs]
    end

    subgraph "Application Security"
        HTTPS[HTTPS/TLS 1.3]
        CORS[CORS Configuration]
        CSP[Content Security Policy]
        JWT[JWT Authentication]
        RBAC[Role-Based Access Control]
    end

    subgraph "Data Security"
        Encryption_Transit[Encryption in Transit]
        Encryption_Rest[Encryption at Rest]
        Key_Management[Key Management Service]
        Database_Security[Database Security]
    end

    subgraph "Monitoring & Compliance"
        SIEM[Security Information Event Management]
        Audit_Logs[Audit Logging]
        Compliance[Compliance Monitoring]
        Incident_Response[Incident Response]
    end

    Internet --> WAF
    WAF --> DDoS
    DDoS --> CDN
    CDN --> LB

    LB --> VPC
    VPC --> Subnets
    Subnets --> Security_Groups
    Security_Groups --> NACLs

    NACLs --> HTTPS
    HTTPS --> CORS
    CORS --> CSP
    CSP --> JWT
    JWT --> RBAC

    RBAC --> Encryption_Transit
    Encryption_Transit --> Encryption_Rest
    Encryption_Rest --> Key_Management
    Key_Management --> Database_Security

    Database_Security --> SIEM
    SIEM --> Audit_Logs
    Audit_Logs --> Compliance
    Compliance --> Incident_Response
```

## 2. Fluxo de Autenticação JWT

### Processo de Login

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant API_Gateway
    participant Auth_Service
    participant Database
    participant Redis

    Client->>Frontend: Inserir credenciais
    Frontend->>Frontend: Validar formato (client-side)
    Frontend->>API_Gateway: POST /auth/login
    API_Gateway->>API_Gateway: Rate limiting check
    API_Gateway->>Auth_Service: Forward request

    Auth_Service->>Database: Buscar usuário por email
    Database-->>Auth_Service: Dados do usuário
    Auth_Service->>Auth_Service: Verificar senha (bcrypt)
    Auth_Service->>Auth_Service: Verificar conta ativa
    Auth_Service->>Auth_Service: Verificar tentativas de login

    alt Credenciais válidas
        Auth_Service->>Auth_Service: Gerar JWT (access + refresh)
        Auth_Service->>Redis: Armazenar refresh token
        Auth_Service->>Database: Log successful login
        Auth_Service-->>API_Gateway: JWT tokens + user data
        API_Gateway-->>Frontend: Authenticated response
        Frontend->>Frontend: Armazenar tokens (httpOnly cookies)
        Frontend-->>Client: Login bem-sucedido
    else Credenciais inválidas
        Auth_Service->>Database: Incrementar tentativas falhidas
        Auth_Service->>Database: Log failed attempt
        Auth_Service-->>API_Gateway: Error 401
        API_Gateway-->>Frontend: Authentication failed
        Frontend-->>Client: Exibir erro
    end
```

### Processo de Autorização

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant API_Gateway
    participant Auth_Middleware
    participant Resource_Service
    participant Database

    Client->>Frontend: Fazer requisição protegida
    Frontend->>API_Gateway: GET /api/protected (Authorization: Bearer token)
    API_Gateway->>Auth_Middleware: Validar token

    Auth_Middleware->>Auth_Middleware: Verificar formato JWT
    Auth_Middleware->>Auth_Middleware: Validar assinatura
    Auth_Middleware->>Auth_Middleware: Verificar expiração

    alt Token válido
        Auth_Middleware->>Database: Buscar permissões do usuário
        Database-->>Auth_Middleware: Roles e permissões
        Auth_Middleware->>Auth_Middleware: Verificar autorização para recurso

        alt Autorizado
            Auth_Middleware->>Resource_Service: Forward request + user context
            Resource_Service->>Database: Executar operação
            Database-->>Resource_Service: Resultado
            Resource_Service-->>API_Gateway: Response
            API_Gateway-->>Frontend: Success response
            Frontend-->>Client: Dados solicitados
        else Não autorizado
            Auth_Middleware-->>API_Gateway: Error 403
            API_Gateway-->>Frontend: Forbidden
            Frontend-->>Client: Acesso negado
        end
    else Token inválido
        Auth_Middleware-->>API_Gateway: Error 401
        API_Gateway-->>Frontend: Unauthorized
        Frontend-->>Client: Redirecionamento para login
    end
```

### Refresh Token Flow

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant API_Gateway
    participant Auth_Service
    participant Redis
    participant Database

    Client->>Frontend: Fazer requisição (token expirado)
    Frontend->>API_Gateway: Request with expired token
    API_Gateway-->>Frontend: 401 Unauthorized

    Frontend->>Frontend: Detectar token expirado
    Frontend->>API_Gateway: POST /auth/refresh (refresh token)
    API_Gateway->>Auth_Service: Validate refresh token

    Auth_Service->>Redis: Verificar refresh token
    alt Refresh token válido
        Redis-->>Auth_Service: Token exists and valid
        Auth_Service->>Database: Verificar usuário ativo
        Database-->>Auth_Service: User data
        Auth_Service->>Auth_Service: Gerar novo access token
        Auth_Service->>Redis: Rotacionar refresh token
        Auth_Service-->>API_Gateway: New tokens
        API_Gateway-->>Frontend: New access token

        Frontend->>Frontend: Atualizar token armazenado
        Frontend->>API_Gateway: Retry original request
        API_Gateway->>Auth_Service: Validate new token
        Auth_Service-->>API_Gateway: Token valid
        API_Gateway-->>Frontend: Original response
        Frontend-->>Client: Dados solicitados
    else Refresh token inválido
        Redis-->>Auth_Service: Token not found/expired
        Auth_Service-->>API_Gateway: Invalid refresh token
        API_Gateway-->>Frontend: 401 Unauthorized
        Frontend->>Frontend: Limpar tokens armazenados
        Frontend-->>Client: Redirecionamento para login
    end
```

## 3. Matriz de Autorização (RBAC)

### Roles e Permissões

```mermaid
graph TB
    subgraph "System Roles"
        SuperAdmin[Super Admin]
        Admin[Admin]
        Manager[Manager]
        Employee[Employee]
        Customer[Customer]
        Guest[Guest]
    end

    subgraph "Permissions"
        UserMgmt[User Management]
        ProductMgmt[Product Management]
        OrderMgmt[Order Management]
        InventoryMgmt[Inventory Management]
        FinancialMgmt[Financial Management]
        ReportAccess[Report Access]
        SystemConfig[System Configuration]
        CustomerSupport[Customer Support]
    end

    subgraph "Resources"
        Users[Users]
        Products[Products]
        Orders[Orders]
        Inventory[Inventory]
        Payments[Payments]
        Reports[Reports]
        Settings[Settings]
        Support[Support Tickets]
    end

    SuperAdmin --> UserMgmt
    SuperAdmin --> ProductMgmt
    SuperAdmin --> OrderMgmt
    SuperAdmin --> InventoryMgmt
    SuperAdmin --> FinancialMgmt
    SuperAdmin --> ReportAccess
    SuperAdmin --> SystemConfig
    SuperAdmin --> CustomerSupport

    Admin --> ProductMgmt
    Admin --> OrderMgmt
    Admin --> InventoryMgmt
    Admin --> ReportAccess
    Admin --> CustomerSupport

    Manager --> OrderMgmt
    Manager --> ReportAccess
    Manager --> CustomerSupport

    Employee --> CustomerSupport

    UserMgmt --> Users
    ProductMgmt --> Products
    OrderMgmt --> Orders
    InventoryMgmt --> Inventory
    FinancialMgmt --> Payments
    ReportAccess --> Reports
    SystemConfig --> Settings
    CustomerSupport --> Support
```

### Controle de Acesso por Recurso

```mermaid
graph LR
    subgraph "Customer Actions"
        ViewProducts[View Products]
        ManageCart[Manage Cart]
        PlaceOrders[Place Orders]
        ViewOrders[View Own Orders]
        ManageProfile[Manage Profile]
    end

    subgraph "Employee Actions"
        CustomerActions[All Customer Actions]
        ViewAllOrders[View All Orders]
        UpdateOrderStatus[Update Order Status]
        AccessSupport[Access Support System]
    end

    subgraph "Manager Actions"
        EmployeeActions[All Employee Actions]
        ManageProducts[Manage Products]
        ViewReports[View Reports]
        ManageInventory[Manage Inventory]
    end

    subgraph "Admin Actions"
        ManagerActions[All Manager Actions]
        ManageUsers[Manage Users]
        SystemSettings[System Settings]
        FinancialReports[Financial Reports]
    end

    subgraph "Super Admin Actions"
        AdminActions[All Admin Actions]
        DatabaseAccess[Database Access]
        SystemMaintenance[System Maintenance]
        SecuritySettings[Security Settings]
    end

    Customer --> ViewProducts
    Customer --> ManageCart
    Customer --> PlaceOrders
    Customer --> ViewOrders
    Customer --> ManageProfile

    Employee --> CustomerActions
    Employee --> ViewAllOrders
    Employee --> UpdateOrderStatus
    Employee --> AccessSupport

    Manager --> EmployeeActions
    Manager --> ManageProducts
    Manager --> ViewReports
    Manager --> ManageInventory

    Admin --> ManagerActions
    Admin --> ManageUsers
    Admin --> SystemSettings
    Admin --> FinancialReports

    SuperAdmin --> AdminActions
    SuperAdmin --> DatabaseAccess
    SuperAdmin --> SystemMaintenance
    SuperAdmin --> SecuritySettings
```

## 4. Proteção de Dados

### Criptografia de Dados

```mermaid
graph TB
    subgraph "Data at Rest"
        Database_Encryption[Database Encryption AES-256]
        File_Encryption[File Storage Encryption]
        Backup_Encryption[Backup Encryption]
        Log_Encryption[Log File Encryption]
    end

    subgraph "Data in Transit"
        TLS_13[TLS 1.3 HTTPS]
        API_Encryption[API Communication Encryption]
        Database_SSL[Database SSL/TLS]
        Internal_TLS[Internal Service TLS]
    end

    subgraph "Key Management"
        HSM[Hardware Security Module]
        Key_Rotation[Automatic Key Rotation]
        Key_Escrow[Key Escrow]
        Access_Control[Key Access Control]
    end

    subgraph "Sensitive Data"
        PII_Encryption[PII Encryption]
        Password_Hashing[Password Hashing (bcrypt)]
        Payment_Tokenization[Payment Data Tokenization]
        Session_Encryption[Session Data Encryption]
    end

    HSM --> Database_Encryption
    HSM --> File_Encryption
    HSM --> Backup_Encryption
    HSM --> Log_Encryption

    TLS_13 --> API_Encryption
    TLS_13 --> Database_SSL
    TLS_13 --> Internal_TLS

    Key_Rotation --> HSM
    Key_Escrow --> HSM
    Access_Control --> HSM

    PII_Encryption --> Database_Encryption
    Password_Hashing --> Database_Encryption
    Payment_Tokenization --> File_Encryption
    Session_Encryption --> TLS_13
```

### Data Loss Prevention (DLP)

```mermaid
graph TB
    subgraph "Data Classification"
        Public_Data[Public Data]
        Internal_Data[Internal Data]
        Confidential_Data[Confidential Data]
        Restricted_Data[Restricted Data]
    end

    subgraph "Protection Mechanisms"
        Access_Controls[Access Controls]
        Data_Masking[Data Masking]
        Watermarking[Digital Watermarking]
        Monitoring[Data Access Monitoring]
    end

    subgraph "Detection Systems"
        Content_Inspection[Content Inspection]
        Pattern_Matching[Pattern Matching]
        Behavioral_Analysis[Behavioral Analysis]
        Anomaly_Detection[Anomaly Detection]
    end

    subgraph "Response Actions"
        Block_Transfer[Block Data Transfer]
        Alert_Security[Alert Security Team]
        Quarantine[Quarantine Data]
        Audit_Trail[Create Audit Trail]
    end

    Public_Data --> Access_Controls
    Internal_Data --> Data_Masking
    Confidential_Data --> Watermarking
    Restricted_Data --> Monitoring

    Access_Controls --> Content_Inspection
    Data_Masking --> Pattern_Matching
    Watermarking --> Behavioral_Analysis
    Monitoring --> Anomaly_Detection

    Content_Inspection --> Block_Transfer
    Pattern_Matching --> Alert_Security
    Behavioral_Analysis --> Quarantine
    Anomaly_Detection --> Audit_Trail
```

## 5. Compliance e Auditoria

### LGPD Compliance Framework

```mermaid
graph TB
    subgraph "Data Subject Rights"
        Access_Right[Right to Access]
        Rectification_Right[Right to Rectification]
        Erasure_Right[Right to Erasure]
        Portability_Right[Right to Portability]
        Opposition_Right[Right to Opposition]
    end

    subgraph "Data Processing"
        Consent_Management[Consent Management]
        Purpose_Limitation[Purpose Limitation]
        Data_Minimization[Data Minimization]
        Accuracy_Maintenance[Accuracy Maintenance]
        Storage_Limitation[Storage Limitation]
    end

    subgraph "Technical Measures"
        Privacy_by_Design[Privacy by Design]
        Data_Protection_Impact[Data Protection Impact Assessment]
        Security_Measures[Technical Security Measures]
        Breach_Detection[Data Breach Detection]
    end

    subgraph "Organizational Measures"
        DPO_Appointment[Data Protection Officer]
        Staff_Training[Staff Training]
        Vendor_Management[Vendor Management]
        Documentation[Documentation & Records]
    end

    Access_Right --> Consent_Management
    Rectification_Right --> Purpose_Limitation
    Erasure_Right --> Data_Minimization
    Portability_Right --> Accuracy_Maintenance
    Opposition_Right --> Storage_Limitation

    Consent_Management --> Privacy_by_Design
    Purpose_Limitation --> Data_Protection_Impact
    Data_Minimization --> Security_Measures
    Accuracy_Maintenance --> Breach_Detection

    Privacy_by_Design --> DPO_Appointment
    Data_Protection_Impact --> Staff_Training
    Security_Measures --> Vendor_Management
    Breach_Detection --> Documentation
```

### Audit Trail Architecture

```mermaid
sequenceDiagram
    participant User
    participant Application
    participant Audit_Service
    participant Audit_DB
    participant SIEM

    User->>Application: Perform action
    Application->>Application: Execute business logic
    Application->>Audit_Service: Log audit event

    Audit_Service->>Audit_Service: Enrich event data
    Audit_Service->>Audit_Service: Validate event format
    Audit_Service->>Audit_DB: Store audit record
    Audit_Service->>SIEM: Send to SIEM

    Note over Audit_Service: Event enrichment includes:
    Note over Audit_Service: - User ID and session
    Note over Audit_Service: - IP address and geolocation
    Note over Audit_Service: - Timestamp and timezone
    Note over Audit_Service: - Action and resource details
    Note over Audit_Service: - Before/after values

    Application-->>User: Action completed

    SIEM->>SIEM: Analyze patterns
    SIEM->>SIEM: Detect anomalies

    alt Suspicious activity detected
        SIEM->>Security_Team: Send alert
    end
```

## 6. Incident Response

### Security Incident Workflow

```mermaid
graph TB
    subgraph "Detection Phase"
        Automated_Detection[Automated Detection]
        Manual_Reporting[Manual Reporting]
        Third_Party_Alert[Third Party Alert]
    end

    subgraph "Analysis Phase"
        Initial_Assessment[Initial Assessment]
        Evidence_Collection[Evidence Collection]
        Impact_Analysis[Impact Analysis]
        Root_Cause_Analysis[Root Cause Analysis]
    end

    subgraph "Containment Phase"
        Immediate_Containment[Immediate Containment]
        System_Isolation[System Isolation]
        Evidence_Preservation[Evidence Preservation]
        Short_Term_Containment[Short-term Containment]
    end

    subgraph "Eradication Phase"
        Remove_Threat[Remove Threat]
        Patch_Vulnerabilities[Patch Vulnerabilities]
        Update_Security[Update Security Controls]
        Harden_Systems[Harden Systems]
    end

    subgraph "Recovery Phase"
        Restore_Services[Restore Services]
        Monitor_Systems[Monitor Systems]
        Validate_Security[Validate Security]
        Resume_Operations[Resume Normal Operations]
    end

    subgraph "Lessons Learned"
        Post_Incident_Review[Post-Incident Review]
        Update_Procedures[Update Procedures]
        Training_Updates[Training Updates]
        Security_Improvements[Security Improvements]
    end

    Automated_Detection --> Initial_Assessment
    Manual_Reporting --> Initial_Assessment
    Third_Party_Alert --> Initial_Assessment

    Initial_Assessment --> Evidence_Collection
    Evidence_Collection --> Impact_Analysis
    Impact_Analysis --> Root_Cause_Analysis

    Root_Cause_Analysis --> Immediate_Containment
    Immediate_Containment --> System_Isolation
    System_Isolation --> Evidence_Preservation
    Evidence_Preservation --> Short_Term_Containment

    Short_Term_Containment --> Remove_Threat
    Remove_Threat --> Patch_Vulnerabilities
    Patch_Vulnerabilities --> Update_Security
    Update_Security --> Harden_Systems

    Harden_Systems --> Restore_Services
    Restore_Services --> Monitor_Systems
    Monitor_Systems --> Validate_Security
    Validate_Security --> Resume_Operations

    Resume_Operations --> Post_Incident_Review
    Post_Incident_Review --> Update_Procedures
    Update_Procedures --> Training_Updates
    Training_Updates --> Security_Improvements
```

### Breach Notification Process

```mermaid
graph TB
    subgraph "Breach Detection"
        Incident_Detected[Security Incident Detected]
        Initial_Assessment[Initial Assessment]
        Breach_Confirmation[Confirm Data Breach]
    end

    subgraph "Internal Notification"
        Notify_CISO[Notify CISO]
        Notify_DPO[Notify Data Protection Officer]
        Notify_Legal[Notify Legal Team]
        Notify_Management[Notify Senior Management]
    end

    subgraph "Risk Assessment"
        Assess_Risk[Assess Risk to Individuals]
        Determine_Scope[Determine Scope of Breach]
        Evaluate_Impact[Evaluate Potential Impact]
        Timeline_Analysis[Analyze Timeline]
    end

    subgraph "Regulatory Notification"
        ANPD_Notification[Notify ANPD within 72h]
        Authority_Report[Submit Detailed Report]
        Follow_Up[Follow-up Communications]
    end

    subgraph "Individual Notification"
        Identify_Affected[Identify Affected Individuals]
        Prepare_Notice[Prepare Breach Notice]
        Send_Notifications[Send Individual Notifications]
        Support_Center[Set up Support Center]
    end

    subgraph "Documentation"
        Incident_Log[Maintain Incident Log]
        Evidence_Collection[Collect Evidence]
        Response_Documentation[Document Response Actions]
        Compliance_Records[Maintain Compliance Records]
    end

    Incident_Detected --> Initial_Assessment
    Initial_Assessment --> Breach_Confirmation

    Breach_Confirmation --> Notify_CISO
    Notify_CISO --> Notify_DPO
    Notify_DPO --> Notify_Legal
    Notify_Legal --> Notify_Management

    Notify_Management --> Assess_Risk
    Assess_Risk --> Determine_Scope
    Determine_Scope --> Evaluate_Impact
    Evaluate_Impact --> Timeline_Analysis

    Timeline_Analysis --> ANPD_Notification
    ANPD_Notification --> Authority_Report
    Authority_Report --> Follow_Up

    Follow_Up --> Identify_Affected
    Identify_Affected --> Prepare_Notice
    Prepare_Notice --> Send_Notifications
    Send_Notifications --> Support_Center

    Support_Center --> Incident_Log
    Incident_Log --> Evidence_Collection
    Evidence_Collection --> Response_Documentation
    Response_Documentation --> Compliance_Records
```

## 7. Penetration Testing Framework

### Testing Methodology

```mermaid
graph TB
    subgraph "Planning Phase"
        Scope_Definition[Define Scope]
        Rules_Engagement[Rules of Engagement]
        Testing_Timeline[Testing Timeline]
        Resource_Allocation[Resource Allocation]
    end

    subgraph "Reconnaissance"
        Passive_Recon[Passive Reconnaissance]
        Active_Recon[Active Reconnaissance]
        OSINT[Open Source Intelligence]
        Social_Engineering[Social Engineering Assessment]
    end

    subgraph "Vulnerability Assessment"
        Network_Scanning[Network Scanning]
        Web_App_Scanning[Web Application Scanning]
        Database_Testing[Database Testing]
        API_Testing[API Security Testing]
    end

    subgraph "Exploitation"
        Vulnerability_Exploitation[Exploit Vulnerabilities]
        Privilege_Escalation[Privilege Escalation]
        Lateral_Movement[Lateral Movement]
        Data_Exfiltration[Data Exfiltration Testing]
    end

    subgraph "Post-Exploitation"
        Persistence[Establish Persistence]
        Evidence_Collection[Collect Evidence]
        Impact_Assessment[Assess Impact]
        Cleanup[Clean Up Artifacts]
    end

    subgraph "Reporting"
        Executive_Summary[Executive Summary]
        Technical_Report[Technical Report]
        Remediation_Plan[Remediation Recommendations]
        Risk_Assessment[Risk Assessment]
    end

    Scope_Definition --> Passive_Recon
    Rules_Engagement --> Active_Recon
    Testing_Timeline --> OSINT
    Resource_Allocation --> Social_Engineering

    Passive_Recon --> Network_Scanning
    Active_Recon --> Web_App_Scanning
    OSINT --> Database_Testing
    Social_Engineering --> API_Testing

    Network_Scanning --> Vulnerability_Exploitation
    Web_App_Scanning --> Privilege_Escalation
    Database_Testing --> Lateral_Movement
    API_Testing --> Data_Exfiltration

    Vulnerability_Exploitation --> Persistence
    Privilege_Escalation --> Evidence_Collection
    Lateral_Movement --> Impact_Assessment
    Data_Exfiltration --> Cleanup

    Persistence --> Executive_Summary
    Evidence_Collection --> Technical_Report
    Impact_Assessment --> Remediation_Plan
    Cleanup --> Risk_Assessment
```

## Conclusão

Esta documentação de segurança fornece uma visão abrangente dos aspectos de segurança do sistema Mestres Café Enterprise, incluindo:

- **Arquitetura de segurança em camadas** com múltiplos controles
- **Fluxos de autenticação e autorização** robustos
- **Proteção de dados** em trânsito e em repouso
- **Compliance com LGPD** e frameworks de auditoria
- **Resposta a incidentes** estruturada e automatizada
- **Testes de segurança** regulares e metodológicos

Esses diagramas servem como referência para implementação, manutenção e evolução dos controles de segurança do sistema.
