# Teams Post — AP-2250 Reopened: Disable Old HubSpot Workflow

**Channel:** Product > Epics (or Bugs)
**To:** Daniel
**Date drafted:** 2026-05-19
**Jira:** AP-2250

---

Hey Daniel — reopening [AP-2250](https://agriprove.atlassian.net/browse/AP-2250) because the fix never landed.

**What's happening:** the old HubSpot Workflow that creates snapshot tickets on "Farm Visit Booked" is still firing. We confirmed this today — tickets created 18-19 May still show the old concatenated format (FirstName + LastName + Email on one line, phone concatenated with the userID). That format only comes from the old workflow, not the BFF automation (AP-2232).

**Impact:** we audited the HORIZON Snapshot Requests pipeline today and found 11 premature tickets in the New stage — all created for contacts with future farm visit dates that haven't happened yet. We've cleaned those out, but more will keep appearing until the old workflow is disabled.

**What needs to happen:** disable the old HubSpot Workflow so the BFF (AP-2232) is the sole ticket creation source. The BFF already triggers on the correct stage and sends the Platform Notifications post. The old workflow is redundant and creating noise.

I've moved AP-2250 back to Development and added a comment with the evidence. Keen to get this knocked out quickly — it's blocking the Growth handover of the snapshot workflow.
