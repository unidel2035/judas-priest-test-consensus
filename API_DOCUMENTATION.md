# API Documentation

## Notes Endpoints

### Create a Note
- **URL**: `POST /api/notes`
- **Description**: Create a new note with optional tags
- **Request Body**:
  ```json
  {
    "title": "Note Title",
    "content": "Note content",
    "tags": ["tag1", "tag2"]
  }
  ```
- **Response**: Created note object with populated tags

### Get All Notes
- **URL**: `GET /api/notes`
- **Description**: Retrieve all notes with their associated tags
- **Response**: Array of note objects

### Get Note by ID
- **URL**: `GET /api/notes/:id`
- **Description**: Retrieve a specific note by its ID
- **Response**: Note object with populated tags

### Update Note
- **URL**: `PUT /api/notes/:id`
- **Description**: Update an existing note
- **Request Body**:
  ```json
  {
    "title": "Updated Title",
    "content": "Updated content",
    "tags": ["tag1", "tag3"]
  }
  ```
- **Response**: Updated note object with populated tags

### Delete Note
- **URL**: `DELETE /api/notes/:id`
- **Description**: Delete a note by its ID
- **Response**: Success message

## Tags Endpoints

### Get All Tags
- **URL**: `GET /api/tags`
- **Description**: Retrieve all available tags
- **Response**: Array of tag objects

### Get Notes by Tag
- **URL**: `GET /api/tags/:tagName/notes`
- **Description**: Retrieve all notes associated with a specific tag
- **Response**: Array of note objects with populated tags