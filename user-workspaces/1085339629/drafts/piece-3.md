STATUS: READY
FORMAT: Twitter Thread
IDEA_TITLE: Contextual retrieval in production: the recall gain and the hidden ingest cost
---
1/ vanilla vector search typically lands around 78% recall on long-document queries.

contextual retrieval can push that past 90%.

the cost nobody warns you about: 2x chunk processing time on every ingest run. here's the full breakdown.

2/ quick context. contextual retrieval adds a step before embedding. instead of chunking a document and embedding raw chunks, you first generate a short context summary for each chunk using the full document as reference.

the chunk now carries its own context. retrieval quality jumps because the embedding actually knows what the chunk is about.

3/ representative recall numbers from published benchmarks:

vanilla vector search: ~78%
hybrid search (BM25 + vector + RRF): ~89%
contextual retrieval + hybrid: ~91-94%

that last few percent sounds small. on a system handling 500+ daily queries it's dozens fewer wrong answers per day.

4/ the hidden cost: ingest time.

every chunk now requires an LLM call to generate its context summary. for a corpus with ~1M documents averaging 12 chunks each, that's ~12M LLM calls just for ingestion.

even with batching and a fast model, you're looking at roughly 2x your previous ingest pipeline duration.

5/ when to accept this trade:

high-stakes queries where wrong answers have real consequences (support systems, compliance, internal tooling for engineers). the ingest cost is a one-time hit per document. the recall gain compounds on every query.

6/ when to skip it:

consumer-facing systems with sub-second freshness requirements. if documents are changing every few minutes and your users expect instant retrieval, you can't afford a 2x ingest bottleneck on every update cycle.

7/ the architecture decision that matters most here: where you place contextual retrieval in your pipeline.

before the vector store = better recall, slower ingest.
as a reranking step after retrieval = no ingest cost, but you're only contextualizing what was already retrieved (which might be wrong).

8/ one more thing worth tracking: context drift.

the summaries generated during ingestion are frozen at the time of processing. if your document corpus evolves and the surrounding context changes, those summaries go stale.

tie your re-ingestion schedule to corpus change rate. not calendar time.

9/ the real question isn't "should we use contextual retrieval."

it's "what's our recall threshold, what's our ingest budget, and where do those two lines cross."

every RAG architecture decision comes down to that kind of trade.
