import {
  ClusterInfo,
  K8sNode,
  K8sPod,
  K8sDeployment,
  K8sNamespace,
  K8sService,
  TerraformResource,
  AnsiblePlaybook,
  AnsibleHost,
  PuppetNode,
  NagiosHostCheck,
  NagiosServiceCheck,
  NagiosAlert,
  JenkinsPipeline,
  SelfHealingHistoryItem,
  InfrastructureEvent,
  AlertNotification
} from '../types';

export const initialClusters: ClusterInfo[] = [
  {
    id: 'eks-prod-us-east-1',
    name: 'prod-aws-us-east-1',
    provider: 'AWS EKS',
    region: 'us-east-1 (N. Virginia)',
    version: 'v1.29.3-eks.2',
    status: 'Active',
    controlPlanesCount: 1,
    workerNodesCount: 3,
    totalPods: 24,
    healthScore: 95
  },
  {
    id: 'eks-staging-eu-west-1',
    name: 'staging-eu-west-1',
    provider: 'AWS EKS',
    region: 'eu-west-1 (Ireland)',
    version: 'v1.29.3-eks.2',
    status: 'Active',
    controlPlanesCount: 1,
    workerNodesCount: 2,
    totalPods: 14,
    healthScore: 98
  }
];

export const initialNodes: K8sNode[] = [
  {
    id: 'node-ctrl-01',
    name: 'k8s-control-plane-01',
    role: 'control-plane',
    status: 'Ready',
    instanceType: 'm5.2xlarge',
    internalIP: '10.0.1.10',
    kubeletVersion: 'v1.29.3',
    cpuCores: 8,
    cpuUsagePercent: 34,
    memoryTotalGB: 32,
    memoryUsagePercent: 52,
    podsAllocated: 6,
    maxPods: 110,
    zone: 'us-east-1a',
    age: '42d'
  },
  {
    id: 'node-wrk-01',
    name: 'k8s-worker-node-01',
    role: 'worker',
    status: 'Ready',
    instanceType: 'm5.xlarge',
    internalIP: '10.0.2.14',
    kubeletVersion: 'v1.29.3',
    cpuCores: 4,
    cpuUsagePercent: 44,
    memoryTotalGB: 16,
    memoryUsagePercent: 68,
    podsAllocated: 9,
    maxPods: 58,
    zone: 'us-east-1a',
    age: '28d'
  },
  {
    id: 'node-wrk-02',
    name: 'k8s-worker-node-02',
    role: 'worker',
    status: 'Ready',
    instanceType: 'm5.xlarge',
    internalIP: '10.0.3.88',
    kubeletVersion: 'v1.29.3',
    cpuCores: 4,
    cpuUsagePercent: 48,
    memoryTotalGB: 16,
    memoryUsagePercent: 72,
    podsAllocated: 8,
    maxPods: 58,
    zone: 'us-east-1b',
    age: '28d'
  },
  {
    id: 'node-wrk-03',
    name: 'k8s-worker-node-03',
    role: 'worker',
    status: 'Ready',
    instanceType: 'm5.xlarge',
    internalIP: '10.0.4.102',
    kubeletVersion: 'v1.29.3',
    cpuCores: 4,
    cpuUsagePercent: 36,
    memoryTotalGB: 16,
    memoryUsagePercent: 64,
    podsAllocated: 7,
    maxPods: 58,
    zone: 'us-east-1c',
    age: '28d'
  }
];

