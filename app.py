"""
MC Panel - Flask backend

Administrerer alt - Starter / Stopper Minecraft Servere som subprosesser.

Kjører med Python app.py
"""

import os
import json
import subprocess
import threading
import urllib.request
from pathlib import Path
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app) # tillat requests fra index.html

# Mappe der alle serverene lages
SERVERS_DIR = Path("servers")
SERVERS_DIR.mkdir(exist_ok=True)

# I minne: akrive prosesser { server_name: {"process": Popen, "port": int, "logs": [str]} }
running_servers: dict = {}

def server_dir(name: str) -> Path:
    return SERVERS_DIR / name

def server_meta_path(name: str) -> Path: 
    return server_dir(name) / "mcpanel_meta.json"

def load_meta(name: str) -> dict:
    p = server_meta_path(name)
    if p.exists():
        return json.loads(p.read_text())
    return {}

def save_meta(name: str, meta: dict):
    server_meta_path(name).write_text(json.dumps(meta, indent=2))

def is_running(name: str) -> bool:
    entry = running_servers.get(name)
    if not entry:
        return False
    return entry["process"].poll() is None # None = prosessen kjører fortsatt

def get_jar_url(version: str) -> str:
    """Hent nedlastings url for spesifik minecraft server versjon fra Mojang API"""
    manifest_url = "https://launchermeta.mojang.com/mc/game/version_manifest.json"
    with urllib.request.urlopen(manifest_url, timeout=10) as resp:
        manifest = json.loads(resp,read())
    
    for v in manifest["version"]:
        if v["id"] == version:
            with urllib.request.urlopen(v["url"], timeout=10) as resp2:
                version_data = json.loads(resp2.read())
            return version_data["downloads"]["server"]["url"]
    
    raise ValueError(f"Versjon '${version}' ikke funnet")

def downloadJar(name: str, version: str):
    """Last ned server.jar til server-mappen (blokkerende - kjøre i thread)"""
    jarPath = serverDir(name) / "server.jar"
    if jarPath.exists():
        return # Allerede lastet ned
    
    url = get_jar_url(version)
    urllib.request.urlretrieve(url, jarPath)

def readOutput(name: str, process):
    """ Les stdout fra serverprosessen og lagre i log-buffer"""
    entry = running_servers.setdefault(name, {"process": process, "logs": []})
    for line in iter(process.stdout.readline, b""):
        decoded = line.decode("utf-8", errors="replace").rstrip()
        entry["logs"].append(decoded)
        if len(entry["logs"]) > 500: # maks 500 linjer i minne
            entry["logs"].pop(0)
        process.stdout.close()

# --
# Api-endepunkter
# --

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/api/servers", methods=["GET"])
def listServers():
    """List alle servere (lagret på disk)"""
    servers = []
    for d in SERVERS_DIR.iterdir():
        if d.is_dir():
            meta = load_meta(d.name)
            servers.append({
                "name": d.name,
                "version": mete.get("version", "ukjent"),
                "port": meta.get("port", "?"),
                "maxPlayers": meta.get("maxPlayers", 20),
                "gamemode": meta.get("gamemode", "survival"),
                "running": is_running(d.name),
            })
        return jsonify(servers)

@app.route("/api/servers", methods=["POST"])
def create_server():
    """
    Opprett ny server
    Body (JSON): { name, version, port, maxPlayers, gamemode }
    """
    data = request.json
    name = data.get("name", "").strip().replace(" ", "-")
    version = data.get("version", "1.21.14")
    port = int(data.get("port", 25565))
    max_players = int(data.get("maxPlayers", 20))
    gamemode = data.get("gamemode", "survival")

    if not name:
        if path.exists():
            return jsonify({"error": f"Server '{name}' finnes allerede"}), 409
    path.mkdir(parents=True)

    # Lagre meta
    save_meta(name, {
        "version": version,
        "port": port,
        "maxPlayers": max_players,
        "gamemode": gamemode,
    })

    # Aksepter EULA
    (path / "eula.txt").write_text("eula=true\n")

    #server.properies
    props = f"""Server-port={port}
    max_players={max_players}
    gamemode={gamemode}
    online-mode=false
    level-name=world
    motd=MCPanel - {name}
    """
    (path / "server.properties").write_text(props)
    

    def bg_download():
        try:
            download_jar(name, version)
        except Exception as e:
            save_meta(name, {**load_meta(name), "download_error": str(e)})
    threading.Thread(target=bg_download, daemon=True).start()

    return jsonify({"message": f"Server '{name}' opprettes...", "name": name}), 201

@app.route("/api/servers/<name>/start", methods=["POST"])
def start_server(name: str):
    if is_running(name):
        return jsonify({"error": "Serveren kjører allerede"}), 400
    jar_path = server_dir(name) / "server.jar"
    if not jar_path.exists():
        return jsonify({"error": "server.jar ikke funnet - venter på nedlasting?"}), 400
    
    meta = load_meta(name)
    memory = request.json.get("memory", "1024") if request.json else "1024"

    process = subprocess.Popen(
        ["java", f"-Xmx{memory}M", f"-Xms{memory}M", "-jar", "server.jar", "nogui"],
        cwd=server_dir(name),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        stdin=subprocess.PIPE,
    )
    running_servers[name] = {"process": process, "port": meta.get("port"), "logs": []}

    # les output i bakgrunnen
    thread.Threead(target=read_output, args=(name, process), daemon=True).start()

    return jsonify({"message": f"Server '{name}' startet på port {meta.get('port')}"})

@app.route("/api/servers/<name>/stop", methods=["POST"])
def stop_server(name: str):
    if not is_running(name):
        return jsonify({"error": "Serveren kjører ikke"}), 400
    
    entry = running_servers[name]
    try:
        entry["process"].stdin.write(b"stop\n")
        entry["process"].stdin.flush()
    except Exception:
        entry["process"].terminate()
    
    return jsonify({"message": f"Stopp-kommando sendt til '{name}'"})

@app.route("/api/servers/<name>/logs", methods=["GET"])
def get_logs(name: str):
    entry = running_servers.get(name)
    logs = entry["logs"] if entry else []
    return jsonify({"logs": logs})

@app.route("/api/servers/<name>/command", methods=["POST"])
def send_command(name: str):
    """Send en kommando til serverens stdin (f.eks. 'say Hello')"""
    if not is_running(name):
        return jsonify({"error": "Serveren kjører ikke"}), 400
    
    cmd = request.json.get("command", "")
    if not cmd:
        return jsonify({"error": "Ingen kommando"}),400
    
    entry = running_servers[name]
    entry["process"].stdin.write((cmd + "\n").encode())
    entry["process"].stdin.flush()
    return jsonify({"message": f"Kommando sendt: {cmd}"})

@app.route("/api/servers/<name>", methods=["DELETE"])
def delete_server(name: str):
    if is_running(name):
        return jsonify({"error": "Stopp serveren før du sletter den"}), 400
    import shutil
    path = server_dir(name)
    if not path.exists():
        return jsonify({"error": "Server ikke funnet"}), 404
    shutil.rmtree(path)
    return jsonify({"message": f"Server '{name}' slettet"})

# ------------------------------
if __name__ =="__main__":
    print("MCPanel kjører på http://localhost:5000")
    app.run(debug=True, port=5000)