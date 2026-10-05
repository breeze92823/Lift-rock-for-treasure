# Landmarks

Where everything is in the lobby. Coordinates are metres, `(x, z)`, with +X east, +Z south and +Y up. North (-Z) is the Lift tower. The source of truth is [src/data/world.js](src/data/world.js); if a value here disagrees with that file, the file wins.

## Map

```
                      N (-Z)
        z=-72  ┌──────────┐ ┌──────────┐   LIFT corridor runs
               │ Cursed · Jet · Skull  │   north from the gap
               │ Robot  Sell ·· Arms   │
   Pool +      │          HUB (0,-45)  │         Training
   boards      │      Aura ·· Upgrades │         pads + banner
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
| Sell | (-11, -59) | Green | Yellow-faced, shades, black shirt |
| Arms | (11, -59) | Orange | Pale, all black |
| Aura | (-15, -35) | Purple | None |
| Upgrades | (15, -35) | Blue | None |

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
| Pool | x -52..-33, z -64..-28 |
| Top Cash board | (-46, -56) |
| Top Power board | (-46, -46) |
| Top Time board | (-46, -36) |

## East: training

| Landmark | Position | Notes |
| --- | --- | --- |
| Walkway | x 39, z -67..-29 | Blue-edged, raised |
| Pad columns | x 32.5 and x 45.5 | Alternate left / right by pad index |
| Pad rows | z -64, -56, -48, -40, -32 | Two pads per row |
| TRAINING banner | x 55, centred on the pad rows | Slanted rainbow sign facing the arena |

Pads, in order (index 0 is column 32.5, row z -64):

| # | Power | Rebirths needed |
| --- | --- | --- |
| 1 | x1.5 (Starter) | 0 |
| 2 | x2 | 1 |
| 3 | x3 | 2 |
| 4 | x5 | 3 |
| 5 | x10 | 4 |
| 6 | x15 | 5 |
| 7 | x25 | 7 |
| 8 | x50 | 10 |
| 9 | x100 | 15 |
| 10 | x250 | 25 |

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
