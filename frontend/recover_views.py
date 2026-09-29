import json, os, glob, re

log_files = glob.glob(r'C:\Users\ashok\.gemini\antigravity\brain\*\.system_generated\logs\transcript.jsonl')
recovered = {}

for lf in log_files:
    with open(lf, 'r', encoding='utf-8') as f:
        for line in f:
            try: data = json.loads(line)
            except: continue
            
            if data.get('type') == 'TOOL_RESPONSE' and data.get('source') == 'ENVIRONMENT':
                content = data.get('content', '')
                if 'File Path: `file:///' in content:
                    # extract path
                    path_match = re.search(r'File Path: `file:///(.+?)`', content)
                    if path_match:
                        file_path = path_match.group(1).replace('/', '\\')
                        
                        if 'CampusGuard' in file_path and file_path.endswith('.jsx'):
                            # Check if the current file is 0 bytes or doesn't exist
                            if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
                                # extract lines
                                lines = []
                                capture = False
                                for c_line in content.split('\n'):
                                    if 'The following code has been modified' in c_line:
                                        capture = True
                                        continue
                                    if 'The above content shows the entire' in c_line:
                                        capture = False
                                        continue
                                    if capture:
                                        # line is like "1: import React from 'react';"
                                        match = re.match(r'^\d+: (.*)$', c_line)
                                        if match:
                                            lines.append(match.group(1))
                                        elif re.match(r'^\d+:$', c_line):
                                            lines.append("")
                                            
                                if lines:
                                    recovered[file_path] = '\n'.join(lines)

print(f'Found {len(recovered)} files from view_file.')
for k, v in recovered.items():
    v = v.replace('data-[theme=light]:', 'light:')
    with open(k, 'w', encoding='utf-8') as out:
        out.write(v)