export const initialPods: K8sPod[] = [
  // Production Payment Service (Target for simulation)
  {
    id: 'pod-pay-01',
    name: 'payment-service-7f89d4c79-k8qzp',
    namespace: 'production',
    deployment: 'payment-service',
    node: 'k8s-worker-node-01',
    status: 'Running',
    restarts: 0,
    age: '4d 12h',
    cpuUsage: '145m',
    memUsage: '412Mi',
    ip: '10.244.1.45',
    readyContainers: '1/1',
    labels: { app: 'payment-service', tier: 'backend', env: 'production' },
    isTargetOfFailure: true,
    recentLogs: [
      '[2026-11-10T21:40:02Z] [INFO] [PaymentGateway] Initialized stripe and paypal handlers',
      '[2026-11-10T21:40:15Z] [INFO] [HttpServer] Listening on :8080 (readiness: OK, liveness: OK)',
      '[2026-11-10T21:42:33Z] [INFO] Processed charge: tx_9941a8fe (status=settled, amount=249.00 USD)',
      '[2026-11-10T21:44:01Z] [INFO] Health check GET /healthz HTTP/1.1 200 OK'
    ]
  },
  {
    id: 'pod-pay-02',
    name: 'payment-service-7f89d4c79-w4mn2',
    namespace: 'production',
    deployment: 'payment-service',
    node: 'k8s-worker-node-02',
    status: 'Running',
    restarts: 0,
    age: '4d 12h',
    cpuUsage: '138m',
    memUsage: '398Mi',
    ip: '10.244.2.19',
    readyContainers: '1/1',
    labels: { app: 'payment-service', tier: 'backend', env: 'production' },
    recentLogs: [
      '[2026-11-10T21:40:00Z] [INFO] Payment replica ready',
      '[2026-11-10T21:45:10Z] [INFO] Processed charge: tx_8820c71a'
    ]
  },
  // Order API
  {
    id: 'pod-ord-01',
    name: 'order-api-6b758dd9-4txp9',
    namespace: 'production',
    deployment: 'order-api',
    node: 'k8s-worker-node-02',
    status: 'Running',
    restarts: 0,
    age: '12d',
    cpuUsage: '92m',
    memUsage: '310Mi',
    ip: '10.244.2.33',
    readyContainers: '1/1',
    labels: { app: 'order-api', tier: 'backend', env: 'production' },
    recentLogs: ['[INFO] Order fulfillment queue consumer active', '[INFO] DB Connection pool: 12/20']
  },
  {
    id: 'pod-ord-02',
    name: 'order-api-6b758dd9-8vb2l',
    namespace: 'production',
    deployment: 'order-api',
    node: 'k8s-worker-node-03',
    status: 'Running',
    restarts: 1,
    age: '12d',
    cpuUsage: '88m',
    memUsage: '295Mi',
    ip: '10.244.3.12',
    readyContainers: '1/1',
    labels: { app: 'order-api', tier: 'backend', env: 'production' }
  },
  // Auth Service
  {
    id: 'pod-auth-01',
    name: 'auth-gateway-55f69c97b8-j98lm',
    namespace: 'production',
    deployment: 'auth-gateway',
    node: 'k8s-worker-node-01',
    status: 'Running',
    restarts: 0,
    age: '18d',
    cpuUsage: '110m',
    memUsage: '190Mi',
    ip: '10.244.1.18',
    readyContainers: '1/1',
    labels: { app: 'auth-gateway', tier: 'api-gateway', env: 'production' }
  },
  {
    id: 'pod-auth-02',
    name: 'auth-gateway-55f69c97b8-q12xp',
    namespace: 'production',
    deployment: 'auth-gateway',
    node: 'k8s-worker-node-03',
    status: 'Running',
    restarts: 0,
    age: '18d',
    cpuUsage: '105m',
    memUsage: '185Mi',
    ip: '10.244.3.44',
    readyContainers: '1/1',
    labels: { app: 'auth-gateway', tier: 'api-gateway', env: 'production' }
  },
  // Frontend Web
  {
    id: 'pod-web-01',
    name: 'frontend-web-54b9d799-52jkl',
    namespace: 'production',
    deployment: 'frontend-web',
    node: 'k8s-worker-node-01',
    status: 'Running',
    restarts: 0,
    age: '2d',
    cpuUsage: '45m',
    memUsage: '128Mi',
    ip: '10.244.1.88',
    readyContainers: '1/1',
    labels: { app: 'frontend-web', tier: 'frontend', env: 'production' }
  },
  {
    id: 'pod-web-02',
    name: 'frontend-web-54b9d799-79kmx',
    namespace: 'production',
    deployment: 'frontend-web',
    node: 'k8s-worker-node-02',
    status: 'Running',
    restarts: 0,
    age: '2d',
    cpuUsage: '40m',
    memUsage: '132Mi',
    ip: '10.244.2.71',
    readyContainers: '1/1',
    labels: { app: 'frontend-web', tier: 'frontend', env: 'production' }
  },
  {
    id: 'pod-web-03',
    name: 'frontend-web-54b9d799-pl092',
    namespace: 'production',
    deployment: 'frontend-web',
    node: 'k8s-worker-node-03',
    status: 'Running',
    restarts: 0,
    age: '2d',
    cpuUsage: '48m',
    memUsage: '125Mi',
    ip: '10.244.3.15',
    readyContainers: '1/1',
    labels: { app: 'frontend-web', tier: 'frontend', env: 'production' }
  },
  // Ingress Nginx
  {
    id: 'pod-ing-01',
    name: 'ingress-nginx-controller-84d799-cc29a',
    namespace: 'ingress-nginx',
    deployment: 'ingress-nginx-controller',
    node: 'k8s-worker-node-01',
    status: 'Running',
    restarts: 0,
    age: '28d',
    cpuUsage: '210m',
    memUsage: '480Mi',
    ip: '10.244.1.11',
    readyContainers: '1/1',
    labels: { app: 'ingress-nginx', component: 'controller' }
  },
  {
    id: 'pod-ing-02',
    name: 'ingress-nginx-controller-84d799-bb88z',
    namespace: 'ingress-nginx',
    deployment: 'ingress-nginx-controller',
    node: 'k8s-worker-node-02',
    status: 'Running',
    restarts: 0,
    age: '28d',
    cpuUsage: '195m',
    memUsage: '465Mi',
    ip: '10.244.2.14',
    readyContainers: '1/1',
    labels: { app: 'ingress-nginx', component: 'controller' }
  },
  // Monitoring & Core Pods
  {
    id: 'pod-mon-01',
    name: 'prometheus-server-7945d89f4b-88zmn',
    namespace: 'monitoring',
    deployment: 'prometheus-server',
    node: 'k8s-worker-node-03',
    status: 'Running',
    restarts: 0,
    age: '28d',
    cpuUsage: '340m',
    memUsage: '1024Mi',
    ip: '10.244.3.89',
    readyContainers: '2/2',
    labels: { app: 'prometheus', component: 'server' }
  },
  {
    id: 'pod-mon-02',
    name: 'grafana-core-66d498c87f-m189q',
    namespace: 'monitoring',
    deployment: 'grafana-core',
    node: 'k8s-worker-node-02',
    status: 'Running',
    restarts: 0,
    age: '28d',
    cpuUsage: '65m',
    memUsage: '256Mi',
    ip: '10.244.2.90',
    readyContainers: '1/1',
    labels: { app: 'grafana' }
  },
  {
    id: 'pod-sys-01',
    name: 'coredns-7c65d6cfc9-4v98k',
    namespace: 'kube-system',
    deployment: 'coredns',
    node: 'k8s-control-plane-01',
    status: 'Running',
    restarts: 0,
    age: '42d',
    cpuUsage: '25m',
    memUsage: '45Mi',
    ip: '10.244.0.2',
    readyContainers: '1/1',
    labels: { 'k8s-app': 'kube-dns' }
  },
  {
    id: 'pod-sys-02',
    name: 'coredns-7c65d6cfc9-ll89z',
    namespace: 'kube-system',
    deployment: 'coredns',
    node: 'k8s-control-plane-01',
    status: 'Running',
    restarts: 0,
    age: '42d',
    cpuUsage: '22m',
    memUsage: '44Mi',
    ip: '10.244.0.3',
    readyContainers: '1/1',
    labels: { 'k8s-app': 'kube-dns' }
  },
  {
    id: 'pod-sys-03',
    name: 'aws-node-7b6x9',
    namespace: 'kube-system',
    deployment: 'aws-node',
    node: 'k8s-worker-node-01',
    status: 'Running',
    restarts: 0,
    age: '28d',
    cpuUsage: '18m',
    memUsage: '64Mi',
    ip: '10.0.2.14',
    readyContainers: '1/1',
    labels: { 'k8s-app': 'aws-node' }
  },
  {
    id: 'pod-sys-04',
    name: 'aws-node-99lm4',
    namespace: 'kube-system',
    deployment: 'aws-node',
    node: 'k8s-worker-node-02',
    status: 'Running',
    restarts: 0,
    age: '28d',
    cpuUsage: '19m',
    memUsage: '62Mi',
    ip: '10.0.3.88',
    readyContainers: '1/1',
    labels: { 'k8s-app': 'aws-node' }
  },
  {
    id: 'pod-sys-05',
    name: 'aws-node-14tt2',
    namespace: 'kube-system',
    deployment: 'aws-node',
    node: 'k8s-worker-node-03',
    status: 'Running',
    restarts: 0,
    age: '28d',
    cpuUsage: '17m',
    memUsage: '61Mi',
    ip: '10.0.4.102',
    readyContainers: '1/1',
    labels: { 'k8s-app': 'aws-node' }
  },
  {
    id: 'pod-sys-06',
    name: 'kube-proxy-x78pl',
    namespace: 'kube-system',
    deployment: 'kube-proxy',
    node: 'k8s-worker-node-01',
    status: 'Running',
    restarts: 0,
    age: '28d',
    cpuUsage: '12m',
    memUsage: '38Mi',
    ip: '10.0.2.14',
    readyContainers: '1/1',
    labels: { 'k8s-app': 'kube-proxy' }
  },
  {
    id: 'pod-sys-07',
    name: 'kube-proxy-88zkp',
    namespace: 'kube-system',
    deployment: 'kube-proxy',
    node: 'k8s-worker-node-02',
    status: 'Running',
    restarts: 0,
    age: '28d',
    cpuUsage: '14m',
    memUsage: '39Mi',
    ip: '10.0.3.88',
    readyContainers: '1/1',
    labels: { 'k8s-app': 'kube-proxy' }
  },
  {
    id: 'pod-sys-08',
    name: 'kube-proxy-5vvg9',
    namespace: 'kube-system',
    deployment: 'kube-proxy',
    node: 'k8s-worker-node-03',
    status: 'Running',
    restarts: 0,
    age: '28d',
    cpuUsage: '11m',
    memUsage: '37Mi',
    ip: '10.0.4.102',
    readyContainers: '1/1',
    labels: { 'k8s-app': 'kube-proxy' }
  },
  {
    id: 'pod-redis-01',
    name: 'redis-leader-0',
    namespace: 'production',
    deployment: 'redis-cluster',
    node: 'k8s-worker-node-01',
    status: 'Running',
    restarts: 0,
    age: '28d',
    cpuUsage: '60m',
    memUsage: '512Mi',
    ip: '10.244.1.20',
    readyContainers: '1/1',
    labels: { app: 'redis', role: 'leader' }
  },
  {
    id: 'pod-redis-02',
    name: 'redis-follower-0',
    namespace: 'production',
    deployment: 'redis-cluster',
    node: 'k8s-worker-node-02',
    status: 'Running',
    restarts: 0,
    age: '28d',
    cpuUsage: '45m',
    memUsage: '490Mi',
    ip: '10.244.2.22',
    readyContainers: '1/1',
    labels: { app: 'redis', role: 'follower' }
  },
  {
    id: 'pod-redis-03',
    name: 'redis-follower-1',
    namespace: 'production',
    deployment: 'redis-cluster',
    node: 'k8s-worker-node-03',
    status: 'Running',
    restarts: 0,
    age: '28d',
    cpuUsage: '42m',
    memUsage: '488Mi',
    ip: '10.244.3.25',
    readyContainers: '1/1',
    labels: { app: 'redis', role: 'follower' }
  }
];

