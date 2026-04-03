# CY_BORG PUNKMAKER - Static Version

A static HTML/CSS/JavaScript recreation of the CY_BORG character generator.

## Files

- **index.html** - Main HTML page
- **styles.css** - Complete styling
- **data.js** - All character generation data tables (31KB)
- **chats.js** - Terminal chat conversations (10 different scenarios)
- **generator.js** - Character generation logic with weighted probabilities

## Features

### Terminal Chat System

The terminal sidebar displays randomized chat conversations:

- **10 Different Scenarios**: Heists, black market deals, gang wars, corporate espionage, bounty hunting, street preachers, debt collection, nano cults, and more
- **Automatic Randomization**: Each character generation loads a new random conversation
- **Cyberpunk Atmosphere**: Authentic chat room aesthetic with system messages, usernames, and status updates

To add new conversations, edit `chats.js` and add arrays to the `conversations` array.

### Character Generation

The generator creates random CY_BORG characters with:

- **Names**: 400+ usernames + 190+ real names
- **Classes**: 4 character classes (Orphaned Gearhead, Burned Hacker, Renegade Cyberslasher, Forsaken Gang-Goon)
- **Stats**: Agility, Knowledge, Presence, Strength, Toughness (rolled with 4d4-4)
- **Appearance**: Style, features, quirks, obsessions, wants
- **Equipment**: Weapons, armor, gear, cybertech, nano powers
- **Debt**: Random debt amount and debtor

### Weighted Probabilities

Equipment is rolled with weighted probabilities:

- **Weapons/Armor/Boosters/Cybertech**: Ordered by strength, higher-tier items have lower chance (70% decay factor)
- **Cybertech**: 50% (1-in-2) chance
- **Advanced Gear**: 50% (1-in-2) chance
- **Nano Power**: 50% (1-in-2) chance
- **Nano Infestation**: 20% (1-in-5) chance normally, 50% (1-in-2) if you have a nano power
- **Boosters**: 50% chance if character has a gun
- **Apps**: Guaranteed for Burned Hackers, 25% chance for others

## Usage

### Docker (Recommended)

The easiest way to run the app is with Docker Compose:

```bash
# Start the server
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the server
docker-compose down
```

The app will be available at **http://localhost:8080**

### Browser (Local File)

1. Open `index.html` in a web browser
2. Character automatically generates on page load
3. Click "CLICK TO RESET" to generate a new character
4. Click "PRINT" to print the character sheet

### Command Line (Testing)

```bash
# Generate 3 test characters
node test-generator.js

# Or use npm
npm test
```

### Programmatic Usage

```javascript
import { generateCharacter, displayCharacter } from './generator.js';

const character = generateCharacter();
displayCharacter(character); // Logs to console
```

## Data Tables Included

- **Character Names**: 590+ names and aliases
- **Classes**: 4 detailed character classes
- **Styles**: 69 cyberpunk style descriptors
- **Features**: 60+ physical appearance features
- **Quirks**: 29 behavioral quirks
- **Obsessions**: 90+ hobbies and obsessions
- **Wants**: 31 character motivations
- **Weapons**: 14 weapon types (melee and firearms)
- **Armor**: 6 armor types
- **Boosters**: 10 special ammo types
- **Gear**: 22 basic + 11 advanced gear items
- **Cybertech**: 19 cybernetic implants
- **Nano Powers**: 12 nano abilities
- **Nano Infestations**: 6 nano afflictions
- **Apps**: 12 hacking programs
- **NPCs**: 30+ NPC role categories
- **Missions**: 28 mission verbs

## Credits

- **CY_BORG** ©2022 Stockholm Kartell
- **Original web app** by Karl Druid
- **Static version** created by extracting data and recreating with vanilla HTML/CSS/JS

## Original Files

- `index.original.html` - Original React-based version (backup)
- `dom.html` - DOM dump used for extraction

## License

This is an unofficial fan recreation. CY_BORG is ©2022 Stockholm Kartell. Original web app by Karl Druid.
