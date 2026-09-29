import json, os, glob
log_files = glob.glob(r'C:\Users\ashok\.gemini\antigravity\brain\*\.system_generated\logs\transcript.jsonl')
recovered = {}

for lf in log_files:
    with open(lf, 'r', encoding='utf-8') as f:
        for line in f:
            try: data = json.loads(line)
            except: continue
            if 'tool_calls' in data:
                for tc in data['tool_calls']:
                    name = tc.get('name', '')
                    if 'write_to_file' in name:
                        args = tc.get('arguments') or tc.get('args', {})
                        if isinstance(args, str):
                            try: args = json.loads(args)
                            except: continue
                        
                        raw_target = args.get('TargetFile', '')
                        if not raw_target: continue
                        
                        target = raw_target[1:-1] if raw_target.startswith('"') else raw_target
                        
                        if 'CampusGuard' in target and target.endswith('.jsx'):
                            raw_code = args.get('CodeContent', '')
                            if raw_code.startswith('"'):
                                code = raw_code[1:-1].replace('\\n', '\n').replace('\\"', '"')
                            else:
                                code = raw_code
                            recovered[target.replace('/', '\\')] = code

print(f'Found {len(recovered)} files to recover.')
for k, v in recovered.items():
    v = v.replace('data-[theme=light]:', 'light:')
    k = k.replace('\\\\', '\\')
    os.makedirs(os.path.dirname(k), exist_ok=True)
    with open(k, 'w', encoding='utf-8') as out:
        out.write(v)
