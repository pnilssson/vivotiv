# Admin Outreach

System for running website scans and sending personalized outreach emails to Swedish SMBs. Uses the same scan pipeline as the free website scan but triggers a different email flow designed for recipients who did not request the scan.

## How it works

1. Admin triggers a scan via a protected endpoint (URL + email + optional business name)
2. The existing scan pipeline runs exactly as it does for a normal scan
3. Scan results are passed to an AI prompt that generates a personalized email body
4. The email is sent via Resend with the outreach React Email template from `tips.vivotiv.com`
5. The scan is saved with `source: "outreach"` for tracking and deduplication

## The outreach email

### What makes it different from the regular scan email

The regular scan email is short and transactional. The recipient expects it because they started the scan themselves. It shows scores per category and links to the full report.

The outreach email is uninvited. The recipient has no context. The email must:

1. Explain who we are and why they are receiving this (one sentence)
2. Make clear this is based on publicly available information, not surveillance
3. Highlight 2-3 specific findings from their scan with real numbers
4. Explain why those findings matter for their business
5. Link to the full report
6. Offer a clear but soft next step
7. Include an unsubscribe link

### Tone and framing

This is the most important part. The email must follow MARKETING-CONTEXT.md exactly:

- **Outcome first.** Lead with what we found, not who we are.
- **Real numbers.** "Er sajt laddar på 8.2 sekunder" not "er sajt är långsam."
- **Build from pain.** Pick findings that connect to business consequences (lost customers, legal risk, lost visibility).
- **Sound human.** This must read like a person who looked at their site, not a mass email tool.
- **Formal Swedish.** Use "Er/er" not "din/du." Natural Swedish, not translated from English.
- **No marketing speak.** No "streamline," "supercharge," "comprehensive." No em dashes. No superlatives.
- **Not salesy.** We are pointing out something useful, not pitching a product. The value is in the information itself.

### Framing the uninvited scan

The email must establish legitimacy in the first lines. The framing is:

- Your website is public
- We analyzed it using the same free tool anyone can use on our site
- We found things we thought were worth sharing

Example opening (Swedish):

> Hej,
>
> Vi på Vivotiv hjälper svenska företag med deras digitala närvaro. Er hemsida är offentlig och vi analyserade den med samma kostnadsfria verktyg som finns tillgängligt för alla på vår sajt. Vi hittade några saker vi ville uppmärksamma er på.

This is a starting point for the AI prompt, not a fixed template. The AI should vary the phrasing.

### What to highlight (2-3 findings)

The AI selects the 2-3 most impactful findings from the scan results. Selection priority:

1. **Legal/compliance risk** (highest priority). GDPR violations (missing cookie consent, pre-consent tracking), EU Accessibility Act gaps. These have real fines and real deadlines. Reference IMY and Swedish enforcement, not abstract EU authorities.
2. **Visibility/revenue risk.** Poor performance (slow load times with specific numbers), SEO problems, AI readiness issues. Frame as "this is costing you customers or making you invisible."
3. **Trust/credibility risk.** Broken links, missing security headers, no SSL. Frame as "this is how your site looks to visitors and to Google."

Do not highlight all three categories. Pick the 2-3 findings that are actually worst for that specific site. A site with perfect compliance but terrible performance should get performance findings.

**Send gates.** The system checks scan results before generating and sending an email:

- **Don't send** if the overall score is 80+ and no single category is below 70. There is nothing urgent to highlight.
- **Don't send** if fewer than 2 findings meet the worst-findings threshold. If we cannot fill 2 meaningful pain points, the email will feel thin and forced.
- **Do send** if any single category is red (below 50), regardless of overall score. One catastrophic category is enough for a valuable email.

If the scan does not pass the send gates, the endpoint returns the scan results but skips the email. The lead is still saved (with a flag like `outreach_skipped: true`) so we do not re-scan the same domain later.

### Call to action

Three options, ordered from lowest to highest commitment:

1. **See the full report** (link). Lowest friction. Let the report do the convincing.
2. **Forward to your developer.** Positions us as helpful. Makes it clear we are not the only option.
3. **Reply if you want to talk.** Highest commitment. Listed last. Simple "svara pa detta mail" -- no booking links, no forms, no pressure.

