// CY_BORG Character Generator
// Uses data from data.js to generate random characters

import * as data from './data.js';
import { getRandomConversation } from './chats.js';

// ========== UTILITY FUNCTIONS ==========

// Get random element from array
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Get random integer between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get random item, handling variants
function getRandomItem(item) {
  if (typeof item === 'string') {
    return item;
  }

  if (item.variants && item.variants.length > 0) {
    const variant = randomElement(item.variants);
    if (typeof variant === 'string') {
      return variant;
    }
    return variant.name || item.name;
  }

  return item.name || item;
}

// Roll a dice (e.g., "d6" returns 1-6, "2d10" returns 2-20)
function rollDice(notation) {
  const match = notation.match(/(\d+)?d(\d+)/);
  if (!match) return 0;

  const count = parseInt(match[1] || '1');
  const sides = parseInt(match[2]);

  let total = 0;
  for (let i = 0; i < count; i++) {
    total += randomInt(1, sides);
  }
  return total;
}

// ========== WEIGHTED RANDOM FUNCTIONS ==========

// Weighted random selection - higher indices have lower probability
// Uses exponential decay for probability distribution
function weightedRandomByStrength(arr, decayFactor = 0.7) {
  if (!arr || arr.length === 0) return null;
  if (arr.length === 1) return arr[0];

  // Create weights - each item has decayFactor^index probability
  const weights = arr.map((_, index) => Math.pow(decayFactor, index));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Random selection based on weights
  let random = Math.random() * totalWeight;

  for (let i = 0; i < arr.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return arr[i];
    }
  }

  return arr[arr.length - 1]; // Fallback
}

// Chance function - returns true with 1-in-n probability
function oneInN(n) {
  return Math.random() < (1 / n);
}

// ========== STAT GENERATION ==========

function generateStats() {
  // Roll 4d4-4 for each stat, resulting in -4 to +12 range
  const rollStat = () => {
    const roll = rollDice('4d4') - 4;
    // Format with + or - sign
    if (roll >= 0) return `+${roll}`;
    return `${roll}`;
  };

  return {
    agility: rollStat(),
    knowledge: rollStat(),
    presence: rollStat(),
    strength: rollStat(),
    toughness: rollStat()
  };
}

// ========== CHARACTER GENERATION ==========

function generateCharacter() {
  // Basic Info
  const username = randomElement(data.usernames);
  const name = randomElement(data.names);
  const characterClass = randomElement(data.classes);

  // Stats
  const stats = generateStats();
  const baseHp = rollDice('2d6');
  const glitches = rollDice('1d4');

  // Appearance & Personality
  const style = getRandomItem(randomElement(data.styles));
  const feature = getRandomItem(randomElement(data.features));
  const quirk = getRandomItem(randomElement(data.quirks));
  const obsession = getRandomItem(randomElement(data.obsessions));
  const want = getRandomItem(randomElement(data.wants));

  // Debt
  const debt = randomInt(1, 6) * 1000;
  const debtor = randomElement(data.debtors || ['a debt buying corp', 'the Vamps', 'Cy Financial Group']);

  // Equipment - Weighted by strength (lower index = higher chance)
  const weapon = weightedRandomByStrength(data.weapons, 0.7);
  const armor = weightedRandomByStrength(data.armor, 0.75);

  // Gear
  const gear = [];

  // Basic gear (1-2 items)
  const numBasicGear = randomInt(1, 2);
  for (let i = 0; i < numBasicGear; i++) {
    gear.push(randomElement(data.miscGear));
  }

  // Advanced gear (50% chance)
  if (oneInN(2)) {
    gear.push(randomElement(data.advancedGear));
  }

  // Cybertech (50% chance)
  let hasCybertech = false;
  if (oneInN(2)) {
    const cyber = weightedRandomByStrength(data.cybertech, 0.7);
    gear.push(cyber);
    hasCybertech = true;
  }

  // Nano power (50% chance)
  let hasNanoPower = false;
  if (oneInN(2)) {
    gear.push(randomElement(data.nanoPowers));
    hasNanoPower = true;
  }

  // Nano infestation (1-in-5 normally, 1-in-2 if you have nano power)
  if (hasNanoPower ? oneInN(2) : oneInN(5)) {
    gear.push(randomElement(data.nanoInfestations));
  }

  // Booster ammo for guns (weighted)
  const hasGun = weapon.tags && weapon.tags.includes('gun');
  if (hasGun && oneInN(2)) {
    gear.push(weightedRandomByStrength(data.boosters, 0.7));
  }

  // Apps (if class is Burned Hacker or random chance)
  if (characterClass.name === 'Burned Hacker' || oneInN(4)) {
    const numApps = randomInt(1, 3);
    for (let i = 0; i < numApps; i++) {
      gear.push(randomElement(data.apps));
    }
  }

  // Ammo
  const mags = randomInt(2, 6);
  const credits = randomInt(0, 100);

  // Calculate final HP (including cybertech bonuses)
  let finalHp = baseHp;
  gear.forEach(item => {
    if (item.bonusHp) {
      finalHp += item.bonusHp;
    }
  });

  return {
    username,
    name,
    fullName: `${username} ${name}`,
    class: characterClass,
    stats,
    hp: finalHp,
    glitches,
    style,
    feature,
    quirk,
    obsession,
    want,
    debt: {
      amount: debt,
      debtor
    },
    weapon,
    armor,
    gear,
    mags,
    credits
  };
}

