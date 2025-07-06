# 🐳 Diagramas de Infraestrutura - Mestres Café Enterprise

## Visão Geral

Esta seção contém todos os diagramas relacionados à infraestrutura do sistema Mestres Café Enterprise, incluindo containers, orquestração, deployment topology e arquitetura de rede.

## 1. Arquitetura de Containers

### Docker Compose Architecture

```mermaid
graph TB
    subgraph "Load Balancer Layer"
        Nginx[Nginx Load Balancer]
        SSL[SSL Termination]
    end

    subgraph "Application Layer"
        Web1[React Web App]
        Web2[React Web App Replica]
        API1[Flask API Server]
        API2[Flask API Server Replica]
        Workers[Celery Workers]
    end

    subgraph "Data Layer"
        Postgres[PostgreSQL Database]
        Redis[Redis Cache]
        Minio[MinIO File Storage]
    end

    subgraph "Monitoring Layer"
        Prometheus[Prometheus]
        Grafana[Grafana]
        Jaeger[Jaeger]
        Elasticsearch[Elasticsearch]
        Kibana[Kibana]
    end

    subgraph "Message Queue"
        RabbitMQ[RabbitMQ]
        Celery[Celery Beat]
    end

    Internet --> Nginx
    Nginx --> SSL
    SSL --> Web1
    SSL --> Web2
    SSL --> API1
    SSL --> API2

    API1 --> Postgres
    API2 --> Postgres
    API1 --> Redis
    API2 --> Redis
    API1 --> Minio
    API2 --> Minio

    Workers --> RabbitMQ
    Celery --> RabbitMQ
    Workers --> Postgres
    Workers --> Redis

    API1 --> Prometheus
    API2 --> Prometheus
    Prometheus --> Grafana
    API1 --> Jaeger
    API2 --> Jaeger
    API1 --> Elasticsearch
    API2 --> Elasticsearch
    Elasticsearch --> Kibana
```

### Container Network Architecture

```mermaid
graph TB
    subgraph "Public Network (External)"
        Internet[Internet]
        CDN[CDN/CloudFlare]
    end

    subgraph "DMZ Network"
        LoadBalancer[Load Balancer]
        WAF[Web Application Firewall]
        ReverseProxy[Reverse Proxy/Nginx]
    end

    subgraph "Application Network (Private)"
        WebContainers[Web App Containers]
        APIContainers[API Containers]
        WorkerContainers[Worker Containers]
    end

    subgraph "Data Network (Isolated)"
        DatabaseContainers[Database Containers]
        CacheContainers[Cache Containers]
        StorageContainers[Storage Containers]
    end

    subgraph "Monitoring Network"
        MetricsContainers[Metrics Containers]
        LoggingContainers[Logging Containers]
        TracingContainers[Tracing Containers]
    end

    Internet --> CDN
    CDN --> LoadBalancer
    LoadBalancer --> WAF
    WAF --> ReverseProxy

    ReverseProxy --> WebContainers
    ReverseProxy --> APIContainers

    APIContainers --> DatabaseContainers
    APIContainers --> CacheContainers
    APIContainers --> StorageContainers
    WorkerContainers --> DatabaseContainers
    WorkerContainers --> CacheContainers

    APIContainers --> MetricsContainers
    WorkerContainers --> LoggingContainers
    APIContainers --> TracingContainers
```

## 2. Kubernetes Architecture (Cloud-Native)

### Kubernetes Cluster Architecture

```mermaid
graph TB
    subgraph "Control Plane"
        APIServer[API Server]
        ETCD[ETCD Cluster]
        Scheduler[Scheduler]
        Controller[Controller Manager]
    end

    subgraph "Worker Nodes"
        subgraph "Node 1"
            Kubelet1[Kubelet]
            KubeProxy1[Kube-proxy]
            CRI1[Container Runtime]
            Pods1[Application Pods]
        end

        subgraph "Node 2"
            Kubelet2[Kubelet]
            KubeProxy2[Kube-proxy]
            CRI2[Container Runtime]
            Pods2[Application Pods]
        end

        subgraph "Node 3"
            Kubelet3[Kubelet]
            KubeProxy3[Kube-proxy]
            CRI3[Container Runtime]
            Pods3[Database Pods]
        end
    end

    subgraph "Add-ons"
        CoreDNS[CoreDNS]
        IngressController[Ingress Controller]
        ServiceMesh[Istio Service Mesh]
        Monitoring[Prometheus Stack]
    end

    APIServer --> ETCD
    APIServer --> Scheduler
    APIServer --> Controller

    Scheduler --> Kubelet1
    Scheduler --> Kubelet2
    Scheduler --> Kubelet3

    Kubelet1 --> CRI1
    Kubelet2 --> CRI2
    Kubelet3 --> CRI3

    CRI1 --> Pods1
    CRI2 --> Pods2
    CRI3 --> Pods3

    IngressController --> KubeProxy1
    IngressController --> KubeProxy2
    ServiceMesh --> Pods1
    ServiceMesh --> Pods2
    Monitoring --> Pods1
    Monitoring --> Pods2
    Monitoring --> Pods3
```

