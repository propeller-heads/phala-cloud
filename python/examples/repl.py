from phala_cloud import create_client

client = create_client()

me = client.safe_get_current_user()
if me.ok:
    print("Current user:")
    print(me.data)
else:
    print(f"Error: {me.error}")

nodes = client.safe_get_available_nodes()
if nodes.ok and nodes.data:
    print(f"Available nodes: {len(nodes.data.nodes)}")
