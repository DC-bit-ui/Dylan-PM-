# AgriProve x Dye & Durham - National Property API

**To:** Paolo Malicse, Account Manager, Dye & Durham
**From:** Dylan Cronje, Product Manager, AgriProve
**Date:** 19 May 2026
**Re:** API Connect portal access - AgriProve (Request #1025791)

---

## About AgriProve

AgriProve is an Australian agtech company that helps landholders measure and manage their soil carbon. We register and run carbon projects on behalf of landholders across all six freehold states (NSW, QLD, VIC, SA, WA, TAS).

As part of each project registration, we need to identify every person or organisation with a registered interest on every land title in the project area - owners, mortgagees, banks, caveators, easement holders, and so on. We then need their consent before we can register the project with the federal regulator.

## What we're looking to do

We already purchase titles through D&D manually via your platform. We're building an internal tool that automates the title ordering and consent process, and we'd like to connect to your National Property API to do that programmatically.

The flow we're building:

1. Our operator confirms which land parcels are in scope for a project (lot and plan numbers, by state)
2. We push those to D&D's API and get back the available titles for purchase
3. The operator reviews and confirms the purchase
4. We receive the title data (structured) and the PDF, and our system takes it from there

We're an existing customer, so we'd be paying the same per-title rates through the API as we do today via the platform.

## Questions

We've reviewed the API Connect Brochure you attached. To get moving on our side, we'd appreciate help with the following:

1. **API portal access:** can you provision us access to the API Connect portal and Swagger documentation? The brochure references interactive docs, and that's the fastest way for our dev team to map the integration.

2. **Tasmania coverage:** the brochure lists NSW, QLD, VIC, SA, and WA. Can you confirm whether TAS title searches are also supported? We register projects across all six freehold states.

3. **PDF delivery:** how are the title PDFs delivered via the API? Signed URL, file attachment, or something else?

4. **Sandbox:** the brochure mentions you can provide a staging environment. Can you provision sandbox credentials alongside portal access so we can start building straight away?

5. **Onboarding timeline:** from here to live credentials, what does the typical timeline look like?

6. **Rate limits and SLA:** anything we should plan around in terms of request limits or availability windows?

Happy to walk through any of this on the call you've proposed. Our lead developer, Cadel Watson, is available 10am-1pm Wednesday 20 May or 9am-1pm Thursday 21 May (AEST) if either of those work for your team.

## Contact

**Dylan Cronje** | Product Manager
Phone: 1300 GO SOIL (1300 46 7645)
Mobile: +61 419 940 230
Email: dylan@agriprove.io
Address: Level 1, 601 Dean Street, Albury NSW 2640

www.agriprove.io

AgriProve Pty Ltd ACN 624 305 371 is an authorised representative (AR No. 001275434) of Corporate Carbon Advisory (AFS Licence No: 430199).
