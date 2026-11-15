# Al Halabi standalone print agent

Shop PC package. **Not** the website.

The kitchen computer should receive only the built folder:

`printer-agent-standalone/release/ALHALABI-PRINTER/`

Copy it to `C:\ALHALABI-PRINTER`.

It talks to `PRINT_AGENT_API_URL` with `PRINT_AGENT_TOKEN` and prints to `PRINTER_IP`.

It does **not** need:

- this website repository
- Firebase Admin keys
- Node.js installed (portable `node\node.exe` is included)
- a visible window after service install

## Build this package (developer PC)

```bat
cd printer-agent-standalone
npm install
npm run build
npm run package:win
```

Output: `release\ALHALABI-PRINTER\`

## Café install

```bat
xcopy /E /I release\ALHALABI-PRINTER C:\ALHALABI-PRINTER
cd C:\ALHALABI-PRINTER
copy .env.example .env
notepad .env
```

Set `PRINT_AGENT_TOKEN` to the **same** Vercel token. Keep:

```
PRINT_AGENT_ENABLED=true
PRINT_AGENT_API_URL=http://localhost:3000
PRINT_AGENT_ID=alhalabi-kitchen-pc
PRINTER_IP=
PRINTER_PORT=9100
```

Café auto-start **without Administrator password**:

```bat
C:\ALHALABI-PRINTER\install-startup.cmd
```

That adds a shortcut to the current user's Startup folder (`shell:startup`) and starts the agent hidden. It restarts after a crash. No Windows Service.

Optional admin-only service (not required):

```bat
C:\ALHALABI-PRINTER\install.cmd
```

Manual (foreground window):

```bat
C:\ALHALABI-PRINTER\start.cmd
C:\ALHALABI-PRINTER\verify.cmd
```

Logs: `C:\ALHALABI-PRINTER\logs\print-agent.log`

Uninstall (Administrator):

```bat
C:\ALHALABI-PRINTER\uninstall.cmd
```
