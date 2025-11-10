import { createClient, encryptEnvVars, watchCvmState } from "@phala/cloud";

const DOCKER_COMPOSE = `
services:
  jupyter:
    image: ghcr.io/kubeflow/kubeflow/notebook-servers/jupyter-pytorch-cuda:latest
    user: root
    environment:
      - GRANT_SUDO=yes
    ports:
      - "8888:8888"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    tty: true
    stdin_open: true
    restart: unless-stopped
`;

async function main() {
  const client = createClient();

  //
  // #1: provisioning CVM with compose file & instance type.
  //
  // That's the minimum requirement, and all resources will be automatically allocated.
  // In this example, we skip the contract-owned dstack app and use the default KMS instead,
  // which will return app_id and app_env_encrypt_pubkey if provisioning succeeds.
  //
  const provision = await client.provisionCvm({
    name: "my-tee-gpu",
    instance_type: "h200.small",
    compose_file: {
      docker_compose_file: DOCKER_COMPOSE,
    },
  });
  if (!provision.app_id || !provision.app_env_encrypt_pubkey) {
    throw new Error("Unxpected provisioning result: app_id or app_env_encrypt_pubkey not found.");
  }

  //
  // #2: Encrypt environment variables locally.
  //
  const encrypted = await encryptEnvVars(
    [{ key: "FOO", value: "helloworld" }],
    provision.app_env_encrypt_pubkey,
  );

  //
  // #3: Commit the CVM provisioning.
  //
  const result = await client.commitCvmProvision({
    app_id: provision.app_id,
    compose_hash: provision.compose_hash,
    encrypted_env: encrypted,
  });
  if (!result.vm_uuid || result.vm_uuid === null) {
    throw new Error("VM Create failed: vm_uuid is missing");
  }
  console.log(`CVM Created: ${result.vm_uuid}`);

  //
  // #4: (Optional) - watch the boot progress until it reaches the target state.
  //
  // A test API that streams the CVM boot state. The streaming will stop
  // once the CVM state reaches the target state.
  //
  //
  let last_progress: undefined | string = undefined;
  await watchCvmState(
    client,
    {
      id: result.vm_uuid,
      target: "running",
    },
    {
      onEvent: (state) => {
        if (state.type === "state" && state.data.boot_progress !== last_progress) {
          last_progress = state.data.boot_progress;
          console.log(`[${state.data.uptime}] ${last_progress}`);
        }
        if (state.type === "complete") {
          console.log(`CVM booted successfully.`);
        }
      },
    },
  );
}

main()
  .then(() => {})
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
