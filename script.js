// ========== APPLICATION STATE ==========
const App = {
  view: "home",
  servers: [],
  activeServer: null,
  activeTab: "console",
  createStep: 0,
  newServer: {
    name: "",
    type: "paper",
    version: "1.21.1",
    hostType: "localhost",
    ip: "",
    port: "25565",
    ram: "2",
  },
};

// ========== ICON HELPER ==========
function icon(name, size = "20px", color = "currentColor", filled = false) {
  const span = document.createElement("span");
  span.className = "material-symbols-outlined";
  span.textContent = name;
  span.style.fontSize = size;
  span.style.color = color;
  span.style.fontVariationSettings = `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`;
  return span;
}

// ========== STATUS BADGE ==========
function createBadge(status) {
  const badge = document.createElement("span");
  badge.className = `badge badge-${status}`;

  const dot = document.createElement("span");
  dot.className = "badge-dot";
  badge.appendChild(dot);
  badge.appendChild(
    document.createTextNode(status.charAt(0).toUpperCase() + status.slice(1)),
  );

  return badge;
}

// ========== BUTTON FACTORY ==========
function createButton(text, style, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.onclick = onClick;

  const classMap = {
    green: "btn btn-green",
    red: "btn btn-red",
    yellow: "btn btn-yellow",
    ghost: "btn btn-ghost",
    start: "btn btn-start",
    green2: "btn btn-green2",
  };

  btn.className = classMap[style] || "btn btn-ghost";
  return btn;
}

// ========== RENDER MAIN VIEW ==========
function render() {
  renderBreadcrumb();
  const container = document.getElementById("body");
  container.innerHTML = "";

  if (App.view === "home") renderHome(container);
  else if (App.view === "create") renderCreate(container);
  else if (App.view === "server") renderServerDetail(container);
}

// ========== BREADCRUMB ==========
function renderBreadcrumb() {
  const bc = document.getElementById("breadcrumb");
  bc.innerHTML = "";

  if (App.view === "home") return;

  const backBtn = document.createElement("button");
  backBtn.className = "back-btn";
  backBtn.onclick = () => {
    App.view = "home";
    App.activeServer = null;
    render();
  };

  backBtn.appendChild(icon("arrow_back", "16px"));
  backBtn.appendChild(document.createTextNode("Back"));
  bc.appendChild(backBtn);

  if (App.activeServer) {
    const sep = document.createElement("span");
    sep.className = "breadcrumb-sep";
    sep.textContent = "/";
    bc.appendChild(sep);

    const name = document.createElement("span");
    name.className = "breadcrumb-name";
    name.textContent = App.activeServer.name;
    bc.appendChild(name);
  }
}

