import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import confetti from 'canvas-confetti';
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
  SelfHealingStep,
  SelfHealingHistoryItem,
  InfrastructureEvent,
  AlertNotification
} from '../types';
import {
  initialClusters,
  initialNodes,
  initialPods,
  initialDeployments,
  initialNamespaces,
  initialServices,
  initialTerraformResources,
  initialAnsibleHosts,
  initialAnsiblePlaybooks,
  initialPuppetNodes,
  initialNagiosHosts,
  initialNagiosServices,
  initialNagiosAlerts,
  initialJenkinsPipelines,
  initialRecoveryHistory,
  initialEvents,
  initialAlerts
} from '../data/mockData';

export type ActivePage =
  | 'overview'
  | 'kubernetes'
  | 'terraform'
  | 'ansible'
  | 'puppet'
  | 'nagios'
  | 'jenkins'
  | 'self-healing'
  | 'architecture';

export type SelfHealingPhase =
  | 'idle'
  | 'pod_crashed'
  | 'monitoring_detected'
  | 'alert_generated'
  | 'k8s_restarting'
  | 'verifying'
  | 'recovered';

export interface MetricsDataPoint {
  time: string;
  cpu: number;
  memory: number;
  networkIn: number;
  networkOut: number;
}

interface KubeOpsContextType {
  // Navigation & Page
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;

  // Selected Cluster
  clusters: ClusterInfo[];
  selectedCluster: ClusterInfo;
  setSelectedCluster: (c: ClusterInfo) => void;

  // Kubernetes State
  nodes: K8sNode[];
  pods: K8sPod[];
  deployments: K8sDeployment[];
  namespaces: K8sNamespace[];
  services: K8sService[];
  scaleDeployment: (deploymentId: string, delta: number) => void;
  restartDeployment: (deploymentId: string) => void;
  deletePod: (podId: string) => void;
  restartPod: (podId: string) => void;

  // Terraform State
  terraformResources: TerraformResource[];
  terraformLogs: string[];
  isTerraformRunning: boolean;
  runTerraformPlan: () => void;
  runTerraformApply: () => void;
  runTerraformDestroy: () => void;

  // Ansible State
  ansiblePlaybooks: AnsiblePlaybook[];
  ansibleHosts: AnsibleHost[];
  runningPlaybookId: string | null;
  runAnsiblePlaybook: (playbookId: string) => void;

  // Puppet State
  puppetNodes: PuppetNode[];
  enforcePuppetCompliance: (nodeId: string) => void;

  // Nagios State
  nagiosHosts: NagiosHostCheck[];
  nagiosServices: NagiosServiceCheck[];
  nagiosAlerts: NagiosAlert[];
  triggerNagiosCheck: (serviceId: string) => void;
  acknowledgeNagiosAlert: (alertId: string) => void;

  // Jenkins State
  jenkinsPipelines: JenkinsPipeline[];
  triggerJenkinsBuild: (pipelineId: string) => void;

  // Self-Healing Core
  selfHealingPhase: SelfHealingPhase;
  selfHealingSteps: SelfHealingStep[];
  selfHealingLogs: string[];
  recoveryHistory: SelfHealingHistoryItem[];
  simulatePodFailure: (failureType?: string) => void;
  resetSelfHealing: () => void;
  isSelfHealingActive: boolean;

  // Global Metrics & Activity
  cpuUtilization: number;
  memoryUtilization: number;
  infrastructureHealth: number;
  failedPodsCount: number;
  metricsHistory: MetricsDataPoint[];
  events: InfrastructureEvent[];
  alerts: AlertNotification[];
  dismissAlert: (alertId: string) => void;

  // UI Modals / Command Palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
}

const KubeOpsContext = createContext<KubeOpsContextType | undefined>(undefined);

