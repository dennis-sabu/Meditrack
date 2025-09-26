import bcrypt from 'bcrypt';
import { db } from '.';
import { user } from './schema';

async function seedUsers() {
    // Sample user data

    console.log('Sample user data has been seeded.');
    process.exit(0);
}
seedUsers().catch((error) => {
    console.error('Error seeding user data:', error);
    process.exit(1);
});