// ========== DISPLAY FUNCTIONS ==========

function formatGearItem(item) {
  if (typeof item === 'string') {
    return { name: item, description: null, tags: null };
  }

  return {
    name: item.name,
    description: item.description || null,
    tags: item.tags || null
  };
}

function displayCharacter(character) {
  console.log('\n==============================================');
  console.log('CY_BORG//:PUNKMAKER.CPY');
  console.log('==============================================\n');

  console.log(`YOU ARE ${character.fullName.toUpperCase()}`);
  console.log(`${character.class.name.toUpperCase()}\n`);

  console.log(`You owe ${character.debt.amount.toLocaleString()}¤ to ${character.debt.debtor}.\n`);

  console.log(`You are ${character.style}.`);
  console.log(`Notable feature: ${character.feature}`);
  console.log(`Quirk: ${character.quirk}`);
  console.log(`Obsessed with: ${character.obsession}`);
  console.log(`Wants: ${character.want}\n`);

  if (character.class.description) {
    console.log(`CLASS: ${character.class.description}\n`);
  }

  if (character.class.additional?.regular) {
    console.log(`${character.class.additional.regular}\n`);
  }

  console.log('--- STATS ---');
  console.log(`Agility:    ${character.stats.agility}`);
  console.log(`Knowledge:  ${character.stats.knowledge}`);
  console.log(`Presence:   ${character.stats.presence}`);
  console.log(`Strength:   ${character.stats.strength}`);
  console.log(`Toughness:  ${character.stats.toughness}`);
  console.log(`HP:         ${character.hp}`);
  console.log(`Glitches:   ${character.glitches}\n`);

  console.log('--- ITEMS ---');

  const weapon = formatGearItem(character.weapon);
  console.log(`Weapon: ${weapon.name}`);
  if (weapon.description) {
    console.log(`  ${weapon.description}`);
  }

  const armor = formatGearItem(character.armor);
  console.log(`Armor: ${armor.name}`);
  if (armor.description) {
    console.log(`  ${armor.description}`);
  }

  if (character.gear.length > 0) {
    console.log('\nAdditional Gear:');
    character.gear.forEach(item => {
      const gearItem = formatGearItem(item);
      console.log(`  - ${gearItem.name}`);
      if (gearItem.description) {
        console.log(`    ${gearItem.description}`);
      }
    });
  }

  if (character.mags > 0) {
    console.log(`\nAmmo: ${character.mags} mags`);
  }

  console.log(`Credits: ${character.credits}¤`);

  console.log('\n==============================================\n');
}

// ========== HTML UPDATE FUNCTIONS ==========

