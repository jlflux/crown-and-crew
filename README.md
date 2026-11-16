# Crown & Crew

**A playable 2D fantasy autobattler RPG prototype.** Build your own hero, recruit companions, arrange a five-unit team, and watch tactical battles play out. Winning requires good formations, improved equipment, and intelligent use of abilities—not lootboxes or paid summons.

This is a standalone game, distinct from the Ricochet Rivals physics prototype.

## Launch on Vercel

1. Open [Vercel → Add New Project](https://vercel.com/new).
2. Import **[jlflux/crown-and-crew](https://github.com/jlflux/crown-and-crew)**.
3. Set **Framework Preset: Other**.
4. Leave **Root Directory** set to the repository root. Leave **Build Command** and **Output Directory** empty / use defaults.
5. Click **Deploy**.

The entire project is static HTML, CSS, and JavaScript. It **does not require npm, environment variables, a database, API keys, or backend services**. Vercel serves \`index.html\` directly. You can also open \`index.html\` in a browser or run \`python3 -m http.server 8080\` locally.

## What is playable in version 0.1

- **Hero creator:** Name your hero, choose Guardian / Ranger / Arcanist, and choose your banner color.
- **Guild roster:** Start with Brann (tank), Orin (fighter), Lyra (healer), and Kael (ranger). Recruit four more named companions as the campaign progresses: Niva, Sable, Mira, and Rook. There is **no random/gacha recruitment**.
- **Formation:** Place five heroes into **two frontline** and **three protected backline** slots. Frontline units are preferentially attacked. Assassins can jump past the front line, healers heal injured allies, and tanks can taunt attacks.
- **Animated battle:** Original procedurally drawn 2D fantasy characters, weapons, effects, health bars, and projectiles. Basic attacks run automatically. Ultimate abilities can be set to **automatic** or manually activated. Speed controls 1×, 2×, 3×.
- **Campaign:** 10 progressively more difficult encounters across Hollowwood, Redstone, Mirefen, and Blackspire. The fifth and tenth are boss stages. Clear each stage to unlock the next. Repeat stages for reduced rewards.
- **Progression:** Spend gold and essence to level individual heroes (max level 12) or strengthen their ultimate abilities (max skill level 5).
- **Equipment:** Earn named item drops from campaign milestones. Equip each item to one hero, and upgrade gear to improve its combat bonuses.
- **Guild Hall:** Upgrade Training Yard (crew attack), Sanctuary (crew maximum health), and Guild Treasury (gold earned).
- **Persistent local save:** Hero, roster, formation, levels, skills, equipment, resources, cleared stages, and guild upgrades are saved in your browser's \`localStorage\` using the key \`crown-and-crew-save-v1\`.

## First-time walkthrough

1. Choose **Guardian** for a defensive captain, **Ranger** for high single-target damage, or **Arcanist** for powerful area magic.
2. Review your formation. Frontline heroes are attacked before backline units in most situations. If your captain is a Ranger/Arcanist, the initial formation protects them in the rear.
3. Hit **Begin Battle** at Stage 1 — The Old Road.
4. Watch how Brann protects the team, Lyra heals, and Kael attacks from safety.
5. Switch **Auto Ult: OFF** to activate abilities manually once their yellow energy bar is full.
6. After the victory, return to the campaign, inspect your roster, upgrade heroes, adjust the formation, and continue.
7. If you're losing, try changing who stands in front or equipping your strongest gear to the companion doing the most work.

## Battle rules

- Five active heroes on each side, except some introductory encounters can vary in composition.
- Heroes attack automatically based on their stats, class, slot, and target selection.
- Normal units usually target enemy frontliners first. Assassins favor vulnerable backliners. Taunt overrides normal target priorities.
- Healers focus damaged allies. Support heroes can grant shields.
- Attacks and received damage generate **ultimate energy**. At 100 energy a hero can activate their unique skill (automatically, or manually if Auto Ult is off).
- Battle ends when a team is defeated. Overtime pressure helps prevent healing stalemates; remaining health decides a close fight when the 65-second cap is reached.
- Victory rewards gold, essence, guild renown, and sometimes a named item. A loss grants a small amount of gold but does not unlock the next stage.

## Test the game

Run the built-in smoke test (Node 20+):

\`\`\`bash
node tests/smoke.cjs
\`\`\`

This checks the full 10-stage dataset, all player classes, battle resolution, ability upgrades, and script references. The battle, character-creation, and local-save flows have also been exercised through a browser-DOM simulation, but **an actual interactive browser visual playtest is still recommended** before treating this as polished.

## Repository structure

| File | Purpose |
|---|---|
| \`index.html\` | App shell, hero creator, battle overlay |
| \`styles.css\` | Responsive fantasy RPG interface |
| \`data.js\` | Character archetypes, eight companions, enemies, stages, equipment, hall |
| \`engine.js\` | Pure combat simulation, targeting, abilities, damage, shields, healing, win conditions |
| \`battle-view.js\` | Procedural 2D characters, backdrops, weapon and spell animations |
| \`game.js\` | UI, progression state, roster management, campaign rewards, storage |
| \`tests/smoke.cjs\` | Node smoke tests |

## Roadmap — intentionally not included yet

- Online accounts, cloud saves, asynchronous PvP, global ranks/leaderboards, guild chat
- Full character spritesheets / premium animation assets and audio
- Procedural dungeon mode, endless tower, daily challenges
- Equipment rarity crafting, side professions, player trading
- A real backend, multiplayer matchmaking, payments or gacha systems

**Version 0.1 is a gameplay prototype, not an MMO or a finished live-service game.** Its purpose is to test whether building a team, changing your formation, leveling up and watching the team perform creates the compelling loop we want. The first priority for feedback is combat readability and tactical depth. No network account means saves remain on that browser and may be lost when browser storage is cleared.
