# KubeOps – Automated Kubernetes Infrastructure & Self-Healing Platform

> **Automate. Orchestrate. Monitor. Recover.**

KubeOps is an enterprise-grade DevOps platform prototype that integrates **Kubernetes**, **Docker**, **Terraform**, **Ansible**, **Puppet**, **Nagios**, and **Jenkins** into a centralized, dark-themed control center.

---

## 🌟 Key Features & Capabilities

### 1. 🛡️ Autonomous Self-Healing Center (Core Showcase)
Demonstrates the full closed-loop remediation workflow:
1. **Pod Failure Injected**: An application pod encounters an unhandled runtime error (e.g., OOMKilled exit code 137, Liveness probe timeout, or Segfault).
2. **Monitoring Detection**: Nagios synthetic probe detects connection refusal on port 8080.
3. **Alert Dispatched**: AlertManager and EventBus broadcast a `CRITICAL` alert.
4. **Kubelet & Controller Reconciliation**: Dead container is evicted and a zero-downtime replica is created.
5. **Health Check Verification**: Readiness and liveness `/healthz` endpoints verify HTTP 200 OK.
6. **System Restored**: Full SLA health is recovered, alert is cleared, and recovery is logged to the MTTR history with a celebration effect.
- **Interactive Controls**: Click **"Simulate Pod Failure"** from the header or dedicated Self-Healing page to trigger this animated multi-stage workflow with real-time logs.

### 2. 📊 Infrastructure Overview Dashboard
- **Telemetry Counters**: Total Clusters (AWS EKS v1.29), 3 Active Worker Nodes, 24 Running Pods, Failed Pods count, 42% CPU, 68% Memory, and 95% Infrastructure Health score.
- **Interactive Visualizations**: Real-time Area charts for CPU and Memory trends.
- **Event Stream**: Filterable real-time event log aggregated from Kubernetes, Nagios, Jenkins, Terraform, Ansible, and Puppet.
- **Active Alerts**: Dismissible alerts with severity indicators.

### 3. ☸️ Kubernetes Cluster Management
- **Node Fleet**: Status (Ready/Not Ready), CPU/RAM utilization bars, instance types (`m5.xlarge`), and pod capacity.
- **Pod Management**: Interactive table with namespace filtering (`production`, `staging`, `kube-system`, `monitoring`), live logs viewer, YAML manifest inspector, restart pod, and delete pod actions.
- **Deployments**: Desired vs. available replica scaling controls (`+` and `-`), rolling restart triggers, and YAML viewer.
- **Namespaces & Services**: Complete ClusterIP, NodePort, and LoadBalancer mapping.

### 4. 📜 Infrastructure Provisioning (Terraform IaC)
- **Tracked Resources**: AWS VPC (`10.0.0.0/16`), Public/Private Subnets, Internet & NAT Gateways, EKS Cluster, and Worker Node Autoscaling Groups.
- **Simulated Execution Terminal**: Interactive terminal running `terraform plan`, `terraform apply`, and `terraform destroy` with live streaming logs.
- **Execution Plan Diff**: Formatted colored diff output (`+` create, `~` update, `-` destroy).
- **HCL Configuration**: Syntax-highlighted `main.tf` inspector.

### 5. ⚙️ Configuration Management (Ansible & Puppet)
- **Ansible**:
  - Playbook history: Node bootstrapping, CIS benchmark audit, NRPE agent deployment.
  - Interactive "Run Playbook" simulation showing task-by-task execution (`ok`, `changed`, `failed`) and play recap.
  - Managed host fleet table with IP, OS, and ping latencies.
- **Puppet**:
  - Continuous compliance score tracking (98.8%).
  - Real-time catalog drift detection (e.g., unauthorized `/etc/security/limits.d` alteration).
  - One-click **"Enforce Catalog (Fix Drift)"** action that restores 100% compliance.

### 6. 🩺 Synthetic Monitoring (Nagios)
- Host availability status (4/4 hosts UP).
- Service checks matrix (HTTP `/healthz`, K8s API HTTPS, CPU Load, Memory, Disk Space, etcd health).
- Color-coded badges for `OK`, `WARNING`, and `CRITICAL` states (dynamically turns CRITICAL during failure simulation).
- Interactive synthetic re-check trigger and alert acknowledgement.

### 7. 🚀 CI/CD Delivery Pipelines (Jenkins)
- 5-stage declarative pipeline visualization:
  1. **Source Code Checkout** (Git commit hash, branch)
  2. **Build & Unit Tests** (Compilation)
  3. **Docker Image Creation** (Container tagging)
  4. **Automated Testing** (Integration tests)
  5. **Kubernetes Deployment** (Rolling update rollout)
- Console log inspector for each individual stage.
- **"Trigger Build"** button that simulates stage progression in real-time.

### 8. 🌐 Architecture Topology
- Interactive component diagram illustrating the relationship between AWS Cloud, Terraform, Ansible, Puppet, Docker, Kubernetes, Jenkins, Nagios, Prometheus & Grafana, and the Self-Healing feedback loop.
- Component inspection drawer detailing architectural role, inputs, outputs, and sample manifests.

### 9. ⚡ Global Productivity Tools
- **Command Palette (`Ctrl+K` or `⌘K`)**: Instant search and navigation across pods, nodes, playbooks, and commands.
- **Cluster Switcher**: Multi-cluster selector (`prod-aws-us-east-1`, `staging-eu-west-1`).
- **Notification Drawer**: Slide-over panel with active alerts and raw audit event stream.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti
- **Typography**: Inter & JetBrains Mono

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
npm run preview
```
Open [http://localhost:4173](http://localhost:4173) in your browser.
