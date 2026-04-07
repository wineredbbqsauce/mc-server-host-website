const state = {
  view: "home",
  servers: [
    {
      id: 1,
      name: "SurvivalWorld",
      type: "Paper",
      version: "1.20.4",
      host: "localhost",
      port: "25565",
      status: "online",
      players: "3/20",
      ram: "1.2 GB",
    },
    {
      id: 2,
      name: "CreativePlot",
      type: "Spigot",
      version: "1.20.1",
      host: "192.168.1.100",
      port: "25566",
      status: "offline",
      players: "0/10",
      ram: "—",
    },
  ],
  activeServer: null,
  activeTab: "console",
  createStep: 0,
  newServer: {
    name: "",
    type: "paper",
    version: "1.20.4",
    hostType: "localhost",
    ip: "",
    port: "25565",
    ram: "2",
  },
  consoleLines: [
    { t: "info", m: "[10:23:41] Server started on port 25565" },
    { t: "info", m: '[10:23:42] Loading world "SurvivalWorld"...' },
    { t: "ok", m: "[10:23:45] World loaded successfully" },
    { t: "info", m: '[10:23:45] Done (3.2s)! For help, type "help"' },
    { t: "join", m: "[10:31:02] Steve joined the game" },
    { t: "join", m: "[10:34:11] Alex joined the game" },
    { t: "info", m: "[10:45:33] [Steve] hello everyone!" },
    { t: "join", m: "[10:52:01] Notch joined the game" },
  ],
  plugins: [
    { name: "EssentialsX", version: "2.20.1", icon: "⚡", enabled: true },
    { name: "WorldEdit", version: "7.2.15", icon: "🗺", enabled: true },
    { name: "Vault", version: "1.7.3", icon: "🔑", enabled: true },
    { name: "LuckPerms", version: "5.4.98", icon: "🔒", enabled: true },
    { name: "WorldGuard", version: "7.0.9", icon: "🛡", enabled: false },
    { name: "DiscordSRV", version: "1.27.0", icon: "💬", enabled: false },
  ],
  files: [
    { name: "server.jar", size: "45.2 MB", type: "file", icon: "📦" },
    { name: "server.properties", size: "2.1 KB", type: "file", icon: "📝" },
    { name: "eula.txt", size: "0.2 KB", type: "file", icon: "📄" },
    { name: "world", size: "—", type: "folder", icon: "📁" },
    { name: "plugins", size: "—", type: "folder", icon: "📁" },
    { name: "logs", size: "—", type: "folder", icon: "📁" },
    { name: "crash-reports", size: "—", type: "folder", icon: "📁" },
    { name: "banned-players.json", size: "0.3 KB", type: "file", icon: "📄" },
  ],
};

// ── helpers ──────────────────────────────────────────────────────────────────

function badge(status) {
  const el = document.createElement("span");
  el.className = `badge badge-${status}`;
  const dot = document.createElement("span");
  dot.className = "badge-dot";
  el.appendChild(dot);
  el.appendChild(document.createTextNode(status));
  return el;
}

function updateServer(id, updates) {
  state.servers = state.servers.map((s) =>
    s.id === id ? { ...s, ...updates } : s,
  );
  if (state.activeServer && state.activeServer.id === id) {
    state.activeServer = { ...state.activeServer, ...updates };
  }
}

// ── render ────────────────────────────────────────────────────────────────────

function render() {
  renderTopbar();
  const body = document.getElementById("body");
  body.innerHTML = "";
  if (state.view === "home") body.appendChild(renderHome());
  else if (state.view === "create") body.appendChild(renderCreate());
  else if (state.view === "server") body.appendChild(renderServerDetail());
}

// ── Topbar ────────────────────────────────────────────────────────────────────

