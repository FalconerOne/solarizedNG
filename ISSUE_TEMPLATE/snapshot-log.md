---
name: 📦 Snapshot Log Entry
about: Automated issue log for repository snapshot
title: "📦 Snapshot Log — {{date}}"
labels: ["snapshot-log"]
assignees: []
---

### 🕒 Snapshot Information
- **Type:** {{snapshot_type}}
- **Timestamp:** {{timestamp}}
- **Branch:** `{{branch_name}}`
- **Tag:** `{{tag_name}}`
- **Triggered By:** @{{triggered_by}}
- **Commit Ref:** `{{commit_ref}}`
- **Workflow Run:** [View Run]({{workflow_url}})

---

### 🧠 Notes
This is an automated entry created by the **Repo Snapshots Workflow**.

Snapshots include:
- All project files and directories.
- GitHub Actions configs.
- Supabase + Vercel configuration manifests.
- Any new commits up to this point.

**Retention policy:**
Nightly snapshots keep only the last 20 tags to save repository space.

---

🪶 *Generated automatically by SolarizedNG Snapshot Manager (MyGiveAway edition)*  
