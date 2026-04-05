// CY_BORG Character Generator
// Uses data from data.js to generate random characters

import * as data from './data.js';
import { getRandomConversation } from './chats.js';
import { classDefaults } from './data.js';

// ========== UTILITY FUNCTIONS ==========

// Get random element from array
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Get random integer between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get random item name (handles strings and objects with names/variants)
function getRandomItem(item) {
  if (typeof item === 'string') {
    return item;
  }
  return item?.name || item;
}

// Roll a dice (e.g., "d6" returns 1-6, "2d10" returns 2-20)
function rollDice(notation) {
  const dice = notation.match(/(\d+)?d(\d+)/);
  if (!dice) return 0;

  const count = parseInt(dice[1] || '1', 10);
  const sides = parseInt(dice[2], 10);

  let total = 0;
  for (let i = 0; i < count; i++) {
    total += randomInt(1, sides);
  }

  // IF there is a + or - in the notation, add that to the total
  const modifierMatch = notation.match(/([+-]\d+)$/);
  if (modifierMatch) {
    total += parseInt(modifierMatch[1], 10);
  }

  return total;
}

function rollRandom(dice, tableObject) {
  const roll = rollDice(dice);
  const result = tableObject[roll - 1];
  if (result?.variants && result.variants.length > 0) {
    return randomElement(result.variants);
  }
  return result;
}

// Chance function - returns true with 1-in-n probability
function oneInN(n) {
  return Math.random() < 1 / n;
}

// Normalize whitespace and commas from start of string
function cleanDescription(value) {
  return (value || '').replace(/^[,\s]+/, '');
}

function cloneItem(item) {
  if (!item || typeof item !== 'object') {
    return item;
  }
  return JSON.parse(JSON.stringify(item));
}

let nextGearId = 1;

function normalizeGearItem(item, fallbackTags = []) {
  if (typeof item === 'string') {
    return {
      id: `gear-${nextGearId++}`,
      name: item,
      description: '',
      tags: [...fallbackTags]
    };
  }

  const safeItem = cloneItem(item);
  return {
    id: `gear-${nextGearId++}`,
    name: safeItem?.name || 'Unknown item',
    description: safeItem?.description || '',
    tags: Array.isArray(safeItem?.tags)
      ? [...safeItem.tags]
      : (fallbackTags.length ? [...fallbackTags] : [])
  };
}

// Roll magazine count for weapons
function rollMags(weapon) {
  if (weapon.tags && weapon.tags.includes('gun')) {
    return rollDice('1d4');
  }
  return 0;
}

// Generate character stats based on class
function generateStats(characterClass) {
  const statConverter = [-3, -3, -3, -3, -2, -2, -1, -1, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 3];
  const stats = {};

  for (const stat of Object.keys(characterClass.stats)) {
    const roll = rollDice(characterClass.stats[stat]);
    stats[stat] = statConverter[roll - 1] || 0;
  }

  return stats;
}

// Build the 'all' gear array from individual gear categories
function buildGearAll(gear) {
  const list = [];

  if (gear.weapon) list.push(gear.weapon);
  if (gear.armor && gear.armor.name !== 'No armor') list.push(gear.armor);

  const groupedKeys = [
    'misc',
    'cybertech',
    'nanoPowers',
    'nanoInfestations',
    'apps',
    'boosters'
  ];

  groupedKeys.forEach((key) => {
    (gear[key] || []).forEach((item) => list.push(item));
  });

  return list;
}

// Sync the 'all' gear array with the individual gear categories in the character
function syncGearAll(character) {
  character.gear.all = buildGearAll(character.gear);
}

// Roll nanomancer-specific gear and abilities
function rollNanomancer(character) {
  let powerCount = 1 + clearAndCountGear(character, ['cybertech', 'apps']);

  for (let i = 0; i < powerCount; i++) {
    const power = normalizeGearItem(randomElement(data.nanoPowers), ['nano']);
    const infestationSource = normalizeGearItem(randomElement(data.nanoInfestations), ['nanoInfestation']);

    infestationSource.description = `${infestationSource.description}. Linked to '${power.name}'`;

    character.gear.nanoPowers.push(power);
    character.gear.nanoInfestations.push(infestationSource);
  }

  syncGearAll(character);
}