function renderTopbar() {
  const bc = document.getElementById("breadcrumb");
  bc.innerHTML = "";

  if (state.view === "home") return;

  const back = document.createElement("button");
  back.className = "back-btn";
  back.textContent = "← Tilbake";
  back.onclick = () => {
    state.view = "home";
    state.activeServer = null;
    render();
  };
  bc.appendChild(back);

  if (state.activeServer) {
    const sep = document.createElement("span");
    sep.className = "breadcrumb-sep";
    sep.textContent = "/";
    const name = document.createElement("span");
    name.className = "breadcrumb-name";
    name.textContent = state.activeServer.name;
    bc.appendChild(sep);
    bc.appendChild(name);
  }
}

// ── Home ──────────────────────────────────────────────────────────────────────

function renderHome() {
  const div = document.createElement("div");
  div.className = "view";

  const online = state.servers.filter((s) => s.status === "online").length;

  const header = document.createElement("div");
  header.className = "home-header";
  header.innerHTML = `<div><h1>Dine servere</h1><p>${online} av ${state.servers.length} servere kjører</p></div>`;
  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-green";
  addBtn.textContent = "+ Ny server";
  addBtn.onclick = () => {
    state.view = "create";
    state.createStep = 0;
    state.newServer = {
      name: "",
      type: "paper",
      version: "1.20.4",
      hostType: "localhost",
      ip: "",
      port: "25565",
      ram: "2",
    };
    render();
  };
  header.appendChild(addBtn);
  div.appendChild(header);

  const list = document.createElement("div");
  list.className = "server-list";

  state.servers.forEach((s) => {
    const card = document.createElement("div");
    card.className = "server-card";
    card.onclick = () => {
      state.activeServer = s;
      state.view = "server";
      state.activeTab = "console";
      render();
    };

    const icon = document.createElement("div");
    icon.className = `server-icon ${s.status === "online" ? "online" : "offline"}`;
    icon.textContent = "🎮";

    const info = document.createElement("div");
    info.className = "server-info";

    const nameRow = document.createElement("div");
    nameRow.className = "server-name-row";
    const nameEl = document.createElement("span");
    nameEl.className = "server-name";
    nameEl.textContent = s.name;
    nameRow.appendChild(nameEl);
    nameRow.appendChild(badge(s.status));

    const meta = document.createElement("div");
    meta.className = "server-meta";
    meta.innerHTML = `<span>${s.type} ${s.version}</span><span>⊙ ${s.host}:${s.port}</span>${s.status === "online" ? `<span style="color:var(--text2)">👥 ${s.players}</span>` : ""}`;

    info.appendChild(nameRow);
    info.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "server-actions";

    if (s.status === "online") {
      const stopBtn = document.createElement("button");
      stopBtn.className = "btn btn-red";
      stopBtn.textContent = "Stop";
      stopBtn.onclick = (e) => {
        e.stopPropagation();
        updateServer(s.id, {
          status: "offline",
          players: "0/" + s.players.split("/")[1],
          ram: "—",
        });
        render();
      };
      actions.appendChild(stopBtn);
    } else {
      const startBtn = document.createElement("button");
      startBtn.className = "btn btn-start";
      startBtn.textContent = "Start";
      startBtn.onclick = (e) => {
        e.stopPropagation();
        updateServer(s.id, { status: "starting" });
        render();
        setTimeout(() => {
          updateServer(s.id, { status: "online", ram: "1.0 GB" });
          render();
        }, 1500);
      };
      actions.appendChild(startBtn);
    }

    card.appendChild(icon);
    card.appendChild(info);
    card.appendChild(actions);
    list.appendChild(card);
  });

  div.appendChild(list);
  return div;
}

// ── Create Server ─────────────────────────────────────────────────────────────

