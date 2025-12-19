document.getElementById('note-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());

  try {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, content, tags })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const note = await response.json();
    
    // Display the note
    const noteDiv = createNoteElement(note);
    document.getElementById('notes-list').appendChild(noteDiv);
    
    // Reset form
    e.target.reset();
  } catch (error) {
    console.error('Error creating note:', error);
    alert('Error creating note: ' + error.message);
  }
});

// Fetch and display existing notes
async function loadNotes() {
  try {
    const response = await fetch('/api/notes');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const notes = await response.json();
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';
    notes.forEach(note => {
      const noteDiv = createNoteElement(note);
      notesList.appendChild(noteDiv);
    });
  } catch (error) {
    console.error('Error loading notes:', error);
    document.getElementById('notes-list').innerHTML = `<p class="error">Error loading notes: ${error.message}</p>`;
  }
}

// Create note element with edit and delete buttons
function createNoteElement(note) {
  const noteDiv = document.createElement('div');
  noteDiv.className = 'note';
  noteDiv.dataset.id = note._id;
  
  noteDiv.innerHTML = `
    <h2>${note.title}</h2>
    <p>${note.content}</p>
    <p><strong>Tags:</strong> ${note.tags.map(tag => tag.name).join(', ')}</p>
    <p><strong>Created:</strong> ${new Date(note.createdAt).toLocaleString()}</p>
    <button class="edit-btn" data-id="${note._id}">Edit</button>
    <button class="delete-btn" data-id="${note._id}">Delete</button>
  `;
  
  // Add event listeners for edit and delete buttons
  noteDiv.querySelector('.edit-btn').addEventListener('click', () => editNote(note._id));
  noteDiv.querySelector('.delete-btn').addEventListener('click', () => deleteNote(note._id));
  
  return noteDiv;
}

// Edit note function
async function editNote(noteId) {
  try {
    const response = await fetch(`/api/notes/${noteId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const note = await response.json();
    
    // Populate form with note data
    document.getElementById('title').value = note.title;
    document.getElementById('content').value = note.content;
    document.getElementById('tags').value = note.tags.map(tag => tag.name).join(', ');
    
    // Change form to update mode
    const form = document.getElementById('note-form');
    form.dataset.editId = noteId;
    form.querySelector('button[type="submit"]').textContent = 'Update Note';
  } catch (error) {
    console.error('Error fetching note:', error);
    alert('Error fetching note: ' + error.message);
  }
}

// Delete note function
async function deleteNote(noteId) {
  if (!confirm('Are you sure you want to delete this note?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Remove note from DOM
    const noteElement = document.querySelector(`.note[data-id="${noteId}"]`);
    if (noteElement) {
      noteElement.remove();
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    alert('Error deleting note: ' + error.message);
  }
}

// Handle form submission for both create and update
document.getElementById('note-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
  
  const isUpdate = this.dataset.editId;
  
  try {
    let response;
    if (isUpdate) {
      // Update existing note
      response = await fetch(`/api/notes/${this.dataset.editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content, tags })
      });
    } else {
      // Create new note
      response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content, tags })
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const note = await response.json();
    
    if (isUpdate) {
      // Update note in DOM
      const noteElement = document.querySelector(`.note[data-id="${this.dataset.editId}"]`);
      if (noteElement) {
        noteElement.outerHTML = createNoteElement(note).outerHTML;
      }
      // Reset form to create mode
      delete this.dataset.editId;
      this.querySelector('button[type="submit"]').textContent = 'Submit';
    } else {
      // Add new note to DOM
      const noteDiv = createNoteElement(note);
      document.getElementById('notes-list').appendChild(noteDiv);
    }
    
    // Reset form
    this.reset();
  } catch (error) {
    console.error('Error saving note:', error);
    alert('Error saving note: ' + error.message);
  }
});

// Load notes when page loads
loadNotes();