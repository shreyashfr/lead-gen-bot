---
name: user-scheduler
description: >
  Creates, updates, pauses, or deletes per-user content schedule cron jobs.
  Called during onboarding to set up the user's first schedule, or when a user
  wants to reschedule, pause, or resume their content reminders.
---

# User Scheduler

Manages content schedule cron jobs for individual users.

---

## SCHEDULE → CRON CONVERSION

IST is UTC+5:30. All crons run in UTC.

**Conversion formula:** `UTC_hour = IST_hour - 5`, `UTC_minute = IST_minute - 30`
Handle carry: if minute goes negative, subtract 1 from hour and add 30 to minute.

**Examples:**
- 9:00 IST = 3:30 UTC → `30 3 * * [day]`
- 10:00 IST = 4:30 UTC → `30 4 * * [day]`
- 7:00 PM (19:00) IST = 13:30 UTC → `30 13 * * [day]`
- 8:00 AM IST = 2:30 UTC → `30 2 * * [day]`

**Day of week numbers (for cron):**
- Sunday = 0
- Monday = 1
- Tuesday = 2
- Wednesday = 3
- Thursday = 4
- Friday = 5
- Saturday = 6

---

## ACTION: CREATE SCHEDULE

Called with:
- `USER_ID` — Telegram ID
- `USER_NAME` — their first name  
- `frequency` — "weekly" or "daily"
- `day` — day name (weekly only)
- `time_ist` — time string like "9:00am", "19:00", "7pm"
- `USER_WORKSPACE` — their workspace path

### Steps:

**1. Parse the time**
Convert `time_ist` to 24h format, then compute UTC equivalent.

**2. Build cron expression**
- Daily: `{UTC_minute} {UTC_hour} * * *`
- Weekly: `{UTC_minute} {UTC_hour} * * {day_number}`

**3. Build reminder message**
```
Hey {USER_NAME}! 📅 Time for your content session.

What's your topic today? Just reply:
  Pillar: [your topic]

I'll handle the rest — research, ideas, writing, Airtable.
```

**4. Create the cron job** using the `cron` tool:
```json
{
  "name": "content-reminder-{USER_ID}",
  "schedule": {
    "kind": "cron",
    "expr": "{cron_expression}",
    "tz": "UTC"
  },
  "payload": {
    "kind": "systemEvent",
    "text": "CONTENT_SCHEDULE_REMINDER | user_id={USER_ID} | user_name={USER_NAME} | workspace={USER_WORKSPACE} | message: Hey {USER_NAME}! 📅 Time for your content session.\n\nWhat's your topic today? Just reply:\n  Pillar: [your topic]\n\nI'll handle the rest — research, ideas, writing, Airtable."
  },
  "sessionTarget": "main"
}
```

**5. Save the cron job ID**
Update `{USER_WORKSPACE}schedule.json`:
```json
{
  "frequency": "weekly|daily",
  "day": "sunday|null",
  "time_ist": "10:00",
  "time_utc": "04:30",
  "cron_expression": "30 4 * * 0",
  "cron_job_id": "{job_id_from_cron_tool}",
  "active": true,
  "created": "{today}"
}
```

Also update `registry.json` with the schedule and `cron_job_id`.

---

## ACTION: UPDATE SCHEDULE

When user says "reschedule", "change my schedule", etc.

1. Read their current `schedule.json` to get `cron_job_id`
2. Ask what they want to change (day? time? frequency?)
3. Compute new cron expression
4. Use `cron` tool with `action=update`, `jobId={cron_job_id}`, new schedule
5. Update `schedule.json` and `registry.json`

Confirm:
```
✅ Schedule updated!
New time: {day} at {time_ist} IST
Next reminder: {next occurrence}
```

---

## ACTION: PAUSE SCHEDULE

When user says "pause", "stop reminders", "take a break".

1. Read `schedule.json` for `cron_job_id`
2. Use `cron` tool: `action=update`, `patch: { enabled: false }`
3. Update `schedule.json`: `active: false`

Reply:
```
⏸️ Reminders paused. Your content setup is still saved.
When you're ready to resume, just say "resume schedule".
```

---

## ACTION: RESUME SCHEDULE

1. Read `schedule.json` for `cron_job_id`
2. Use `cron` tool: `action=update`, `patch: { enabled: true }`
3. Update `schedule.json`: `active: true`

Reply:
```
▶️ Reminders are back on!
Next one: {day} at {time_ist} IST.
```

---

## ACTION: DELETE SCHEDULE

When user says "delete my schedule", "cancel everything", or account is being removed.

1. Read `cron_job_id` from `schedule.json`
2. Use `cron` tool: `action=remove`, `jobId={cron_job_id}`
3. Delete or clear `schedule.json`

---

## HANDLING SCHEDULE REMINDER FIRING

When a cron fires with the `CONTENT_SCHEDULE_REMINDER` system event:

1. Parse the event text to extract `user_id`, `user_name`, `workspace`
2. Send the reminder message via the Telegram channel to the user
3. The reminder message prompts them to reply with `Pillar: [topic]`
4. When they reply, the dispatcher routes it to pillar-workflow with their context

> **Note:** The cron uses `sessionTarget: main` so the main session receives it.
> The main session should then use the `message` tool or direct reply to reach the Telegram user.
> Since the bot is single-channel Telegram, the reply will go to that Telegram chat.
> For multi-user: send to the specific user's Telegram ID using `message` tool with `target={USER_ID}`.

### Sending the reminder to the right user:
Use:
```
message(action="send", channel="telegram", target="{USER_ID}", message="{reminder_text}")
```

---

## SCHEDULE SUMMARY FORMAT

When asked to show their schedule:
```
📅 Your Content Schedule

Frequency: {weekly/daily}
{Day: Sunday | (daily)}
Time: {time_ist} IST
Status: {Active ✅ / Paused ⏸️}

Next reminder: {date + time}
```
