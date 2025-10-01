#!/usr/bin/env python3
"""Test MCP servers using uv run (the correct method)"""

import subprocess
import json
import time
import sys

def test_mcp(path, name):
    print(f"\n{'='*60}")
    print(f"Testing {name}")
    print(f"Path: {path}")
    print('='*60)

    process = subprocess.Popen(
        ['uv', 'run', 'main.py'],
        cwd=path,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=0
    )

    # Give uv time to set up environment
    time.sleep(3)

    # Send initialize request
    init_req = json.dumps({
        'jsonrpc': '2.0',
        'id': 1,
        'method': 'initialize',
        'params': {
            'protocolVersion': '2024-11-05',
            'capabilities': {},
            'clientInfo': {'name': 'test', 'version': '1.0.0'}
        }
    }) + '\n'

    try:
        process.stdin.write(init_req)
        process.stdin.flush()
        print(f"[SENT] Initialize request")

        # Wait for response
        time.sleep(2)

        # Try to read response
        response = process.stdout.readline()
        if response:
            try:
                data = json.loads(response)
                if 'result' in data and 'serverInfo' in data['result']:
                    server_info = data['result']['serverInfo']
                    print(f"[SUCCESS] Server: {server_info.get('name')} v{server_info.get('version')}")

                    # Send tools/list request
                    tools_req = json.dumps({
                        'jsonrpc': '2.0',
                        'id': 2,
                        'method': 'tools/list'
                    }) + '\n'

                    process.stdin.write(tools_req)
                    process.stdin.flush()
                    time.sleep(1)

                    tools_response = process.stdout.readline()
                    if tools_response:
                        tools_data = json.loads(tools_response)
                        if 'result' in tools_data and 'tools' in tools_data['result']:
                            tool_count = len(tools_data['result']['tools'])
                            print(f"[SUCCESS] Tools registered: {tool_count}")
                            process.terminate()
                            return True

                    process.terminate()
                    return True
                else:
                    print(f"[ERROR] Unexpected response: {data}")
            except json.JSONDecodeError as e:
                print(f"[ERROR] Failed to parse response: {e}")
                print(f"Raw response: {response}")
        else:
            print(f"[TIMEOUT] No response received")

    except Exception as e:
        print(f"[ERROR] Exception: {e}")
    finally:
        try:
            process.terminate()
            process.wait(timeout=2)
        except:
            process.kill()

    return False

if __name__ == '__main__':
    base_path = r"C:\Users\User\mcp-servers\Crypto MCPs\Crypto-MCP-Suite\native\lib"

    mcps = [
        (f"{base_path}\\crypto-feargreed-mcp", "Crypto Fear & Greed"),
        (f"{base_path}\\crypto-portfolio-mcp", "Crypto Portfolio"),
        (f"{base_path}\\crypto-orderbook-mcp", "Crypto Orderbook"),
    ]

    results = {}
    for path, name in mcps:
        results[name] = test_mcp(path, name)

    print(f"\n\n{'='*60}")
    print("FINAL RESULTS")
    print('='*60)
    for name, success in results.items():
        status = "✅ WORKING" if success else "❌ FAILED"
        print(f"{name}: {status}")
