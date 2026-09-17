const storageKey = "sample-issue-tracker.issues";
const sampleIssues = [
  {
    id: "sample-1",
    title: "Approve release for production",
    description: "Use the GitHub Actions approval workflow after Octopus pauses on the manual intervention step.",
    status: "in-review",
    octopusTaskId: "Tasks-1234",
    createdAt: "2026-09-17T00:00:00.000Z",
  },
];

const issueForm = document.getElementById("issue-form");
const issueList = document.getElementById("issue-list");
const issueTemplate = document.getElementById("issue-template");
const resetSampleButton = document.getElementById("reset-sample");

function loadIssues() {
  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    return [];
  }

  try {
    const issues = JSON.parse(raw);
    return Array.isArray(issues) ? issues : [];
  } catch {
    return [];
  }
}

function saveIssues(issues) {
  window.localStorage.setItem(storageKey, JSON.stringify(issues));
}

function formatCreatedAt(value) {
  return new Date(value).toLocaleString();
}

function renderIssues() {
  const issues = loadIssues();
  issueList.innerHTML = "";

  if (issues.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No issues yet. Create one to start tracking Octopus approvals.";
    issueList.appendChild(emptyState);
    return;
  }

  issues.forEach((issue) => {
    const fragment = issueTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".issue-card");

    fragment.querySelector(".issue-card__title").textContent = issue.title;
    fragment.querySelector(".issue-card__meta").textContent = `Created ${formatCreatedAt(issue.createdAt)}`;
    fragment.querySelector(".issue-card__description").textContent = issue.description || "No description provided.";

    const statusSelect = fragment.querySelector(".issue-status");
    statusSelect.value = issue.status;
    statusSelect.addEventListener("change", () => updateIssueStatus(issue.id, statusSelect.value));

    const taskText = issue.octopusTaskId
      ? `Octopus task: ${issue.octopusTaskId} — run the approve-octopus-change workflow when approval is required.`
      : "No Octopus task linked.";

    fragment.querySelector(".issue-card__task").textContent = taskText;
    fragment.querySelector(".issue-delete").addEventListener("click", () => deleteIssue(issue.id));

    card.dataset.issueId = issue.id;
    issueList.appendChild(fragment);
  });
}

function addIssue(event) {
  event.preventDefault();

  const formData = new FormData(issueForm);
  const title = formData.get("title").toString().trim();

  if (!title) {
    return;
  }

  const issues = loadIssues();
  issues.unshift({
    id: `issue-${Date.now()}`,
    title,
    description: formData.get("description").toString().trim(),
    status: "open",
    octopusTaskId: formData.get("octopusTaskId").toString().trim(),
    createdAt: new Date().toISOString(),
  });

  saveIssues(issues);
  issueForm.reset();
  renderIssues();
}

function updateIssueStatus(issueId, status) {
  const issues = loadIssues().map((issue) => (issue.id === issueId ? { ...issue, status } : issue));
  saveIssues(issues);
  renderIssues();
}

function deleteIssue(issueId) {
  const issues = loadIssues().filter((issue) => issue.id !== issueId);
  saveIssues(issues);
  renderIssues();
}

function loadSampleIssue() {
  saveIssues(sampleIssues);
  renderIssues();
}

issueForm.addEventListener("submit", addIssue);
resetSampleButton.addEventListener("click", loadSampleIssue);

renderIssues();
