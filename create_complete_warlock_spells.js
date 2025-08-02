const fs = require('fs');

// Complete warlock spell list organized by level
const allWarlockSpells = {
  cantrips: [
    "Blade Ward",
    "Chill Touch", 
    "Eldritch Blast",
    "Friends",
    "Mage Hand",
    "Mind Sliver",
    "Minor Illusion",
    "Poison Spray",
    "Prestidigitation",
    "Thunderclap",
    "Toll the Dead",
    "True Strike"
  ],
  level1: [
    "Armor of Agathys",
    "Arms of Hadar",
    "Bane",
    "Charm Person",
    "Comprehend Languages",
    "Detect Magic",
    "Expeditious Retreat",
    "Hellish Rebuke",
    "Hex",
    "Illusory Script",
    "Protection from Evil and Good",
    "Speak with Animals",
    "Tasha's Hideous Laughter",
    "Unseen Servant",
    "Witch Bolt"
  ],
  level2: [
    "Cloud of Daggers",
    "Crown of Madness",
    "Darkness",
    "Enthrall",
    "Gaseous Form",
    "Hold Person",
    "Hunger of Hadar",
    "Hypnotic Pattern",
    "Invisibility",
    "Magic Circle",
    "Major Image",
    "Mind Spike",
    "Mirror Image",
    "Misty Step",
    "Ray of Enfeeblement",
    "Spider Climb",
    "Suggestion"
  ],
  level3: [
    "Calm Emotions",
    "Counterspell",
    "Dispel Magic",
    "Faerie Fire",
    "Fear",
    "Fly",
    "Phantasmal Force",
    "Remove Curse",
    "Summon Fey",
    "Summon Undead",
    "Tongues",
    "Vampiric Touch"
  ],
  level4: [
    "Banishment",
    "Blight",
    "Charm Monster",
    "Dimension Door",
    "Hallucinatory Terrain",
    "Summon Aberration"
  ],
  level5: [
    "Blink",
    "Contact Other Plane",
    "Dream",
    "Hold Monster",
    "Jallarzi's Storm of Radiance",
    "Mislead",
    "Planar Binding",
    "Plant Growth",
    "Scrying",
    "Synaptic Static",
    "Teleportation Circle"
  ],
  level6: [
    "Arcane Gate",
    "Circle of Death",
    "Create Undead",
    "Eyebite",
    "Summon Fiend",
    "Tasha's Bubbling Cauldron",
    "True Seeing"
  ],
  level7: [
    "Dominate Beast",
    "Etherealness",
    "Finger of Death",
    "Forcecage",
    "Greater Invisibility",
    "Plane Shift"
  ],
  level8: [
    "Befuddlement",
    "Demiplane",
    "Dominate Monster",
    "Glibness",
    "Power Word Stun"
  ],
  level9: [
    "Astral Projection",
    "Dominate Person",
    "Foresight",
    "Gate",
    "Imprisonment",
    "Power Word Kill",
    "Seeming",
    "True Polymorph",
    "Weird"
  ]
};

// Icon mapping for different spell types
const getIconForSpell = (spellName) => {
  const iconMap = {
    // Cantrips
    "Blade Ward": "sparkles",
    "Chill Touch": "skull",
    "Eldritch Blast": "magic-swirl",
    "Friends": "smile",
    "Mage Hand": "hand",
    "Mind Sliver": "brain",
    "Minor Illusion": "eye",
    "Poison Spray": "biohazard",
    "Prestidigitation": "sparkles",
    "Thunderclap": "lightning",
    "Toll the Dead": "skull",
    "True Strike": "target",
    
    // Level 1
    "Armor of Agathys": "magic-swirl",
    "Arms of Hadar": "magic-swirl",
    "Bane": "magic-swirl",
    "Charm Person": "magic-swirl",
    "Comprehend Languages": "magic-swirl",
    "Detect Magic": "magic-swirl",
    "Expeditious Retreat": "magic-swirl",
    "Hellish Rebuke": "magic-swirl",
    "Hex": "magic-swirl",
    "Illusory Script": "magic-swirl",
    "Protection from Evil and Good": "magic-swirl",
    "Speak with Animals": "magic-swirl",
    "Tasha's Hideous Laughter": "magic-swirl",
    "Unseen Servant": "magic-swirl",
    "Witch Bolt": "magic-swirl",
    
    // Level 2
    "Cloud of Daggers": "magic-swirl",
    "Crown of Madness": "magic-swirl",
    "Darkness": "magic-swirl",
    "Enthrall": "magic-swirl",
    "Gaseous Form": "smoke",
    "Hold Person": "magic-swirl",
    "Hunger of Hadar": "void",
    "Hypnotic Pattern": "eye",
    "Invisibility": "eye",
    "Magic Circle": "shield",
    "Major Image": "mirror",
    "Mind Spike": "brain",
    "Mirror Image": "mirror",
    "Misty Step": "teleport",
    "Ray of Enfeeblement": "skull",
    "Spider Climb": "spider-web",
    "Suggestion": "chat-bubble",
    
    // Level 3
    "Calm Emotions": "heart",
    "Counterspell": "shield",
    "Dispel Magic": "magic-swirl",
    "Faerie Fire": "flame",
    "Fear": "skull",
    "Fly": "wing",
    "Phantasmal Force": "brain",
    "Remove Curse": "magic-swirl",
    "Summon Fey": "magic-swirl",
    "Summon Undead": "magic-swirl",
    "Tongues": "magic-swirl",
    "Vampiric Touch": "magic-swirl",
    
    // Level 4
    "Banishment": "teleport",
    "Blight": "biohazard",
    "Charm Monster": "smile",
    "Dimension Door": "door",
    "Hallucinatory Terrain": "mountain",
    "Summon Aberration": "tentacle",
    
    // Level 5
    "Blink": "teleport",
    "Contact Other Plane": "brain",
    "Dream": "moon",
    "Hold Monster": "lock",
    "Jallarzi's Storm of Radiance": "lightning",
    "Mislead": "mirror",
    "Planar Binding": "chain",
    "Plant Growth": "leaf",
    "Scrying": "eye",
    "Synaptic Static": "brain",
    "Teleportation Circle": "teleport",
    
    // Level 6
    "Arcane Gate": "magic-swirl",
    "Circle of Death": "magic-swirl",
    "Create Undead": "magic-swirl",
    "Eyebite": "magic-swirl",
    "Summon Fiend": "magic-swirl",
    "Tasha's Bubbling Cauldron": "magic-swirl",
    "True Seeing": "eye",
    
    // Level 7
    "Dominate Beast": "crown",
    "Etherealness": "ghost",
    "Finger of Death": "skull",
    "Forcecage": "cage",
    "Greater Invisibility": "eye",
    "Plane Shift": "teleport",
    
    // Level 8
    "Befuddlement": "brain",
    "Demiplane": "door",
    "Dominate Monster": "crown",
    "Glibness": "mouth",
    "Power Word Stun": "lightning",
    
    // Level 9
    "Astral Projection": "ghost",
    "Dominate Person": "crown",
    "Foresight": "eye",
    "Gate": "door",
    "Imprisonment": "cage",
    "Power Word Kill": "skull",
    "Seeming": "mirror",
    "True Polymorph": "magic-swirl",
    "Weird": "skull"
  };
  
  return iconMap[spellName] || "magic-swirl";
};

