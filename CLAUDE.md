# ClarityOS — Project Spec

This file is the foundational doc. Every future Claude Code session reads it on autoload. Update it whenever a decision is made that future-you would otherwise have to re-derive.

## STATUS

**Coaching framework is being rebuilt from the ground up.**

The previous framework — 11-step cognitive-strategist protocol drawing on IFS, memory reconsolidation, somatic awareness, cognitive restructuring, etc. — has been scrapped. Do not reintroduce it. Do not infer the new framework from the old one.

The deployed app is currently neutered: the system prompt instructs the model to respond with a single "ClarityOS is being rebuilt" line and refuse to coach. This stays until the new framework is operationalised.

## THE NEW MECHANISM (the only spec currently locked)

```
1. Lower analytical resistance
2. Let the subconscious choose the emotionally charged memory
3. Re-enter the memory vividly
4. Observe the implicit emotional meaning
5. Update/rewrite the emotional interpretation
6. Merge the younger self with the present self
```

Everything else — voice, refusal protocol, session shape, opening move, diagnostic signal, identity of the AI, target user, positioning copy — is **undefined and awaiting instruction**. Do not assume any of it carries over from the previous spec.

## INFRA (kept — framework-agnostic)

- `api/chat.js` — Vercel serverless proxy to Anthropic. Keeps `ANTHROPIC_API_KEY` server-side. Prompt-caches the system prefix.
- `src/systemPrompt.js` — single exported string. Currently a placeholder that refuses to coach.
- `src/App.jsx` — minimal chat UI. Dark, mobile-first, no router, no auth, no persistence.
- `.env.example` — env var shape.
- Repo: https://github.com/luke123mcc-beep/ClarityOS
- Live: https://clarity-os-nine-ochre.vercel.app (auto-deploys from `main`)
- Env var `ANTHROPIC_API_KEY` lives in Vercel Project Settings, not in this repo.

## BUILD RULES (still apply)

1. The system prompt is the product. Iterate disproportionately there.
2. `ANTHROPIC_API_KEY` never reaches the browser. All Claude calls go through `/api/chat`.
3. Push to `main` = ship. Vercel auto-deploys.
4. Lean dependencies. No UI libs, no router, no Tailwind until justified.

## WHAT NOT TO DO RIGHT NOW

- Don't write a system prompt based on the 6-step mechanism alone. The mechanism is the *what*; the *how* (voice, opening move, transitions between steps, refusal rules, what "vividly re-enter" looks like in chat) is what makes it work — and none of that has been specified yet.
- Don't reintroduce vocabulary from the old framework (cognitive strategist, IFS, resonance check, 11-step protocol, hard refusal domains, etc.). Some of it may come back; assume none of it does until told.
- Don't ship the new coach prompt until the spec for the *how* is given.
