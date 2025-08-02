# Duplicate Removal and Sorting Script

This script removes duplicate entries from JSON card files based on the `title` field and sorts them by level and then by spell name.

## Usage

```bash
node remove_duplicates.js <file_or_directory>
```

## Examples

### Process a single file
```bash
node remove_duplicates.js "1. warlock/warlock-spells.json"
```

### Process all JSON files in a directory
```bash
node remove_duplicates.js "1. warlock/"
```

### Process all JSON files recursively from current directory
```bash
node remove_duplicates.js .
```

## What it does

1. **Identifies duplicates**: Looks for cards with the same `title` field
2. **Removes duplicates**: Keeps the first occurrence and removes subsequent duplicates
3. **Sorts cards**: Orders cards by level (Cantrips first, then Level 1, 2, 3, etc.) and then alphabetically by title
4. **Updates the original file**: Replaces the file with deduplicated and sorted content
5. **Creates a backup**: Saves removed duplicates to a `-duplicates.json` file for review
6. **Provides feedback**: Shows counts of original, unique, and removed items

## Output

The script will show:
- Original count of cards
- Number of unique cards after deduplication
- Number of duplicates removed
- List of duplicate titles found
- Confirmation of sorting
- Confirmation of file updates

## Example Output

```
Processing 1. warlock/warlock-spells.json
Original count: 54
Duplicate found: Cloud of Daggers
Duplicate found: Crown of Madness
Duplicate found: Darkness
Duplicate found: Enthrall
Duplicate found: Hold Person
Duplicate found: Invisibility
Duplicate found: Mind Spike
Duplicate found: Mirror Image
Unique count: 46
Duplicates removed: 8
✅ Sorted cards by level and title
✅ Updated 1. warlock/warlock-spells.json
📝 Duplicates saved to 1. warlock/warlock-spells-duplicates.json
```

## Safety Features

- **Backup duplicates**: Removed items are saved to a separate file
- **Error handling**: Gracefully handles missing files and invalid JSON
- **Validation**: Checks for cards without titles and warns about them
- **Non-destructive**: Only processes JSON files, ignores other file types

## Requirements

- Node.js (any recent version)
- No additional dependencies required 