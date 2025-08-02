const fs = require('fs');
const path = require('path');

/**
 * Sorts cards by level and then by title
 * @param {Array} cards - Array of card objects
 * @returns {Array} Sorted array of cards
 */
function sortCards(cards) {
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
}

/**
 * Converts card level to numeric value for sorting
 * @param {string} level - Card level string
 * @returns {number} Numeric value for sorting
 */
function getLevelValue(level) {
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
}

/**
 * Removes duplicate entries from a JSON file based on the 'title' field and sorts by level and title
 * @param {string} filePath - Path to the JSON file
 */
function removeDuplicates(filePath) {
  try {
    // Read the JSON file
    const data = fs.readFileSync(filePath, 'utf8');
    const cards = JSON.parse(data);
    
    console.log(`Processing ${filePath}`);
    console.log(`Original count: ${cards.length}`);
    
    // Create a Map to track seen titles
    const seenTitles = new Map();
    const uniqueCards = [];
    const duplicates = [];
    
    // Filter out duplicates
    for (const card of cards) {
      if (!card.title) {
        console.warn('Found card without title:', card);
        uniqueCards.push(card);
        continue;
      }
      
      if (seenTitles.has(card.title)) {
        duplicates.push(card);
        console.log(`Duplicate found: ${card.title}`);
      } else {
        seenTitles.set(card.title, true);
        uniqueCards.push(card);
      }
    }
    
    console.log(`Unique count: ${uniqueCards.length}`);
    console.log(`Duplicates removed: ${duplicates.length}`);
    
    // Sort the unique cards by level and then by title
    const sortedCards = sortCards(uniqueCards);
    console.log(`✅ Sorted cards by level and title`);
    
    // Always write the sorted data back to the file (even if no duplicates were found)
    fs.writeFileSync(filePath, JSON.stringify(sortedCards, null, 2), 'utf8');
    console.log(`✅ Updated ${filePath}`);
    
    if (duplicates.length > 0) {
      // Optionally save duplicates to a separate file for review
      const duplicatesPath = filePath.replace('.json', '-duplicates.json');
      fs.writeFileSync(duplicatesPath, JSON.stringify(duplicates, null, 2), 'utf8');
      console.log(`📝 Duplicates saved to ${duplicatesPath}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

/**
 * Process all JSON files in a directory recursively
 * @param {string} directory - Directory to process
 */
function processDirectory(directory) {
  try {
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (item.endsWith('.json')) {
        removeDuplicates(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error.message);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node remove_duplicates.js <file_or_directory>');
    console.log('Examples:');
    console.log('  node remove_duplicates.js 1. warlock/warlock-spells.json');
    console.log('  node remove_duplicates.js 1. warlock/');
    console.log('  node remove_duplicates.js .');
    process.exit(1);
  }
  
  const target = args[0];
  
  if (!fs.existsSync(target)) {
    console.error(`Error: ${target} does not exist`);
    process.exit(1);
  }
  
  const stat = fs.statSync(target);
  
  if (stat.isDirectory()) {
    console.log(`Processing directory: ${target}`);
    processDirectory(target);
  } else if (target.endsWith('.json')) {
    removeDuplicates(target);
  } else {
    console.error(`Error: ${target} is not a JSON file or directory`);
    process.exit(1);
  }
  
  console.log('\n🎉 Deduplication complete!');
}

module.exports = { removeDuplicates, processDirectory }; 