### Kubernetes Namespaces and Resources

```mermaid
graph TB
    subgraph "Production Namespace"
        ProdWeb[Web Deployment]
        ProdAPI[API Deployment]
        ProdDB[Database StatefulSet]
        ProdServices[Services]
        ProdIngress[Ingress]
        ProdSecrets[Secrets]
        ProdConfigMaps[ConfigMaps]
    end

    subgraph "Staging Namespace"
        StagingWeb[Web Deployment]
        StagingAPI[API Deployment]
        StagingDB[Database StatefulSet]
        StagingServices[Services]
        StagingIngress[Ingress]
        StagingSecrets[Secrets]
        StagingConfigMaps[ConfigMaps]
    end

    subgraph "Monitoring Namespace"
        Prometheus[Prometheus]
        Grafana[Grafana]
        AlertManager[Alert Manager]
        Jaeger[Jaeger]
    end

    subgraph "Ingress Namespace"
        NginxIngress[Nginx Ingress Controller]
        CertManager[Cert Manager]
        ExternalDNS[External DNS]
    end

    subgraph "Storage"
        PVC[Persistent Volume Claims]
        PV[Persistent Volumes]
        StorageClass[Storage Classes]
    end

    ProdWeb --> ProdServices
    ProdAPI --> ProdServices
    ProdDB --> PVC
    ProdIngress --> NginxIngress

    StagingWeb --> StagingServices
    StagingAPI --> StagingServices
    StagingDB --> PVC
    StagingIngress --> NginxIngress

    PVC --> PV
    PV --> StorageClass

    Prometheus --> AlertManager
    CertManager --> ProdIngress
    CertManager --> StagingIngress
```

## 3. CI/CD Pipeline Architecture

### GitHub Actions Workflow

```mermaid
graph TB
    subgraph "Source Control"
        GitHub[GitHub Repository]
        PullRequest[Pull Request]
        MainBranch[Main Branch]
    end

    subgraph "CI Pipeline"
        Trigger[Workflow Trigger]
        Checkout[Checkout Code]
        Tests[Run Tests]
        Build[Build Application]
        Security[Security Scan]
        QualityGate[Quality Gate]
    end

    subgraph "CD Pipeline"
        BuildImage[Build Docker Image]
        PushRegistry[Push to Registry]
        Deploy[Deploy to Environment]
        HealthCheck[Health Check]
        Rollback[Rollback if Needed]
    end

    subgraph "Environments"
        Development[Development]
        Staging[Staging]
        Production[Production]
    end

    subgraph "External Services"
        DockerHub[Docker Registry]
        SonarQube[SonarQube]
        Snyk[Snyk Security]
        Slack[Slack Notifications]
    end

    GitHub --> Trigger
    PullRequest --> Trigger
    MainBranch --> Trigger

    Trigger --> Checkout
    Checkout --> Tests
    Tests --> Build
    Build --> Security
    Security --> QualityGate

    QualityGate --> BuildImage
    BuildImage --> PushRegistry
    PushRegistry --> Deploy
    Deploy --> HealthCheck
    HealthCheck --> Rollback

    Deploy --> Development
    Deploy --> Staging
    Deploy --> Production

    Security --> SonarQube
    Security --> Snyk
    PushRegistry --> DockerHub
    Deploy --> Slack
    Rollback --> Slack
```

### Deployment Strategies

