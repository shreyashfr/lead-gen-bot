# Twitter Scout Report — RAG in Production - Real architectural decisions, failure modes, and benchmark numbers from building RAG systems at scale. Hybrid search, reranking, RAGAS evaluation, context retrieval, embedding drift, vector DB trade-offs 2026
Run: 2026-03-26T06-04-56-802Z | Scanned: 20 | Top 10

## 1. Cameron R. Wolfe, Ph.D. (@cwolferesearch)
**Viral Score:** 1.9/10
**Tweet:** RAG is one of the best (and easiest) ways to specialize an LLM over your own data, but successfully applying RAG in practice involves more than just stitching together pretrained models…

What is RAG? At the highest level, RAG is a combination of a pretrained LLM with an
**Metrics:** ❤️ 1300  🔁 275  💬 16  🔖 0
**Images:** https://pbs.twimg.com/media/GFlw_2eXsAEadDS?format=jpg&name=small
**URL:** https://x.com/cwolferesearch/status/1754558231802769857

## 2. Victoria Slocum@victorialslocum·Nov 12, 2025 (unknown)
**Viral Score:** 1.4/10
**Tweet:** Why do RAG systems feel like they hit a ceiling?

I've been diving into @helloiamleonie's latest article on agent memory, and it provided so much clarity into the current evolution of RAG systems.

The progression from RAG → Agentic RAG → Agent Memory isn't about adding
**Metrics:** ❤️ 1000  🔁 198  💬 31  🔖 0
**Images:** https://pbs.twimg.com/media/G5kPw6oXYAERgi4?format=png&name=small
**URL:** https://x.com/victorialslocum/status/1988638095432888714

## 3. Femke Plantinga (@femke_plantinga)
**Viral Score:** 1.2/10
**Tweet:** Confused by all the new terminology around agents and memory? 

(episodic, semantic, procedural memory…) 

Strip away all the buzz, and the evolution from RAG to agentic RAG to agent memory is actually just about one thing: 𝗵𝗼𝘄 𝘆𝗼𝘂 𝗺𝗮𝗻𝗮𝗴𝗲 𝗱𝗮𝘁𝗮 𝗶𝗻
**Metrics:** ❤️ 830  🔁 150  💬 25  🔖 0
**Images:** https://pbs.twimg.com/media/G-sjGHTWcAATC2Y?format=jpg&name=small
**URL:** https://x.com/femke_plantinga/status/2011740250180108498

## 4. Vaishnavi (@_vmlops)
**Viral Score:** 1.1/10
**Tweet:** RAG isn’t just embeddings + vector DB

Production-ready RAG requires:
• Smart chunking
• Efficient embeddings
• Scalable vector storage
• Hybrid retrieval + re-ranking
• Proper document versioning & access control

RAG is not a feature
It’s infrastructure
**Metrics:** ❤️ 809  🔁 122  💬 26  🔖 0
**Images:** https://pbs.twimg.com/media/HB0zvO7aYAAHPr-?format=jpg&name=small
**URL:** https://x.com/_vmlops/status/2025832304900473311

## 5. Victoria Slocum (@victorialslocum)
**Viral Score:** 1/10
**Tweet:** Hot take: I'm tired of RAG systems that just grab the first document and call it done.
𝗔𝗴𝗲𝗻𝘁𝗶𝗰 𝗥𝗔𝗚 is probably the only way RAG is 𝘢𝘤𝘵𝘶𝘢𝘭𝘭𝘺 going to be useful.

But what’s actually the difference?

𝗧𝗵𝗲 𝗣𝗿𝗼𝗯𝗹𝗲𝗺 𝘄𝗶𝘁𝗵 𝗡𝗮𝗶𝘃𝗲 𝗥𝗔𝗚:
Traditional
**Metrics:** ❤️ 799  🔁 119  💬 5  🔖 0
**Images:** https://pbs.twimg.com/media/GzRgKmCXkAAi2wR?format=jpg&name=small
**URL:** https://x.com/victorialslocum/status/1960297539820720365