export const initialDeployments: K8sDeployment[] = [
  {
    id: 'dep-payment',
    name: 'payment-service',
    namespace: 'production',
    replicas: 2,
    availableReplicas: 2,
    image: 'kubeops/payment-service:v2.4.1',
    status: 'Healthy',
    strategy: 'RollingUpdate',
    updatedAt: '2026-11-06 14:22:10 UTC'
  },
  {
    id: 'dep-order',
    name: 'order-api',
    namespace: 'production',
    replicas: 2,
    availableReplicas: 2,
    image: 'kubeops/order-api:v1.9.0',
    status: 'Healthy',
    strategy: 'RollingUpdate',
    updatedAt: '2026-10-29 09:15:32 UTC'
  },
  {
    id: 'dep-auth',
    name: 'auth-gateway',
    namespace: 'production',
    replicas: 2,
    availableReplicas: 2,
    image: 'kubeops/auth-gateway:v3.1.2',
    status: 'Healthy',
    strategy: 'RollingUpdate',
    updatedAt: '2026-10-22 18:40:00 UTC'
  },
  {
    id: 'dep-web',
    name: 'frontend-web',
    namespace: 'production',
    replicas: 3,
    availableReplicas: 3,
    image: 'kubeops/frontend-web:v4.0.5',
    status: 'Healthy',
    strategy: 'RollingUpdate',
    updatedAt: '2026-11-08 11:02:44 UTC'
  }
];

