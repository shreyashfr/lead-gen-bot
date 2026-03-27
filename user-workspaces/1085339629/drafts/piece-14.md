STATUS: READY
FORMAT: Twitter Thread
IDEA_TITLE: The gap between knowing LangChain and knowing when not to use it
---
1/ I used LangChain for everything. retrieval chains, document loaders, custom agents, evaluation pipelines.

then I hit a wall where the abstraction was costing me more than it was saving.

here's what I figured out about when to use libraries vs when to write your own.

2/ the junior mistake: debating whether to use LangChain or not.

the senior move: knowing exactly which components fall into the library bucket and which fall into the custom bucket. and being able to justify the split.

3/ libraries own commoditized components.

document loaders. vector store wrappers. basic retrieval chains. embedding model integrations. these are infrastructure plumbing. every RAG system needs them. there's no competitive advantage in writing your own PDF parser.

4/ custom code owns differentiated logic.

your reranking strategy. your context prioritization rules. your evaluation pipeline. your query decomposition logic. your fallback chain when retrieval confidence is low.

this is where your system's intelligence lives. and it's where library abstractions start hurting you.

5/ the problem with abstracting your differentiated logic: you lose control over the exact behavior at the edges.

when LangChain's retrieval chain handles a failed retrieval, it does what the library decided. not what your users need. you can override it, but at some point you're fighting the framework instead of building your system.

6/ the boundary I use now:

if the component exists in every RAG system regardless of use case, use the library. you're not getting paid to reinvent document chunking.

if the component is what makes YOUR system different from a generic tutorial, write it yourself. you need full control over how it behaves, how it fails, and how it evolves.

7/ the real cost of getting this wrong isn't technical. it's velocity.

teams that use libraries for everything move fast at first, then slow down when every customization is a fight against the framework.

teams that write everything custom move slow at first, then slow down because they're maintaining infrastructure nobody asked them to build.

8/ the engineers who get this balance right ship faster AND have more control. they're not religious about either approach. they're surgical.

the question isn't "LangChain or custom." it's "for this specific component, which choice gives me speed now and control later."
