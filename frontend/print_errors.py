import json
with open('eslint_report.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
for file in data:
    for msg in file.get('messages', []):
        if msg.get('ruleId') is not None:
            print(f"{file['filePath']}:{msg['line']} - {msg['ruleId']} : {msg['message']}")