export const initialNamespaces: K8sNamespace[] = [
  { name: 'production', status: 'Active', podsCount: 10, servicesCount: 5, cpuQuota: '8.0 Cores', memoryQuota: '32 GiB' },
  { name: 'staging', status: 'Active', podsCount: 4, servicesCount: 3, cpuQuota: '4.0 Cores', memoryQuota: '16 GiB' },
  { name: 'monitoring', status: 'Active', podsCount: 3, servicesCount: 2, cpuQuota: '4.0 Cores', memoryQuota: '16 GiB' },
  { name: 'kube-system', status: 'Active', podsCount: 8, servicesCount: 2, cpuQuota: 'Unlimited', memoryQuota: 'Unlimited' },
  { name: 'ingress-nginx', status: 'Active', podsCount: 2, servicesCount: 1, cpuQuota: '2.0 Cores', memoryQuota: '4 GiB' }
];

export const initialServices: K8sService[] = [
  { name: 'payment-service', namespace: 'production', type: 'ClusterIP', clusterIP: '172.20.45.19', ports: '8080/TCP', age: '28d' },
  { name: 'order-api', namespace: 'production', type: 'ClusterIP', clusterIP: '172.20.12.88', ports: '8080/TCP', age: '28d' },
  { name: 'auth-gateway', namespace: 'production', type: 'ClusterIP', clusterIP: '172.20.90.104', ports: '80/TCP, 443/TCP', age: '28d' },
  { name: 'frontend-web', namespace: 'production', type: 'ClusterIP', clusterIP: '172.20.101.4', ports: '3000/TCP', age: '28d' },
  { name: 'ingress-nginx-lb', namespace: 'ingress-nginx', type: 'LoadBalancer', clusterIP: '172.20.2.1', externalIP: 'k8s-elb-a91283.us-east-1.elb.amazonaws.com', ports: '80:31280/TCP, 443:31443/TCP', age: '42d' }
];

