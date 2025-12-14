const bcrypt = require('bcryptjs');

/**
 * Password Hashing Utility
 * This script generates secure bcrypt hashes for passwords
 */

// Function to hash a password
async function hashPassword(plainPassword) {
    const saltRounds = 10; // Higher = more secure but slower
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
}

// Function to verify a password
async function verifyPassword(plainPassword, hashedPassword) {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
}

// Generate hash for default admin password
async function generateAdminPassword() {
    console.log('\n' + '='.repeat(60));
    console.log('🔐 PASSWORD HASHING UTILITY');
    console.log('='.repeat(60) + '\n');

    const plainPassword = 'admin123';

    console.log('Plain Password:', plainPassword);
    console.log('Hashing...\n');

    const hashedPassword = await hashPassword(plainPassword);

    console.log('✅ Hashed Password:');
    console.log(hashedPassword);
    console.log('\n' + '='.repeat(60));
    console.log('📋 SQL UPDATE QUERY');
    console.log('='.repeat(60) + '\n');
    console.log('Run this in phpMyAdmin to update the admin password:\n');
    console.log(`UPDATE admins SET password = '${hashedPassword}' WHERE username = 'admin';\n`);

    // Test verification
    console.log('='.repeat(60));
    console.log('🧪 VERIFICATION TEST');
    console.log('='.repeat(60) + '\n');

    const isValid = await verifyPassword(plainPassword, hashedPassword);
    console.log(`Testing password "${plainPassword}":`, isValid ? '✅ MATCH' : '❌ NO MATCH');

    const isInvalid = await verifyPassword('wrongpassword', hashedPassword);
    console.log(`Testing password "wrongpassword":`, isInvalid ? '✅ MATCH' : '❌ NO MATCH');

    console.log('\n' + '='.repeat(60));
    console.log('💡 HOW TO USE IN YOUR API');
    console.log('='.repeat(60) + '\n');
    console.log('// Login endpoint example:');
    console.log('const bcrypt = require("bcryptjs");');
    console.log('');
    console.log('// Compare user input with hashed password from database');
    console.log('const isMatch = await bcrypt.compare(userInput, dbPassword);');
    console.log('if (isMatch) {');
    console.log('  // Password correct - login successful');
    console.log('} else {');
    console.log('  // Password incorrect - login failed');
    console.log('}\n');
}

// Run the generator
generateAdminPassword().catch(console.error);

// Export functions for use in other files
module.exports = { hashPassword, verifyPassword };
