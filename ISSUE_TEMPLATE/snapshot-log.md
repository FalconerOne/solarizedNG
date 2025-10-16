name: Repo Snapshots (Auto + Manual + Nightly + Issue Logs)

on:
  push:
    branches:
      - main
      - production

  workflow_dispatch:
    inputs:
      label:
        description: 'Optional label or reason for manual snapshot (e.g. before update)'
        required: false
        default: 'manual'

  schedule:
    # Runs every night at 23:30 UTC
    - cron: "30 23 * * *"

jobs:
  snapshot:
    runs-on: ubuntu-latest
    name: Create Snapshot (Auto/Manual/Nightly)

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Needed for proper tagging/branch context

      - name: Generate timestamp
        id: time
        run: echo "timestamp=$(date +'%Y%m%d-%H%M%S')" >> $GITHUB_OUTPUT

      - name: Determine snapshot type
        id: type
        run: |
          if [[ "${{ github.event_name }}" == "schedule" ]]; then
            echo "type=nightly" >> $GITHUB_OUTPUT
          elif [[ "${{ github.event_name }}" == "workflow_dispatch" ]]; then
            echo "type=manual" >> $GITHUB_OUTPUT
          else
            echo "type=auto" >> $GITHUB_OUTPUT
          fi

      - name: Compute label
        id: label
        run: |
          INPUT_LABEL="${{ github.event.inputs.label }}"
          if [[ -z "$INPUT_LABEL" ]]; then
            LABEL="${{ steps.type.outputs.type }}"
          else
            LABEL="$INPUT_LABEL"
          fi
          SAFE_LABEL=$(echo "$LABEL" | tr -cd '[:alnum:]_-')
          echo "safe_label=$SAFE_LABEL" >> $GITHUB_OUTPUT

      - name: Prepare branch and tag names
        id: names
        run: |
          SNAP_TYPE="${{ steps.type.outputs.type }}"
          LABEL="${{ steps.label.outputs.safe_label }}"
          TS="${{ steps.time.outputs.timestamp }}"
          BRANCH_NAME="${SNAP_TYPE}-snapshot-${LABEL}-${TS}"
          TAG_NAME="${SNAP_TYPE}-snapshot-${LABEL}-${TS}"
          echo "branch_name=$BRANCH_NAME" >> $GITHUB_OUTPUT
          echo "tag_name=$TAG_NAME" >> $GITHUB_OUTPUT

      - name: Create snapshot branch
        run: |
          git checkout -b "${{ steps.names.outputs.branch_name }}"
          git push origin "${{ steps.names.outputs.branch_name }}" || echo "⚠️ Branch push skipped (already exists)"

      - name: Create snapshot tag
        run: |
          git tag -a "${{ steps.names.outputs.tag_name }}" -m "Snapshot created: ${{ steps.names.outputs.tag_name }}"
          git push origin "${{ steps.names.outputs.tag_name }}" || echo "⚠️ Tag push skipped (already exists)"

      - name: Confirm snapshot creation
        run: echo "🎉 Snapshot (${{ steps.type.outputs.type }}) created successfully"

      - name: Create GitHub Issue Log
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        run: |
          echo "🪶 Creating issue log..."
          TYPE="${{ steps.type.outputs.type }}"
          TS="${{ steps.time.outputs.timestamp }}"
          TAG="${{ steps.names.outputs.tag_name }}"
          BRANCH="${{ steps.names.outputs.branch_name }}"
          LABEL="${{ steps.label.outputs.safe_label }}"
          ACTOR="${{ github.actor }}"
          REPO="${{ github.repository }}"
          TITLE="📦 Snapshot Log — ${TS} (${TYPE})"
          BODY=$(cat <<EOF
### 🕒 Snapshot Details
- **Type:** ${TYPE}
- **Timestamp:** ${TS}
- **Branch:** ${BRANCH}
- **Tag:** ${TAG}
- **Triggered By:** @${ACTOR}
- **Workflow Run:** [View Run](${RUN_URL})

---

### 📘 Description
This issue was automatically created by the **Repo Snapshots** workflow to log all snapshots for version tracking and rollback.

Snapshots can be triggered:
- 🔹 Automatically on push (\`main\` or \`production\`)
- 🔹 Manually via the “Run Workflow” button
- 🔹 Nightly (23:30 UTC) via cron job

---

### 🧹 Maintenance Notes
Nightly snapshots older than 20 runs are automatically deleted to keep the repository clean.
EOF
)
          curl -s -X POST -H "Authorization: token ${GH_TOKEN}" \
               -H "Accept: application/vnd.github.v3+json" \
               https://api.github.com/repos/${REPO}/issues \
               -d "{\"title\":\"${TITLE}\",\"body\":\"${BODY}\",\"labels\":[\"snapshot-log\"]}" || echo "⚠️ Failed to create issue log"

      - name: Cleanup old snapshots (keep last 20)
        if: ${{ steps.type.outputs.type == 'nightly' }}
        run: |
          echo "🧹 Cleaning up older snapshots..."
          git fetch --tags
          TAGS=$(git tag -l "nightly-snapshot-*" | sort -r | tail -n +21)
          for TAG in $TAGS; do
            echo "Deleting old tag: $TAG"
            git push origin :refs/tags/$TAG || true
          done
