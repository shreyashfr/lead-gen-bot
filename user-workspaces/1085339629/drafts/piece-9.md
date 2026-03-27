STATUS: READY
FORMAT: Twitter Thread
IDEA_TITLE: NFRs for AI systems that traditional system design interviews never cover
---
1/ latency. throughput. availability. durability.

those are the NFRs every system design interview covers.

for AI systems, you need at least 4 more. and most teams don't discover them until production breaks in ways their monitoring can't explain.

2/ NFR #1: answer quality.

traditional systems return data. AI systems return opinions dressed as facts.

"is the system up?" is not the same question as "is the system correct?" you need a continuous evaluation layer that scores live responses against ground truth. not once at launch. every day.

3/ NFR #2: cost per query.

in traditional systems, serving a request costs fractions of a cent. in LLM systems, a single complex query with retrieval + reranking + generation can cost meaningfully more than a simple API call.

your cost-per-query NFR directly shapes your architecture decisions: which model, how much context, whether to cache.

4/ NFR #3: failure detectability.

in a classic backend, failures are loud. 500 errors. timeouts. broken connections. your alerting catches them in seconds.

in an AI system, the worst failures are silent. the model returns a confident wrong answer. a 200 response. low latency. your dashboard is green. your users are getting bad information.

time-to-detect for quality failures needs its own SLA. "we'll know within 4 hours" is very different from "we'll know when a user tweets about it."

5/ NFR #4: context freshness.

how stale is the data your model reasons over?

if your RAG index updates daily but your users expect real-time answers, you have a correctness gap that no amount of model quality can fix. context freshness needs a defined SLA just like data replication lag in a distributed database.

6/ NFR #5: cost predictability.

different from cost-per-query. this is about variance.

a traditional system at 2x traffic costs roughly 2x compute. an LLM system at 2x traffic can cost significantly more than 2x if the new queries are longer, hit more retrieval steps, or trigger more retries. your CFO needs a cost model that accounts for this non-linearity.

7/ NFR #6: graceful degradation under quality loss.

traditional systems degrade by serving slower or returning partial data. AI systems need a different degradation path.

model quality drops below threshold? fall back to a smaller model. retrieval confidence is low? return "i don't have enough information" instead of guessing. this needs to be designed, not improvised during an incident.

8/ the gap between "can design a scalable backend" and "can design a reliable AI system" lives in these 6 NFRs.

traditional system design is table stakes. the engineers who can layer AI-specific requirements on top are the ones building systems that survive contact with real users.
