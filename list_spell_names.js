const fs = require('fs');

function listSpellNames(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Error: File not found: ${filePath}`);
      return;
    }
    
    // Read and parse the JSON file
    const data = fs.readFileSync(filePath, 'utf8');
    const spells = JSON.parse(data);
    
    // Validate that it's an array
    if (!Array.isArray(spells)) {
      console.error(`❌ Error: File does not contain a valid spell array`);
      return;
    }
    
    console.log(`📖 Reading spells from: ${filePath}`);
    console.log(`📊 Total spells found: ${spells.length}`);
    
    // Check if we have any spells
    if (spells.length === 0) {
      console.log(`⚠️  No spells found in the file`);
      return;
    }
    
    // Get the level from the first spell (assuming all spells in file are same level)
    const level = spells[0]?.card_level || "Unknown";
    console.log(`🎯 Spell level: ${level}`);
    
    // List all spell names
    console.log(`\n📋 Spell Names:`);
    spells.forEach((spell, index) => {
      const number = (index + 1).toString().padStart(2, ' ');
      console.log(`   ${number}. ${spell.title}`);
    });
    
    // Show summary
    console.log(`\n📊 Summary:`);
    console.log(`   - File: ${filePath}`);
    console.log(`   - Level: ${level}`);
    console.log(`   - Total spells: ${spells.length}`);
    
    // Optional: Show spell details if requested
    if (process.argv.includes('--details')) {
      console.log(`\n🔍 Detailed spell information:`);
      spells.forEach((spell, index) => {
        const number = (index + 1).toString().padStart(2, ' ');
        console.log(`\n   ${number}. ${spell.title}`);
        console.log(`      Level: ${spell.card_level}`);
        console.log(`      Icon: ${spell.icon_front}`);
        console.log(`      Tags: ${spell.tags.join(', ')}`);
      });
    }
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`❌ Error: Invalid JSON file: ${error.message}`);
    } else {
      console.error(`❌ Error reading file: ${error.message}`);
    }
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node list_spell_names.js <file_path> [--details]');
    console.log('');
    console.log('Examples:');
    console.log('  node list_spell_names.js "1. warlock/spells-by-level/warlock-cantrips.json"');
    console.log('  node list_spell_names.js "1. warlock/spells-by-level/warlock-level-1.json" --details');
    console.log('');
    console.log('Options:');
    console.log('  --details    Show detailed information for each spell');
    process.exit(1);
  }
  
  const filePath = args[0];
  listSpellNames(filePath);
}

module.exports = { listSpellNames }; 