```mermaid
graph TB
    subgraph "Blue-Green Deployment"
        BlueEnvironment[Blue Environment - Current]
        GreenEnvironment[Green Environment - New]
        LoadBalancerBG[Load Balancer]
        Switch[Traffic Switch]
    end

    subgraph "Rolling Deployment"
        Instance1[Instance 1]
        Instance2[Instance 2]
        Instance3[Instance 3]
        LoadBalancerRoll[Load Balancer]
        RollingUpdate[Rolling Update]
    end

    subgraph "Canary Deployment"
        StableVersion[Stable Version - 90%]
        CanaryVersion[Canary Version - 10%]
        TrafficSplit[Traffic Split]
        MetricsMonitoring[Metrics Monitoring]
        AutoPromote[Auto Promote/Rollback]
    end

    BlueEnvironment --> LoadBalancerBG
    GreenEnvironment --> Switch
    Switch --> LoadBalancerBG

    Instance1 --> LoadBalancerRoll
    Instance2 --> LoadBalancerRoll
    Instance3 --> LoadBalancerRoll
    RollingUpdate --> Instance1
    RollingUpdate --> Instance2
    RollingUpdate --> Instance3

    StableVersion --> TrafficSplit
    CanaryVersion --> TrafficSplit
    TrafficSplit --> MetricsMonitoring
    MetricsMonitoring --> AutoPromote
```

## 4. Cloud Infrastructure (AWS)

### AWS Architecture

```mermaid
graph TB
    subgraph "Global Infrastructure"
        Route53[Route 53 DNS]
        CloudFront[CloudFront CDN]
        WAF[AWS WAF]
    end

    subgraph "VPC - Production"
        subgraph "Public Subnets"
            ALB[Application Load Balancer]
            NATGateway[NAT Gateway]
            Bastion[Bastion Host]
        end

        subgraph "Private Subnets"
            EKS[EKS Cluster]
            RDS[RDS PostgreSQL]
            ElastiCache[ElastiCache Redis]
            EFS[EFS Storage]
        end

        subgraph "Database Subnets"
            RDSPrimary[RDS Primary]
            RDSReplica[RDS Read Replica]
            RDSBackup[Automated Backups]
        end
    end

    subgraph "Security & Monitoring"
        IAM[IAM Roles & Policies]
        SecretsManager[Secrets Manager]
        CloudWatch[CloudWatch]
        CloudTrail[CloudTrail]
        SecurityHub[Security Hub]
    end

    subgraph "Storage & Backup"
        S3[S3 Buckets]
        S3Backup[S3 Backup]
        Glacier[Glacier Archive]
    end

    Route53 --> CloudFront
    CloudFront --> WAF
    WAF --> ALB

    ALB --> EKS
    EKS --> RDS
    EKS --> ElastiCache
    EKS --> EFS
    EKS --> S3

    RDS --> RDSPrimary
    RDSPrimary --> RDSReplica
    RDSPrimary --> RDSBackup

    EKS --> IAM
    RDS --> SecretsManager
    ALB --> CloudWatch
    VPC --> CloudTrail
    CloudWatch --> SecurityHub

    EFS --> S3Backup
    RDSBackup --> Glacier
```

### Auto Scaling Configuration

```mermaid
graph TB
    subgraph "Horizontal Pod Autoscaler (HPA)"
        CPUMetrics[CPU Metrics]
        MemoryMetrics[Memory Metrics]
        CustomMetrics[Custom Metrics]
        HPADecision[HPA Decision Engine]
        ScalePods[Scale Pods]
    end

    subgraph "Vertical Pod Autoscaler (VPA)"
        ResourceAnalysis[Resource Analysis]
        RecommendationEngine[Recommendation Engine]
        ResourceLimits[Update Resource Limits]
    end

    subgraph "Cluster Autoscaler (CA)"
        NodeMetrics[Node Metrics]
        PendingPods[Pending Pods]
        CADecision[CA Decision Engine]
        ScaleNodes[Scale Nodes]
    end

    subgraph "Application Metrics"
        ResponseTime[Response Time]
        QueueLength[Queue Length]
        ErrorRate[Error Rate]
        ThroughputMetrics[Throughput]
    end

    CPUMetrics --> HPADecision
    MemoryMetrics --> HPADecision
    CustomMetrics --> HPADecision
    HPADecision --> ScalePods

    ResourceAnalysis --> RecommendationEngine
    RecommendationEngine --> ResourceLimits

    NodeMetrics --> CADecision
    PendingPods --> CADecision
    CADecision --> ScaleNodes

    ResponseTime --> CustomMetrics
    QueueLength --> CustomMetrics
    ErrorRate --> CustomMetrics
    ThroughputMetrics --> CustomMetrics
```

## 5. Service Mesh Architecture (Istio)

### Istio Service Mesh