function renderCreate() {
  const wrap = document.createElement("div");
  wrap.className = "create-wrap";
  const inner = document.createElement("div");
  inner.className = "create-inner";

  const h1 = document.createElement("h1");
  h1.textContent = "Opprett ny server";
  inner.appendChild(h1);

  // name field (always visible)
  const nameGroup = document.createElement("div");
  nameGroup.className = "form-group";
  nameGroup.innerHTML = '<label class="form-label">Servernavn</label>';
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "MinServer";
  nameInput.className = "form-input";
  nameInput.value = state.newServer.name;
  nameInput.oninput = (e) => {
    state.newServer.name = e.target.value;
  };
  nameGroup.appendChild(nameInput);
  inner.appendChild(nameGroup);

  // Steps indicator
  const stepsLabels = ["Servertype", "Vertskap", "Oppsummering"];
  const stepsEl = document.createElement("div");
  stepsEl.className = "steps";
  stepsLabels.forEach((label, i) => {
    const item = document.createElement("div");
    item.className = "step-item" + (i < stepsLabels.length - 1 ? " grow" : "");

    const numEl = document.createElement("div");
    numEl.className =
      "step-num " +
      (i < state.createStep
        ? "done"
        : i === state.createStep
          ? "active"
          : "pending");
    numEl.textContent = i < state.createStep ? "✓" : String(i + 1);

    const labelEl = document.createElement("span");
    labelEl.className =
      "step-label " + (i === state.createStep ? "active" : "pending");
    labelEl.textContent = label;

    item.appendChild(numEl);
    item.appendChild(labelEl);

    if (i < stepsLabels.length - 1) {
      const line = document.createElement("div");
      line.className = "step-line";
      item.appendChild(line);
    }
    stepsEl.appendChild(item);
  });
  inner.appendChild(stepsEl);

  // Step content
  const content = document.createElement("div");

  if (state.createStep === 0) {
    const types = [
      { id: "paper", name: "Paper", desc: "Raskest, beste ytelse", icon: "📄" },
      { id: "spigot", name: "Spigot", desc: "Populær og stabil", icon: "🔧" },
      { id: "vanilla", name: "Vanilla", desc: "Ren Minecraft", icon: "🍦" },
      { id: "fabric", name: "Fabric", desc: "Moddingstøtte", icon: "🧵" },
    ];
    const grid = document.createElement("div");
    grid.className = "type-grid";
    types.forEach((t) => {
      const card = document.createElement("div");
      card.className =
        "type-card" + (state.newServer.type === t.id ? " selected" : "");
      card.innerHTML = `<div class="type-icon">${t.icon}</div><div class="type-name">${t.name}</div><div class="type-desc">${t.desc}</div>`;
      card.onclick = () => {
        state.newServer.type = t.id;
        grid
          .querySelectorAll(".type-card")
          .forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
      };
      grid.appendChild(card);
    });
    content.appendChild(grid);

    const versions = ["1.21.1", "1.20.4", "1.20.1", "1.19.4", "1.18.2"];
    const vg = document.createElement("div");
    vg.className = "form-group";
    vg.innerHTML = '<label class="form-label">Versjon</label>';
    const sel = document.createElement("select");
    sel.className = "form-select";
    versions.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      if (v === state.newServer.version) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.onchange = (e) => {
      state.newServer.version = e.target.value;
    };
    vg.appendChild(sel);
    content.appendChild(vg);
  } else if (state.createStep === 1) {
    const hostGrid = document.createElement("div");
    hostGrid.className = "host-grid";
    const hostTypes = [
      {
        id: "localhost",
        name: "Localhost",
        desc: "Kjør på denne PCen",
        icon: "💻",
      },
      {
        id: "ip",
        name: "Ekstern IP",
        desc: "Koble til egen server",
        icon: "🌐",
      },
    ];
    hostTypes.forEach((h) => {
      const card = document.createElement("div");
      card.className =
        "host-card" + (state.newServer.hostType === h.id ? " selected" : "");
      card.innerHTML = `<div class="host-icon">${h.icon}</div><div class="host-name">${h.name}</div><div class="host-desc">${h.desc}</div>`;
      card.onclick = () => {
        state.newServer.hostType = h.id;
        hostGrid
          .querySelectorAll(".host-card")
          .forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        render_ip_fields();
      };
      hostGrid.appendChild(card);
    });
    content.appendChild(hostGrid);

    const ipContainer = document.createElement("div");
    ipContainer.id = "ip-fields";
    content.appendChild(ipContainer);

    function render_ip_fields() {
      ipContainer.innerHTML = "";
      if (state.newServer.hostType === "ip") {
        const g = document.createElement("div");
        g.className = "form-group";
        g.innerHTML = '<label class="form-label">Server IP / Hostname</label>';
        const inp = document.createElement("input");
        inp.type = "text";
        inp.placeholder = "f.eks. 192.168.1.100 eller min-server.no";
        inp.className = "form-input";
        inp.value = state.newServer.ip;
        inp.oninput = (e) => {
          state.newServer.ip = e.target.value;
        };
        g.appendChild(inp);
        ipContainer.appendChild(g);
      }
      const row = document.createElement("div");
      row.className = "form-row";
      // Port
      const pg = document.createElement("div");
      pg.className = "form-group";
      pg.innerHTML = '<label class="form-label">Port</label>';
      const pi = document.createElement("input");
      pi.type = "text";
      pi.className = "form-input";
      pi.value = state.newServer.port;
      pi.style.fontFamily = "var(--font-mono)";
      pi.oninput = (e) => {
        state.newServer.port = e.target.value;
      };
      pg.appendChild(pi);
      row.appendChild(pg);
      // RAM
      const rg = document.createElement("div");
      rg.className = "form-group";
      rg.innerHTML = '<label class="form-label">RAM</label>';
      const rs = document.createElement("select");
      rs.className = "form-select";
      ["1", "2", "4", "6", "8"].forEach((v) => {
        const o = document.createElement("option");
        o.value = v;
        o.textContent = v + " GB";
        if (v === state.newServer.ram) o.selected = true;
        rs.appendChild(o);
      });
      rs.onchange = (e) => {
        state.newServer.ram = e.target.value;
      };
      rg.appendChild(rs);
      row.appendChild(rg);
      ipContainer.appendChild(row);
    }
    render_ip_fields();
  } else {
    const host =
      state.newServer.hostType === "localhost"
        ? "localhost"
        : state.newServer.ip || "—";
    const rows = [
      ["Navn", state.newServer.name || "—"],
      ["Type", state.newServer.type + " " + state.newServer.version],
      [
        "Vertskap",
        state.newServer.hostType === "localhost"
          ? "Localhost"
          : "Ekstern IP: " + host,
      ],
      ["Port", state.newServer.port],
      ["RAM", state.newServer.ram + " GB"],
    ];
    const table = document.createElement("div");
    table.className = "summary-table";
    rows.forEach(([k, v]) => {
      const row = document.createElement("div");
      row.className = "summary-row";
      row.innerHTML = `<span class="summary-key">${k}</span><span class="summary-val">${v}</span>`;
      table.appendChild(row);
    });
    content.appendChild(table);
  }

  inner.appendChild(content);

  // Footer
  const footer = document.createElement("div");
  footer.className = "create-footer";

  const prevBtn = document.createElement("button");
  prevBtn.className = "btn btn-ghost";
  prevBtn.textContent = state.createStep === 0 ? "Avbryt" : "← Tilbake";
  prevBtn.onclick = () => {
    if (state.createStep === 0) {
      state.view = "home";
    } else {
      state.createStep--;
    }
    render();
  };
  footer.appendChild(prevBtn);

  if (state.createStep < 2) {
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn btn-green";
    nextBtn.textContent = "Neste →";
    nextBtn.onclick = () => {
      state.createStep++;
      render();
    };
    footer.appendChild(nextBtn);
  } else {
    const createBtn = document.createElement("button");
    createBtn.className = "btn btn-green2";
    createBtn.textContent = "✓ Opprett server";
    createBtn.onclick = () => {
      const ns = {
        id: Date.now(),
        name: state.newServer.name || "NyServer",
        type:
          state.newServer.type.charAt(0).toUpperCase() +
          state.newServer.type.slice(1),
        version: state.newServer.version,
        host:
          state.newServer.hostType === "localhost"
            ? "localhost"
            : state.newServer.ip || "localhost",
        port: state.newServer.port,
        status: "offline",
        players: "0/20",
        ram: "—",
      };
      state.servers.push(ns);
      state.view = "home";
      render();
    };
    footer.appendChild(createBtn);
  }

  inner.appendChild(footer);
  wrap.appendChild(inner);
  return wrap;
}

