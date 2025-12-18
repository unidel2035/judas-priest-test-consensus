document.getElementById('note-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());

  const response = await fetch('/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, content, tags })
  });

  const note = await response.json();
  
  // Display the note
  const noteDiv = document.createElement('div');
  noteDiv.className = 'note';
  noteDiv.innerHTML = `<h2>${note.title}</h2><p>${note.content}</p><p><strong>Tags:</strong> ${note.tags.map(tag => tag.name).join(', ')}</p>`;
  
  document.getElementById('notes-list').appendChild(noteDiv);
  
  // Reset form
  e.target.reset();
});

// Fetch and display existing notes
fetch('/api/notes')
  .then(response => response.json())
  .then(notes => {
    notes.forEach(note => {
      const noteDiv = document.createElement('div');
      noteDiv.className = 'note';
      noteDiv.innerHTML = `<h2>${note.title}</h2><p>${note.content}</p><p><strong>Tags:</strong> ${note.tags.map(tag => tag.name).join(', ')}</p>`;
      document.getElementById('notes-list').appendChild(noteDiv);
    });
  });