import shutil
from pathlib import Path


def remove_pycache(root_dir: str = "."):
    root = Path(root_dir).resolve()
    print(f"Cleaning cache files in: {root}\n")

    dirs_removed = 0
    files_removed = 0

    # 1. Remove all __pycache__ directories
    for cache_dir in root.rglob("__pycache__"):
        if cache_dir.is_dir():
            try:
                shutil.rmtree(cache_dir)
                print(f"[REMOVED DIR]  {cache_dir.relative_to(root)}")
                dirs_removed += 1
            except Exception as e:
                print(f"[ERROR] Could not remove {cache_dir}: {e}")

    # 2. Remove any standalone .pyc or .pyo files outside __pycache__
    for pattern in ("*.pyc", "*.pyo"):
        for cache_file in root.rglob(pattern):
            if cache_file.is_file():
                try:
                    cache_file.unlink()
                    print(f"[REMOVED FILE] {cache_file.relative_to(root)}")
                    files_removed += 1
                except Exception as e:
                    print(f"[ERROR] Could not remove {cache_file}: {e}")

    print("\n--- Summary ---")
    print(f"Directories removed: {dirs_removed}")
    print(f"Files removed:       {files_removed}")


if __name__ == "__main__":
    remove_pycache()