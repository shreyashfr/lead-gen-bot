# Rate Limits — Content Engine

## Limits

| Action | Limit | Window |
|--------|-------|--------|
| Messages | 15 messages | Per hour |
| Pillar runs | 3 runs | Per day |
| Competitive scans | 2 scans | Per day |

## How to Check

Read `{USER_WORKSPACE}usage.json`. If file doesn't exist, create it fresh.

Structure:
```json
{
  "messages": {
    "count": 0,
    "window_start": "2026-03-13T10:00:00Z"
  },
  "pillar_runs": {
    "count": 0,
    "window_start": "2026-03-13T00:00:00Z"
  },
  "competitive_scans": {
    "count": 0,
    "window_start": "2026-03-13T00:00:00Z"
  }
}
```

## Enforcement Rules

### Messages (hourly window)
- If `now - window_start > 1 hour` → reset count to 0, update window_start
- If `count >= 15` → send rate limit message, STOP
- Otherwise → increment count, proceed

### Pillar runs / Competitive scans (daily window — resets at midnight UTC)
- If `now.date > window_start.date` → reset count to 0, update window_start
- If pillar count >= 3 → send rate limit message, STOP
- If scan count >= 2 → send rate limit message, STOP
- Otherwise → increment count, proceed

## Rate Limit Messages

### Message spam:
```
⏳ You're sending messages too fast.

You can send up to 15 messages per hour. Your limit resets at {reset_time UTC}.

Need help? shreyash.chavan2016@gmail.com
```

### Pillar run limit:
```
⏳ You've used all 3 pillar runs for today.

Your limit resets at midnight UTC. Reply with a topic to queue it for tomorrow.

Need more runs? shreyash.chavan2016@gmail.com
```

### Competitive scan limit:
```
⏳ You've used both competitive scans for today.

Your limit resets at midnight UTC.

Need help? shreyash.chavan2016@gmail.com
```

## Always update usage.json after every action.