// --- Terraform Mock Data ---
export const initialTerraformResources: TerraformResource[] = [
  {
    id: 'vpc-0a18bc92d1',
    address: 'aws_vpc.kubeops_vpc',
    type: 'aws_vpc',
    name: 'kubeops_vpc',
    provider: 'hashicorp/aws (v5.30.0)',
    status: 'applied',
    attributes: {
      cidr_block: '10.0.0.0/16',
      enable_dns_hostnames: 'true',
      tags_Name: 'kubeops-vpc-production'
    }
  },
  {
    id: 'subnet-09f182',
    address: 'aws_subnet.public_1a',
    type: 'aws_subnet',
    name: 'public_1a',
    provider: 'hashicorp/aws',
    status: 'applied',
    attributes: {
      cidr_block: '10.0.1.0/24',
      availability_zone: 'us-east-1a',
      map_public_ip_on_launch: 'true'
    }
  },
  {
    id: 'subnet-09f183',
    address: 'aws_subnet.private_1b',
    type: 'aws_subnet',
    name: 'private_1b',
    provider: 'hashicorp/aws',
    status: 'applied',
    attributes: {
      cidr_block: '10.0.2.0/24',
      availability_zone: 'us-east-1b'
    }
  },
  {
    id: 'eks-cluster-01',
    address: 'aws_eks_cluster.prod_cluster',
    type: 'aws_eks_cluster',
    name: 'prod_cluster',
    provider: 'hashicorp/aws',
    status: 'applied',
    attributes: {
      name: 'prod-aws-us-east-1',
      version: '1.29',
      role_arn: 'arn:aws:iam::123456789012:role/eks-cluster-role',
      endpoint: 'https://6A74B8FF2D.gr7.us-east-1.eks.amazonaws.com'
    }
  },
  {
    id: 'eks-ng-01',
    address: 'aws_eks_node_group.workers',
    type: 'aws_eks_node_group',
    name: 'workers',
    provider: 'hashicorp/aws',
    status: 'applied',
    attributes: {
      instance_types: 'm5.xlarge',
      scaling_config: 'min: 3, desired: 3, max: 10',
      disk_size: '100 GiB GP3'
    }
  },
  {
    id: 'igw-099238',
    address: 'aws_internet_gateway.gw',
    type: 'aws_internet_gateway',
    name: 'gw',
    provider: 'hashicorp/aws',
    status: 'applied',
    attributes: {
      vpc_id: 'vpc-0a18bc92d1'
    }
  },
  {
    id: 'nat-018247',
    address: 'aws_nat_gateway.nat',
    type: 'aws_nat_gateway',
    name: 'nat',
    provider: 'hashicorp/aws',
    status: 'applied',
    attributes: {
      allocation_id: 'eipalloc-017723',
      subnet_id: 'subnet-09f182'
    }
  }
];

export const sampleTerraformPlanOutput = `Terraform used the selected providers to generate the following execution plan.
Resource actions are indicated with the following symbols:
  + create
  ~ update in-place
  - destroy

Terraform will perform the following actions:

  # aws_eks_node_group.workers will be updated in-place
  ~ resource "aws_eks_node_group" "workers" {
        id              = "prod-aws-us-east-1:workers"
      ~ scaling_config {
          ~ desired_size = 3 -> 4
            max_size     = 10
            min_size     = 3
        }
        tags            = {
            "Environment" = "production"
            "Terraform"   = "true"
        }
    }

  # aws_security_group_rule.ingress_nagios will be created
  + resource "aws_security_group_rule" "ingress_nagios" {
      + cidr_blocks              = [
          + "10.0.0.0/16",
        ]
      + from_port                = 5666
      + protocol                 = "tcp"
      + security_group_id        = "sg-04481b7a9f82d"
      + to_port                  = 5666
      + type                     = "ingress"
    }

Plan: 1 to add, 1 to change, 0 to destroy.

------------------------------------------------------------------------
Note: You didn't use the -out option to save this plan, so Terraform can't
guarantee to take exactly these actions if you run "terraform apply" now.`;

// --- Ansible Mock Data ---
export const initialAnsibleHosts: AnsibleHost[] = [
  { id: 'h1', hostname: 'k8s-control-plane-01', group: 'control_plane', ip: '10.0.1.10', os: 'Ubuntu 22.04 LTS', state: 'reachable', lastPing: '12s ago' },
  { id: 'h2', hostname: 'k8s-worker-node-01', group: 'workers', ip: '10.0.2.14', os: 'Ubuntu 22.04 LTS', state: 'reachable', lastPing: '10s ago' },
  { id: 'h3', hostname: 'k8s-worker-node-02', group: 'workers', ip: '10.0.3.88', os: 'Ubuntu 22.04 LTS', state: 'reachable', lastPing: '10s ago' },
  { id: 'h4', hostname: 'k8s-worker-node-03', group: 'workers', ip: '10.0.4.102', os: 'Ubuntu 22.04 LTS', state: 'reachable', lastPing: '11s ago' }
];