### What we explicitly do NOT do

- We do not claim to be the only solution. "Vi kan hjalpa er, eller sa kan ni anvanda rapporten som underlag till er utvecklare."
- We do not exaggerate findings. If the scan says 6.2 seconds load time, we say 6.2 seconds. We do not say "extremely slow."
- We do not imply urgency that does not exist. EAA deadlines and GDPR fines are real urgency. "Act now before it's too late" is fake urgency.
- We do not hide that this is a business. We are transparent that we offer services, but the email's value stands on its own even if they never become a customer.

## AI-generated personalization

### Why AI

Every outreach email must feel like someone actually looked at their site. With hundreds of potential targets, writing each email manually is not sustainable. The AI generates the personalized body based on structured scan data.

### What the AI receives

The AI prompt receives structured data, not raw scan output:

```
{
  "business_name": "Företaget AB",
  "url": "https://example.se",
  "category_scores": {
    "performance": 42,
    "seo": 67,
    "accessibility": 31,
    "trust_security": 58,
    "website_quality": 45,
    "ai_readiness": 22
  },
  "worst_findings": [
    {
      "category": "accessibility",
      "finding": "15 kritiska tillgänglighetsbrister",
      "detail": "Saknar alt-texter på 12 bilder, formulär utan labels",
      "business_impact": "EU:s tillgänglighetsdirektiv (EAA) träder i kraft 28 juni 2025. IMY kan utfärda sanktionsavgifter."
    },
    {
      "category": "performance",
      "finding": "Laddtid 8.2 sekunder",
      "detail": "LCP 8.2s, TBT 1.4s, CLS 0.34",
      "business_impact": "Google rekommenderar under 2.5 sekunder. Besökare lämnar sajter som laddar långsammare än 3 sekunder."
    }
  ]
}
```

The `worst_findings` are pre-selected by the scan pipeline based on the priority hierarchy (legal > visibility > trust). The AI does not choose what to highlight -- it receives the selection and writes about it.

### What the AI outputs

A short email body in Swedish (150-250 words) containing:

1. Opening line establishing context (who we are, why they get this)
2. 2-3 personalized finding paragraphs with real numbers from the scan
3. A sentence connecting findings to business consequences
4. Link to the full report
5. The soft CTA

### AI prompt guardrails

The system prompt must enforce these rules:

**Must:**
- Use only data provided in the input. Every number and finding must come from the scan data.
- Write in natural Swedish with formal "Er/er" address.
- Keep the total body under 250 words.
- Include the report link exactly as provided.
- Sound like a knowledgeable person, not a template.

**Must not:**
- Invent or exaggerate findings. If the data says 6.2 seconds, write 6.2 seconds.
- Use superlatives ("worst," "best," "most critical").
- Use marketing speak ("streamline," "supercharge," "unlock," "leverage").
- Use em dashes.
- Use AI-typical patterns (punchy fragment pairs, dramatic reveals, forced rhyming, "in today's digital landscape").
- Make promises about outcomes ("guaranteed improvement," "double your traffic").
- Mention competitor tools or services by name.
- Add information not present in the input data.

**Tone calibration:**
- Professional but warm. Like a colleague in the industry giving a heads-up.
- Confident but not arrogant. We found real issues, not opinions.
- Helpful, not predatory. The email should be valuable even if they never contact us.

### Prompt testing

Before going live, test the AI prompt against 10-20 real scan results and verify:
- Every number in the output traces back to the input data
- No guardrail violations
- Emails read as natural Swedish, not translated English
- Tone is consistent across different finding combinations
- Edge cases: sites with only one bad category, sites with all categories in orange (no clear worst), sites with one catastrophic score

## Tracking and deduplication

### Source tracking on scans

Add `source` to the **scans** table (`"scan"` | `"outreach"`, default `"scan"`). Every scan records how it was initiated. This is sufficient for all use cases: deduplication (query scans by URL and source), analytics (count/filter by source), and conversion tracking (domain with an outreach scan followed by an organic scan). Lead acquisition history is derivable from the earliest scan for that lead.

This enables:

