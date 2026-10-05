import { ITEM_CATALOG } from '../../data/loot.js'

// Glyph shown for each loot item in the Sell window and hotbar: every catalog
// item's glyph, with the overrides below.
export const ITEM_ICON = {
  ...Object.fromEntries(ITEM_CATALOG.map(([name, , glyph]) => [name, glyph])),
  Coal: '🪨',
  Bone: '🦴',
  Skull: '💀',
  Mushroom: '🍄',
  Anchor: '⚓',
  Gem: '💎',
  'Beaded Bracelet': '📿',
  Coin: '🪙',
  'Brass Bell': '🔔',
  Binoculars: '🔭',
  'Iron Bar': '🔩',
  'Pirate Hat': '🏴‍☠️',
  Anvil: '⚒️',
  Dagger: '🗡️',
  TNT: '🧨',
  Bomb: '💣',
  Helmet: '🪖',
  Quartz: '🔹',
  Emerald: '🟢',
  'Porcelain Vase': '🏺',
  Amethyst: '🟣',
}