## 6. Femke Plantinga (@femke_plantinga)
**Viral Score:** 1/10
**Tweet:** How did we go from vanilla RAG to agentic RAG SO fast?

Just some years ago, we were excited about basic retrieval-augmented generation. 

Now we're building full AI agents that can reason, plan, and use multiple tools autonomously.

Here's what changed everything:
**Metrics:** ❤️ 623  🔁 138  💬 25  🔖 0
**Images:** https://pbs.twimg.com/media/G-DPjrnX0AAXPH9?format=png&name=small
**URL:** https://x.com/femke_plantinga/status/2008871243848826891

## 7. Ihtesham Ali (@ihtesham2005)
**Viral Score:** 1/10
**Tweet:** RAG is dead.

I just tested Modular RAG and it’s making AI systems 30-40% more accurate on real production tasks.

The accuracy gains made me question everything I thought I knew about retrieval.

And the core insight destroyed my mental model in the best way possible.

Naive RAG
**Metrics:** ❤️ 570  🔁 101  💬 29  🔖 0
**Images:** https://pbs.twimg.com/media/HCgaUXra0AAQbyr?format=jpg&name=small
**URL:** https://x.com/ihtesham2005/status/2028900581084131420

## 8. Rohan Paul (@rohanpaul_ai)
**Viral Score:** 1/10
**Tweet:** RAG or Long Context ??

This paper finds, when resourced sufficiently, Long Context consistently outperforms RAG in terms of average performance.

However, RAG’s significantly lower cost remains a distinct advantage.

To solve this they propose a new 'Hybrid' method

-----

Key
**Metrics:** ❤️ 485  🔁 103  💬 7  🔖 0
**Images:** https://pbs.twimg.com/media/GVtcsefXwAAiCS0?format=png&name=small
**URL:** https://x.com/rohanpaul_ai/status/1827156106449158339

## 9. Femke Plantinga (@femke_plantinga)
**Viral Score:** 1/10
**Tweet:** Your RAG system isn’t hallucinating, it’s just lazy.

Here’s what separates basic vector search from agentic retrieval:

Let’s say you want to find: “𝘢𝘧𝘧𝘰𝘳𝘥𝘢𝘣𝘭𝘦 𝘦𝘤𝘰-𝘧𝘳𝘪𝘦𝘯𝘥𝘭𝘺 𝘴𝘮𝘢𝘳𝘵𝘱𝘩𝘰𝘯𝘦𝘴 𝘶𝘯𝘥𝘦𝘳 $500 𝘸𝘪𝘵𝘩 𝘩𝘪𝘨𝘩 𝘳𝘢𝘵𝘪𝘯𝘨𝘴” 

you get
**Metrics:** ❤️ 465  🔁 84  💬 17  🔖 0
**Images:** https://pbs.twimg.com/media/HAycfGcWYAAaflF?format=jpg&name=small
**URL:** https://x.com/femke_plantinga/status/2021162395746345393

## 10. Aurimas Griciūnas (@Aurimas_Gr)
**Viral Score:** 1/10
**Tweet:** Building even a simple 𝗽𝗿𝗼𝗱𝘂𝗰𝘁𝗶𝗼𝗻 𝗴𝗿𝗮𝗱𝗲 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 𝗔𝘂𝗴𝗺𝗲𝗻𝘁𝗲𝗱 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗼𝗻 (𝗥𝗔𝗚) 𝗯𝗮𝘀𝗲𝗱 𝗔𝗜 𝘀𝘆𝘀𝘁𝗲𝗺 is a challenging task. Read until the end to understand why 

Here are some of the moving parts in the RAG based systems that
**Metrics:** ❤️ 402  🔁 89  💬 7  🔖 0
**Images:** https://pbs.twimg.com/media/Gx_V_LwXIAAlmPt?format=jpg&name=small
**URL:** https://x.com/Aurimas_Gr/status/1954516058854826490