// ── Server Detail ─────────────────────────────────────────────────────────────

function renderServerDetail() {
  const s = state.activeServer;
  const wrap = document.createElement("div");
  wrap.className = "server-detail";

  // Top bar
  const topBar = document.createElement("div");
  topBar.className = "detail-topbar";
  const titleRow = document.createElement("div");
  titleRow.className = "detail-title-row";
  const nameEl = document.createElement("span");
  nameEl.className = "detail-name";
  nameEl.textContent = s.name;
  const hostEl = document.createElement("span");
  hostEl.className = "detail-host";
  hostEl.textContent = s.host + ":" + s.port;
  titleRow.appendChild(nameEl);
  titleRow.appendChild(badge(s.status));
  titleRow.appendChild(hostEl);

  const actions = document.createElement("div");
  actions.className = "detail-actions";

  function refreshActions() {
    actions.innerHTML = "";
    if (s.status === "online" || s.status === "starting") {
      const r = document.createElement("button");
      r.className = "btn btn-yellow";
      r.textContent = "Restart";
      r.onclick = () => {
        updateServer(s.id, { status: "starting" });
        render();
        setTimeout(() => {
          updateServer(s.id, { status: "online" });
          render();
        }, 1500);
      };
      const stop = document.createElement("button");
      stop.className = "btn btn-red";
      stop.textContent = "Stop";
      stop.onclick = () => {
        updateServer(s.id, {
          status: "offline",
          players: "0/" + s.players.split("/")[1],
          ram: "—",
        });
        render();
      };
      actions.appendChild(r);
      actions.appendChild(stop);
    } else {
      const start = document.createElement("button");
      start.className = "btn btn-start";
      start.textContent = "▶ Start";
      start.onclick = () => {
        updateServer(s.id, { status: "starting" });
        render();
        setTimeout(() => {
          updateServer(s.id, { status: "online", ram: "1.1 GB" });
          render();
        }, 1500);
      };
      actions.appendChild(start);
    }
  }
  refreshActions();

  topBar.appendChild(titleRow);
  topBar.appendChild(actions);
  wrap.appendChild(topBar);

  // Body
  const body = document.createElement("div");
  body.className = "detail-body";

  // Sidebar
  const sidebar = document.createElement("div");
  sidebar.className = "sidebar-tabs";
  const tabs = [
    { id: "console", label: "Konsoll", icon: ">_", cls: "console-icon" },
    { id: "files", label: "Filer", icon: "📁" },
    { id: "plugins", label: "Plugins", icon: "🔌" },
    { id: "software", label: "Software", icon: "⚙" },
  ];
  tabs.forEach((t) => {
    const btn = document.createElement("button");
    btn.className =
      "tab-btn" +
      (t.cls ? " " + t.cls : "") +
      (state.activeTab === t.id ? " active" : "");
    btn.textContent = t.icon;
    btn.setAttribute("data-tip", t.label);
    btn.onclick = () => {
      state.activeTab = t.id;
      renderTabContent();
    };
    sidebar.appendChild(btn);
  });
  body.appendChild(sidebar);

  // Tab content container
  const tabWrap = document.createElement("div");
  tabWrap.id = "tab-wrap";
  tabWrap.style.cssText = "flex:1;display:flex;overflow:hidden;";
  body.appendChild(tabWrap);

  function renderTabContent() {
    // Update active tab button styles
    sidebar.querySelectorAll(".tab-btn").forEach((btn, i) => {
      btn.classList.toggle("active", tabs[i].id === state.activeTab);
    });
    tabWrap.innerHTML = "";
    if (state.activeTab === "console") tabWrap.appendChild(renderConsole());
    else if (state.activeTab === "files") tabWrap.appendChild(renderFiles());
    else if (state.activeTab === "plugins")
      tabWrap.appendChild(renderPlugins());
    else
      tabWrap.appendChild(
        renderEmpty("⚙", "Software-administrasjon kommer snart"),
      );
  }

  renderTabContent();
  wrap.appendChild(body);
  return wrap;
}

