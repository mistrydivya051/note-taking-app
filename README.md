
# Note-Taking App

### 1. Clone the repository
```bash
git clone https://github.com/mistrydivya051/note-taking-app.git
cd note-taking-app
```

### 2. Create `package.json`
If `package.json` does not exist, initialize it:
```bash
npm init -y
```

### 3. Install dependencies
If `package.json` exists:
```bash
npm install
```

If `package.json` is missing, install the required dependencies manually:
```bash
npm install express mongoose dotenv ejs passport passport-google-oauth20 passport-github2 express-session connect-flash method-override
```

For development (nodemon):
```bash
npm install -D nodemon
```

### 4. Configure environment variables
Create a `.env` file in the root directory:

```ini
PORT=3000
BASE_URL=http://localhost:3000
MONGODB_URL=your_mongodb_connection_string

SESSION_SECRET='I build stuff code'

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=your_google_callback_url

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=your_github_callback_url
```

### 5. Seed the database
```bash
npm run seed (optional)
```

### 6. Run the application
```bash
npm run dev    # for development with nodemon
npm start      # for production
```

To run use follow link:  [http://localhost:3000](http://localhost:3000)

---

## Difficulties Faced
- Connecting to MongoDB and setting up environment variables
- Organizing routes and models clearly
- Managing async database operations and handling errors
- Rendering data correctly in EJS templates

---

## What I Learned
- How to use Express and MongoDB together with Mongoose
- Organizing Node.js projects with routes, models, and views
- Using environment variables for sensitive information
- Creating seed scripts for quick testing
- Debugging MongoDB and async code in Node.js