function updateHTMLCharacter(character) {
  // Update character name
  const nameElement = document.querySelector('.character-name');
  if (nameElement) {
    nameElement.textContent = `YOU ARE ${character.fullName.toUpperCase()}`;
  }

  // Update class
  const classElement = document.querySelector('.character-class');
  if (classElement) {
    classElement.textContent = character.class.name.toUpperCase();
  }

  // Update glitch
  const glitchElement = document.querySelector('.character-glitch');
  if (glitchElement && character.class.glitch) {
    glitchElement.textContent = character.class.glitch;
  }

  // Update glitch description (regular ability)
  const glitchDescElement = document.querySelector('.glitch-description');
  if (glitchDescElement && character.class.additional?.regular) {
    glitchDescElement.textContent = character.class.additional.regular;
  }

  // Update debt
  const debtElement = document.querySelector('.debt-info');
  if (debtElement) {
    debtElement.textContent = `You owe ${character.debt.amount.toLocaleString()}¤ to ${character.debt.debtor}.`;
  }

  // Update class description
  const descElement = document.querySelector('.class-description');
  if (descElement) {
    descElement.textContent = character.class.description || '';
  }

  // Update stats
  const statLabels = ['agility', 'knowledge', 'presence', 'strength', 'toughness'];
  statLabels.forEach(stat => {
    const statElement = document.querySelector(`.stat-item .stat-label`);
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
      const label = item.querySelector('.stat-label');
      if (label && label.textContent.toLowerCase() === stat) {
        const value = item.querySelector('.stat-value');
        if (value) {
          value.textContent = character.stats[stat];
        }
      }
    });
  });

  // Update glitches (add to stats if not present)
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    let glitchElement = Array.from(statsSection.querySelectorAll('.stat-item')).find(item => {
      const label = item.querySelector('.stat-label');
      return label && label.textContent.toLowerCase() === 'glitches';
    });

    if (glitchElement) {
      const value = glitchElement.querySelector('.stat-value');
      if (value) {
        value.textContent = character.glitches;
      }
    }
  }

  // Update HP panel
  const hpCurrent = document.querySelector('.hp-current');
  const hpMax = document.querySelector('.hp-max');
  const hpPanel = document.querySelector('.hp-panel');

  if (hpCurrent && hpMax) {
    hpCurrent.textContent = character.hp;
    hpMax.textContent = character.hp;

    // Set data attribute for current HP
    if (hpPanel) {
      hpPanel.dataset.currentHp = character.hp;
      hpPanel.dataset.maxHp = character.hp;

      // Update dead state
      if (parseInt(character.hp) <= 0) {
        hpPanel.classList.add('dead');
      } else {
        hpPanel.classList.remove('dead');
      }
    }
  }

  // Update gear section
  const gearSection = document.querySelector('.gear-section');
  if (gearSection) {
    // Clear existing gear items
    const existingItems = gearSection.querySelectorAll('.gear-item');
    existingItems.forEach(item => item.remove());

    // Add weapon
    const weapon = formatGearItem(character.weapon);
    const weaponTags = weapon.tags || ['weapon'];
    addGearItemWithDesc(gearSection, weapon.name, weapon.description, weaponTags);

    // Add armor
    if (character.armor.name !== 'No armor') {
      const armor = formatGearItem(character.armor);
      const armorTags = armor.tags || ['armor'];
      addGearItemWithDesc(gearSection, armor.name, armor.description, armorTags);
    }

    // Add all other gear
    character.gear.forEach(item => {
      const gearItem = formatGearItem(item);
      addGearItemWithDesc(gearSection, gearItem.name, gearItem.description, gearItem.tags);
    });

    // Add mags with clickable icons
    if (character.mags > 0) {
      addMagsItem(gearSection, character.mags);
    }

    // Add editable credits
    addCreditsItem(gearSection, character.credits);
  }
}

function addGearItemWithDesc(parent, name, description, tags = null) {
  const div = document.createElement('div');
  div.className = 'gear-item';

  const strongEl = document.createElement('strong');

  // Add name span
  const nameSpan = document.createElement('span');
  nameSpan.className = 'gear-item-name';
  nameSpan.textContent = name;
  strongEl.appendChild(nameSpan);

  // Add tag if present
  if (tags && tags.length > 0) {
    const tagSpan = document.createElement('span');
    tagSpan.className = 'gear-item-tag';
    // Get the first relevant tag (skip "blank" tags)
    const displayTag = tags.find(tag => tag !== 'blank') || tags[0];
    tagSpan.textContent = `[${displayTag}]`;
    strongEl.appendChild(tagSpan);
  }

  div.appendChild(strongEl);

  if (description) {
    const p = document.createElement('p');
    // Clean up description - remove leading comma, space, or comma+space
    const cleanDesc = description.replace(/^[,\s]+/, '');
    p.textContent = cleanDesc;
    div.appendChild(p);
  }

  parent.appendChild(div);
}