```mermaid
graph TB
    subgraph "Control Plane"
        Istiod[Istiod]
        Pilot[Pilot]
        Citadel[Citadel]
        Galley[Galley]
    end

    subgraph "Data Plane"
        subgraph "Web Service"
            WebApp[Web Application]
            WebProxy[Envoy Proxy]
        end

        subgraph "API Service"
            APIApp[API Application]
            APIProxy[Envoy Proxy]
        end

        subgraph "Database Service"
            DBApp[Database Application]
            DBProxy[Envoy Proxy]
        end
    end

    subgraph "Ingress Gateway"
        IstioGateway[Istio Gateway]
        IngressProxy[Envoy Proxy]
    end

    subgraph "Observability"
        Jaeger[Jaeger Tracing]
        Prometheus[Prometheus Metrics]
        Grafana[Grafana Dashboard]
        Kiali[Kiali Service Map]
    end

    Istiod --> Pilot
    Istiod --> Citadel
    Istiod --> Galley

    Pilot --> WebProxy
    Pilot --> APIProxy
    Pilot --> DBProxy
    Pilot --> IngressProxy

    WebApp --> WebProxy
    APIApp --> APIProxy
    DBApp --> DBProxy

    WebProxy --> APIProxy
    APIProxy --> DBProxy

    IstioGateway --> IngressProxy
    IngressProxy --> WebProxy

    WebProxy --> Jaeger
    APIProxy --> Jaeger
    DBProxy --> Jaeger

    WebProxy --> Prometheus
    APIProxy --> Prometheus
    DBProxy --> Prometheus

    Prometheus --> Grafana
    Jaeger --> Kiali
    Prometheus --> Kiali
```

### Traffic Management

```mermaid
graph TB
    subgraph "Traffic Rules"
        VirtualService[Virtual Service]
        DestinationRule[Destination Rule]
        Gateway[Gateway]
        ServiceEntry[Service Entry]
    end

    subgraph "Load Balancing"
        RoundRobin[Round Robin]
        LeastConnection[Least Connection]
        WeightedRoundRobin[Weighted Round Robin]
        ConsistentHash[Consistent Hash]
    end

    subgraph "Traffic Splitting"
        BlueGreen[Blue-Green]
        Canary[Canary Deployment]
        ABTesting[A/B Testing]
        TrafficMirroring[Traffic Mirroring]
    end

    subgraph "Fault Injection"
        DelayInjection[Delay Injection]
        AbortInjection[Abort Injection]
        CircuitBreaker[Circuit Breaker]
        Retry[Retry Policy]
    end

    VirtualService --> RoundRobin
    DestinationRule --> LeastConnection
    Gateway --> WeightedRoundRobin
    ServiceEntry --> ConsistentHash

    RoundRobin --> BlueGreen
    LeastConnection --> Canary
    WeightedRoundRobin --> ABTesting
    ConsistentHash --> TrafficMirroring

    BlueGreen --> DelayInjection
    Canary --> AbortInjection
    ABTesting --> CircuitBreaker
    TrafficMirroring --> Retry
```

## 6. Backup and Disaster Recovery

### Backup Strategy

```mermaid
graph TB
    subgraph "Data Sources"
        PostgreSQL[PostgreSQL Database]
        Redis[Redis Cache]
        FileStorage[File Storage]
        Configurations[Configuration Files]
        Secrets[Secrets & Keys]
    end

    subgraph "Backup Types"
        FullBackup[Full Backup]
        IncrementalBackup[Incremental Backup]
        DifferentialBackup[Differential Backup]
        SnapshotBackup[Snapshot Backup]
    end

    subgraph "Backup Storage"
        LocalStorage[Local Storage]
        S3Primary[S3 Primary]
        S3Secondary[S3 Secondary Region]
        GlacierArchive[Glacier Archive]
    end

    subgraph "Backup Schedule"
        Hourly[Hourly Snapshots]
        Daily[Daily Full Backup]
        Weekly[Weekly Archive]
        Monthly[Monthly Long-term]
    end

    PostgreSQL --> FullBackup
    Redis --> SnapshotBackup
    FileStorage --> IncrementalBackup
    Configurations --> DifferentialBackup
    Secrets --> FullBackup

    FullBackup --> LocalStorage
    IncrementalBackup --> S3Primary
    DifferentialBackup --> S3Secondary
    SnapshotBackup --> GlacierArchive

    Hourly --> SnapshotBackup
    Daily --> FullBackup
    Weekly --> IncrementalBackup
    Monthly --> GlacierArchive
```

### Disaster Recovery Plan

