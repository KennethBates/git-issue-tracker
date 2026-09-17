import json
import os
import sys
from urllib import error, request


def require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SystemExit(f"Missing required environment variable: {name}")
    return value


def api_root(server: str, space_id: str) -> str:
    base = server.rstrip("/")
    if space_id:
        return f"{base}/api/{space_id}"
    return f"{base}/api"


def octopus_request(url: str, api_key: str, method: str = "GET", body: dict | None = None) -> dict:
    payload = None if body is None else json.dumps(body).encode("utf-8")
    headers = {
        "X-Octopus-ApiKey": api_key,
        "Accept": "application/json",
    }

    if payload is not None:
        headers["Content-Type"] = "application/json"

    req = request.Request(url, data=payload, headers=headers, method=method)

    try:
        with request.urlopen(req) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except error.HTTPError as exc:
        message = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Octopus API request failed ({exc.code}): {message}") from exc


def main() -> int:
    server = require_env("OCTOPUS_URL")
    api_key = require_env("OCTOPUS_API_KEY")
    task_id = require_env("OCTOPUS_TASK_ID")
    action = os.environ.get("OCTOPUS_ACTION", "proceed").strip() or "proceed"
    notes = os.environ.get("OCTOPUS_NOTES", "Approved via GitHub Actions").strip() or "Approved via GitHub Actions"
    space_id = os.environ.get("OCTOPUS_SPACE_ID", "").strip()

    if action not in {"proceed", "abort"}:
        raise SystemExit("OCTOPUS_ACTION must be 'proceed' or 'abort'")

    base_url = api_root(server, space_id)
    interruptions = octopus_request(f"{base_url}/tasks/{task_id}/interruptions", api_key)
    items = interruptions.get("Items", interruptions if isinstance(interruptions, list) else [])

    if not items:
        raise SystemExit(f"No pending interruptions found for task {task_id}")

    interruption_id = items[0]["Id"]
    result = octopus_request(
        f"{base_url}/interruptions/{interruption_id}/submit",
        api_key,
        method="POST",
        body={
            "Action": action,
            "Notes": notes,
            "FormValues": {},
        },
    )

    print(
        f"Submitted '{action}' for interruption {interruption_id} on task {task_id}. "
        f"Server response: {json.dumps(result)}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
