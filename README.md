# git-issue-tracker

A basic sample issue tracker that keeps issues in the browser and includes GitHub Actions examples for:

- pushing build information to Octopus Deploy
- approving Octopus manual intervention tasks from GitHub Actions

## Sample app

Open `/home/runner/work/git-issue-tracker/git-issue-tracker/index.html` in a browser to use the sample tracker.

Each issue supports:

- title and description
- status updates
- an optional Octopus task ID for manual approval tracking

The sample stores issues in `localStorage`, so it works without extra dependencies.

## Octopus Deploy workflows

### 1. Push build information

The workflow at `.github/workflows/octopus-build-info.yml` pushes build information to Octopus Deploy on pushes to `main` and on manual dispatch.

Set these GitHub secrets and variables before running it:

- `OCTOPUS_URL` - your Octopus Deploy server URL
- `OCTOPUS_API_KEY` - an Octopus API key
- `OCTOPUS_SPACE` - the Octopus space name or ID

### 2. Approve a manual intervention

The workflow at `.github/workflows/approve-octopus-change.yml` runs `scripts/approve_octopus_change.py` to approve or reject a pending Octopus manual intervention task.

Set these secrets and variables before running it:

- `OCTOPUS_URL` - your Octopus Deploy server URL
- `OCTOPUS_API_KEY` - an Octopus API key
- `OCTOPUS_SPACE_ID` - optional Octopus space ID when your instance uses spaces

Dispatch the workflow with:

- `task_id` - the Octopus task ID to approve
- `action` - `proceed` to approve or `abort` to reject
- `notes` - optional approval notes

## Repository layout

- `index.html` - sample issue tracker UI
- `styles.css` - sample styling
- `app.js` - local issue tracker behavior
- `.github/workflows/octopus-build-info.yml` - build information workflow
- `.github/workflows/approve-octopus-change.yml` - approval workflow
- `scripts/approve_octopus_change.py` - Octopus approval script