export const initialAnsiblePlaybooks: AnsiblePlaybook[] = [
  {
    id: 'pb-01',
    name: 'Bootstrap & Hardening Nodes',
    file: 'playbooks/k8s-bootstrap.yml',
    targetHosts: ['control_plane', 'workers'],
    lastRun: '2 hours ago',
    status: 'successful',
    tasksTotal: 6,
    tasksCompleted: 6,
    tasks: [
      { id: 't1', name: 'Gathering Facts', status: 'ok', durationMs: 620, host: 'all' },
      { id: 't2', name: 'Configure Kernel Modules (overlay, br_netfilter)', status: 'ok', durationMs: 410, host: 'all' },
      { id: 't3', name: 'Setup sysctl params for k8s networking', status: 'ok', durationMs: 380, host: 'all' },
      { id: 't4', name: 'Install containerd.io and runc packages', status: 'ok', durationMs: 1450, host: 'all' },
      { id: 't5', name: 'Deploy systemd cgroup containerd configuration', status: 'changed', durationMs: 510, host: 'all' },
      { id: 't6', name: 'Restart and enable containerd service', status: 'ok', durationMs: 720, host: 'all' }
    ]
  },
  {
    id: 'pb-02',
    name: 'Deploy Nagios NRPE Agent',
    file: 'playbooks/deploy-nagios-nrpe.yml',
    targetHosts: ['workers'],
    lastRun: '1 day ago',
    status: 'successful',
    tasksTotal: 4,
    tasksCompleted: 4,
    tasks: [
      { id: 't21', name: 'Gathering Facts', status: 'ok', durationMs: 550, host: 'workers' },
      { id: 't22', name: 'Install nagios-nrpe-server & monitoring-plugins', status: 'ok', durationMs: 1200, host: 'workers' },
      { id: 't23', name: 'Copy nrpe.cfg with allowed monitoring servers', status: 'changed', durationMs: 320, host: 'workers' },
      { id: 't24', name: 'Ensure nagios-nrpe-server is running', status: 'ok', durationMs: 450, host: 'workers' }
    ]
  },
  {
    id: 'pb-03',
    name: 'Security CIS Benchmark Audit',
    file: 'playbooks/cis-security-audit.yml',
    targetHosts: ['all'],
    lastRun: '3 days ago',
    status: 'successful',
    tasksTotal: 5,
    tasksCompleted: 5,
    tasks: [
      { id: 't31', name: 'Gathering Facts', status: 'ok', durationMs: 580, host: 'all' },
      { id: 't32', name: 'Audit /etc/kubernetes/manifests file permissions', status: 'ok', durationMs: 410, host: 'all' },
      { id: 't33', name: 'Check kubelet service auth flags', status: 'ok', durationMs: 390, host: 'all' },
      { id: 't34', name: 'Verify disable anonymous auth', status: 'ok', durationMs: 350, host: 'all' },
      { id: 't35', name: 'Generate compliance audit JSON report', status: 'changed', durationMs: 620, host: 'all' }
    ]
  }
];

// --- Puppet Mock Data ---
export const initialPuppetNodes: PuppetNode[] = [
  {
    id: 'pup-01',
    certname: 'k8s-control-plane-01.us-east-1.internal',
    environment: 'production',
    compliancePercent: 100,
    status: 'compliant',
    lastCatalogApply: '14m ago',
    agentVersion: '8.4.1',
    drifts: []
  },
  {
    id: 'pup-02',
    certname: 'k8s-worker-node-01.us-east-1.internal',
    environment: 'production',
    compliancePercent: 96,
    status: 'drift_detected',
    lastCatalogApply: '22m ago',
    agentVersion: '8.4.1',
    drifts: [
      {
        resource: 'File[/etc/security/limits.d/99-nofile.conf]',
        expected: 'nofile 65536',
        actual: 'nofile 1024 (manual alteration)',
        severity: 'medium'
      }
    ]
  },
  {
    id: 'pup-03',
    certname: 'k8s-worker-node-02.us-east-1.internal',
    environment: 'production',
    compliancePercent: 100,
    status: 'compliant',
    lastCatalogApply: '8m ago',
    agentVersion: '8.4.1',
    drifts: []
  },
  {
    id: 'pup-04',
    certname: 'k8s-worker-node-03.us-east-1.internal',
    environment: 'production',
    compliancePercent: 100,
    status: 'compliant',
    lastCatalogApply: '17m ago',
    agentVersion: '8.4.1',
    drifts: []
  }
];

// --- Nagios Mock Data ---
export const initialNagiosHosts: NagiosHostCheck[] = [
  { id: 'nh-1', name: 'k8s-control-plane-01', address: '10.0.1.10', status: 'UP', lastCheck: '2026-11-10 21:50:00', latencyMs: 0.8 },
  { id: 'nh-2', name: 'k8s-worker-node-01', address: '10.0.2.14', status: 'UP', lastCheck: '2026-11-10 21:50:30', latencyMs: 1.1 },
  { id: 'nh-3', name: 'k8s-worker-node-02', address: '10.0.3.88', status: 'UP', lastCheck: '2026-11-10 21:51:00', latencyMs: 1.3 },
  { id: 'nh-4', name: 'k8s-worker-node-03', address: '10.0.4.102', status: 'UP', lastCheck: '2026-11-10 21:51:30', latencyMs: 1.0 }
];

