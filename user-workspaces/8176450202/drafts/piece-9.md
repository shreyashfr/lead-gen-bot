# Piece #9: Serving ML Models in Production

You have a model. Now make it predict 10,000 games per second without melting.

This is the real problem nobody talks about.

In your Jupyter notebook, your model runs fine. 50ms per prediction. Cool. But move it to production and suddenly you're serving thousands of requests per second. Your GPU melts. Your CPU maxes out. Your inference costs explode.

The gap between "model works" and "model scales" is bigger than most people realize.

Here's what actually matters:

**Batching is your best friend.**
Don't predict one game at a time. Collect requests for 64 or 128 games, then run them together. A single forward pass on 128 samples is way faster per-sample than 128 separate passes. This is the difference between serving 100 req/s and 10,000 req/s.

**Quantization cuts your memory in half.**
Your model probably uses float32. Convert to int8. You lose 1-2% accuracy but gain massive speed and cut memory usage. On a GPU with limited VRAM, this is the difference between possible and impossible.

**Caching is underrated.**
If the same game position appears twice, you don't re-compute it. Build a fast cache layer in front of your model. Memcached or Redis. You'll be surprised how many duplicate requests you get.

**Choose the right hardware.**
A Tesla T4 might be cheap, but an RTX 4090 or TPU serves 10x faster. Sometimes you spend more on hardware and save money on inference costs. Do the math.

Most people start with one model and one server. Then it breaks under load. Then they panic.

Instead, think about this upfront. How will 10,000 requests per second actually look? Will you batch? Quantize? Cache? Run multiple servers? Use a serving framework like TensorFlow Serving or ONNX Runtime.

The engineers building real systems start here. Not after it breaks.

System design isn't just databases and caches. It includes your model serving layer too.

What's your approach? Batching? Quantization? Or do you have a different trick?