- Measuring outreach email performance separately from organic scans
- Tracking conversions: outreach recipients who later run their own scan
- Filtering outreach scans in analytics
- Potentially showing a different experience when the recipient clicks the report link

### Deduplication rules

- Never send outreach to a domain that already has an outreach scan (regardless of email address)
- Never send outreach to a domain that already has an organic scan (they already know about us)
- Check deduplication before running the scan, not after (avoid wasting scan resources)

## Email delivery via Resend

### Why Resend (not Loops)

Resend is already in the stack for scan-complete emails. It gives full control over the email body via React Email templates, which is needed for AI-generated personalized content with formatting, links, and conditional sections.

### Sending domain

Outreach emails send from the existing Resend sending domain (`vivotiv.com`). A separate subdomain (`tips.vivotiv.com`) can be added later if outreach volume grows and reputation isolation becomes necessary.

### Outreach email template

A new React Email component (`outreach-email.tsx`) alongside the existing `scan-complete.tsx`. The template is text-forward by design -- cold outreach with heavy styling signals mass email and kills open rates. The AI generates structured data (opening, findings, CTA text), and the template renders it with minimal formatting.

### Unsubscribe

Every outreach email includes a one-click unsubscribe link. Implementation:

- Add `unsubscribed` boolean to the leads table (default `false`)
- Add an unsubscribe API endpoint: `GET /unsubscribe?token=<signed-token>` that sets the flag
- The outreach email template includes the unsubscribe link in the footer
- Check the `unsubscribed` flag before sending any outreach email
- Swedish marketing law (marknadsforingslagen) and GDPR require this for unsolicited commercial email

## Endpoint design

### Protection

The endpoint requires authentication (API key or admin session). It must not be publicly accessible. A leaked endpoint would allow anyone to trigger scans and send emails on our behalf.

### Input

```
POST /api/admin/outreach

{
  "url": "https://example.se",
  "email": "info@example.se",
  "business_name": "Företaget AB"  // optional, used in email personalization
}
```

### Validation

- URL must be a valid public URL (same validation as the regular scan)
- Email must be a valid email address
- Domain deduplication check before proceeding
- Queued via Inngest with lower priority than organic scans

### Response

Returns immediately with a job ID. The scan, AI generation, and email sending happen asynchronously via the existing Inngest pipeline.

```
{
  "jobId": "...",
  "status": "queued"
}
```

### Queue and priority

Outreach scans use the same Inngest pipeline but with lower priority than organic scans. Organic scans are from users who are actively waiting for results. Outreach recipients do not know a scan is running.

- Separate Inngest function with lower concurrency limit than the organic scan function
- Organic scans always run first; outreach scans fill remaining capacity

## What this does NOT include

- **Bulk import.** No CSV upload or batch endpoint. Each outreach is triggered individually. Batch automation can be built later on top of the same endpoint.
- **Automated prospecting.** We do not crawl directories or scrape business listings to find targets. Target selection is manual (for now).
- **Follow-up sequences.** One email per domain. No automated follow-up chains. If we add follow-ups later, they will be a separate feature.
- **A/B testing.** The AI prompt produces one version per email. We test and iterate on the prompt itself, not on per-send variants.

## Implementation order

1. **Source tracking.** Add `source` field to scans table (`"scan"` | `"outreach"`, default `"scan"`). Pass source through the Inngest event chain (`scan.requested` → `scan.completed`).
3. **Unsubscribe.** Add `unsubscribed` boolean to leads table. Build unsubscribe endpoint and signed token generation.
4. **Deduplication.** Add domain-level deduplication check for outreach scans.
5. **Outreach endpoint.** Protected POST endpoint that validates input, checks deduplication and unsubscribe status, and queues the scan via Inngest.
6. **Outreach email template.** New React Email component (`outreach-email.tsx`), text-forward design, with slots for AI-generated content and unsubscribe link.
7. **AI prompt and generation.** Build the finding selection logic (worst findings by priority), send gates, and the AI prompt. Test against real scan results.
8. **Email sending.** New Inngest function that runs after scan completion for outreach scans: applies send gates, generates AI body, renders template, sends via Resend from `tips.vivotiv.com`.
9. **Queue priority.** Configure the outreach Inngest function with lower concurrency than organic scans so outreach never starves real users.
