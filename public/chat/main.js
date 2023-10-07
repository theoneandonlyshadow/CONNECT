const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('search-btn');
  const searchResults = document.getElementById('searchResults');


  try {
    document.getElementById('proman').addEventListener('click', () => {
      window.location.href = '../proman/proman.html';
    });
  } catch (error) {
    console.error('An error occurred:', error);
  }

  
  searchButton.addEventListener('click', function () {
      searchForText(searchInput.value);
  });

  function searchForText(query) {
      const content = document.body.textContent;
      const regex = new RegExp(query, 'gi'); // 'gi' for global and case-insensitive search

      const matches = content.match(regex);

      if (matches) {
          const highlightedContent = content.replace(
              regex,
              (match) => `<span class="highlight">${match}</span>`
          );

          searchResults.innerHTML = `<p>Found ${matches.length} matches:</p>`;
          searchResults.innerHTML += highlightedContent;

          // Scroll to the first match
          const firstMatch = document.querySelector('.highlight');
          if (firstMatch) {
              firstMatch.scrollIntoView({ behavior: 'smooth' });
          }
      } else {
          searchResults.innerHTML = '<p>No matches found.</p>';
      }
  }
});


// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(room);
});

// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

app.get('/', (req, res) => {
  const userData = req.body.name || {}; // Retrieve user data from the session
  res.json(userData); // Send user data as JSON to the client
});

//proman




// dropdown
const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {
    const select = dropdown.querySelector('.select');
    const caret = dropdown.querySelector('.caret');
    const menu = dropdown.querySelector('.menu');
    const options = dropdown.querySelectorAll('.menu li');
    const selected = dropdown.querySelector('.selected');

  
select.addEventListener('click', () => {
  select.classList.toggle('select-clicked');
  caret.classList.toggle('caret-rotate');
  menu.classList.toggle('menu-open');
});

options.forEach(option => {
  option.addEventListener('click', () => {
      selected.innerText = option.innerText;
      select.classList.remove('select-clicked');
      caret.classList.remove('caret-rotate');
      menu.classList.remove('menu-open');
    
      options.forEach(option => {
        option.classList.remove('active');
        });
          option.classList.add('active');
  });
});
});

const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName'); // Add this line


// File input change event listener
fileInput.addEventListener('change', (e) => {
  const selectedFile = e.target.files[0];
  if (selectedFile) {
    alert(`File Attached: ${selectedFile.name}`);
    alert("press send with a message")
  } else {
    alert("error");
  }
});

// Message submit including file attachment
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const msgInput = e.target.elements.msg;
  const msg = msgInput.value;

  // Check if a file is attached
  const file = fileInput.files[0];
  if (file) {
    // Handle file attachment
    const reader = new FileReader();
    reader.onload = () => {
      const fileData = {
        filename: file.name,
        data: reader.result,
      };

      socket.emit('file-upload', fileData);
      console.log('File uploaded:', file.name);

      // Display the file name in the chat
      const message = `${username} attached a file: ${file.name}`;
      outputMessage({ username, text: message });
    };
    reader.readAsDataURL(file);

    // Clear the file input
    fileInput.value = '';
    fileNameDisplay.innerText = '';
  }

  // Check if a text message is entered
  if (msg.trim() !== '') {
    socket.emit('chatMessage', msg);
  }

  // Clear input
  msgInput.value = '';
  msgInput.focus();
});


//file stuf
// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);

  // Create a download link for the file if it's attached
  if (message.downloadLink) {
    const downloadLink = document.createElement('a');
    downloadLink.classList.add('download-icon');
    downloadLink.href = message.downloadLink;
    downloadLink.download = message.filename;
    downloadLink.title = 'Download File';
    downloadLink.innerHTML = '<i class="fas fa-download"></i>';
    div.appendChild(downloadLink);
  }

  document.querySelector('.chat-messages').appendChild(div);
}
