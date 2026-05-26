---
name: feedback-proceed-autonomously
description: User wants Claude to proceed through all build steps without asking for permission or confirmation
metadata:
  type: feedback
---

User explicitly granted full permission to proceed autonomously through all build steps without pausing for confirmation.

**Why:** User wants continuous forward progress on the CartAndBuy e-commerce build.

**How to apply:** Do not ask "shall I proceed?" between steps. Move directly to the next step after completing each one. Only pause if there is a genuine blocker requiring a decision (e.g., missing credentials, ambiguous requirements).
