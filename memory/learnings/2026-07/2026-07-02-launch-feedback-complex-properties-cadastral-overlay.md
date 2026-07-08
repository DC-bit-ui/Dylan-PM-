# Launch feedback: tool works for simple blocks, complex properties need cadastral overlay + tap-select

**Date:** 2026-07-02
**Type:** post-launch user feedback (farmer calls) + product direction — Farm Map Drawing Tool (AP-2514)
**Trigger:** Ben's feedback in Product/General from two farmer calls after the launch email, relayed by Dylan.

## Signal
Two farmers used the tool **unprompted** off the launch email and completed a Snapshot request each **without assistance**. John: "worked a treat." No negative feedback on the core draw + submit. The email-to-tool journey is converting.

## What's working
- Visual self-serve draw is landing as intended.
- It solved the exact problem it was built for: John previously struggled with updated/long title numbers and lot/plan docs with **no visual of each parcel** - being able to see and draw the farm removed that friction.

## Friction (the real product signal) [high]
1. **Complex properties are the limit.** John's larger 1,200 ha property was "too complicated" to draw (fragmented parcels + a highway easement cutting through) - he **reverted to digging up titles and emailing lot/plan numbers**. His simpler 350 ha block was fine. Complex, multi-parcel, easement properties are where freehand drawing breaks.
2. **Drawing-accuracy uncertainty.** Brett had area fall outside his outline but the report still returned a figure (~4,000 ha) and he was not confident he drew it "quite correctly." Farmers want a **validation step showing what area was actually captured vs intended**.
3. **Manual back-end reconciliation persists.** Ben still compares drawn outlines against land titles before the report goes out.

## Direction (Ben's stated next opportunity, and it converges with what we designed)
**Cadastral/parcel overlay + tap-to-select (multi-lot) + easement handling + a "what we captured" validation.** This resolves all three at once: complex/fragmented properties (tap each parcel), easements (drop the road parcel), accuracy doubt (see the real parcels + exact area), and Ben's reconciliation (parcels are the source of truth, less to reconcile).

Key insight: this is the **same tap-to-select-parcels interaction we designed for the OUTBOUND confirm screen, brought into the INBOUND draw tool.** Model = **draw to locate, then confirm the real cadastral parcels underneath** (snap-to-parcels), limited to a 5-10km radius. Grounded: parcels are the source of truth in the backend, so selecting parcels = precise + less reconciliation.

## Actioned
- Added **Round 8** to `design/claude-design-prompt.md`: cadastral overlay + tap-to-select + captured-area validation, on **duplicates** of the approved designs (do not lose the approved-for-dev versions).
- Not yet in PRD / tickets - this is the "complex properties" next iteration (this week was the simple-block test). Flagged to Dylan: worth a ticket / PRD scope entry, and it is the strongest candidate for the next build after v1.

Source: Ben (Product/General, farmer calls), 2026-07-02, via Dylan.
