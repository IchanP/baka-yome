# Baka Yome

Baka Yome is a tracker for Japanese immersion — the reading and listening you do to actually learn the language, and the hours and characters that go into it. It's one place to keep all of that, that I own.

## Why I made it

Immersion is a numbers-over-time thing. You don't feel yourself improving day to day, so it helps a lot to look back and see the days stack up. I wanted a heatmap I'd feel bad about breaking — a small nudge to read a little Japanese every day.

Before this, I logged everything through a Discord bot. It worked, but my data lived on someone else's server in a shape I couldn't really do anything with. I wanted it back — somewhere I could store it how I liked and eventually build real statistics on top of it, like how my reading speed changes over the months.

## What it does

- Log reading and listening sessions separately, each in characters and minutes, tagged with whatever source you were immersing with.
- See a year-long heatmap that shades each day by how much you did — the calendar makes streaks and gaps obvious.
- Switch between reading, listening, or an overall view that combines the two into one map.
- Get quick headline stats and a feed of your most recent sessions.
- Everything saves to a database and shows up instantly, so logging never makes you wait.

## Built with

Next.js (App Router), React, TypeScript, Supabase, and SWR. Mobile-first and responsive.
