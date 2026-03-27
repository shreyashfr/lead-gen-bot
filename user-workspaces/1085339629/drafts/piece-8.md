STATUS: READY
FORMAT: LinkedIn Post
IDEA_TITLE: Why your LLM system needs circuit breakers before it needs a better model
---
most teams spend weeks picking the right model. almost none of them spend a single hour planning what happens when that model goes down during peak traffic.

and it will go down.

the model isn't the weak point. the system around it is.

no fallback. no circuit breaker. no timeout that actually matches the model's response time under load. just a direct API call wrapped in a try-catch and a hope that the provider stays healthy.

here's what makes LLM API calls different from calling a database: they're slow, expensive, and unpredictable. response times can swing from 800ms to 12 seconds on the same endpoint depending on provider load. rate limits hit without warning. and when the provider has an incident, your system doesn't get a graceful error. it gets a 30-second hang that cascades through every downstream service.

a circuit breaker for LLM calls needs to track three things:

failure rate over a rolling window. not just 5xx errors. include timeouts, rate limit responses, and responses that exceed your latency SLA.

a fallback chain. primary model fails, route to a smaller model. smaller model fails, serve a cached response. cached response is stale, return a honest "try again in a moment" instead of hanging forever.

a half-open state that tests recovery properly. don't flip the circuit back to closed after a timer. send a single probe request first. if it succeeds within your latency budget, resume traffic gradually.

model selection is maybe 20% of the reliability problem. the other 80% is what your system does when the model isn't there.

#GenAI #RAG #AgenticAI #LLMEngineering #SystemDesign #MLEngineering #ProductionAI #AIEngineering