const initialHealingSteps: SelfHealingStep[] = [
  {
    stepNumber: 1,
    title: 'Pod Failure Triggered',
    description: 'Kubernetes application pod encounters fatal error / crash',
    system: 'Kubernetes Pod',
    status: 'waiting'
  },
  {
    stepNumber: 2,
    title: 'Monitoring Detection',
    description: 'Nagios synthetic health check & metrics scrape detect connection failure',
    system: 'Nagios Monitoring',
    status: 'waiting'
  },
  {
    stepNumber: 3,
    title: 'Alert Dispatched',
    description: 'CRITICAL alert dispatched via EventBus & PagerDuty webhook',
    system: 'AlertManager / EventBus',
    status: 'waiting'
  },
  {
    stepNumber: 4,
    title: 'Kubelet / Controller Reconciliation',
    description: 'Kubelet kills dead container; ReplicaSet initiates zero-downtime replacement',
    system: 'K8s Controller',
    status: 'waiting'
  },
  {
    stepNumber: 5,
    title: 'Health Check Verification',
    description: 'Readiness & liveness probes /healthz return HTTP 200 OK',
    system: 'Liveness / Readiness Probe',
    status: 'waiting'
  },
  {
    stepNumber: 6,
    title: 'Autonomous System Restored',
    description: 'Service restored to normal SLA, traffic re-routed, alert auto-resolved',
    system: 'KubeOps Recovery System',
    status: 'waiting'
  }
];