function addMagsItem(parent, magCount) {
  const div = document.createElement('div');
  div.className = 'gear-item';

  const strongEl = document.createElement('strong');

  // Add name
  const nameSpan = document.createElement('span');
  nameSpan.className = 'gear-item-name';
  nameSpan.textContent = 'AMMUNITION';
  strongEl.appendChild(nameSpan);

  // Add tag
  const tagSpan = document.createElement('span');
  tagSpan.className = 'gear-item-tag';
  tagSpan.textContent = '[ammo]';
  strongEl.appendChild(tagSpan);

  div.appendChild(strongEl);

  // Create mags container
  const magsContainer = document.createElement('p');
  magsContainer.className = 'mags-container';

  const label = document.createElement('span');
  label.className = 'mags-label';
  label.textContent = 'Mags:';
  magsContainer.appendChild(label);

  // Add mag icons
  for (let i = 0; i < magCount; i++) {
    const magIcon = createMagIcon();
    magsContainer.appendChild(magIcon);
  }

  // Add plus button to add more mags
  const addBtn = document.createElement('button');
  addBtn.className = 'mag-add-btn';
  addBtn.textContent = '+';
  addBtn.title = 'Add magazine';
  addBtn.addEventListener('click', function() {
    const newMag = createMagIcon();
    // Insert before the plus button
    magsContainer.insertBefore(newMag, addBtn);
  });
  magsContainer.appendChild(addBtn);

  div.appendChild(magsContainer);
  parent.appendChild(div);
}

function createMagIcon() {
  const magIcon = document.createElement('span');
  magIcon.className = 'mag-icon';
  magIcon.title = 'Click to remove';
  magIcon.addEventListener('click', function() {
    this.remove();
  });
  return magIcon;
}

function addCreditsItem(parent, credits) {
  const div = document.createElement('div');
  div.className = 'gear-item';

  const strongEl = document.createElement('strong');

  // Add name
  const nameSpan = document.createElement('span');
  nameSpan.className = 'gear-item-name';
  nameSpan.textContent = 'CREDITS';
  strongEl.appendChild(nameSpan);

  // Add tag
  const tagSpan = document.createElement('span');
  tagSpan.className = 'gear-item-tag';
  tagSpan.textContent = '[¤]';
  strongEl.appendChild(tagSpan);

  div.appendChild(strongEl);

  // Create editable credits input
  const creditsContainer = document.createElement('p');

  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'credits-editable';
  input.value = credits;
  input.min = 0;
  input.title = 'Click to edit credits';

  const currencySymbol = document.createElement('span');
  currencySymbol.textContent = '¤';
  currencySymbol.style.marginLeft = '5px';
  currencySymbol.style.color = 'var(--color-cyan)';

  creditsContainer.appendChild(input);
  creditsContainer.appendChild(currencySymbol);

  div.appendChild(creditsContainer);
  parent.appendChild(div);
}

// ========== EXPORT & INITIALIZATION ==========

export {
  generateCharacter,
  displayCharacter,
  updateHTMLCharacter,
  randomElement,
  randomInt,
  rollDice,
  weightedRandomByStrength,
  oneInN
};

// HP Management Functions
function updateHPDisplay() {
  const hpPanel = document.querySelector('.hp-panel');
  const hpCurrent = document.querySelector('.hp-current');

  if (hpPanel && hpCurrent) {
    const currentHp = parseInt(hpPanel.dataset.currentHp);

    // Update display
    hpCurrent.textContent = currentHp;

    // Toggle dead state
    if (currentHp <= 0) {
      hpPanel.classList.add('dead');
    } else {
      hpPanel.classList.remove('dead');
    }
  }
}