```mermaid
graph TB
    subgraph "Disaster Scenarios"
        DataCenterOutage[Data Center Outage]
        RegionFailure[Region Failure]
        CyberAttack[Cyber Attack]
        DataCorruption[Data Corruption]
        HumanError[Human Error]
    end

    subgraph "Detection Systems"
        HealthChecks[Health Checks]
        MonitoringAlerts[Monitoring Alerts]
        AutoFailover[Auto Failover Triggers]
        ManualTrigger[Manual Trigger]
    end

    subgraph "Recovery Actions"
        TrafficReroute[Traffic Rerouting]
        BackupRestore[Backup Restoration]
        ServiceRecovery[Service Recovery]
        DataSynchronization[Data Synchronization]
    end

    subgraph "Recovery Targets"
        RPO[Recovery Point Objective]
        RTO[Recovery Time Objective]
        DataIntegrity[Data Integrity]
        ServiceAvailability[Service Availability]
    end

    DataCenterOutage --> HealthChecks
    RegionFailure --> MonitoringAlerts
    CyberAttack --> AutoFailover
    DataCorruption --> ManualTrigger
    HumanError --> ManualTrigger

    HealthChecks --> TrafficReroute
    MonitoringAlerts --> BackupRestore
    AutoFailover --> ServiceRecovery
    ManualTrigger --> DataSynchronization

    TrafficReroute --> RPO
    BackupRestore --> RTO
    ServiceRecovery --> DataIntegrity
    DataSynchronization --> ServiceAvailability
```

## 7. Performance and Scaling

### Caching Architecture

```mermaid
graph TB
    subgraph "Client-Side Caching"
        BrowserCache[Browser Cache]
        ServiceWorker[Service Worker]
        LocalStorage[Local Storage]
    end

    subgraph "CDN Layer"
        CloudFlare[CloudFlare CDN]
        EdgeLocations[Edge Locations]
        CacheRules[Cache Rules]
    end

    subgraph "Application Layer"
        ApplicationCache[Application Cache]
        SessionCache[Session Cache]
        QueryCache[Query Cache]
    end

    subgraph "Database Layer"
        RedisCache[Redis Cache]
        DatabaseCache[Database Query Cache]
        ConnectionPool[Connection Pooling]
    end

    subgraph "Cache Strategies"
        CacheAside[Cache-Aside]
        WriteThrough[Write-Through]
        WriteBack[Write-Back]
        RefreshAhead[Refresh-Ahead]
    end

    BrowserCache --> CloudFlare
    ServiceWorker --> EdgeLocations
    LocalStorage --> CacheRules

    CloudFlare --> ApplicationCache
    EdgeLocations --> SessionCache
    CacheRules --> QueryCache

    ApplicationCache --> RedisCache
    SessionCache --> DatabaseCache
    QueryCache --> ConnectionPool

    RedisCache --> CacheAside
    DatabaseCache --> WriteThrough
    ConnectionPool --> WriteBack
    CacheAside --> RefreshAhead
```

### Load Balancing Strategy

```mermaid
graph TB
    subgraph "Global Load Balancing"
        GeoDNS[Geographic DNS]
        LatencyRouting[Latency-based Routing]
        HealthRouting[Health-based Routing]
    end

    subgraph "Regional Load Balancing"
        ALB[Application Load Balancer]
        TargetGroups[Target Groups]
        HealthChecks[Health Checks]
    end

    subgraph "Service Load Balancing"
        ServiceMesh[Service Mesh LB]
        RoundRobin[Round Robin]
        LeastConnections[Least Connections]
        WeightedRouting[Weighted Routing]
    end

    subgraph "Database Load Balancing"
        ReadReplicas[Read Replicas]
        WriteLeader[Write Leader]
        ConnectionRouting[Connection Routing]
    end

    GeoDNS --> ALB
    LatencyRouting --> TargetGroups
    HealthRouting --> HealthChecks

    ALB --> ServiceMesh
    TargetGroups --> RoundRobin
    HealthChecks --> LeastConnections

    ServiceMesh --> ReadReplicas
    RoundRobin --> WriteLeader
    LeastConnections --> ConnectionRouting
    WeightedRouting --> ConnectionRouting
```

## Conclusão

Esta documentação de infraestrutura fornece uma visão completa da arquitetura de infraestrutura do sistema Mestres Café Enterprise, incluindo:

- **Containerização com Docker** e orquestração com Kubernetes
- **Pipeline CI/CD** automatizado com GitHub Actions
- **Infraestrutura cloud-native** na AWS
- **Service mesh** com Istio para microserviços
- **Estratégias de backup** e disaster recovery
- **Performance e scaling** com múltiplas camadas de cache

Esses diagramas servem como referência para deployment, manutenção e evolução da infraestrutura do sistema, garantindo alta disponibilidade, escalabilidade e performance.