export const KubeOpsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [activePage, setActivePage] = useState<ActivePage>('overview');

  // Clusters
  const [clusters] = useState<ClusterInfo[]>(initialClusters);
  const [selectedCluster, setSelectedCluster] = useState<ClusterInfo>(initialClusters[0]);

  // Kubernetes State
  const [nodes, setNodes] = useState<K8sNode[]>(initialNodes);
  const [pods, setPods] = useState<K8sPod[]>(initialPods);
  const [deployments, setDeployments] = useState<K8sDeployment[]>(initialDeployments);
  const [namespaces] = useState<K8sNamespace[]>(initialNamespaces);
  const [services] = useState<K8sService[]>(initialServices);

  // Terraform State
  const [terraformResources, setTerraformResources] = useState<TerraformResource[]>(initialTerraformResources);
  const [terraformLogs, setTerraformLogs] = useState<string[]>([
    'KubeOps Terraform v1.7.4 on linux_amd64',
    'Initializing the backend "s3"...',
    'Successfully configured the backend "s3"! Terraform will automatically',
    'use this backend unless the configuration changes.',
    'Terraform has been successfully initialized!'
  ]);
  const [isTerraformRunning, setIsTerraformRunning] = useState(false);

  // Ansible State
  const [ansiblePlaybooks, setAnsiblePlaybooks] = useState<AnsiblePlaybook[]>(initialAnsiblePlaybooks);
  const [ansibleHosts] = useState<AnsibleHost[]>(initialAnsibleHosts);
  const [runningPlaybookId, setRunningPlaybookId] = useState<string | null>(null);

  // Puppet State
  const [puppetNodes, setPuppetNodes] = useState<PuppetNode[]>(initialPuppetNodes);

  // Nagios State
  const [nagiosHosts] = useState<NagiosHostCheck[]>(initialNagiosHosts);
  const [nagiosServices, setNagiosServices] = useState<NagiosServiceCheck[]>(initialNagiosServices);
  const [nagiosAlerts, setNagiosAlerts] = useState<NagiosAlert[]>(initialNagiosAlerts);

  // Jenkins State
  const [jenkinsPipelines, setJenkinsPipelines] = useState<JenkinsPipeline[]>(initialJenkinsPipelines);

  // Self-Healing Core State
  const [selfHealingPhase, setSelfHealingPhase] = useState<SelfHealingPhase>('idle');
  const [selfHealingSteps, setSelfHealingSteps] = useState<SelfHealingStep[]>(initialHealingSteps);
  const [selfHealingLogs, setSelfHealingLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] System ready. Auto-healing watcher active on cluster prod-aws-us-east-1.`
  ]);
  const [recoveryHistory, setRecoveryHistory] = useState<SelfHealingHistoryItem[]>(initialRecoveryHistory);

  // Metrics & Activity
  const [cpuUtilization, setCpuUtilization] = useState(42);
  const [memoryUtilization, setMemoryUtilization] = useState(68);
  const [infrastructureHealth, setInfrastructureHealth] = useState(95);
  const [events, setEvents] = useState<InfrastructureEvent[]>(initialEvents);
  const [alerts, setAlerts] = useState<AlertNotification[]>(initialAlerts);

  // UI Drawers / Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Dynamic time-series metrics
  const [metricsHistory, setMetricsHistory] = useState<MetricsDataPoint[]>([
    { time: '21:00', cpu: 38, memory: 65, networkIn: 45, networkOut: 38 },
    { time: '21:10', cpu: 40, memory: 66, networkIn: 52, networkOut: 42 },
    { time: '21:20', cpu: 41, memory: 67, networkIn: 48, networkOut: 44 },
    { time: '21:30', cpu: 44, memory: 69, networkIn: 55, networkOut: 49 },
    { time: '21:40', cpu: 42, memory: 68, networkIn: 50, networkOut: 45 },
    { time: '21:50', cpu: 42, memory: 68, networkIn: 51, networkOut: 46 }
  ]);

  const healingTimerRef = useRef<number | null>(null);

  // Derived failed pods count
  const failedPodsCount = pods.filter(p => p.status === 'CrashLoopBackOff' || p.status === 'Error' || p.status === 'Terminating').length;

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Periodic metrics jitter for lively realism
  useEffect(() => {
    const interval = setInterval(() => {
      if (selfHealingPhase === 'idle' || selfHealingPhase === 'recovered') {
        const cpuJitter = Math.floor(Math.random() * 5) - 2;
        const memJitter = Math.floor(Math.random() * 3) - 1;
        setCpuUtilization(prev => Math.min(85, Math.max(35, prev + cpuJitter)));
        setMemoryUtilization(prev => Math.min(85, Math.max(60, prev + memJitter)));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selfHealingPhase]);

  // Add event helper
  const addEvent = (source: InfrastructureEvent['source'], type: InfrastructureEvent['type'], title: string, message: string) => {
    const newEvent: InfrastructureEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: 'Just now',
      source,
      type,
      title,
      message
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 19)]);
  };

  // Add alert helper
  const addAlert = (source: string, severity: AlertNotification['severity'], title: string, message: string) => {
    const newAlert: AlertNotification = {
      id: `alt-${Date.now()}`,
      source,
      severity,
      title,
      message,
      timestamp: 'Just now',
      acknowledged: false
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // -------------------------------------------------------------
  // Kubernetes Actions
  // -------------------------------------------------------------
  const scaleDeployment = (deploymentId: string, delta: number) => {
    setDeployments(prev =>
      prev.map(dep => {
        if (dep.id === deploymentId) {
          const newReplicas = Math.max(1, Math.min(10, dep.replicas + delta));
          addEvent('Kubernetes', 'info', `Deployment Scaled: ${dep.name}`, `Desired replicas updated from ${dep.replicas} to ${newReplicas}`);
          return { ...dep, replicas: newReplicas, availableReplicas: newReplicas };
        }
        return dep;
      })
    );
  };

  const restartDeployment = (deploymentId: string) => {
    const dep = deployments.find(d => d.id === deploymentId);
    if (!dep) return;

    addEvent('Kubernetes', 'warning', `Rolling Restart: ${dep.name}`, 'Triggering rolling update replacement of all replica pods');
    // Temporarily mark pods as ContainerCreating then back to Running
    setPods(prev =>
      prev.map(p => {
        if (p.deployment === dep.name) {
          return { ...p, status: 'ContainerCreating', age: '10s' };
        }
        return p;
      })
    );

    setTimeout(() => {
      setPods(prev =>
        prev.map(p => {
          if (p.deployment === dep.name) {
            return { ...p, status: 'Running', restarts: p.restarts + 1 };
          }
          return p;
        })
      );
      addEvent('Kubernetes', 'success', `Deployment Restarted: ${dep.name}`, 'All 2 pods successfully running new container generation');
    }, 2000);
  };

  const deletePod = (podId: string) => {
    const pod = pods.find(p => p.id === podId);
    if (!pod) return;

    addEvent('Kubernetes', 'warning', `Pod Deleted: ${pod.name}`, 'Pod manually terminated by operator');
    setPods(prev => prev.map(p => (p.id === podId ? { ...p, status: 'Terminating' } : p)));

    setTimeout(() => {
      // Re-create new pod (K8s ReplicaSet behavior)
      const newPodId = `pod-${Date.now().toString().slice(-4)}`;
      const newPodName = `${pod.deployment}-${Math.random().toString(36).substr(2, 5)}`;
      setPods(prev => [
        ...prev.filter(p => p.id !== podId),
        {
          ...pod,
          id: newPodId,
          name: newPodName,
          status: 'Running',
          restarts: 0,
          age: '5s'
        }
      ]);
      addEvent('Kubernetes', 'success', `ReplicaSet Replaced Pod: ${newPodName}`, 'New pod scheduled and healthy');
    }, 2500);
  };

  const restartPod = (podId: string) => {
    setPods(prev =>
      prev.map(p => {
        if (p.id === podId) {
          return { ...p, status: 'ContainerCreating', restarts: p.restarts + 1 };
        }
        return p;
      })
    );
    setTimeout(() => {
      setPods(prev =>
        prev.map(p => (p.id === podId ? { ...p, status: 'Running', age: '15s' } : p))
      );
    }, 2000);
  };

  // -------------------------------------------------------------
  // Self-Healing Core Simulation Engine
  // -------------------------------------------------------------
  const resetSelfHealing = () => {
    if (healingTimerRef.current) {
      clearTimeout(healingTimerRef.current);
    }
    setSelfHealingPhase('idle');
    setSelfHealingSteps(initialHealingSteps);
    setInfrastructureHealth(95);
    setPods(initialPods);
    setNagiosServices(initialNagiosServices);
  };

  const simulatePodFailure = (failureType = 'OOMKilled / Heap Exhaustion') => {
    if (healingTimerRef.current) {
      clearTimeout(healingTimerRef.current);
    }

    const crashTimestamp = new Date().toLocaleTimeString();
    const targetPodName = 'payment-service-7f89d4c79-k8qzp';

    // Step 1: Pod Crashes
    setSelfHealingPhase('pod_crashed');
    setInfrastructureHealth(76);
    setCpuUtilization(68);
    setMemoryUtilization(94);

    setPods(prev =>
      prev.map(p =>
        p.name === targetPodName
          ? {
              ...p,
              status: 'CrashLoopBackOff',
              restarts: p.restarts + 1,
              memUsage: '512Mi (Limit 512Mi)',
              recentLogs: [
                `[${crashTimestamp}] [FATAL] java.lang.OutOfMemoryError: Java heap space`,
                `[${crashTimestamp}] [SYSTEM] Container exited with status 137 (OOMKilled)`,
                `[${crashTimestamp}] [KUBELET] Back-off restarting failed container`
              ]
            }
          : p
      )
    );

    setSelfHealingSteps(prev =>
      prev.map(s =>
        s.stepNumber === 1
          ? { ...s, status: 'alert', timestamp: crashTimestamp, details: `Pod ${targetPodName} terminated with SIGKILL (Exit 137). ${failureType}` }
          : s.stepNumber === 2
          ? { ...s, status: 'in-progress' }
          : { ...s, status: 'waiting' }
      )
    );

    setSelfHealingLogs(prev => [
      `[${crashTimestamp}] [POD CRASH] ${targetPodName} in namespace 'production' failed! Reason: ${failureType}`,
      ...prev
    ]);

    addEvent('Kubernetes', 'error', `Pod Crash: ${targetPodName}`, `Fatal exception detected: ${failureType}`);

    // Step 2: Monitoring Detects Failure (after 2.2s)
    healingTimerRef.current = window.setTimeout(() => {
      const detectTime = new Date().toLocaleTimeString();
      setSelfHealingPhase('monitoring_detected');

      // Update Nagios service check
      setNagiosServices(prev =>
        prev.map(svc =>
          svc.serviceDescription.includes('payment-service')
            ? {
                ...svc,
                state: 'CRITICAL',
                lastCheck: 'Just now',
                statusInformation: 'CRITICAL - HTTP GET /healthz Connection refused (port 8080 unreachable)',
                attempt: '2/3'
              }
            : svc
        )
      );

      setSelfHealingSteps(prev =>
        prev.map(s =>
          s.stepNumber === 2
            ? { ...s, status: 'alert', timestamp: detectTime, details: 'Nagios synthetic probe check failed: HTTP Connection Refused on port 8080.' }
            : s.stepNumber === 3
            ? { ...s, status: 'in-progress' }
            : s
        )
      );

      setSelfHealingLogs(prev => [
        `[${detectTime}] [NAGIOS PROBE] Service HTTP check for payment-service failed. State changed: OK -> CRITICAL`,
        ...prev
      ]);

      addEvent('Nagios', 'error', 'Service CRITICAL: payment-service', 'HTTP 502 Connection refused on port 8080');

      // Step 3: Alert Generated (after 2.2s)
      healingTimerRef.current = window.setTimeout(() => {
        const alertTime = new Date().toLocaleTimeString();
        setSelfHealingPhase('alert_generated');

        const alertItem: NagiosAlert = {
          id: `na-${Date.now()}`,
          timestamp: alertTime,
          host: 'k8s-worker-node-01',
          service: 'HTTP Service: payment-service:8080/healthz',
          state: 'CRITICAL',
          message: 'CRITICAL - Payment service health probe failed 3 consecutive checks'
        };
        setNagiosAlerts(prev => [alertItem, ...prev]);

        addAlert('Nagios', 'critical', 'Payment Service Unhealthy', 'Pod payment-service-7f89d4c79-k8qzp crashed. Self-healing triggered.');

        setSelfHealingSteps(prev =>
          prev.map(s =>
            s.stepNumber === 3
              ? { ...s, status: 'alert', timestamp: alertTime, details: 'AlertManager fired CRITICAL alert to KubeOps Self-Healing controller.' }
              : s.stepNumber === 4
              ? { ...s, status: 'in-progress' }
              : s
          )
        );

        setSelfHealingLogs(prev => [
          `[${alertTime}] [ALERTMGMT] CRITICAL alert dispatched. PagerDuty Incident #8194 opened. Automated remediation triggered.`,
          ...prev
        ]);

        // Step 4: K8s Controller Auto-Restarts / Replaces Pod (after 2.6s)
        healingTimerRef.current = window.setTimeout(() => {
          const restartTime = new Date().toLocaleTimeString();
          setSelfHealingPhase('k8s_restarting');

          // Transition pod to Terminating & spin up replacement
          const replacementPodName = `payment-service-7f89d4c79-${Math.random().toString(36).substr(2, 5)}`;

          setPods(prev =>
            prev.map(p =>
              p.name === targetPodName
                ? {
                    ...p,
                    status: 'ContainerCreating',
                    name: replacementPodName,
                    restarts: 1,
                    age: '3s',
                    cpuUsage: '22m',
                    memUsage: '140Mi',
                    recentLogs: [
                      `[${restartTime}] [KUBELET] Pulling image "kubeops/payment-service:v2.4.1" (cached)`,
                      `[${restartTime}] [KUBELET] Successfully pulled image`,
                      `[${restartTime}] [KUBELET] Created container payment-service`,
                      `[${restartTime}] [KUBELET] Started container payment-service`
                    ]
                  }
                : p
            )
          );

          setSelfHealingSteps(prev =>
            prev.map(s =>
              s.stepNumber === 4
                ? { ...s, status: 'completed', timestamp: restartTime, details: `Kubelet restarted container into ${replacementPodName}. Pod scheduled on k8s-worker-node-01.` }
                : s.stepNumber === 5
                ? { ...s, status: 'in-progress' }
                : s
            )
          );

          setSelfHealingLogs(prev => [
            `[${restartTime}] [K8S RECONCILE] ReplicaSet reconciled. Container restarted in pod ${replacementPodName}.`,
            ...prev
          ]);

          addEvent('Kubernetes', 'info', `Auto-Healing: Replacement Pod ${replacementPodName}`, 'Container created and initialized by Kubelet');

          // Step 5: Health Check Verifies Recovery (after 2.4s)
          healingTimerRef.current = window.setTimeout(() => {
            const verifyTime = new Date().toLocaleTimeString();
            setSelfHealingPhase('verifying');

            // Pod is now Running
            setPods(prev =>
              prev.map(p =>
                p.deployment === 'payment-service'
                  ? {
                      ...p,
                      status: 'Running',
                      recentLogs: [
                        `[${verifyTime}] [INFO] [PaymentGateway] Initialized cleanly`,
                        `[${verifyTime}] [INFO] [HttpServer] Listening on :8080`,
                        `[${verifyTime}] [PROBE] Readiness check GET /healthz 200 OK (latency=4ms)`
                      ]
                    }
                  : p
              )
            );

            // Nagios returns to OK
            setNagiosServices(prev =>
              prev.map(svc =>
                svc.serviceDescription.includes('payment-service')
                  ? {
                      ...svc,
                      state: 'OK',
                      lastCheck: 'Just now',
                      statusInformation: 'HTTP OK: HTTP/1.1 200 OK - 84 bytes in 0.008 second response time',
                      attempt: '1/3'
                    }
                  : svc
              )
            );

            setSelfHealingSteps(prev =>
              prev.map(s =>
                s.stepNumber === 5
                  ? { ...s, status: 'completed', timestamp: verifyTime, details: 'Readiness probe returned HTTP 200 OK. Ingress traffic re-routed.' }
                  : s.stepNumber === 6
                  ? { ...s, status: 'in-progress' }
                  : s
              )
            );

            setSelfHealingLogs(prev => [
              `[${verifyTime}] [HEALTH PROBE] GET /healthz returned HTTP 200 OK. Nagios state restored to OK.`,
              ...prev
            ]);

            // Step 6: Full Recovery Completed (after 1.8s)
            healingTimerRef.current = window.setTimeout(() => {
              const recoverTime = new Date().toLocaleTimeString();
              setSelfHealingPhase('recovered');
              setInfrastructureHealth(98);
              setCpuUtilization(42);
              setMemoryUtilization(66);

              setSelfHealingSteps(prev =>
                prev.map(s =>
                  s.stepNumber === 6
                    ? { ...s, status: 'completed', timestamp: recoverTime, details: 'Incident auto-resolved in 11.2 seconds. Full cluster health restored.' }
                    : s
                )
              );

              setSelfHealingLogs(prev => [
                `[${recoverTime}] [AUTO-HEAL COMPLETE] Autonomous recovery verified! Mean Time to Recover (MTTR): 11.2s. 100% SLA preserved.`,
                ...prev
              ]);

              // Add to recovery history
              const newHistoryItem: SelfHealingHistoryItem = {
                id: `rec-${Date.now()}`,
                incidentId: `INC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
                timestamp: `${new Date().toISOString().split('T')[0]} ${recoverTime} UTC`,
                podName: targetPodName,
                namespace: 'production',
                node: 'k8s-worker-node-01',
                rootCause: failureType,
                remediationAction: 'Kubelet killed unresponsive container; automated rolling replacement booted and passed readiness probe within 11.2s',
                downtimeSeconds: 11,
                status: 'Recovered'
              };
              setRecoveryHistory(prev => [newHistoryItem, ...prev]);

              addEvent('Self-Healing', 'success', 'Autonomous Recovery Complete', 'Payment service recovered automatically with zero human intervention in 11.2s');

              // Trigger confetti celebration!
              try {
                confetti({
                  particleCount: 80,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ['#326ce5', '#10b981', '#6366f1', '#38bdf8']
                });
              } catch {
                // Ignore if in test env
              }
            }, 1800);
          }, 2400);
        }, 2600);
      }, 2200);
    }, 2200);
  };

  // -------------------------------------------------------------
  // Terraform Simulation
  // -------------------------------------------------------------
  const runTerraformPlan = () => {
    setIsTerraformRunning(true);
    setTerraformLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Running 'terraform plan' against AWS us-east-1...`,
      'Refreshing state for aws_vpc.kubeops_vpc...',
      'Refreshing state for aws_eks_cluster.prod_cluster...',
      'Refreshing state for aws_eks_node_group.workers...',
      'Plan: 1 to add, 1 to change, 0 to destroy.',
      '------------------------------------------------------------------------'
    ]);
    setTimeout(() => {
      setIsTerraformRunning(false);
    }, 1500);
  };

  const runTerraformApply = () => {
    setIsTerraformRunning(true);
    addEvent('Terraform', 'info', 'Terraform Apply Initiated', 'Applying infrastructure changes to AWS us-east-1');
    setTerraformLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Running 'terraform apply -auto-approve'...`,
      'aws_security_group_rule.ingress_nagios: Creating...',
      'aws_security_group_rule.ingress_nagios: Still creating... [10s elapsed]',
      'aws_security_group_rule.ingress_nagios: Creation complete after 12s [id=sgr-019928ab]',
      'Apply complete! Resources: 1 added, 1 changed, 0 destroyed.'
    ]);
    setTimeout(() => {
      setIsTerraformRunning(false);
      addEvent('Terraform', 'success', 'Terraform Apply Complete', 'All 7 AWS cloud resources matched configuration catalog');
    }, 2000);
  };

  const runTerraformDestroy = () => {
    setIsTerraformRunning(true);
    setTerraformLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] WARN: 'terraform destroy' simulation requested...`,
      'Simulated safeguard: Production cluster destroy blocked by state lock prevention.'
    ]);
    setTimeout(() => {
      setIsTerraformRunning(false);
    }, 1500);
  };

  // -------------------------------------------------------------
  // Ansible Simulation
  // -------------------------------------------------------------
  const runAnsiblePlaybook = (playbookId: string) => {
    setRunningPlaybookId(playbookId);
    const pb = ansiblePlaybooks.find(p => p.id === playbookId);
    if (!pb) return;

    addEvent('Ansible', 'info', `Ansible Playbook Started: ${pb.name}`, `Target hosts: ${pb.targetHosts.join(', ')}`);

    setTimeout(() => {
      setAnsiblePlaybooks(prev =>
        prev.map(p => (p.id === playbookId ? { ...p, lastRun: 'Just now', status: 'successful' } : p))
      );
      setRunningPlaybookId(null);
      addEvent('Ansible', 'success', `Ansible Playbook Finished: ${pb.name}`, `Tasks: ${pb.tasksTotal}/${pb.tasksTotal} executed successfully`);
    }, 2500);
  };

  // -------------------------------------------------------------
  // Puppet Simulation
  // -------------------------------------------------------------
  const enforcePuppetCompliance = (nodeId: string) => {
    setPuppetNodes(prev =>
      prev.map(n => {
        if (n.id === nodeId) {
          addEvent('Puppet', 'info', `Puppet Catalog Enforce: ${n.certname}`, 'Correcting detected configuration drift');
          return {
            ...n,
            compliancePercent: 100,
            status: 'compliant',
            drifts: [],
            lastCatalogApply: 'Just now'
          };
        }
        return n;
      })
    );
    setTimeout(() => {
      addEvent('Puppet', 'success', 'Puppet Compliance 100%', 'All node files and sysctl configs restored to catalog truth');
    }, 1200);
  };

  // -------------------------------------------------------------
  // Nagios Simulation
  // -------------------------------------------------------------
  const triggerNagiosCheck = (serviceId: string) => {
    setNagiosServices(prev =>
      prev.map(s => {
        if (s.id === serviceId) {
          return {
            ...s,
            lastCheck: 'Just now',
            statusInformation: s.statusInformation.replace(/in 0\.\d+ second/, 'in 0.009 second')
          };
        }
        return s;
      })
    );
    addEvent('Nagios', 'info', 'Nagios Immediate Check', `Synthetic active check dispatched for service`);
  };

  const acknowledgeNagiosAlert = (alertId: string) => {
    setNagiosAlerts(prev => prev.filter(a => a.id !== alertId));
    addEvent('Nagios', 'info', 'Alert Acknowledged', 'Operator marked alert as acknowledged');
  };

  // -------------------------------------------------------------
  // Jenkins Simulation
  // -------------------------------------------------------------
  const triggerJenkinsBuild = (pipelineId: string) => {
    const pipe = jenkinsPipelines.find(p => p.id === pipelineId);
    if (!pipe) return;

    addEvent('Jenkins', 'info', `Jenkins Build #${pipe.lastBuildNumber + 1} Started`, `Pipeline: ${pipe.name}`);

    // Set first stage to in-progress
    setJenkinsPipelines(prev =>
      prev.map(p => {
        if (p.id === pipelineId) {
          return {
            ...p,
            lastBuildNumber: p.lastBuildNumber + 1,
            lastBuildStatus: 'IN_PROGRESS',
            stages: p.stages.map((st, idx) => ({
              ...st,
              status: idx === 0 ? 'IN_PROGRESS' : 'PENDING'
            }))
          };
        }
        return p;
      })
    );

    // Simulate pipeline progression
    let currentStageIndex = 0;
    const stageInterval = setInterval(() => {
      currentStageIndex += 1;
      if (currentStageIndex < 5) {
        setJenkinsPipelines(prev =>
          prev.map(p => {
            if (p.id === pipelineId) {
              return {
                ...p,
                stages: p.stages.map((st, idx) => {
                  if (idx < currentStageIndex) return { ...st, status: 'SUCCESS' };
                  if (idx === currentStageIndex) return { ...st, status: 'IN_PROGRESS' };
                  return { ...st, status: 'PENDING' };
                })
              };
            }
            return p;
          })
        );
      } else {
        clearInterval(stageInterval);
        setJenkinsPipelines(prev =>
          prev.map(p => {
            if (p.id === pipelineId) {
              return {
                ...p,
                lastBuildStatus: 'SUCCESS',
                lastBuildDuration: '3m 15s',
                stages: p.stages.map(st => ({ ...st, status: 'SUCCESS' }))
              };
            }
            return p;
          })
        );
        addEvent('Jenkins', 'success', `Jenkins Build #${pipe.lastBuildNumber + 1} Succeeded`, 'Artifact deployed to Kubernetes prod-aws-us-east-1');
      }
    }, 1200);
  };

  const isSelfHealingActive = selfHealingPhase !== 'idle' && selfHealingPhase !== 'recovered';

  return (
    <KubeOpsContext.Provider
      value={{
        activePage,
        setActivePage,
        clusters,
        selectedCluster,
        setSelectedCluster,
        nodes,
        pods,
        deployments,
        namespaces,
        services,
        scaleDeployment,
        restartDeployment,
        deletePod,
        restartPod,
        terraformResources,
        terraformLogs,
        isTerraformRunning,
        runTerraformPlan,
        runTerraformApply,
        runTerraformDestroy,
        ansiblePlaybooks,
        ansibleHosts,
        runningPlaybookId,
        runAnsiblePlaybook,
        puppetNodes,
        enforcePuppetCompliance,
        nagiosHosts,
        nagiosServices,
        nagiosAlerts,
        triggerNagiosCheck,
        acknowledgeNagiosAlert,
        jenkinsPipelines,
        triggerJenkinsBuild,
        selfHealingPhase,
        selfHealingSteps,
        selfHealingLogs,
        recoveryHistory,
        simulatePodFailure,
        resetSelfHealing,
        isSelfHealingActive,
        cpuUtilization,
        memoryUtilization,
        infrastructureHealth,
        failedPodsCount,
        metricsHistory,
        events,
        alerts,
        dismissAlert,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen
      }}
    >
      {children}
    </KubeOpsContext.Provider>
  );
};

export const useKubeOps = (): KubeOpsContextType => {
  const context = useContext(KubeOpsContext);
  if (!context) {
    throw new Error('useKubeOps must be used within a KubeOpsProvider');
  }
  return context;
};

