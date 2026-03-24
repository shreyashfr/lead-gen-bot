# COMPLETE USER WORKFLOW — /START TO FIRST CONTENT PIECE

## STEP 1: NEW USER SENDS /START

**User:** `/start`

**Bot (Dispatcher):**
```
Hi there! 👋 Welcome to the Content Engine.

I'm a Multi-Agent Social Media Content Engine — I surf Reddit, X (Twitter), YouTube, and Google News, track what's going viral in your niche, and turn those insights into ready-to-post content for you.

Here's what I do:

📄 Uses your Master Document as context so every post sounds like you
💬 Learns your writing style from your WhatsApp chats
🔍 Surfs Twitter, Reddit, YouTube and Google News for real-time trends
🎯 Researches viral content and high-performing hooks across 4 platforms
✍️ Generates posts for LinkedIn, Instagram, Twitter and more
🤖 Eliminates AI signs — content that actually sounds human

To get started, complete your payment below 👇

https://buy.stripe.com/test_8x2eVf8qc5a27JF8q6cbC00?client_reference_id={sender_id}

You'll get instant access as soon as payment is confirmed. I'll set everything up automatically.

Need help? shreyash.chavan2016@gmail.com

Powered by Openclaw and Claude.
```

---

## STEP 2: USER COMPLETES PAYMENT

(User goes to Stripe link, pays, comes back to Telegram)

**Bot (Auto-triggered by Stripe webhook):**
```
✅ Payment confirmed, {name}! Setting up your workspace... ⚙️
```

---

## STEP 3: MASTER DOC TEMPLATE SENT

**Bot (Onboarding - Step 0):**
```
✅ Workspace ready, {name}!

To build your content system, fill in the attached Master Doc template and send it back as a .txt or .md file.

This is what tells the engine your voice, niche, writing rules, and stories — it's the foundation of everything.

💬 Optional but powerful — you can also export your WhatsApp chats and send them as a .txt or .md file. I'll study how you naturally write and talk, and use that to make your content sound even more like you.

To export a WhatsApp chat:
→ Open the chat → ⋮ Menu → More → Export chat → Without media → Send the .txt file here

I only use chats to learn your writing style. Personal details, names, and private conversations are never used in your content.
```

(Attaches: master-doc-template.md)

**User:** (Fills template, sends back as .txt or .md)

---

## STEP 4: MASTER DOC RECEIVED

**Bot (Onboarding - Step 1):**
```
📄 Got it! Building your content system now...
```

(Bot internally: saves master-doc, generates voice-memory.json, builds workspace)

---

## STEP 5: ONBOARDING COMPLETE

**Bot (Onboarding - Step 2):**
```
✅ All set, {name}!

Your content system is ready. Here's what you can do:

🔍 Pillar: [topic] → Research what's viral + get 15 ideas
Run `Pillar: AI + Healthcare` or `Pillar: SaaS Founders`

📊 my numbers → Track your content performance
🔄 run competitive scan → See what competitors are doing

Ready to create your first piece? Start with:

Pillar: [your topic]
```

---

## STEP 6: USER RUNS FIRST PILLAR

**User:** `Pillar: AI Marketing`

**Bot (Dispatcher):**
```
🔍 Searching viral posts around "AI Marketing" on Reddit and Twitter/X...

Retrieving top ideas and hooks. This takes 5-7 minutes — sit back and relax. 🙌
```

(Internally: pillar-workflow STEP 1 runs research)

---

## STEP 7: RESEARCH COMPLETES + IDEAS DELIVERED

(After 5-7 minutes: research validates all URLs, idea-generator creates 15 ideas)

**Bot (Auto-posts ideas):**
```
## IDEAS REPORT — AI Marketing

1. **Hook:** "I tested 5 AI tools on my marketing team..."
Format: LinkedIn Post
📎 Source: https://x.com/[author]/status/[id]

2. **Hook:** "Here's what changed when we automated the boring parts..."
Format: Twitter Thread
📎 Source: https://reddit.com/r/[subreddit]/comments/[id]

[ideas 3-15, each with format + hook + source URL]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 What's your production plan?

Tell me:
1. Which ideas you want to produce (pick numbers, e.g. 2, 5, 9)
2. How many of each format this week:

e.g.
5x LinkedIn Posts
4x Twitter Threads
2x Tweets
```

**User:** `Ideas 1, 3, 5, 7, 9, 11, 13, 15 — 4x LinkedIn Posts + 2x Twitter Threads`

---

## STEP 8: PRODUCTION PLAN CONFIRMED

**Bot:**
```
✍️ Starting production of 6 pieces.

I'll send you piece #1 as soon as it's ready — and while you're reviewing it, the rest are already generating in the background.
```

(Internally: content-producer generates all 6 pieces in parallel)

---

## STEP 9: PIECE #1 DELIVERED FOR APPROVAL

(After ~2-3 minutes)

**Bot:**
```
📝 Piece #1 ready for review:

[Full LinkedIn Post content here]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply:
✅ approved
🔧 fix: [what to change]
⏭️ next (skip this one)
```

**User:** `✅ approved`

---

## STEP 10: PIECE APPROVED → NEXT DELIVERED

**Bot:**
```
✅ Locked in! Moving to piece #2...

📝 Piece #2 ready for review:

[Full Twitter Thread content]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply:
✅ approved
🔧 fix: [what to change]
⏭️ next (skip this one)
```

**User:** `🔧 fix: remove em dashes`

---

## STEP 11: FEEDBACK PROCESSED → REWRITE

**Bot:**
```
Got it — I've locked that rule. I'll never use em dashes again in any future post.

Rewriting piece #2 now...
```

(After ~1 minute)

```
📝 Piece #2 (rewritten) ready for review:

[Full rewritten Twitter Thread - no em dashes]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply:
✅ approved
🔧 fix: [what to change]
⏭️ next (skip this one)
```

**User:** `✅ approved`

---

## STEPS 12-17: REMAINING PIECES

(Each piece appears immediately after previous approval, since all 6 were generating in parallel)

**Pattern repeats for pieces 3-6:**
```
📝 Piece #3 ready for review:
[Content]
```

(User approves each one)

---

## STEP 18: ALL PIECES COMPLETE

**Bot:**
```
🎉 All done!

6 pieces created + approved
📊 All added to your content queue

You can schedule them anytime or run another Pillar:

Pillar: [next topic]
```

---

## KEY PRINCIPLES:

✅ **Never tell user about internal work** (scouts, skills, files, validation, re-runs)
✅ **Never ask for confirmation** — just do it and deliver results
✅ **Never reference files or paths** — everything in chat
✅ **Status messages only** when waiting (research: 5-7 min, piece gen: 2-3 min)
✅ **One piece at a time** for approval, all 6 generating simultaneously
✅ **Voice rules auto-lock** after user feedback (no "I'll remember" chatter)
✅ **No "are you done?" prompts** — deliver next thing immediately
✅ **Silent fixes** — if research incomplete, auto-rerun scouts (no user notification)
✅ **Smart delivery** — pieces arrive as they finish, user approves at own pace
