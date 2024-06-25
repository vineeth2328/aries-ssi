# Indy Network Setup Instructions

## Step 1: Navigate to k8s Directory

```sh
cd /home/ubuntu/k8s
```

## Step 2: Create EFS in the Same EKS Network

1. Create an EFS in the same EKS network.
2. Get the EFS ID and place it in `pv.yaml`.
3. Apply the Persistent Volume configuration:

```sh
kubectl apply -f pv.yaml
```

## Step 3: Apply Persistent Volume Claim

```sh
kubectl apply -f pvc.yaml
```

## Step 4: Start Indy Network

1. Navigate to the Indy Kubernetes directory:

```sh
cd /home/ubuntu/k8s/indy-k8s
```

2. Apply all configurations in the directory:

```sh
kubectl apply -f .
```

3. Once all containers are running, check if the `indyweb` deployment is running.

4. Get the EXTERNAL-IP of `indyweb`:

```sh
kubectl get svc
```

5. Open a browser and copy the above output along with port `8000`.

## Step 5: Register DIDs for Agents in Indyweb Portal

1. Copy the `--seed 'holder00000000000000000000000123'` from each agent deployment file.
2. Register in the Indyweb portal.

## Step 6: Run PostgreSQL DB for All Agents

1. Navigate to the Aries DB directory:

```sh
cd /home/ubuntu/k8s/aries-db
```

2. Apply the configurations:

```sh
kubectl apply -f .
```

## Step 7: Run Aries Cloud Agents

1. Navigate to the Aries Kubernetes directory:

```sh
cd /home/ubuntu/k8s/aries-k8s
```

2. Apply the configurations:

```sh
kubectl apply -f .
```

---