function increaseHP() {
  const hpPanel = document.querySelector('.hp-panel');
  if (hpPanel) {
    let currentHp = parseInt(hpPanel.dataset.currentHp);
    currentHp++;
    hpPanel.dataset.currentHp = currentHp;
    updateHPDisplay();
  }
}

function decreaseHP() {
  const hpPanel = document.querySelector('.hp-panel');
  if (hpPanel) {
    let currentHp = parseInt(hpPanel.dataset.currentHp);
    currentHp--;
    hpPanel.dataset.currentHp = currentHp;
    updateHPDisplay();
  }
}

// Edit Modal Functions
let currentEditElement = null;

function openEditModal(element) {
  currentEditElement = element;
  const modal = document.getElementById('editModal');
  const textarea = document.getElementById('editTextarea');

  if (modal && textarea) {
    textarea.value = element.textContent;
    modal.classList.add('active');
    textarea.focus();
  }
}

function closeEditModal() {
  const modal = document.getElementById('editModal');
  if (modal) {
    modal.classList.remove('active');
    currentEditElement = null;
  }
}

function saveEdit() {
  const textarea = document.getElementById('editTextarea');
  if (currentEditElement && textarea) {
    currentEditElement.textContent = textarea.value;
  }
  closeEditModal();
}

function deleteItem() {
  if (!currentEditElement) return;

  // Find the parent gear-item
  const gearItem = currentEditElement.closest('.gear-item');

  if (gearItem && confirm('Delete this item?')) {
    gearItem.remove();
    closeEditModal();
  }
}

function makeTextEditable(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    element.classList.add('editable-text');
    element.addEventListener('click', () => openEditModal(element));
  });
}

function makeItemsEditable() {
  // Get all gear items
  const gearItems = document.querySelectorAll('.gear-item');

  gearItems.forEach(item => {
    // Skip if this is the mags item (has mags-container) or credits item (has credits-editable)
    if (item.querySelector('.mags-container') || item.querySelector('.credits-editable')) {
      return;
    }

    // Make the item name editable
    const nameElement = item.querySelector('.gear-item-name');
    if (nameElement && !nameElement.classList.contains('editable-text')) {
      nameElement.classList.add('editable-text');
      nameElement.addEventListener('click', () => openEditModal(nameElement));
    }

    // Make the description editable
    const descElement = item.querySelector('p');
    if (descElement && !descElement.classList.contains('editable-text') && !descElement.classList.contains('mags-container')) {
      descElement.classList.add('editable-text');
      descElement.addEventListener('click', () => openEditModal(descElement));
    }
  });
}

// Add Item Modal Functions
function openAddItemModal() {
  const modal = document.getElementById('addItemModal');
  const titleInput = document.getElementById('itemTitle');
  const descInput = document.getElementById('itemDescription');
  const typeSelect = document.getElementById('itemType');

  if (modal) {
    // Clear previous values
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (typeSelect) typeSelect.value = 'gear';

    modal.classList.add('active');
    if (titleInput) titleInput.focus();
  }
}

