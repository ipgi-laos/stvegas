Hydra Points rollback patch

Changed website leaderboard back to the old public format:
- Shows Hydra Points instead of Tier / Status.
- Removed tier/status image rendering from the landing page table.
- leaderboard.json rows now use: rank, membership, points.
- make_public_leaderboard.py now exports points again.
- tools/update_leaderboard.py saves public leaderboard.json with points again.

Files patched:
- index.html
- script.js
- style.css
- translation.json
- leaderboard.json
- make_public_leaderboard.py
- tools/update_leaderboard.py
