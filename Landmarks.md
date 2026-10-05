# Landmarks

Where everything is in the lobby. Coordinates are metres, `(x, z)`, with +X east, +Z south and +Y up. North (-Z) is the Lift tower. The source of truth is [src/data/world.js](src/data/world.js); if a value here disagrees with that file, the file wins.

## Map

```
                      N (-Z)
        z=-72  ┌──────────┐ ┌──────────┐   LIFT corridor runs
               │ Cursed · Jet · Skull  │   north from the gap
               │ Robot Aura ·· Sell    │
   Pool +      │          HUB (0,-45)  │         Training
   boards      │  Upgrades ·· Arms     │         pads + banner
        z=-28  │          ║            │
               │  Plot ═══╬═══ Plot    │   chevron path
               │  Plot ═══╬═══ Plot    │   runs south
               │  Plot ═══╬═══ Plot    │
        z= 48  └───────────────────────┘
          x=-56                      x=56
                      S (+Z)
```

## Arena

| Item | Value |
| --- | --- |
| Walkable bounds | x -56..56, z -72..48, plus the Lift corridor north to z -198 |
| Walls | 5 m high, blue checkered, green rim on top |
| Trees | on the green rim behind the Lift and along the east/west edges |

## Spawn and hub

| Landmark | Position | Notes |
| --- | --- | --- |
| Hub centre / emblem | (0, -45) | Black spiky sun on the plaza |
| Player spawn | (0, -43) | Faces north toward the Lift |
| Plaza | north path x -5..5, cross arms to x -32 and x 30 | Grey studded tiles |

## Lift corridor

A walled channel (18 m wide, 5 m high blue side walls) running north from the plaza through the arena's north wall. Zones of dark loot floor are separated by luck barriers; each barrier has an orange LIFT stripe in front. Cyan glow trims run along both floor edges.

| Part | Position | Notes |
| --- | --- | --- |
| Corridor mouth | z -72 | Flush with the hub's north wall; the wall continues either side, x ±9 |
| x1 zone marker | z -72..-76 | Pale green slab with clover and "x1" |
| Timer board | z -84, bottom 6 m | Spans the corridor on posts in the side walls |
| Barriers | x2 z -94..-99 (0/500), x3 z -121..-126 (0/1.5K), x4 z -148..-153 (0/3K), x5 z -175..-180 (0/5K) | 5 m tall: label plinth plus two rock steps |
| LIFT stripes | 2 m wide, directly south of each barrier | |
| Corridor end | z -200 | Capped by a wall |

## Stalls

Each stall has a coloured ring in front of it, which is where an interaction would be triggered (not wired up yet).

| Stall | Position | Colour | Shopkeeper |
| --- | --- | --- | --- |
| Sell | (12, -55) | Green | Yellow-faced, shades, black shirt |
| Arms | (12, -35) | Orange | Pale, all black |
| Aura | (-12, -55) | Purple | None |
| Upgrades | (-12, -35) | Blue | None |

## Treasure showcase

| Treasure | Rarity | Value | Position |
| --- | --- | --- | --- |
| Robot Head | Secret | $71.4M | (-17, -66) |
| Cursed Box | Celestial | $580M | (-11, -69) |
| Jet | Secret | $90M | (-11, -63.5) |
| Infinity Skull | Exclusive | 983/1000 | (11, -66) |

## West: pool and leaderboards

| Landmark | Position |
| --- | --- |
| Pool | x -51..-35, z -60..-32 |
| Top Cash board | (-46, -53.5), turned 0.4 rad inward |
| Top Power board | (-47.5, -46), set back, faces east |
| Top Time board | (-46, -38.5), turned 0.4 rad inward |

## East: training

One raised periwinkle platform (x 30..48, z -68..-28) with two rows of five 5 m slots. Slots run north to south at z -64, -56, -48, -40, -32. The front row (x 34) faces the plaza; its middle slot (z -48) is left open as the entrance. The back row is at x 43. Each pad has a coloured rim, two dumbbells in a V, and a label plaque above its back edge. The TRAINING banner (gold, slanted) is on the east wall at x 55, centred on the platform.

| Row | Slot z | Power | Requirement | Pad |
| --- | --- | --- | --- | --- |
| Front | -64 | x2 | 1 rebirth | Teal, orange rim |
| Front | -56 | x1.5 | Starter | Purple |
| Front | -48 | | | Entrance (open) |
| Front | -40 | x5 | 2 rebirths | Yellow |
| Front | -32 | x25 | 7 rebirths | Cyan |
| Back | -64 | x15* | 29 hex | Dark red |
| Back | -56 | x10 | 4 rebirths | White, teal rim |
| Back | -48 | x100* | 559 hex | Colour-cycling, spotted bells |
| Back | -40 | x50 | 10 rebirths | Green |
| Back | -32 | x250* | 225 hex | Giant cookie |

\* Power is a placeholder: the reference screenshots hide that label text.

## South: player plots

Six plots, 32 × 18 m, in three rows either side of the chevron path (x -7..7 is kept clear). Each has a red carpet with yellow edges and two rows of six dark treasure slots.

| Plot | Centre | Notes |
| --- | --- | --- |
| West row 1 (home) | (-23, -21) | Two storeys, ladder, trophies, house marker. The **Home** button teleports to (-9.5, -21). |
| East row 1 | (23, -21) | |
| West row 2 | (-23, 3) | |
| East row 2 | (23, 3) | |
| West row 3 | (-23, 27) | |
| East row 3 | (23, 27) | |

## Not yet interactive

Stalls, treasure pedestals, training pads, the Lift pad and plot slots are visual only. Only the **Spawn** and **Home** HUD buttons do anything (they teleport the player).