function closeAddItemModal() {
  const modal = document.getElementById('addItemModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function addCustomItem() {
  const titleInput = document.getElementById('itemTitle');
  const descInput = document.getElementById('itemDescription');
  const typeSelect = document.getElementById('itemType');
  const gearSection = document.querySelector('.gear-section');

  if (!titleInput || !gearSection) return;

  const title = titleInput.value.trim();
  if (!title) {
    alert('Please enter an item name');
    return;
  }

  const description = descInput ? descInput.value.trim() : '';
  const type = typeSelect ? typeSelect.value : 'gear';

  // Add the new item before the mags/credits
  const magsItem = Array.from(gearSection.querySelectorAll('.gear-item')).find(item =>
    item.querySelector('.mags-container')
  );

  const newItemDiv = document.createElement('div');
  newItemDiv.className = 'gear-item';

  const strongEl = document.createElement('strong');

  const nameSpan = document.createElement('span');
  nameSpan.className = 'gear-item-name editable-text';
  nameSpan.textContent = title;
  nameSpan.addEventListener('click', () => openEditModal(nameSpan));
  strongEl.appendChild(nameSpan);

  const tagSpan = document.createElement('span');
  tagSpan.className = 'gear-item-tag';
  tagSpan.textContent = `[${type}]`;
  strongEl.appendChild(tagSpan);

  newItemDiv.appendChild(strongEl);

  if (description) {
    const p = document.createElement('p');
    p.className = 'editable-text';
    p.textContent = description;
    p.addEventListener('click', () => openEditModal(p));
    newItemDiv.appendChild(p);
  }

  if (magsItem) {
    gearSection.insertBefore(newItemDiv, magsItem);
  } else {
    gearSection.appendChild(newItemDiv);
  }

  closeAddItemModal();
}

// Load random chat conversation
function loadRandomChat() {
  const chatLog = document.querySelector('.chat-log');
  if (chatLog) {
    // Clear existing chat
    chatLog.innerHTML = '';

    // Get random conversation
    const conversation = getRandomConversation();

    // Add each line
    conversation.forEach((line, index) => {
      const chatLine = document.createElement('div');
      chatLine.className = 'chat-line';

      // Add cursor to last line
      if (index === conversation.length - 1) {
        chatLine.innerHTML = line + '<span class="cursor">█</span>';
      } else {
        chatLine.textContent = line;
      }

      chatLog.appendChild(chatLine);
    });
  }
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  window.PunkGenerator = {
    generateCharacter,
    displayCharacter,
    updateHTMLCharacter,
    increaseHP,
    decreaseHP,
    loadRandomChat
  };

  // Generate initial character on page load
  document.addEventListener('DOMContentLoaded', () => {
    // Load random chat
    loadRandomChat();

    // Generate character
    const character = generateCharacter();
    updateHTMLCharacter(character);

    // Make only item text elements editable (not character info, not mags)
    makeItemsEditable();

    // Hook up reset button
    const resetButton = document.querySelector('.btn-reset');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        // Load new random chat
        loadRandomChat();

        // Generate new character
        const newCharacter = generateCharacter();
        updateHTMLCharacter(newCharacter);

        // Re-apply editable text after regenerating
        setTimeout(() => {
          makeItemsEditable();
        }, 100);
      });
    }

    // Hook up print button (optional - just prints the page)
    const printButton = document.querySelector('.btn-print');
    if (printButton) {
      printButton.addEventListener('click', () => {
        window.print();
      });
    }

    // Hook up HP buttons
    const hpPlusButton = document.querySelector('.hp-plus');
    const hpMinusButton = document.querySelector('.hp-minus');

    if (hpPlusButton) {
      hpPlusButton.addEventListener('click', increaseHP);
    }

    if (hpMinusButton) {
      hpMinusButton.addEventListener('click', decreaseHP);
    }

    // Hook up modal buttons
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.modal-close');
    const cancelBtn = document.querySelector('.modal-btn-cancel');
    const saveBtn = document.querySelector('.modal-btn-save');
    const deleteBtn = document.querySelector('.modal-btn-delete');

    if (closeBtn) {
      closeBtn.addEventListener('click', closeEditModal);
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeEditModal);
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', saveEdit);
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', deleteItem);
    }

    // Close modal when clicking outside
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeEditModal();
        }
      });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeEditModal();
        closeAddItemModal();
      }
    });

    // Hook up add item button
    const addItemBtn = document.querySelector('.add-item-btn');
    if (addItemBtn) {
      addItemBtn.addEventListener('click', openAddItemModal);
    }

    // Hook up add item modal buttons
    const addItemModal = document.getElementById('addItemModal');
    const closeAddBtn = document.querySelector('.modal-close-add');
    const cancelAddBtn = document.querySelector('.modal-btn-cancel-add');
    const addBtn = document.querySelector('.modal-btn-add');

    if (closeAddBtn) {
      closeAddBtn.addEventListener('click', closeAddItemModal);
    }

    if (cancelAddBtn) {
      cancelAddBtn.addEventListener('click', closeAddItemModal);
    }

    if (addBtn) {
      addBtn.addEventListener('click', addCustomItem);
    }

    // Close add item modal when clicking outside
    if (addItemModal) {
      addItemModal.addEventListener('click', (e) => {
        if (e.target === addItemModal) {
          closeAddItemModal();
        }
      });
    }
  });
}

// For Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateCharacter,
    displayCharacter,
    updateHTMLCharacter
  };
}
