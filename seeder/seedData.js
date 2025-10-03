import bcrypt from "bcryptjs";
import connectDB from "./../config/db.js";
import User from "./../models/User.js";
import Note from "./../models/Note.js";

async function seedData() {
    try {

        // Connect to DB
        await connectDB();

        // Clear
        await User.deleteMany({});
        await Note.deleteMany({});
        console.log("Cleared Users & Notes");

        // Create users
        const users = await User.insertMany([
            {
                fullName: "Alice Johnson",
                email: "alice@example.com",
                password: await bcrypt.hash("Password123!", 10),
                provider: "local",
            },
            {
                fullName: "Bob Smith",
                email: "bob@example.com",
                password: await bcrypt.hash("Password456!", 10),
                provider: "local",
            },
            {
                fullName: "Charlie Lee",
                email: "charlie@example.com",
                password: await bcrypt.hash("Password789!", 10),
                provider: "local",
            },
        ]);

        console.log("Users seeded:", users.map(u => u.fullName));

        // Create notes
        const notes = await Note.insertMany([
            {
                title: "Welcome Note",
                content: `Welcome to your note-taking app! 
                Here you can create, edit, and organize notes. 
                Try pinning or favoriting important ones to keep them at the top.`,
                    user: users[0]._id,
                isPinned: true,
            },
            {
                title: "Project Roadmap",
                content: `Phase 1: Research & Planning
                - Define user requirements
                - Draft wireframes
                - Research similar products

                Phase 2: Development
                - Build authentication system
                - Implement CRUD for notes
                - Add pin & favorite functionality

                Phase 3: Launch
                - Testing
                - Deployment
                - Collect user feedback`,
                user: users[0]._id,
                isFavorite: true,
            },
            {
                title: "Shopping List",
                content: `Groceries:
            - Fresh vegetables (carrots, spinach, tomatoes)
            - Fruits (apples, bananas, grapes)
            - Dairy (milk, yogurt, cheese)
            - Snacks (nuts, granola bars, crackers)
            - Household (detergent, soap, paper towels)`,
                user: users[1]._id,
            },
            {
                title: "Daily Journal",
                content: `Today I experimented with MongoDB and Mongoose. 
                Learned how to create schemas, connect relationships, and seed data. 
                It's much easier to test when the database has realistic entries!`,
                user: users[1]._id,
                isFavorite: true,
            },
            {
                title: "Ideas for the Future",
                content: `- Implement dark mode
                - Add note search by keyword
                - Support file & image uploads
                - Collaborative editing with friends
                - Mobile app version for iOS/Android`,
                user: users[2]._id,
                isPinned: true,
            },
            {
                title: "Travel Plans",
                content: `Summer 2025 Trip:
                - Destination: Japan
                - Must visit: Tokyo, Kyoto, Osaka
                - Things to pack: passport, JR rail pass, camera, travel adapter
                - Budget: $3500 (flights + hotels + food + attractions)`,
                user: users[2]._id,
            },
        ]);

        console.log("Notes seeded:", notes.map(n => n.title));

        process.exit(0);
    } catch (err) {
        console.error("Error seeding data:", err);
        process.exit(1);
    }
}

seedData();
