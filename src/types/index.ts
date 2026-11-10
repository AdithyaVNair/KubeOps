// ==========================================
// KubeOps Platform Data Types
// ==========================================

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'degraded';
export type NodeStatus = 'Ready' | 'Not Ready';
export type PodStatus = 'Running' | 'CrashLoopBackOff' | 'Error' | 'Terminating' | 'ContainerCreating' | 'Pending';

export interface ClusterInfo {
  id: string;
  name: string;
  provider: 'AWS EKS' | 'GKE' | 'Bare Metal' | 'Azure AKS';
  region: string;
  version: string;
  status: 'Active' | 'Degraded' | 'Upgrading';
  controlPlanesCount: number;
  workerNodesCount: number;
  totalPods: number;
  healthScore: number;
}

export interface K8sNode {
  id: string;
  name: string;
  role: 'control-plane' | 'worker';
  status: NodeStatus;
  instanceType: string;
  internalIP: string;
  kubeletVersion: string;
  cpuCores: number;
  cpuUsagePercent: number;
  memoryTotalGB: number;
  memoryUsagePercent: number;
  podsAllocated: number;
  maxPods: number;
  zone: string;
  age: string;
}

export interface K8sPod {
  id: string;
  name: string;
  namespace: string;
  deployment: string;
  node: string;
  status: PodStatus;
  restarts: number;
  age: string;
  cpuUsage: string;
  memUsage: string;
  ip: string;
  readyContainers: string;
  labels: Record<string, string>;
  recentLogs?: string[];
  isTargetOfFailure?: boolean;
}

export interface K8sDeployment {
  id: string;
  name: string;
  namespace: string;
  replicas: number;
  availableReplicas: number;
  image: string;
  status: 'Healthy' | 'Degraded' | 'Progressing';
  strategy: 'RollingUpdate' | 'Recreate';
  updatedAt: string;
}

export interface K8sNamespace {
  name: string;
  status: 'Active' | 'Terminating';
  podsCount: number;
  servicesCount: number;
  cpuQuota: string;
  memoryQuota: string;
}

export interface K8sService {
  name: string;
  namespace: string;
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
  clusterIP: string;
  externalIP?: string;
  ports: string;
  age: string;
}

// --- Terraform Types ---
export interface TerraformResource {
  id: string;
  address: string;
  type: string;
  name: string;
  provider: string;
  status: 'applied' | 'creating' | 'destroying' | 'modified' | 'drifted';
  attributes: Record<string, string>;
}

export interface TerraformExecution {
  id: string;
  action: 'apply' | 'plan' | 'destroy';
  status: 'success' | 'running' | 'failed' | 'idle';
  timestamp: string;
  durationSec: number;
  resourcesToCreate: number;
  resourcesToModify: number;
  resourcesToDestroy: number;
  rawLogs: string[];
}

// --- Ansible Types ---
export interface AnsibleTask {
  id: string;
  name: string;
  status: 'ok' | 'changed' | 'failed' | 'skipping';
  durationMs: number;
  host: string;
}

export interface AnsiblePlaybook {
  id: string;
  name: string;
  file: string;
  targetHosts: string[];
  lastRun: string;
  status: 'successful' | 'running' | 'failed';
  tasksTotal: number;
  tasksCompleted: number;
  tasks: AnsibleTask[];
}

export interface AnsibleHost {
  id: string;
  hostname: string;
  group: string;
  ip: string;
  os: string;
  state: 'reachable' | 'unreachable';
  lastPing: string;
}

// --- Puppet Types ---
export interface PuppetNode {
  id: string;
  certname: string;
  environment: string;
  compliancePercent: number;
  status: 'compliant' | 'unresponsive' | 'drift_detected';
  lastCatalogApply: string;
  agentVersion: string;
  drifts: {
    resource: string;
    expected: string;
    actual: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}

// --- Nagios Types ---
export type NagiosState = 'OK' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';

export interface NagiosHostCheck {
  id: string;
  name: string;
  address: string;
  status: 'UP' | 'DOWN' | 'UNREACHABLE';
  lastCheck: string;
  latencyMs: number;
}

export interface NagiosServiceCheck {
  id: string;
  hostName: string;
  serviceDescription: string;
  state: NagiosState;
  lastCheck: string;
  statusInformation: string;
  duration: string;
  attempt: string;
  isFlapping: boolean;
}

export interface NagiosAlert {
  id: string;
  timestamp: string;
  host: string;
  service: string;
  state: NagiosState;
  message: string;
}

// --- Jenkins Types ---
export type StageStatus = 'SUCCESS' | 'IN_PROGRESS' | 'FAILED' | 'PENDING' | 'ABORTED';

export interface JenkinsStage {
  id: string;
  name: string;
  status: StageStatus;
  durationMs: number;
  logs?: string[];
}

export interface JenkinsPipeline {
  id: string;
  name: string;
  repo: string;
  branch: string;
  lastBuildNumber: number;
  lastBuildStatus: StageStatus;
  lastBuildDuration: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  stages: JenkinsStage[];
}

// --- Self-Healing Types ---
export type SelfHealingStepStatus = 'waiting' | 'in-progress' | 'completed' | 'alert';

export interface SelfHealingStep {
  stepNumber: number;
  title: string;
  description: string;
  system: 'Kubernetes Pod' | 'Nagios Monitoring' | 'AlertManager / EventBus' | 'K8s Controller' | 'Liveness / Readiness Probe' | 'KubeOps Recovery System';
  status: SelfHealingStepStatus;
  timestamp?: string;
  details?: string;
}

export interface SelfHealingHistoryItem {
  id: string;
  incidentId: string;
  timestamp: string;
  podName: string;
  namespace: string;
  node: string;
  rootCause: string;
  remediationAction: string;
  downtimeSeconds: number;
  status: 'Recovered' | 'Failed' | 'In Progress';
}

// --- Global Alerts & Activity ---
export interface InfrastructureEvent {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  source: 'Kubernetes' | 'Terraform' | 'Ansible' | 'Puppet' | 'Nagios' | 'Jenkins' | 'Self-Healing';
  title: string;
  message: string;
}

export interface AlertNotification {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  acknowledged: boolean;
}

