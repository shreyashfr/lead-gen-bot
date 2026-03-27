STATUS: READY
FORMAT: LinkedIn Post
IDEA_TITLE: What nobody tells you about the 6 months after your RAG demo works
---
building a RAG prototype took me a weekend.

shipping it to real engineers at Softeon took 6 weeks.

keeping it alive in production for 6 months. that's where nobody prepares you.

month 1: it works. everyone's happy. you move on to other things.

month 2: someone reports a wrong answer. you check the logs. looks fine. you close the ticket.

month 3: 4 more tickets. same pattern. the system is returning answers that look right but aren't. confidently. with citations. you realize your evaluation pipeline doesn't catch this because your eval set hasn't changed since launch.

month 4: you rebuild the eval pipeline. tie it to every ingestion run. add answer grounding checks. latency goes up 40ms. you accept the trade because silent failures cost more than milliseconds.

month 5: new document types break your chunking strategy. what worked for support docs doesn't work for API specs. you build a second chunking path. then a third. your "simple RAG system" now has 6 config files and a routing layer.

month 6: someone asks "can we add a new team's documents?" and you realize your vector isolation strategy was never designed for multi-tenant. you spend 2 weeks on namespace architecture you should've thought about on day 1.

the prototype was the easy part.

if you're building RAG right now, don't measure success by "does it return an answer."

measure it by "what happens when it returns the wrong one and nobody notices for 3 days."

that's the engineering problem most teams never see coming.

#GenAI #RAG #AgenticAI #LLMEngineering #SystemDesign #MLEngineering #ProductionAI #AIEngineering
