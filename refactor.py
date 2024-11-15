import os
import re
from tqdm import tqdm

directory = os.getcwd()  # get the current working directory

# Create log files
files_created_log = open("files_created.log", "w")
functions_copied_log = open("functions_copied.log", "w")

# Get a list of all files to process
files_to_process = []
for root, dirs, files in os.walk(directory):
    if 'node-modules' in dirs:
        dirs.remove('node-modules')  # exclude node-modules folder
    if '.next' in dirs:
        dirs.remove('.next')  # exclude node-modules folder
    for file in files:
        files_to_process.append(os.path.join(root, file))

# Process files
for file_path in tqdm(files_to_process):
    file = os.path.basename(file_path)
    if file.endswith(".ts"):  # assuming TypeScript files
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            functions = re.findall(r"function\s+([^\(]+)\s*\([^)]*\)", content)
            for func in functions:
                if 'brand' in func:  # case sensitive search
                    new_func = func.replace('brand', 'unit')
                    new_content = content.replace(f"function {func}", f"function {new_func}")
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    functions_copied_log.write(f"Copied function {func} to {new_func} in file {file}\n")
            # Add 'unit' to code without replacing 'brand'
            content = re.sub(r'const\s+\{([^}]*)\}\s*=\s*parsedBody\.data;', lambda match: f'const {{{match.group(1)}, unit}} = parsedBody.data;', content)
            content = re.sub(r'if\s*\(\!\s*brandRow\)', lambda match: f'{match.group(0)}\nif (!unitRow)', content)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
    if 'Brand' in file:  # case sensitive search
        new_file = file.replace('Brand', 'Unit')
        new_file_path = os.path.join(os.path.dirname(file_path), new_file)
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        content = content.replace('Brand', 'Unit')  # replace 'Brand' with 'Unit' in file content
        with open(new_file_path, "w", encoding="utf-8") as f:
            f.write(content)
        files_created_log.write(f"Created file {new_file} from {file}\n")

# Close log files
files_created_log.close()
functions_copied_log.close()