export const initialNagiosServices: NagiosServiceCheck[] = [
  {
    id: 'ns-01',
    hostName: 'k8s-worker-node-01',
    serviceDescription: 'HTTP Service: payment-service:8080/healthz',
    state: 'OK',
    lastCheck: '32s ago',
    statusInformation: 'HTTP OK: HTTP/1.1 200 OK - 84 bytes in 0.012 second response time',
    duration: '4d 12h 14m',
    attempt: '1/3',
    isFlapping: false
  },
  {
    id: 'ns-02',
    hostName: 'k8s-worker-node-02',
    serviceDescription: 'HTTP Service: order-api:8080/healthz',
    state: 'OK',
    lastCheck: '45s ago',
    statusInformation: 'HTTP OK: HTTP/1.1 200 OK - 92 bytes in 0.015 second response time',
    duration: '12d 8h 02m',
    attempt: '1/3',
    isFlapping: false
  },
  {
    id: 'ns-03',
    hostName: 'k8s-control-plane-01',
    serviceDescription: 'K8s API Server HTTPS :6443/livez',
    state: 'OK',
    lastCheck: '15s ago',
    statusInformation: 'HTTPS OK: 200 OK [ok] - API server responsive',
    duration: '42d 0h 19m',
    attempt: '1/3',
    isFlapping: false
  },
  {
    id: 'ns-04',
    hostName: 'k8s-worker-node-01',
    serviceDescription: 'NRPE CPU Load Average',
    state: 'OK',
    lastCheck: '1m ago',
    statusInformation: 'OK - load average: 0.44, 0.52, 0.49',
    duration: '18d 4h 22m',
    attempt: '1/3',
    isFlapping: false
  },
  {
    id: 'ns-05',
    hostName: 'k8s-worker-node-02',
    serviceDescription: 'NRPE Memory Utilization',
    state: 'OK',
    lastCheck: '1m ago',
    statusInformation: 'OK - Memory 68% used (10.88 GB / 16.00 GB)',
    duration: '18d 4h 22m',
    attempt: '1/3',
    isFlapping: false
  },
  {
    id: 'ns-06',
    hostName: 'k8s-worker-node-03',
    serviceDescription: 'Disk Space (/var/lib/containerd)',
    state: 'OK',
    lastCheck: '2m ago',
    statusInformation: 'DISK OK - free space: /var/lib/containerd 58.2 GB (58% inode=91%)',
    duration: '28d 14h 50m',
    attempt: '1/3',
    isFlapping: false
  },
  {
    id: 'ns-07',
    hostName: 'k8s-control-plane-01',
    serviceDescription: 'etcd Cluster Health',
    state: 'OK',
    lastCheck: '30s ago',
    statusInformation: 'ETCD OK - 3/3 members healthy, leader active, db size 42 MB',
    duration: '42d 0h 19m',
    attempt: '1/3',
    isFlapping: false
  }
];

export const initialNagiosAlerts: NagiosAlert[] = [
  {
    id: 'na-1',
    timestamp: '2026-11-09 18:22:15',
    host: 'k8s-worker-node-02',
    service: 'NRPE Memory Utilization',
    state: 'WARNING',
    message: 'Memory exceeded threshold (82% used during batch job)'
  },
  {
    id: 'na-2',
    timestamp: '2026-11-08 04:15:02',
    host: 'k8s-worker-node-03',
    service: 'Disk Space (/var/lib/containerd)',
    state: 'WARNING',
    message: 'Unused image prune recommended (74% used)'
  }
];

// --- Jenkins Mock Data ---
export const initialJenkinsPipelines: JenkinsPipeline[] = [
  {
    id: 'pipe-01',
    name: 'payment-service-pipeline',
    repo: 'github.com/kubeops-org/payment-service',
    branch: 'main',
    lastBuildNumber: 142,
    lastBuildStatus: 'SUCCESS',
    lastBuildDuration: '3m 42s',
    commitHash: 'e7f82b1',
    commitMessage: 'fix(stripe): handle webhook signature retry edge-case',
    author: 'Alex Morgan <alex@kubeops.io>',
    stages: [
      { id: 's1', name: 'Source Code Checkout', status: 'SUCCESS', durationMs: 12000, logs: ['Git shallow clone branch main', 'HEAD is now at e7f82b1'] },
      { id: 's2', name: 'Build & Unit Tests', status: 'SUCCESS', durationMs: 48000, logs: ['go build -v ./cmd/payment-service', 'Running 86 unit tests... PASS'] },
      { id: 's3', name: 'Docker Image Creation', status: 'SUCCESS', durationMs: 62000, logs: ['Step 1/8 FROM golang:1.22-alpine', 'Successfully tagged kubeops/payment-service:v2.4.1'] },
      { id: 's4', name: 'Automated Testing', status: 'SUCCESS', durationMs: 44000, logs: ['Integration tests with testcontainers', '42 endpoint tests passed in 44s'] },
      { id: 's5', name: 'Kubernetes Deployment', status: 'SUCCESS', durationMs: 56000, logs: ['kubectl set image deployment/payment-service payment=kubeops/payment-service:v2.4.1', 'deployment.apps/payment-service successfully rolled out'] }
    ]
  },
  {
    id: 'pipe-02',
    name: 'frontend-web-pipeline',
    repo: 'github.com/kubeops-org/frontend-web',
    branch: 'release/v4.0',
    lastBuildNumber: 98,
    lastBuildStatus: 'SUCCESS',
    lastBuildDuration: '2m 18s',
    commitHash: '49ba1c9',
    commitMessage: 'feat(ui): dark mode contrast enhancement for cluster cards',
    author: 'Sarah Chen <sarah@kubeops.io>',
    stages: [
      { id: 's21', name: 'Source Code Checkout', status: 'SUCCESS', durationMs: 8000 },
      { id: 's22', name: 'Build & Unit Tests', status: 'SUCCESS', durationMs: 38000 },
      { id: 's23', name: 'Docker Image Creation', status: 'SUCCESS', durationMs: 45000 },
      { id: 's24', name: 'Automated Testing', status: 'SUCCESS', durationMs: 25000 },
      { id: 's25', name: 'Kubernetes Deployment', status: 'SUCCESS', durationMs: 22000 }
    ]
  }
];

