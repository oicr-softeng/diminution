import escapeHtml from 'escape-html';
import express from 'express';
import fs from 'fs';
import marked from 'marked';
import path from 'path';
import databaseHandlers from './database';
import urlRoutes from './routes';

const PORT = process.env.PORT || 4100;
const app = express();

// these just set up instructions at the root endpoint
app.engine('md', (filepath, options, fn) =>
  fs.readFile(filepath, 'utf8', (err, str) =>
    err
      ? fn(err)
      : fn(
          null,
          marked.parse(str).replace(/\{([^}]+)\}/g, (_, name) => escapeHtml(options[name] || '')),
        ),
  ),
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'md'); // makes .md the default extension

app.get('/help', (req, res) => res.render('instructions', { title: 'Usage instructions' }));

// this is the business end of this thing
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));
// app.use(express.raw()); // TODO: accept files

app.use('/', urlRoutes(databaseHandlers));

app.listen(PORT, () => console.log(`Diminution is listening on port ${PORT}`));
