STATUS: READY
FORMAT: LinkedIn Post
IDEA_TITLE: The system design interview question nobody asks: what happens when your LLM returns confidently wrong?
---
every system design interview asks about scaling. about availability. about caching.

almost none of them ask: what does your system do when the model is wrong and doesn't know it?

this is the gap between traditional system design and AI system design. and it's massive.

in a classic backend, a failure is observable. a 500 error. a timeout. a null response. your monitoring catches it. your circuit breaker trips. the system degrades gracefully.

in an LLM-powered system, the most dangerous failure looks exactly like success. a 200 response. low latency. a confident, well-structured answer. that happens to be wrong.

your uptime dashboard says everything is fine. your users are getting bad answers. and nothing in your observability stack is designed to catch it.

this is why AI system design requires a different set of non-functional requirements.

traditional NFRs: latency, throughput, availability, durability.

AI-specific NFRs you should be designing for:

answer quality. not "does the model respond" but "is the response correct." this needs an evaluation layer that runs continuously, not just at launch.

failure detectability. how long between a quality regression and someone on your team knowing about it? if the answer is "when a user complains," your monitoring has a blind spot the size of your entire AI layer.

cost predictability. LLM costs scale with usage in ways that traditional compute doesn't. a viral feature can 10x your model bill overnight with zero warning from your infrastructure metrics.

context freshness. how stale is the data your model is reasoning over? if your RAG index hasn't been refreshed in a week but your users expect real-time answers, you have a silent correctness problem.

the engineers who can design for these four things on top of the traditional NFRs are the ones AI startups actually need right now.

the interview question worth preparing for isn't "design a chat system." it's "design a chat system where the model is wrong 5% of the time and your users can't tell."

#GenAI #RAG #AgenticAI #LLMEngineering #SystemDesign #MLEngineering #ProductionAI #AIEngineering