// --- Self-Healing History ---
export const initialRecoveryHistory: SelfHealingHistoryItem[] = [
  {
    id: 'rec-01',
    incidentId: 'INC-202611-0902',
    timestamp: '2026-11-08 19:42:10 UTC',
    podName: 'order-api-6b758dd9-8vb2l',
    namespace: 'production',
    node: 'k8s-worker-node-03',
    rootCause: 'Liveness probe timeout (HTTP 504 Gateway Timeout during DB connection saturation)',
    remediationAction: 'Kubelet killed unresponsive container; Kubernetes ReplicaSet scheduled clean replacement pod with fresh pool connection',
    downtimeSeconds: 14,
    status: 'Recovered'
  },
  {
    id: 'rec-02',
    incidentId: 'INC-202611-0844',
    timestamp: '2026-11-05 11:15:33 UTC',
    podName: 'auth-gateway-55f69c97b8-q12xp',
    namespace: 'production',
    node: 'k8s-worker-node-03',
    rootCause: 'Fatal runtime panic / OOMKilled (Exit Code 137, Memory Limit Exceeded 256Mi)',
    remediationAction: 'RestartPolicy: Always triggered; pod restarted with cleared heap cache and self-healed to Ready state',
    downtimeSeconds: 11,
    status: 'Recovered'
  },
  {
    id: 'rec-03',
    incidentId: 'INC-202611-0791',
    timestamp: '2026-11-02 04:58:19 UTC',
    podName: 'redis-follower-0',
    namespace: 'production',
    node: 'k8s-worker-node-02',
    rootCause: 'Disk I/O pressure trigger on node causing brief socket timeout',
    remediationAction: 'Nagios signaled alert; K8s readiness probe isolated traffic, restarted process, synchronized replication stream',
    downtimeSeconds: 18,
    status: 'Recovered'
  }
];

// --- Events & Alerts ---
export const initialEvents: InfrastructureEvent[] = [
  {
    id: 'ev-1',
    timestamp: '2 mins ago',
    type: 'success',
    source: 'Nagios',
    title: 'Routine Health Checks Passed',
    message: 'All 7 registered host and service probes returned HTTP 200 / OK'
  },
  {
    id: 'ev-2',
    timestamp: '14 mins ago',
    type: 'info',
    source: 'Puppet',
    title: 'Catalog Sync Run Completed',
    message: 'Node k8s-control-plane-01 applied 44 resources with zero catalog drift'
  },
  {
    id: 'ev-3',
    timestamp: '1 hour ago',
    type: 'info',
    source: 'Jenkins',
    title: 'Pipeline Build #142 Succeeded',
    message: 'payment-service:v2.4.1 deployed to cluster prod-aws-us-east-1'
  },
  {
    id: 'ev-4',
    timestamp: '2 hours ago',
    type: 'success',
    source: 'Ansible',
    title: 'Playbook Execution Complete',
    message: 'k8s-bootstrap.yml executed across 4 nodes (changed=4, failed=0)'
  },
  {
    id: 'ev-5',
    timestamp: '5 hours ago',
    type: 'info',
    source: 'Terraform',
    title: 'State Sync',
    message: 'Terraform remote state refreshed from s3://kubeops-terraform-tfstate'
  }
];

export const initialAlerts: AlertNotification[] = [
  {
    id: 'alt-01',
    severity: 'info',
    title: 'Puppet Drift Detected',
    message: 'Worker node 01 has minor limits.conf deviation from central catalog',
    timestamp: '22m ago',
    source: 'Puppet',
    acknowledged: false
  }
];

