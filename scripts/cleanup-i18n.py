
import re

file_path = 'client/src/contexts/i18n.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

current_lang = None
seen_keys = {
    'en': set(),
    'zh': set()
}
duplicate_indices = []

# Regex to match key-value pairs like: "key": "value",
# It should capture the key content inside the quotes
key_regex = re.compile(r'^\s*"([^"]+)"\s*:\s*')

for i, line in enumerate(lines):
    trimmed = line.strip()

    # Detect start of language blocks
    if trimmed == 'en: {':
        current_lang = 'en'
        continue
    if trimmed == 'zh: {':
        current_lang = 'zh'
        continue

    # Detect end of language blocks
    if (current_lang == 'en' or current_lang == 'zh') and trimmed.startswith('},'):
        current_lang = None
        continue

    if current_lang:
        # Check for comments
        if trimmed.startswith('//'):
            continue

        match = key_regex.match(line)
        if match:
            key = match.group(1)
            if key in seen_keys[current_lang]:
                print(f"Duplicate found in {current_lang}: {key} at line {i + 1}")
                duplicate_indices.append(i)
            else:
                seen_keys[current_lang].add(key)

print(f"Total duplicates found: {len(duplicate_indices)}")

if duplicate_indices:
    new_lines = [line for i, line in enumerate(lines) if i not in duplicate_indices]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print('Fixed duplicates and wrote back to file.')