// Helper function: clear specific gear categories and count converted items
function clearAndCountGear(character, categoriesToClear) {
  const count = categoriesToClear.reduce((sum, key) => sum + character.gear[key].length, 0);
  categoriesToClear.forEach(key => {
    character.gear[key] = [];
  });
  return count;
}

// Roll hacker-specific gear and abilities
function rollHacker(character) {
  const slots = character.stats.knowledge + 4;
  character.gear.misc.push(normalizeGearItem({ name: 'Cyberdeck', description: `${slots} slots.` }, ['deck']));
  character.gear.apps.push(normalizeGearItem(randomElement(data.apps), ['app']));

  let appCount = 1;
  const convertedCount = clearAndCountGear(character, ['cybertech', 'nanoPowers']);
  appCount += convertedCount;

  for (let i = 0; i < appCount; i++) {
    character.gear.apps.push(normalizeGearItem(randomElement(data.apps), ['app']));
  }

  syncGearAll(character);
}

// Roll gearhead-specific gear and abilities
function rollGearhead(character) {
  const drones = [
    {
      name: 'Semi-autonomous quad-bot',
      description: `With tools including health scanner and torch. Has an attitude. Bites for d4, ${character.stats.knowledge + rollDice('1d8')} HP and -d2 armor`
    },
    {
      name: 'Flying drone',
      description: `Follows basic commands. ${character.stats.knowledge + rollDice('1d12')} HP and one d8a assault rifle`
    },
    {
      name: '3 fly sized surveillance drones',
      description: 'Equipped with a camera, 3d scanner and heat sensor respectively. Very fragile'
    },
    {
      name: 'Prototype crawler drone',
      description: `With a laser turret (d12a). ${character.stats.knowledge + rollDice('1d10')} HP, -d6 armor. Can follow advanced commands. Needs a hard reboot after dealing max damage`
    },
    {
      name: 'Armored van',
      description: "Five seats and lined with junk. Has a smuggler's hatch underneath it all. Once a day, test knowledge DR8 to find the spare part you need to fix any broken tech"
    },
    {
      name: 'Walking weapons platform',
      description: 'Nigh-indestructible, large enough to ride and janky as hell. Anti-materiel battery (2d10) destroys most walls, doors and vehicles with a shot. Has a 2-in-6 chance of breaking down after firing. Takes d4 hours to repair'
    }
  ];

  character.gear.misc.push(normalizeGearItem(randomElement(drones), ['drone']));
  syncGearAll(character);
}

const classFunctionMap = {
  'Shunned Nanomancer': rollNanomancer,
  'Burned Hacker': rollHacker,
  'Orphaned Gearhead': rollGearhead
}

