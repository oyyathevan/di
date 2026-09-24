import os

# Define the folder structure
project_root = "dti-notes"
folders = [
    project_root,
    os.path.join(project_root, "css"),
    os.path.join(project_root, "js")
]

files = [
    "index.html",
    "unit1.html",
    "unit2.html",
    "unit3.html",
    "unit4.html",
    "unit5.html",
    "templates.html",
    "resources.html",
    "lesson-plan.html",
    os.path.join("css", "style.css","extras.css"),
    os.path.join("js", "nav.js")
]

# Create folders
for folder in folders:
    os.makedirs(folder, exist_ok=True)

# Create files
for file in files:
    file_path = os.path.join(project_root, file)
    with open(file_path, "w") as f:
        f.write("")  # empty file

print("Project structure created successfully!")
