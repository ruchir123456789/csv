import os
import sys
import subprocess
import threading
import signal
import time

def stream_output(process, prefix, color_code):
    """Streams and prefixes output from a subprocess."""
    reset_code = "\033[0m"
    try:
        for line in iter(process.stdout.readline, ""):
            if not line:
                break
            print(f"{color_code}{prefix}{reset_code} {line.rstrip()}")
    except Exception:
        pass

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("\n" + "=" * 65)
    print("  CSV Analyser & Product Intelligence Platform")
    print("  Starting Full-Stack System (Backend + Frontend)...")
    print("=" * 65)
    print("  * Backend API:  http://127.0.0.1:8000  (Docs: http://127.0.0.1:8000/docs)")
    print("  * Frontend UI:  http://localhost:5174  (or http://localhost:5173)")
    print("  * Press Ctrl+C to stop both servers at any time.")
    print("=" * 65 + "\n")

    # Determine executable commands
    python_exe = sys.executable
    npm_cmd = "npm.cmd" if sys.platform.startswith("win") else "npm"

    # Start Backend
    backend_cmd = [python_exe, "run.py"]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        shell=False
    )

    # Start Frontend
    frontend_cmd = [npm_cmd, "run", "dev"]
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=frontend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        shell=sys.platform.startswith("win")
    )

    # Output streaming threads
    cyan = "\033[96m"
    green = "\033[92m"

    t1 = threading.Thread(target=stream_output, args=(backend_proc, "[Backend]", cyan), daemon=True)
    t2 = threading.Thread(target=stream_output, args=(frontend_proc, "[Frontend]", green), daemon=True)
    t1.start()
    t2.start()

    def shutdown(sig=None, frame=None):
        print("\n\n[System] Gracefully shutting down Backend & Frontend...")
        for proc, name in [(backend_proc, "Backend"), (frontend_proc, "Frontend")]:
            try:
                if sys.platform.startswith("win"):
                    subprocess.call(["taskkill", "/F", "/T", "/PID", str(proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    proc.terminate()
            except Exception:
                pass
        print("[System] Both servers stopped cleanly.")
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    try:
        while True:
            # Check if any process terminated unexpectedly
            if backend_proc.poll() is not None:
                print(f"[Backend] Process exited with code {backend_proc.returncode}")
                break
            if frontend_proc.poll() is not None:
                print(f"[Frontend] Process exited with code {frontend_proc.returncode}")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        shutdown()

if __name__ == "__main__":
    main()
