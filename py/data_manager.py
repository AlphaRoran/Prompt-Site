#!/usr/bin/env python3
# py/data_manager.py
import json
import sys
from typing import Any, Dict

def load_data(filename: str) -> Dict[str, Any]:
    with open(filename, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data: Dict[str, Any], filename: str) -> None:
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def list_templates(data: Dict[str, Any]) -> None:
    templates = data.get("templates", [])
    if not templates:
        print("No templates found.")
        return
    for t in templates:
        print(f"Template ID: {t.get('id')}, Name: {t.get('name')}")

def main():
    if len(sys.argv) < 3:
        print("Usage: python data_manager.py [load|save|list] filename")
        sys.exit(1)
    command = sys.argv[1]
    filename = sys.argv[2]
    if command == "load":
        data = load_data(filename)
        print(json.dumps(data, indent=2))
    elif command == "save":
        # For demonstration, we'll save an empty structure
        data = {
            "promptParts": {"persona": [], "goal": [], "context": [], "tone": []},
            "templates": [],
            "agents": [],
            "promptHistory": []
        }
        save_data(data, filename)
        print(f"Data saved to {filename}")
    elif command == "list":
        data = load_data(filename)
        list_templates(data)
    else:
        print("Unknown command.")

if __name__ == "__main__":
    main()