// Generate a new character
function generateCharacter() {
  // Basic Info
  const username = randomElement(data.usernames);
  const name = randomElement(data.names);
  const rolledClass = randomElement(data.classes);
  const characterClass = {
    ...classDefaults,
    ...rolledClass,
    stats: {
      ...classDefaults.stats,
      ...(rolledClass.stats || {})
    }
  };

  // Stats
  const stats = generateStats(characterClass);
  const baseHp = rollDice(characterClass.hitPoints) + stats.toughness;

  // Equipment - Weighted by strength (lower index = higher chance)
  const weapon = normalizeGearItem(rollRandom(characterClass.weapon, data.weapons), ['weapon']);
  const armor = normalizeGearItem(rollRandom(characterClass.armor, data.armor), ['armor']);

  // Gear buckets for export + rendering
  const gear = {
    weapon,
    armor,
    mags: rollMags(weapon),
    credits: randomInt(0, 100),
    misc: [],
    cybertech: [],
    nanoPowers: [],
    nanoInfestations: [],
    apps: [],
    boosters: [],
    all: []
  };

  const addGearItem = (category, item, fallbackTags = []) => {
    if (!gear[category]) {
      gear[category] = [];
    }
    gear[category].push(normalizeGearItem(item, fallbackTags));
  };

  // Basic gear (1-2 items)
  const numBasicGear = randomInt(1, 2);
  for (let i = 0; i < numBasicGear; i++) {
    addGearItem('misc', randomElement(data.miscGear), ['gear']);
  }

  // Advanced gear (50% chance)
  if (oneInN(2)) {
    addGearItem('misc', randomElement(data.advancedGear), ['gear']);
  }

  // Cybertech (50% chance)
  if (oneInN(6)) {
    addGearItem('cybertech', rollRandom('1d12', data.cybertech), ['cybertech']);
  }

  // Nano power (50% chance)
  let hasNanoPower = false;
  if (oneInN(10)) {
    addGearItem('nanoPowers', randomElement(data.nanoPowers), ['nano']);
    hasNanoPower = true;
  }
  if (hasNanoPower) {
    addGearItem('nanoInfestations', randomElement(data.nanoInfestations), ['nanoInfestation']);
  }

  // Booster ammo for guns (weighted)
  const hasGun = weapon.tags && weapon.tags.includes('gun');
  if (hasGun && oneInN(2)) {
    addGearItem('boosters', randomElement(data.boosters), ['booster']);
  }

  // Apps
  const hasDeck = gear.misc.some((item) => item.name.toLowerCase() === 'cyberdeck');
  if (hasDeck) {
    const numApps = randomInt(1, 3);
    for (let i = 0; i < numApps; i++) {
      addGearItem('apps', randomElement(data.apps), ['app']);
    }
  }

  // Calculate final HP (including cybertech bonuses)
  let finalHp = baseHp;
  buildGearAll(gear).forEach((item) => {
    const numericBonus = Number(item.bonusHp || 0);
    if (numericBonus > 0) {
      finalHp += numericBonus;
    }
  });

  const character = {
    username,
    name,
    fullName: `${username} ${name}`,
    class: characterClass,
    stats,
    maxHp: finalHp,
    currentHp: finalHp,
    glitches: rollDice(characterClass.glitches),
    style: getRandomItem(randomElement(data.styles)),
    feature: getRandomItem(randomElement(data.features)),
    quirk: getRandomItem(randomElement(data.quirks)),
    obsession: getRandomItem(randomElement(data.obsessions)),
    want: getRandomItem(randomElement(data.wants)),
    debt: {
      amount: randomInt(1, 6) * 1000,
      debtor: randomElement(data.debtors || ['a debt buying corp', 'the Vamps', 'Cy Financial Group'])
    },
    gear
  };

  if (classFunctionMap[characterClass.name]) {
    classFunctionMap[characterClass.name](character);
  }

  syncGearAll(character);
  return character
}

// ========== DISPLAY FUNCTIONS ==========

// Create chat lines for the conversation
function createChatLines() {
  const conversation = getRandomConversation();
  const userColors = new Map();
  let userColorIndex = 1;
  const runId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  return conversation.map((line, index) => {
    let lineClass = '';

    if (line.startsWith(':// SYSTEM:')) {
      lineClass = 'system';
    } else if (line.startsWith('://')) {
      const usernameMatch = line.match(/^:\/\/\s*([^:]+):/);
      if (usernameMatch) {
        const username = usernameMatch[1].trim();
        if (!userColors.has(username)) {
          userColors.set(username, userColorIndex);
          userColorIndex = (userColorIndex % 5) + 1;
        }
        lineClass = `user-${userColors.get(username)}`;
      }
    }

    return {
      id: `chat-${runId}-${index}`,
      text: line,
      lineClass,
      showCursor: index === conversation.length - 1
    };
  });
}

function initStaticTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  if (!tabButtons.length || !tabPanels.length) {
    return;
  }

  // Ensure deterministic initial fallback state.
  tabPanels.forEach((panel) => {
    const isCharacter = panel.id === 'character-tab';
    panel.classList.toggle('active', isCharacter);
    panel.setAttribute('aria-hidden', String(!isCharacter));
  });
  tabButtons.forEach((btn) => {
    const isCharacter = btn.dataset.tabTarget === 'character-tab';
    btn.classList.toggle('active', isCharacter);
    btn.setAttribute('aria-selected', String(isCharacter));
  });

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.tabTarget;
      if (!targetId) return;

      tabButtons.forEach((btn) => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });

      tabPanels.forEach((panel) => {
        panel.classList.remove('active');
        panel.setAttribute('aria-hidden', 'true');
      });

      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        targetPanel.classList.add('active');
        targetPanel.setAttribute('aria-hidden', 'false');
      }
    });
  });
}

