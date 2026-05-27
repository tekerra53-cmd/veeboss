#!/usr/bin/env python3
"""
Seed the Supabase `site_content` table with id='site'.

Usage:
  python scripts/seed_supabase.py            # uses content.json if present or a minimal default
  python scripts/seed_supabase.py --file mycontent.json
  python scripts/seed_supabase.py --dry-run

Requires env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
"""
from __future__ import annotations

import argparse
import json
import os
import sys

from supabase import create_client


def load_input(path: str | None):
    if path:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    if os.path.exists("content.json"):
        with open("content.json", "r", encoding="utf-8") as fh:
            return json.load(fh)
    return {
        "heroSubtitle": "welcome to",
        "heroDescription": "Seeded content",
        "services": [],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed Supabase site_content table with id='site'.")
    parser.add_argument("--file", "-f", help="Path to JSON file to use as content")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be sent without contacting Supabase")
    args = parser.parse_args()

    content = load_input(args.file)

    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if args.dry_run:
        print("Dry run: would upsert id='site' with the following content:")
        print(json.dumps(content, indent=2, ensure_ascii=False))
        return 0

    if not (supabase_url and supabase_key):
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment.", file=sys.stderr)
        return 2

    client = create_client(supabase_url, supabase_key)

    try:
        res = client.table("site_content").upsert({"id": "site", "content": content}).execute()
        # Supabase client may return a response object or dict-like result
        print("Seed successful.")
        try:
            print("Response:", json.dumps(res.data if hasattr(res, "data") else res, indent=2, ensure_ascii=False))
        except Exception:
            print(res)
        return 0
    except Exception as exc:
        print("Seed failed:", exc, file=sys.stderr)
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
