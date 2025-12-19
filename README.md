# Test Consensus - Notes Application

A full-featured notes application with tagging functionality built with Node.js, Express, and MongoDB.

## Features

- Create, read, update, and delete notes
- Tag notes with multiple tags
- Filter notes by tags
- Responsive web interface
- RESTful API

## API Endpoints

### Notes
- `POST /api/notes` - Create a new note
- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get a specific note by ID
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/:tagName/notes` - Get notes by tag

### Health Check
- `GET /api/health` - Check server and database status

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Make sure MongoDB is running on localhost:27017

3. Start the server:
   ```
   npm start
   ```

4. Open your browser to http://localhost:3000

## Project Structure

- `server.js` - Main server file
- `routes/` - API route definitions
- `controllers/` - Request handlers
- `models/` - Database models
- `public/` - Frontend files
- `public/index.html` - Main application interface
- `public/test.html` - API testing interface

## Testing

You can test the API using the test interface at http://localhost:3000/test.html or by running the test script:

```
node test_api.js
```