// ========== HOME VIEW ==========
function renderHome(container) {
  const viewDiv = document.createElement("div");
  viewDiv.className = "view";

  const header = document.createElement("div");
  header.className = "home-header";

  const titleDiv = document.createElement("div");
  const onlineCount = App.servers.filter((s) => s.status === "online").length;
  titleDiv.innerHTML = `
    <h1>Your Servers</h1>
    <p>${onlineCount} of ${App.servers.length} servers running</p>
  `;
  header.appendChild(titleDiv);

  const addBtn = createButton("+ New Server", "green", () => {
    App.view = "create";
    App.createStep = 0;
    App.newServer = {
      name: "",
      type: "paper",
      version: "1.21.1",
      hostType: "localhost",
      ip: "",
      port: "25565",
      ram: "2",
    };
    render();
  });
  header.appendChild(addBtn);
  viewDiv.appendChild(header);

  if (App.servers.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      <div class="empty-icon">${icon("dns", "48px", "#64748b").outerHTML}</div>
      <p>No servers yet</p>
    `;

    const createFirst = createButton("Create Server", "green", () => {
      App.view = "create";
      render();
    });
    empty.appendChild(createFirst);
    viewDiv.appendChild(empty);
  } else {
    const list = document.createElement("div");
    list.className = "server-list";

    App.servers.forEach((server) => {
      const card = document.createElement("div");
      card.className = "server-card";
      card.onclick = () => {
        App.activeServer = { ...server };
        App.view = "server";
        App.activeTab = "console";
        render();
      };

      const iconWrapper = document.createElement("div");
      iconWrapper.className = `server-icon ${server.status === "online" ? "online" : "offline"}`;
      iconWrapper.appendChild(icon("sports_esports", "24px"));
      card.appendChild(iconWrapper);

      const info = document.createElement("div");
      info.className = "server-info";

      const nameRow = document.createElement("div");
      nameRow.className = "server-name-row";

      const nameEl = document.createElement("span");
      nameEl.className = "server-name";
      nameEl.textContent = server.name;
      nameRow.appendChild(nameEl);
      nameRow.appendChild(createBadge(server.status));
      info.appendChild(nameRow);

      const meta = document.createElement("div");
      meta.className = "server-meta";
      meta.innerHTML = `
        <span>${server.type} ${server.version}</span>
        <span>${server.host}:${server.port}</span>
        ${server.status === "online" ? `<span>${icon("group", "14px").outerHTML} ${server.players}</span>` : ""}
      `;
      info.appendChild(meta);
      card.appendChild(info);

      const actions = document.createElement("div");
      actions.className = "server-actions";

      if (server.status === "online") {
        actions.appendChild(
          createButton("Stop", "red", (e) => {
            e.stopPropagation();
            server.status = "offline";
            server.ram = "—";
            render();
          }),
        );
      } else {
        actions.appendChild(
          createButton("Start", "start", (e) => {
            e.stopPropagation();
            server.status = "starting";
            render();
            setTimeout(() => {
              server.status = "online";
              server.ram = "1.2 GB";
              render();
            }, 1500);
          }),
        );
      }
      card.appendChild(actions);

      list.appendChild(card);
    });

    viewDiv.appendChild(list);
  }

  container.appendChild(viewDiv);
}

// ========== CREATE SERVER VIEW ==========
function renderCreate(container) {
  const wrap = document.createElement("div");
  wrap.className = "create-wrap";

  const inner = document.createElement("div");
  inner.className = "create-inner";

  const title = document.createElement("h1");
  title.textContent = "Create New Server";
  inner.appendChild(title);

  const nameGroup = document.createElement("div");
  nameGroup.className = "form-group";
  nameGroup.innerHTML = '<label class="form-label">Server Name</label>';

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.className = "form-input";
  nameInput.placeholder = "MyServer";
  nameInput.value = App.newServer.name;
  nameInput.oninput = (e) => (App.newServer.name = e.target.value);
  nameGroup.appendChild(nameInput);
  inner.appendChild(nameGroup);

  const steps = ["Server Type", "Hosting", "Summary"];
  const stepsDiv = document.createElement("div");
  stepsDiv.className = "steps";

  steps.forEach((label, i) => {
    const stepItem = document.createElement("div");
    stepItem.className = "step-item" + (i < 2 ? " grow" : "");

    const num = document.createElement("div");
    const isActive = i === App.createStep;
    const isDone = i < App.createStep;
    num.className = `step-num ${isDone ? "done" : isActive ? "active" : "pending"}`;
    num.textContent = isDone ? "✓" : i + 1;
    stepItem.appendChild(num);

    const labelSpan = document.createElement("span");
    labelSpan.className = `step-label ${isActive ? "active" : "pending"}`;
    labelSpan.textContent = label;
    stepItem.appendChild(labelSpan);

    if (i < 2) {
      const line = document.createElement("div");
      line.className = "step-line";
      stepItem.appendChild(line);
    }

    stepsDiv.appendChild(stepItem);
  });
  inner.appendChild(stepsDiv);

  const contentDiv = document.createElement("div");

  if (App.createStep === 0) {
    const types = [
      {
        id: "paper",
        name: "Paper",
        desc: "Best performance",
        icon: "description",
      },
      { id: "spigot", name: "Spigot", desc: "Popular & stable", icon: "build" },
      {
        id: "vanilla",
        name: "Vanilla",
        desc: "Pure Minecraft",
        icon: "icecream",
      },
      { id: "fabric", name: "Fabric", desc: "Mod support", icon: "weave" },
    ];

    const grid = document.createElement("div");
    grid.className = "type-grid";

    types.forEach((t) => {
      const card = document.createElement("div");
      card.className = `type-card ${App.newServer.type === t.id ? "selected" : ""}`;
      card.onclick = () => {
        App.newServer.type = t.id;
        const allCards = grid.querySelectorAll(".type-card");
        allCards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
      };

      card.innerHTML = `
        <div class="type-icon">${icon(t.icon, "20px").outerHTML}</div>
        <div class="type-name">${t.name}</div>
        <div class="type-desc">${t.desc}</div>
      `;
      grid.appendChild(card);
    });
    contentDiv.appendChild(grid);

    const versionDiv = document.createElement("div");
    versionDiv.className = "form-group";
    versionDiv.innerHTML = '<label class="form-label">Version</label>';

    const select = document.createElement("select");
    select.className = "form-select";
    ["1.21.1", "1.20.4", "1.20.1", "1.19.4", "1.18.2"].forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      if (v === App.newServer.version) opt.selected = true;
      select.appendChild(opt);
    });
    select.onchange = (e) => (App.newServer.version = e.target.value);
    versionDiv.appendChild(select);
    contentDiv.appendChild(versionDiv);
  } else if (App.createStep === 1) {
    const hostTypes = [
      {
        id: "localhost",
        name: "Localhost",
        desc: "Run on this PC",
        icon: "computer",
      },
      {
        id: "ip",
        name: "External IP",
        desc: "Connect to remote",
        icon: "public",
      },
    ];

    const hostGrid = document.createElement("div");
    hostGrid.className = "host-grid";

    hostTypes.forEach((h) => {
      const card = document.createElement("div");
      card.className = `host-card ${App.newServer.hostType === h.id ? "selected" : ""}`;
      card.onclick = () => {
        App.newServer.hostType = h.id;
        const allCards = hostGrid.querySelectorAll(".host-card");
        allCards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");

        const ipFieldContainer = document.getElementById("ip-field-container");
        if (ipFieldContainer) {
          ipFieldContainer.style.display = h.id === "ip" ? "block" : "none";
        }
      };
      card.innerHTML = `
        <div class="host-icon">${icon(h.icon, "24px").outerHTML}</div>
        <div class="host-name">${h.name}</div>
        <div class="host-desc">${h.desc}</div>
      `;
      hostGrid.appendChild(card);
    });
    contentDiv.appendChild(hostGrid);

    const ipContainer = document.createElement("div");
    ipContainer.id = "ip-field-container";
    ipContainer.style.display =
      App.newServer.hostType === "ip" ? "block" : "none";

    const ipDiv = document.createElement("div");
    ipDiv.className = "form-group";
    ipDiv.innerHTML = '<label class="form-label">Server IP / Hostname</label>';
    const ipInput = document.createElement("input");
    ipInput.type = "text";
    ipInput.className = "form-input";
    ipInput.placeholder = "e.g. 192.168.1.100";
    ipInput.value = App.newServer.ip;
    ipInput.oninput = (e) => (App.newServer.ip = e.target.value);
    ipDiv.appendChild(ipInput);
    ipContainer.appendChild(ipDiv);
    contentDiv.appendChild(ipContainer);

    const row = document.createElement("div");
    row.className = "form-row";

    const portDiv = document.createElement("div");
    portDiv.className = "form-group";
    portDiv.innerHTML = '<label class="form-label">Port</label>';
    const portInput = document.createElement("input");
    portInput.type = "text";
    portInput.className = "form-input";
    portInput.value = App.newServer.port;
    portInput.oninput = (e) => (App.newServer.port = e.target.value);
    portDiv.appendChild(portInput);
    row.appendChild(portDiv);

    const ramDiv = document.createElement("div");
    ramDiv.className = "form-group";
    ramDiv.innerHTML = '<label class="form-label">RAM</label>';
    const ramSelect = document.createElement("select");
    ramSelect.className = "form-select";
    ["1", "2", "4", "6", "8"].forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v + " GB";
      if (v === App.newServer.ram) opt.selected = true;
      ramSelect.appendChild(opt);
    });
    ramSelect.onchange = (e) => (App.newServer.ram = e.target.value);
    ramDiv.appendChild(ramSelect);
    row.appendChild(ramDiv);

    contentDiv.appendChild(row);
  } else {
    const summary = document.createElement("div");
    summary.className = "summary-table";

    const rows = [
      ["Name", App.newServer.name || "—"],
      ["Type", App.newServer.type + " " + App.newServer.version],
      [
        "Host",
        App.newServer.hostType === "localhost"
          ? "Localhost"
          : App.newServer.ip || "—",
      ],
      ["Port", App.newServer.port],
      ["RAM", App.newServer.ram + " GB"],
    ];

    rows.forEach(([key, val]) => {
      const row = document.createElement("div");
      row.className = "summary-row";
      row.innerHTML = `<span class="summary-key">${key}</span><span class="summary-val">${val}</span>`;
      summary.appendChild(row);
    });
    contentDiv.appendChild(summary);
  }

  inner.appendChild(contentDiv);

  const footer = document.createElement("div");
  footer.className = "create-footer";

  footer.appendChild(
    createButton(App.createStep === 0 ? "Cancel" : "← Back", "ghost", () => {
      if (App.createStep === 0) {
        App.view = "home";
        render();
      } else {
        App.createStep--;
        render();
      }
    }),
  );

  if (App.createStep < 2) {
    footer.appendChild(
      createButton("Next →", "green", () => {
        App.createStep++;
        render();
      }),
    );
  } else {
    footer.appendChild(
      createButton("✓ Create Server", "green2", () => {
        const newServer = {
          id: Date.now(),
          name: App.newServer.name || "NewServer",
          type:
            App.newServer.type.charAt(0).toUpperCase() +
            App.newServer.type.slice(1),
          version: App.newServer.version,
          host:
            App.newServer.hostType === "localhost"
              ? "localhost"
              : App.newServer.ip || "localhost",
          port: App.newServer.port,
          status: "offline",
          players: "0/20",
          ram: "—",
        };
        App.servers.push(newServer);
        App.view = "home";
        render();
      }),
    );
  }

  inner.appendChild(footer);
  wrap.appendChild(inner);
  container.appendChild(wrap);
}

// ========== SERVER DETAIL VIEW ==========
function renderServerDetail(container) {
  const server = App.activeServer;
  if (!server) return;

  const detailDiv = document.createElement("div");
  detailDiv.className = "server-detail";

  const topbar = document.createElement("div");
  topbar.className = "detail-topbar";

  const titleRow = document.createElement("div");
  titleRow.className = "detail-title-row";

  function updateTitleRow() {
    titleRow.innerHTML = `
      <span class="detail-name">${server.name}</span>
      ${createBadge(server.status).outerHTML}
      <span class="detail-host">${server.host}:${server.port}</span>
    `;
  }
  updateTitleRow();
  topbar.appendChild(titleRow);

  const actions = document.createElement("div");
  actions.className = "detail-actions";

  function updateActions() {
    actions.innerHTML = "";
    if (server.status === "online") {
      actions.appendChild(
        createButton("Restart", "yellow", () => {
          server.status = "starting";
          updateTitleRow();
          updateActions();
          updateContent();
          setTimeout(() => {
            server.status = "online";
            updateTitleRow();
            updateActions();
            updateContent();
          }, 1500);
        }),
      );
      actions.appendChild(
        createButton("Stop", "red", () => {
          server.status = "offline";
          server.ram = "—";
          updateTitleRow();
          updateActions();
          updateContent();
        }),
      );
    } else if (server.status === "starting") {
      actions.appendChild(createButton("Starting...", "yellow", () => {}));
    } else {
      actions.appendChild(
        createButton("▶ Start", "start", () => {
          server.status = "starting";
          updateTitleRow();
          updateActions();
          updateContent();
          setTimeout(() => {
            server.status = "online";
            server.ram = "1.2 GB";
            updateTitleRow();
            updateActions();
            updateContent();
          }, 1500);
        }),
      );
    }
  }

  topbar.appendChild(actions);
  detailDiv.appendChild(topbar);

  const body = document.createElement("div");
  body.className = "detail-body";

  const sidebar = document.createElement("div");
  sidebar.className = "sidebar-tabs";

  const content = document.createElement("div");
  content.style.cssText =
    "flex: 1; padding: 16px; overflow: auto; background: #0a0c0f;";

  const tabs = [
    { id: "console", icon: "terminal", label: "Console", cls: "console-icon" },
    { id: "files", icon: "folder", label: "Files" },
    { id: "plugins", icon: "extension", label: "Plugins" },
    { id: "settings", icon: "settings", label: "Settings" },
  ];

  function updateActiveTab() {
    const allTabBtns = sidebar.querySelectorAll(".tab-btn");
    allTabBtns.forEach((btn, index) => {
      const tab = tabs[index];
      if (tab && tab.id === App.activeTab) {
        btn.classList.add("active");
        btn.style.background = "#1f242f";
        btn.style.color = "#4ade80";
      } else {
        btn.classList.remove("active");
        btn.style.background = "transparent";
        btn.style.color = "#64748b";
      }
    });
  }

  function updateContent() {
    content.innerHTML = "";

    if (App.activeTab === "console") {
      const consoleWrap = document.createElement("div");
      consoleWrap.className = "console-wrap";

      const output = document.createElement("div");
      output.className = "console-output";

      const logs = [
        { t: "info", m: "[10:23:41] Server thread started" },
        {
          t: "info",
          m: `[10:23:42] Loading server on ${server.host}:${server.port}`,
        },
        { t: "ok", m: '[10:23:45] Done! Type "help" for commands' },
        { t: "join", m: "[10:31:02] Steve joined the game" },
        { t: "info", m: "[10:34:11] Alex joined the game" },
        { t: "info", m: "[10:45:33] [Steve] Hello everyone!" },
      ];

      logs.forEach((log) => {
        const line = document.createElement("div");
        line.className = `log-${log.t}`;
        line.textContent = log.m;
        output.appendChild(line);
      });
      consoleWrap.appendChild(output);

      const inputRow = document.createElement("div");
      inputRow.className = "console-input-row";
      inputRow.innerHTML = '<span class="console-prompt">></span>';

      const input = document.createElement("input");
      input.type = "text";
      input.className = "console-input";
      input.placeholder = "Type command...";

      input.onkeydown = (e) => {
        if (e.key === "Enter" && input.value.trim()) {
          const newLog = {
            t: "info",
            m: `[${new Date().toLocaleTimeString()}] ${input.value}`,
          };
          const line = document.createElement("div");
          line.className = `log-${newLog.t}`;
          line.textContent = newLog.m;
          output.appendChild(line);
          output.scrollTop = output.scrollHeight;
          input.value = "";
        }
      };

      inputRow.appendChild(input);
      consoleWrap.appendChild(inputRow);
      content.appendChild(consoleWrap);
    } else if (App.activeTab === "files") {
      const filesWrap = document.createElement("div");
      filesWrap.className = "files-wrap";

      const header = document.createElement("div");
      header.className = "files-header";
      header.innerHTML = `
        <span class="files-path">/ home / ${server.name}</span>
        <button class="btn btn-ghost" style="font-size: 12px; padding: 5px 12px;">+ New</button>
      `;
      filesWrap.appendChild(header);

      const fileList = document.createElement("div");
      fileList.className = "file-list";

      const files = [
        { name: "server.jar", size: "45.2 MB", type: "file", icon: "draft" },
        {
          name: "server.properties",
          size: "2.1 KB",
          type: "file",
          icon: "draft",
        },
        { name: "eula.txt", size: "0.2 KB", type: "file", icon: "draft" },
        { name: "world", size: "—", type: "folder", icon: "folder" },
        { name: "world_nether", size: "—", type: "folder", icon: "folder" },
        { name: "world_the_end", size: "—", type: "folder", icon: "folder" },
        { name: "plugins", size: "—", type: "folder", icon: "folder" },
        { name: "logs", size: "—", type: "folder", icon: "folder" },
      ];

      files.forEach((f) => {
        const row = document.createElement("div");
        row.className = "file-row";
        row.innerHTML = `
          <span class="file-icon">${icon(f.icon, "15px", f.type === "folder" ? "#60a5fa" : "#94a3b8").outerHTML}</span>
          <span class="file-name">${f.name}</span>
          <span class="file-size">${f.size}</span>
        `;
        fileList.appendChild(row);
      });

      filesWrap.appendChild(fileList);
      content.appendChild(filesWrap);
    } else if (App.activeTab === "plugins") {
      const pluginsWrap = document.createElement("div");
      pluginsWrap.className = "plugins-wrap";

      const header = document.createElement("div");
      header.style.cssText =
        "display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;";
      header.innerHTML = `
        <span style="font-size: 13px; color: #94a3b8;">Installed plugins</span>
        <button class="btn btn-green" style="font-size: 12px; padding: 6px 14px;">+ Add</button>
      `;
      pluginsWrap.appendChild(header);

      const grid = document.createElement("div");
      grid.className = "plugin-grid";

      const plugins = [
        { name: "EssentialsX", version: "2.20.1", enabled: true },
        { name: "WorldEdit", version: "7.2.15", enabled: true },
        { name: "Vault", version: "1.7.3", enabled: true },
        { name: "LuckPerms", version: "5.4.98", enabled: true },
        { name: "WorldGuard", version: "7.0.9", enabled: false },
        { name: "DiscordSRV", version: "1.27.0", enabled: false },
      ];

      plugins.forEach((p) => {
        const card = document.createElement("div");
        card.className = "plugin-card";
        card.innerHTML = `
          <div class="plugin-icon">${icon("extension", "18px", "#4ade80").outerHTML}</div>
          <div class="plugin-info">
            <div class="plugin-name">${p.name}</div>
            <div class="plugin-ver">v${p.version}</div>
          </div>
        `;

        const toggle = document.createElement("div");
        toggle.className = `toggle ${p.enabled ? "on" : ""}`;
        toggle.onclick = (e) => {
          e.stopPropagation();
          p.enabled = !p.enabled;
          toggle.classList.toggle("on", p.enabled);
        };
        card.appendChild(toggle);
        grid.appendChild(card);
      });

      pluginsWrap.appendChild(grid);
      content.appendChild(pluginsWrap);
    } else if (App.activeTab === "settings") {
      content.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Server Settings</h3>
          <div style="background: #11141a; border: 1px solid #1e2535; border-radius: 8px; padding: 16px;">
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 13px; color: #94a3b8; margin-bottom: 6px;">Server Name</label>
              <input type="text" value="${server.name}" style="width: 100%; background: #1f242f; border: 1px solid #1e2535; border-radius: 6px; color: #e2e8f0; padding: 8px 12px; font-size: 13px;">
            </div>
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 13px; color: #94a3b8; margin-bottom: 6px;">MOTD</label>
              <input type="text" value="Welcome to ${server.name}!" style="width: 100%; background: #1f242f; border: 1px solid #1e2535; border-radius: 6px; color: #e2e8f0; padding: 8px 12px; font-size: 13px;">
            </div>
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 13px; color: #94a3b8; margin-bottom: 6px;">Max Players</label>
              <input type="number" value="20" style="width: 100%; background: #1f242f; border: 1px solid #1e2535; border-radius: 6px; color: #e2e8f0; padding: 8px 12px; font-size: 13px;">
            </div>
            <button class="btn btn-green" style="width: 100%;">Save Changes</button>
          </div>
        </div>
      `;
    }
  }

  tabs.forEach((tab) => {
    const btn = document.createElement("button");
    btn.className = `tab-btn ${tab.cls || ""}`;
    btn.setAttribute("data-tip", tab.label);
    btn.appendChild(icon(tab.icon, "18px"));

    btn.addEventListener("mouseenter", () => {
      if (App.activeTab !== tab.id) {
        btn.style.background = "#1f242f";
        btn.style.color = "#94a3b8";
      }
    });
    btn.addEventListener("mouseleave", () => {
      if (App.activeTab !== tab.id) {
        btn.style.background = "transparent";
        btn.style.color = "#64748b";
      }
    });

    btn.onclick = () => {
      App.activeTab = tab.id;
      updateActiveTab();
      updateContent();
    };

    sidebar.appendChild(btn);
  });

  body.appendChild(sidebar);
  body.appendChild(content);
  detailDiv.appendChild(body);
  container.appendChild(detailDiv);

  updateActions();
  updateActiveTab();
  updateContent();
}

// ========== INITIALIZE APP ==========
render();