// ── Console ───────────────────────────────────────────────────────────────────

function renderConsole() {
  const wrap = document.createElement("div");
  wrap.className = "console-wrap";

  const output = document.createElement("div");
  output.className = "console-output";

  function appendLine(l) {
    const div = document.createElement("div");
    div.className = "log-" + (l.t || "info");
    div.textContent = l.m;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
  }
  state.consoleLines.forEach(appendLine);

  const inputRow = document.createElement("div");
  inputRow.className = "console-input-row";
  const prompt = document.createElement("span");
  prompt.className = "console-prompt";
  prompt.textContent = ">";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "console-input";
  input.placeholder = "Skriv kommando...";
  input.onkeydown = (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      const line = {
        t: "info",
        m: "[" + new Date().toLocaleTimeString("no") + "] " + input.value,
      };
      state.consoleLines.push(line);
      appendLine(line);
      input.value = "";
    }
  };
  inputRow.appendChild(prompt);
  inputRow.appendChild(input);
  wrap.appendChild(output);
  wrap.appendChild(inputRow);
  return wrap;
}

// ── Files ─────────────────────────────────────────────────────────────────────

function renderFiles() {
  const wrap = document.createElement("div");
  wrap.className = "files-wrap";
  const header = document.createElement("div");
  header.className = "files-header";
  header.innerHTML = '<span class="files-path">/ root</span>';
  const newBtn = document.createElement("button");
  newBtn.className = "btn btn-ghost";
  newBtn.style.fontSize = "12px";
  newBtn.style.padding = "5px 12px";
  newBtn.textContent = "+ Ny fil";
  header.appendChild(newBtn);
  wrap.appendChild(header);

  const list = document.createElement("div");
  list.className = "file-list";
  state.files.forEach((f) => {
    const row = document.createElement("div");
    row.className = "file-row";
    row.innerHTML = `<span class="file-icon">${f.icon}</span><span class="file-name">${f.name}</span><span class="file-size">${f.size}</span>`;
    list.appendChild(row);
  });
  wrap.appendChild(list);
  return wrap;
}