const VUE_RUNTIME_URLS = [
  'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js',
  'https://unpkg.com/vue@3/dist/vue.global.prod.js'
];

function loadVueRuntime(timeoutMs = 8000) {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  if (window.Vue) {
    return Promise.resolve(true);
  }

  const tryLoad = (url) => new Promise((resolve) => {
    const existingScript = document.querySelector(`script[data-vue-runtime="${url}"]`);

    const done = (ok) => resolve(ok && !!window.Vue);
    const timer = setTimeout(() => done(false), timeoutMs);
    const settle = (ok) => {
      clearTimeout(timer);
      done(ok);
    };

    if (existingScript) {
      existingScript.addEventListener('load', () => settle(true), { once: true });
      existingScript.addEventListener('error', () => settle(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.dataset.vueRuntime = url;
    script.addEventListener('load', () => settle(true), { once: true });
    script.addEventListener('error', () => settle(false), { once: true });
    document.head.appendChild(script);
  });

  return (async () => {
    for (const url of VUE_RUNTIME_URLS) {
      const ok = await tryLoad(url);
      if (ok) {
        return true;
      }
    }
    return false;
  })();
}

// Initialize the Vue application
async function initVueApp() {
  if (typeof window === 'undefined') {
    return;
  }

  const hasVue = await loadVueRuntime();
  if (!hasVue || !window.Vue) {
    console.warn('Vue runtime unavailable. Showing static fallback view.');
    initStaticTabs();
    return;
  }

  const { createApp } = window.Vue;

  try {
    createApp({
    data() {
      let character;
      try {
        const stored = localStorage.getItem('cy_borg_character');
        if (stored) {
          character = JSON.parse(stored);
        }
      } catch (e) {
        // Fallback if storage is corrupted
      }
      if (!character) {
        character = generateCharacter();
      }
      return {
        activeTab: 'character-tab',
        character,
        chatLines: createChatLines(),
        addItemModalOpen: false,
        descriptionModalOpen: false,
        descriptionModalItem: null,
        descriptionDraft: '',
        addItemForm: {
          title: '',
          category: 'misc',
          description: ''
        },
        diceRollModalOpen: false,
        diceRollModalAbility: '',
        diceRollIsAnimating: false,
        diceRollGlitchValue: 0,
        diceRollFinalValue: 0,
        diceRollAnimationTimer: null,
        diceRollModifier: 0,
        diceRollRawValue: 0,
        diceRollTotal: 0,
        diceRollResult: '' // 'normal', 'fumble', or 'critical'
      };
    },
    computed: {
      hpIsDead() {
        return this.character.currentHp <= 0;
      },
      statEntries() {
        return [
          ['Agility', this.character.stats.agility],
          ['Knowledge', this.character.stats.knowledge],
          ['Presence', this.character.stats.presence],
          ['Strength', this.character.stats.strength],
          ['Toughness', this.character.stats.toughness],
          ['Glitches', this.character.glitches]
        ];
      },
      gearSections() {
        return [
          { key: 'weapon', title: 'Weapon', single: true },
          { key: 'armor', title: 'Armor', single: true },
          { key: 'cybertech', title: 'Cybertech' },
          { key: 'nanoPowers', title: 'Nano Powers' },
          { key: 'nanoInfestations', title: 'Nano Infestations' },
          { key: 'apps', title: 'Apps' },
          { key: 'boosters', title: 'Boosters' },
          { key: 'misc', title: 'Gear' }
        ];
      },
      displayGearItems() {
        const categoryLabels = {
          weapon: 'weapon',
          armor: 'armor',
          mags: 'ammo',
          credits: 'credits',
          cybertech: 'cybertech',
          nanoPowers: 'nano powers',
          nanoInfestations: 'nano infestations',
          apps: 'apps',
          boosters: 'boosters',
          misc: 'gear'
        };

        const flat = [];
        const pushItem = (item, categoryKey) => {
          if (!item || !item.name) return;
          if (categoryKey === 'armor' && item.name === 'No armor') return;

           flat.push({
             id: item.id || `${categoryKey}-${flat.length}`,
             name: item.name,
             category: categoryLabels[categoryKey] || categoryKey,
             description: cleanDescription(item.description),
             bucketKey: categoryKey,
             source: item,
             canEdit: true
           });
        };

        pushItem(this.character.gear.weapon, 'weapon');
        pushItem(this.character.gear.armor, 'armor');

        const hasGun = Array.isArray(this.character.gear.weapon?.tags)
          && this.character.gear.weapon.tags.includes('gun');

        if (hasGun || this.character.gear.mags > 0) {
          flat.push({
            id: 'mags',
            name: `${this.character.gear.mags} mags`,
            category: categoryLabels.mags,
            description: '',
            source: null,
            canEdit: false,
            magsCount: this.character.gear.mags
          });
        }

        flat.push({
          id: 'credits',
          name: `${this.character.gear.credits}¤`,
          category: categoryLabels.credits,
          description: '',
          source: null,
          canEdit: false,
          creditsAmount: this.character.gear.credits
        });

        ['cybertech', 'nanoPowers', 'nanoInfestations', 'apps', 'boosters', 'misc'].forEach((bucketKey) => {
          (this.character.gear[bucketKey] || []).forEach((item) => pushItem(item, bucketKey));
        });

        return flat;
      },
      allGearItems() {
        return buildGearAll(this.character.gear);
      }
    },
    methods: {
      setActiveTab(tabId) {
        this.activeTab = tabId;
      },
      resetCharacter() {
        this.character = generateCharacter();
        this.chatLines = createChatLines();
        this.saveCharacterToStorage();
      },
      openAddItemModal() {
        this.addItemForm = {
          title: '',
          category: 'misc',
          description: ''
        };
        this.addItemModalOpen = true;
      },
      closeAddItemModal() {
        this.addItemModalOpen = false;
      },
      openDescriptionModal(item) {
        if (!item || !item.canEdit || !item.source) {
          return;
        }

         this.descriptionModalItem = item;
         this.descriptionDraft = cleanDescription(item.source.description);
         this.descriptionModalOpen = true;
      },
      closeDescriptionModal() {
        this.descriptionModalOpen = false;
        this.descriptionModalItem = null;
        this.descriptionDraft = '';
      },
      openDiceRollModal(abilityName, abilityModifier) {
        this.diceRollModalAbility = abilityName;
        this.diceRollModalOpen = true;
        this.diceRollIsAnimating = true;
        this.diceRollGlitchValue = 0;
        this.diceRollFinalValue = 0;
        this.diceRollModifier = abilityModifier;
        this.diceRollRawValue = 0;
        this.diceRollTotal = 0;
        this.diceRollResult = ''; // 'normal', 'fumble', or 'critical'

        if (this.diceRollAnimationTimer) {
          clearInterval(this.diceRollAnimationTimer);
        }

        const startTime = Date.now();
        const animationDuration = 1000; // 1 second

        this.diceRollAnimationTimer = setInterval(() => {
          const elapsed = Date.now() - startTime;

          if (elapsed >= animationDuration) {
            clearInterval(this.diceRollAnimationTimer);
            this.diceRollIsAnimating = false;
            this.diceRollRawValue = rollDice('1d20');
            this.diceRollTotal = this.diceRollRawValue + abilityModifier;

            // Determine result type
            if (this.diceRollRawValue === 1) {
              this.diceRollResult = 'fumble';
            } else if (this.diceRollRawValue === 20) {
              this.diceRollResult = 'critical';
            } else {
              this.diceRollResult = 'normal';
            }
            return;
          }

          // Show rapid glitching numbers
          this.diceRollGlitchValue = randomInt(1, 20);
        }, 50); // Update every 50ms for glitch effect
      },
      closeDiceRollModal() {
        this.diceRollModalOpen = false;
        if (this.diceRollAnimationTimer) {
          clearInterval(this.diceRollAnimationTimer);
        }
        this.diceRollIsAnimating = false;
        this.diceRollGlitchValue = 0;
        this.diceRollFinalValue = 0;
      },
      saveDescriptionModal() {
        if (!this.descriptionModalItem || !this.descriptionModalItem.source) {
          return;
        }

        this.descriptionModalItem.source.description = this.descriptionDraft.trim().replace(/^[,\s]+/, '');
        syncGearAll(this.character);
        this.saveCharacterToStorage();
        this.closeDescriptionModal();
      },
      deleteDescriptionModalItem() {
        const selected = this.descriptionModalItem;
        if (!selected || !selected.source || !selected.bucketKey) {
          return;
        }

        if (selected.bucketKey === 'weapon') {
          this.character.gear.weapon = null;
        } else if (selected.bucketKey === 'armor') {
          this.character.gear.armor = normalizeGearItem({ name: 'No armor', tags: ['blank'] }, ['armor']);
        } else if (Array.isArray(this.character.gear[selected.bucketKey])) {
          this.character.gear[selected.bucketKey] = this.character.gear[selected.bucketKey]
            .filter((item) => item.id !== selected.source.id);
        }

        syncGearAll(this.character);
        this.closeDescriptionModal();
        this.saveCharacterToStorage();
      },
      addMag() {
        this.character.gear.mags += 1;
        this.saveCharacterToStorage();
      },
      removeMag() {
        if (this.character.gear.mags <= 0) {
          return;
        }
        this.character.gear.mags -= 1;
        this.saveCharacterToStorage();
      },
      addCredits() {
        this.character.gear.credits += 10;
        this.saveCharacterToStorage();
      },
      removeCredits() {
        if (this.character.gear.credits <= 0) {
          return;
        }
        this.character.gear.credits = Math.max(0, this.character.gear.credits - 10);
        this.saveCharacterToStorage();
      },
      submitAddItem() {
        const title = this.addItemForm.title.trim();
        if (!title) {
          return;
        }

        const description = this.addItemForm.description.trim();
        const category = this.addItemForm.category;

        const createItem = (tags = []) => normalizeGearItem({
          name: title,
          description,
          tags
        });

        if (category === 'weapon') {
          this.character.gear.weapon = createItem(['weapon']);
        } else if (category === 'armor') {
          this.character.gear.armor = createItem(['armor']);
        } else {
          if (!Array.isArray(this.character.gear[category])) {
            this.character.gear[category] = [];
          }
          this.character.gear[category].push(createItem([category]));
        }

        syncGearAll(this.character);
        this.closeAddItemModal();
        this.saveCharacterToStorage();
      },
      increaseHP() {
        this.character.currentHp += 1;
        this.saveCharacterToStorage();
      },
      decreaseHP() {
        this.character.currentHp -= 1;
        this.saveCharacterToStorage();
      },
      formatStat(value) {
        return value > 0 ? `+${value}` : `${value}`;
      },
       cleanDescription(value) {
         return cleanDescription(value);
       },
      tagsToString(item) {
        return Array.isArray(item.tags) ? item.tags.join(', ') : '';
      },
      updateTags(item, rawTags) {
        item.tags = rawTags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
      },
      saveCharacterToStorage() {
        try {
          localStorage.setItem('cy_borg_character', JSON.stringify(this.character));
        } catch (e) {
          // Silently fail if storage is full or disabled
        }
      },
      refreshChat() {
        this.chatLines = createChatLines();
      },
      printSheet() {
        window.print();
      }
    }
    }).mount('#root');
  } catch (error) {
    // Keep static markup visible if Vue fails to initialize.
    console.error('Vue initialization failed:', error);
    initStaticTabs();
  }
}

initVueApp();

export {
  generateCharacter,
  randomElement,
  randomInt,
  rollDice,
  rollRandom,
  oneInN
};
