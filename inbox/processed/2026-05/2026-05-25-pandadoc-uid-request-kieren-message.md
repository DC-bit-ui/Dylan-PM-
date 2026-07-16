# Message to Kieren — PandaDoc Template UUIDs

**Date:** 2026-05-25
**From:** Dylan (via Claude Code, EIH Automation repo)
**For:** Dylan to copy-paste into his Teams thread with Kieren
**Cowork action:** Surface this message inline so Dylan can copy it in one click. If a Teams thread with Kieren is already open and routinely used for tool requests, the `agriprove-pm` skill may optionally post a draft into that thread for Dylan's approval. Do NOT auto-send.

---

## Message (copy-paste ready)

```
Hi Kieren,

Thanks for the sandbox API key — that's in. There are three more values I need from you to wire the live PandaDoc integration into the EIH automation tool. Each one is a unique ID for one of our templates, and each one takes about 30 seconds to grab.

The IDs I need are for these three templates. The links below are the ones that were sent over previously — they'll help you pick the right template in PandaDoc for each ID:

1. KCT (the Key Commercial Terms template AgriProve uses for our own projects)
   Reference: https://form.pandadoc.com/form/qfwte8iPDxnh4ijX9iMRcQ

2. LawrieCo KCT (the template we use when registering a LawrieCo-tagged project)
   Reference: https://form.pandadoc.com/form/XTBQ6DdQAVsGTdnxkN9KXg

3. EIH-C (the consent form for mortgagees, easement holders, caveators, and Crown)
   Reference: https://app.pandadoc.com/a/#/templates/7ZTfTgUbQgZc9MdBpLRDT8

The reference links above are the public "share-link" version of each template — useful for identifying which template I mean, but NOT the ID format the tool can use. I need the template's own URL from inside the editor.

To grab the right ID for each one:

1. Log into PandaDoc (app.pandadoc.com). Make sure you're in the same workspace
   you generated the sandbox API key for — if you're in a different workspace
   the IDs won't match and the tool can't see them.

2. Click "Templates" in the left-hand menu.

3. Click into the template that matches the reference link above (e.g. for #1,
   open the template that the form.pandadoc.com/form/qfwte8iPDxnh4ijX9iMRcQ
   link points at).

4. Once you're inside the template editor, look at the URL in your browser's
   address bar. It will look something like this:

       https://app.pandadoc.com/a/#/templates/7ZTfTgUbQgZc9MdBpLRDT8

   The 22-character string at the very end (the bit after /templates/) is the
   ID I need. For the EIH-C one (#3) the ID is already in that format —
   7ZTfTgUbQgZc9MdBpLRDT8 — but please double-check it opens in the same
   workspace as the sandbox API key so we know it's the right copy.

5. Reply with all three labelled like this:

       KCT:        <id>
       LawrieCo:   <id>
       EIH-C:      <id>

Important — please DO NOT send me the "Share" link (the form.pandadoc.com/form/
URLs above). Those are different IDs used for public form-filling and the
tool can't use them. We need the URL from inside the template editor itself.

If any of these templates don't exist in the sandbox workspace yet, let me
know — most likely the EIH-C consent form (which is new and may need LawrieCo
legal input to draft first).

Thanks,
Dylan
```

---

## Context (for Cowork's `agriprove-pm` skill if any polish is warranted)

- **Why:** Kieren previously sent share-links (`form.pandadoc.com/form/...`) which are public-form URLs, not template UUIDs. The EIH automation tool's PandaDoc integration (`web/src/lib/pandadoc.ts:LivePandadocClient.createFromTemplate`) uses the API's `template_uuid` field, sourced from the in-editor URL (`app.pandadoc.com/a/#/templates/<UUID>`).
- **Audience:** Kieren is admin / has technical context — plain language is appropriate but no over-explaining. He generated the API key, so workspace context is established.
- **Tone calibration:** direct but not curt. Dylan's preferred external-comms voice — see `memory/profile/communication.md`.
- **Optional enhancements:** if the agriprove-pm skill has a record of which Teams thread Dylan uses with Kieren, surface that. If there's a standing channel for tool requests, prefer that over a 1:1 DM.

**Don't auto-send.** Dylan reviews and posts manually.

---

## Related deliverables

- Original PandaDoc access request: `memory/deliverables/2026-05-21-pandadoc-access-request-kieren.md`
- This follow-up (full record with context): `memory/deliverables/2026-05-25-pandadoc-template-uid-request-kieren.md`
