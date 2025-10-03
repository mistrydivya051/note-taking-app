import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import expressLayouts from 'express-ejs-layouts'; // for layout support in EJS
import morgan from 'morgan';
import methodOverride from 'method-override'; // to support DELETE in forms

import connectDB from './config/db.js';
import configurePassport from './config/passport.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import usersRoutes from './routes/users.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to MongoDB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method')); // this allows ?_method=DELETE to work
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL})
}));

// Passport
configurePassport();
import passport from 'passport';
app.use(passport.initialize());
app.use(passport.session());

// flash toast message
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.toast = req.session.toast || null;
  if (res.locals.toast) {
    res.locals.serverToastScript = `<script>window.__SERVER_TOAST__ = ${JSON.stringify(res.locals.toast)};</script>`;
  } else {
    res.locals.serverToastScript = '';
  }
  delete req.session.toast;
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/notes', notesRoutes);
app.use('/users', usersRoutes);

app.get('/', (req, res) => res.render('index', { title: 'Home' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