// Create spell card object
const createSpellCard = (title, level) => {
  return {
    "count": 1,
    "color": "black",
    "icon_front": getIconForSpell(title),
    "title": title,
    "card_level": level,
    "contents": [
      `footer | Warlock Spell | ${level === "Cantrip" ? "Cantrip" : `Level ${level}`}`
    ],
    "tags": [
      "warlock",
      "spell"
    ]
  };
};

// Sort cards by level and then by title
const sortCards = (cards) => {
  return cards.sort((a, b) => {
    // Get level values for comparison
    const levelA = getLevelValue(a.card_level);
    const levelB = getLevelValue(b.card_level);
    
    // First sort by level
    if (levelA !== levelB) {
      return levelA - levelB;
    }
    
    // Then sort by title (case-insensitive)
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  });
};

// Convert card level to numeric value for sorting
const getLevelValue = (level) => {
  if (!level) return 0;
  
  // Handle cantrips (should come first)
  if (level.toLowerCase() === 'cantrip') {
    return 0;
  }
  
  // Handle numeric levels
  const numericLevel = parseInt(level);
  if (!isNaN(numericLevel)) {
    return numericLevel;
  }
  
  // For any other format, put at the end
  return 999;
};

// Create complete warlock spells file
function createCompleteWarlockSpells() {
  try {
    const allCards = [];
    
    // Add cantrips
    allWarlockSpells.cantrips.forEach(spell => {
      allCards.push(createSpellCard(spell, "Cantrip"));
    });
    
    // Add level 1 spells
    allWarlockSpells.level1.forEach(spell => {
      allCards.push(createSpellCard(spell, "1"));
    });
    
    // Add level 2 spells
    allWarlockSpells.level2.forEach(spell => {
      allCards.push(createSpellCard(spell, "2"));
    });
    
    // Add level 3 spells
    allWarlockSpells.level3.forEach(spell => {
      allCards.push(createSpellCard(spell, "3"));
    });
    
    // Add level 4 spells
    allWarlockSpells.level4.forEach(spell => {
      allCards.push(createSpellCard(spell, "4"));
    });
    
    // Add level 5 spells
    allWarlockSpells.level5.forEach(spell => {
      allCards.push(createSpellCard(spell, "5"));
    });
    
    // Add level 6 spells
    allWarlockSpells.level6.forEach(spell => {
      allCards.push(createSpellCard(spell, "6"));
    });
    
    // Add level 7 spells
    allWarlockSpells.level7.forEach(spell => {
      allCards.push(createSpellCard(spell, "7"));
    });
    
    // Add level 8 spells
    allWarlockSpells.level8.forEach(spell => {
      allCards.push(createSpellCard(spell, "8"));
    });
    
    // Add level 9 spells
    allWarlockSpells.level9.forEach(spell => {
      allCards.push(createSpellCard(spell, "9"));
    });
    
    // Sort all cards
    const sortedCards = sortCards(allCards);
    
    // Write to file
    const filePath = "1. warlock/warlock-spells.json";
    fs.writeFileSync(filePath, JSON.stringify(sortedCards, null, 2), 'utf8');
    
    console.log(`✅ Created complete warlock spells file`);
    console.log(`📊 Total spells: ${sortedCards.length}`);
    console.log(`📁 File: ${filePath}`);
    
    // Show breakdown by level
    const levelCounts = {};
    sortedCards.forEach(card => {
      const level = card.card_level;
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });
    
    console.log(`\n📋 Breakdown by level:`);
    Object.entries(levelCounts).forEach(([level, count]) => {
      console.log(`   ${level}: ${count} spells`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the script
createCompleteWarlockSpells(); 