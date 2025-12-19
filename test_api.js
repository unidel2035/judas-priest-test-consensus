// Simple test script to verify API functionality
const http = require('http');

// Test data
const testNote = {
  title: 'Test Note',
  content: 'This is a test note for API verification',
  tags: ['test', 'api']
};

// Test base URL (assuming server runs on localhost:3000)
const baseURL = 'http://localhost:3000';

// Function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

// Test functions
async function testCreateNote() {
  console.log('Testing CREATE note...');
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/notes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options, testNote);
    console.log('CREATE Note Status:', response.statusCode);
    console.log('CREATE Note Response:', response.data);
    return response.data ? response.data._id : null;
  } catch (error) {
    console.error('Error creating note:', error.message);
  }
}

async function testGetNotes() {
  console.log('Testing GET all notes...');
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/notes',
      method: 'GET'
    };

    const response = await makeRequest(options);
    console.log('GET Notes Status:', response.statusCode);
    console.log('GET Notes Count:', response.data ? response.data.length : 0);
  } catch (error) {
    console.error('Error getting notes:', error.message);
  }
}

async function testGetNoteById(noteId) {
  if (!noteId) {
    console.log('No note ID provided, skipping GET by ID test');
    return;
  }

  console.log('Testing GET note by ID...');
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/notes/${noteId}`,
      method: 'GET'
    };

    const response = await makeRequest(options);
    console.log('GET Note by ID Status:', response.statusCode);
    console.log('GET Note by ID Title:', response.data ? response.data.title : 'N/A');
  } catch (error) {
    console.error('Error getting note by ID:', error.message);
  }
}

async function testUpdateNote(noteId) {
  if (!noteId) {
    console.log('No note ID provided, skipping UPDATE test');
    return;
  }

  console.log('Testing UPDATE note...');
  try {
    const updatedNote = {
      title: 'Updated Test Note',
      content: 'This note has been updated',
      tags: ['updated', 'test']
    };

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/notes/${noteId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options, updatedNote);
    console.log('UPDATE Note Status:', response.statusCode);
    console.log('UPDATE Note Response:', response.data);
  } catch (error) {
    console.error('Error updating note:', error.message);
  }
}

async function testDeleteNote(noteId) {
  if (!noteId) {
    console.log('No note ID provided, skipping DELETE test');
    return;
  }

  console.log('Testing DELETE note...');
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/notes/${noteId}`,
      method: 'DELETE'
    };

    const response = await makeRequest(options);
    console.log('DELETE Note Status:', response.statusCode);
    console.log('DELETE Note Response:', response.data);
  } catch (error) {
    console.error('Error deleting note:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('Starting API tests...\n');
  
  // Create a note and get its ID
  const noteId = await testCreateNote();
  
  // Get all notes
  await testGetNotes();
  
  // Get the specific note by ID
  await testGetNoteById(noteId);
  
  // Update the note
  await testUpdateNote(noteId);
  
  // Delete the note
  await testDeleteNote(noteId);
  
  console.log('\nAPI tests completed.');
}

// Run the tests
runTests().catch(console.error);