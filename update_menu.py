import glob

files = glob.glob('*.html')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    start_idx = None
    end_idx = None
    
    for i, line in enumerate(lines):
        if 'function toggleMenu()' in line:
            start_idx = i
        if start_idx is not None and 'window.innerWidth > 768' in line:
            for j in range(i, min(i+10, len(lines))):
                if '});' in lines[j] and end_idx is None:
                    end_idx = j
                    break
    
    if start_idx is not None and end_idx is not None:
        new_lines = lines[:start_idx-1] + ['  <script src="menu.js"></script>\n\n'] + lines[end_idx+1:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f'Updated: {filepath} (lines {start_idx}-{end_idx})')
    else:
        print(f'No change: {filepath} (start={start_idx}, end={end_idx})')
