# Browser verification scripts

Run from the project root: `node scripts/qa/shared-components-qa.mjs`.

Recent verified checks: `shared-components-qa.mjs`, `enemy-cards-qa.mjs`, `save-v2-qa.mjs`, `reload-recovery-qa.mjs`, `watch-direction-qa.mjs`, `status-icons-qa.mjs`.

These use a local game server (5173 development or 5174 built preview as specified in each script). Screenshots are recreated in `output/`. Earlier checks are retained as historical regression coverage; some old selectors and expectations may need updating before reuse.
