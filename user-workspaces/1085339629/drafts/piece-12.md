STATUS: READY
FORMAT: LinkedIn Post
IDEA_TITLE: The interview where I couldn't defend a single architectural decision
---
the interviewer asked why I chose vector search over full-text.

I said "because that's what the tutorial used."

the room went quiet. not in an uncomfortable way. more like he was waiting for me to realize what I'd just said.

he moved on. asked about my chunking strategy. I described what I'd built. he asked why 512 tokens and not 256. I didn't have an answer.

he asked about reranking. I explained the pipeline. he asked when I would NOT use a cross-encoder reranker. I had never thought about it.

every question was the same shape: not "what did you build" but "why did you build it that way, and when would you build it differently."

I could describe the system. I could not defend it.

that interview changed how I approach every technical decision. not because I suddenly got smarter. but because I started asking myself the same questions before anyone else could.

why this vector DB and not that one. what breaks first under 10x load. what's the latency cost of adding reranking and when is that cost not worth paying. what happens when the retriever returns bad context and the system has no way to self-correct.

the engineers who can answer "what did you build" are everywhere. the ones who can answer "why, and when would you not" are the ones who get through technical rounds at companies building real AI products.

every architectural decision should come with a boundary condition. if you can't name when your choice would be wrong, you don't fully understand why it's right.

now every system I build starts with three questions: why this approach and not the alternative. what breaks first under load. and when would I make a completely different decision. the interview was embarrassing. it was also the most useful 45 minutes of my engineering career.

#GenAI #RAG #AgenticAI #LLMEngineering #SystemDesign #MLEngineering #ProductionAI #AIEngineering
