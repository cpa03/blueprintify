# Universal AI Agent Specification & Reusable Catalog (.agent)

Koleksi definisi agent, skills, workflows/commands, dan memory yang dirancang **100% framework-agnostic**. Semua artefak di direktori ini dapat digunakan oleh agent mana saja (Claude Code, Hermes Agent, Roo Code, Cursor, Windsurf, OpenCode, Aider, LangChain, AutoGen, CrewAI, atau autonomous loop mandiri).

---

## 📁 Struktur Direktori

```
.agent/
├── registry/
│   └── index.json          # Manifest metadata seluruh katalog (28 agents, 25 skills, 8 commands, 18 memory)
├── agents/                 # 28 Definisi Agent dengan persona, capabilities, workflow, & standards
│   ├── backend-engineer.md
│   ├── frontend-engineer.md
│   ├── software-architect.md
│   ├── cmz.md
│   ├── coder.md
│   ├── debugger.md
│   └── ... (28 agents total)
├── skills/                 # 25 Reusable Skills (SKILL.md standard)
│   ├── planning-with-files/
│   ├── obra-superpowers-test-driven-development/
│   ├── obra-superpowers-systematic-debugging/
│   ├── react-component-create/
│   ├── api-endpoint-create/
│   └── ... (25 skills total)
├── commands/               # 8 Command / Workflow Routines
│   ├── on-pull.md          # Autonomous repository maintainer & PR integrator
│   ├── commit.md           # Conventional commit generator
│   ├── fix.md              # Auto-fix linting/types/formatting
│   ├── status.md           # Project health & status checker
│   ├── execute-specialist.md
│   └── ... (8 commands total)
├── memory/                 # 18 Domain Knowledge & Patterns
│   ├── PATTERNS.md         # Learned patterns & anti-patterns
│   ├── backend.md, frontend.md, database.md, security.md, qa.md ...
└── templates/              # Universal template schemas
    ├── agent.universal.yaml
    ├── SKILL.universal.md
    └── command.universal.md
```

---

## 🔄 Apa yang Di-refactor agar Bebas dari Keterikatan OpenCode?

| Aspek               | Format Sebelumnya (Terkunci ke OpenCode)                        | Format Universal / Portable Baru (.agent)                                     |
| ------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Model Mandate**   | `model: opencode/deepseek-v4-flash-free` di-hardcode            | `${AGENT_MODEL:-deepseek-v4-flash-free}` atau configurable via frontmatter    |
| **Path Dependensi** | Hardcoded path `.opencode/memory/`, `.opencode/agent/`          | Dynamic variables `${AGENT_MEMORY_DIR:-.agent/memory}/`, `${AGENT_DIR}`       |
| **Tool Names**      | OpenCode internal tools: `find_by_name`, `grep_search`, `skill` | Abstract capabilities: `search`, `read`, `write`, `edit`, `bash`, `skill`     |
| **Command Syntax**  | `!npm run test $ARGUMENTS`, `@blueprint.md`                     | Standard markdown, shell blocks, parameter `<args>`, referensi berkas standar |
| **Frontmatter**     | Format internal OpenCode (`mode: primary`, inline permissions)  | Standard YAML metadata (`name`, `display_name`, `capabilities`, `version`)    |
| **Standards**       | "Universal OpenCode Standards"                                  | "Universal Engineering Standards"                                             |

---

## 🚀 Cara Menggunakan di Berbagai Agent Framework

### 1. Claude Code

Muat skill atau prompt agent langsung dengan parameter context:

```bash
claude --prompt "$(cat .agent/agents/backend-engineer.md)"
# atau gunakan skill langsung:
claude --prompt "Gunakan instruksi dari .agent/skills/planning-with-files/SKILL.md"
```

### 2. Hermes Agent

Gunakan tools `read_file` atau daftarkan skill ke directory profiles:

- System prompt: Baca isi `.agent/agents/{role}.md`.
- Skills: Copy/symlink folder `.agent/skills/*` ke `~/.hermes/skills/` atau load via skill view.

### 3. Cursor / Windsurf / Copilot

Tambahkan direktori ke context rules:

- Tambahkan `.agent/agents/` atau file memory `.agent/memory/PATTERNS.md` ke `.cursorrules` atau `.windsurfrules`.

### 4. Custom Python / TypeScript LLM Loop

Baca manifest `index.json` untuk otomatis menginjeksi persona dan context:

```python
import json

with open('.agent/registry/index.json') as f:
    registry = json.load(f)

# Ambil prompt backend engineer
with open('.agent/agents/backend-engineer.md') as f:
    backend_prompt = f.read()

# Kirim ke OpenAI / Anthropic / Local LLM sebagai system prompt
```