// ── Plugins ───────────────────────────────────────────────────────────────────

function renderPlugins() {
  const wrap = document.createElement("div");
  wrap.className = "plugins-wrap";

  const header = document.createElement("div");
  header.style.cssText =
    "display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;";
  header.innerHTML =
    '<span style="font-size:13px;color:var(--text2)">Installerte plugins</span>';
  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-green";
  addBtn.style.fontSize = "12px";
  addBtn.style.padding = "6px 14px";
  addBtn.textContent = "+ Legg til";
  header.appendChild(addBtn);
  wrap.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "plugin-grid";
  state.plugins.forEach((p, idx) => {
    const card = document.createElement("div");
    card.className = "plugin-card";
    card.innerHTML = `
      <div class="plugin-icon">${p.icon}</div>
      <div class="plugin-info">
        <div class="plugin-name">${p.name}</div>
        <div class="plugin-ver">v${p.version}</div>
      </div>`;
    const toggle = document.createElement("div");
    toggle.className = "toggle" + (p.enabled ? " on" : "");
    toggle.onclick = () => {
      state.plugins[idx].enabled = !state.plugins[idx].enabled;
      toggle.classList.toggle("on", state.plugins[idx].enabled);
    };
    card.appendChild(toggle);
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
  return wrap;
}

// ── Empty state ───────────────────────────────────────────────────────────────

function renderEmpty(icon, msg) {
  const div = document.createElement("div");
  div.className = "empty-state";
  div.innerHTML = `<div class="empty-icon">${icon}</div><p>${msg}</p>`;
  return div;
}

// ── Boot ──────────────────────────────────────────────────────────────────────

render();
