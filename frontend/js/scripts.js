// js/scripts.js
$(document).ready(function() {

  const API_BASE_URL = 'http://localhost:3000/api';

  // --- Login Form ---
  $('#loginForm').submit(function(e) {
    e.preventDefault();
    const username = $('#loginUsername').val().trim();
    const password = $('#loginPassword').val().trim();

    if (!username || !password) {
      alert('Please enter username and password');
      return;
    }

    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          loadUserInfo();
          $('#loginForm').hide();
        } else {
          alert(data.error || 'Login failed');
        }
      })
      .catch(() => alert('Login failed: Network or server error'));
  });

  // --- Register Form ---
  $('#registerForm').submit(function(e) {
    e.preventDefault();
    const username = $('#regUsername').val().trim();
    const email = $('#regEmail').val().trim();
    const password = $('#regPassword').val().trim();
    const role = $('#regRole').val() || 'user';

    if (!username || !email || !password) {
      alert('Please enter username, email, and password');
      return;
    }

    fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          $('#registerMessage').html(`<div class="alert alert-success">${data.message}. You can <a href="index.html">login now</a>.</div>`);
          $('#registerForm')[0].reset();
        } else {
          $('#registerMessage').html(`<div class="alert alert-danger">${data.error || 'Registration failed'}</div>`);
        }
      })
      .catch(() => {
        $('#registerMessage').html('<div class="alert alert-danger">Network or server error</div>');
      });
  });

  // --- Load logged-in user info and shirts ---
  function loadUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Decode token payload to show username + role
    const payloadBase64 = token.split('.')[1];
    const payloadJSON = atob(payloadBase64);
    const user = JSON.parse(payloadJSON);

    $('#usernameDisplay').text(user.username);
    $('#userRole').text(user.role);
    $('#userInfo').show();
    $('#loginForm').hide();

    // Show admin panel button only if role is admin
    if (user.role === 'admin') {
      $('#adminPanel').show();
    } else {
      $('#adminPanel').hide();
    }

    // Fetch and display shirts
    fetchShirts();
  }

  // Fetch shirts from backend and render
  function fetchShirts() {
    fetch(`${API_BASE_URL}/shirts`)
      .then(res => res.json())
      .then(shirts => {
        if (!Array.isArray(shirts)) {
          $('#shirtsList').html('<p>Error loading shirts</p>');
          return;
        }

        let html = '';
        shirts.forEach(shirt => {
          html += `<div class="col-md-4 mb-3">
                     <div class="card">
                       <div class="card-body">
                         <h5 class="card-title">${shirt.name}</h5>
                         <p class="card-text">${shirt.description || ''}</p>
                         <p class="card-text"><strong>Price: </strong>$${shirt.price}</p>
                         <p class="card-text"><strong>Stock: </strong>${shirt.stock}</p>
                       </div>
                     </div>
                   </div>`;
        });

        $('#shirtsList').html(html);
      })
      .catch(() => {
        $('#shirtsList').html('<p>Network or server error loading shirts</p>');
      });
  }

  // --- Logout ---
  $('#logoutBtn, #adminLogoutBtn').click(function() {
    localStorage.removeItem('token');
    $('#userInfo').hide();
    $('#adminPanel').hide();
    if ($('#loginForm').length) {
      $('#loginForm').show();
      $('#loginForm')[0].reset();
    }
    if ($('#createShirtForm').length) {
      window.location.href = 'index.html'; // Redirect admin to login on logout
    }
  });

  // --- Admin page logic ---
  if (window.location.pathname.endsWith('admin.html')) {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login as admin to access this page.');
      window.location.href = 'index.html';
      return;
    }

    // Decode token to check role
    const payloadBase64 = token.split('.')[1];
    const payloadJSON = atob(payloadBase64);
    const user = JSON.parse(payloadJSON);

    if (user.role !== 'admin') {
      alert('Access denied. Admins only.');
      window.location.href = 'index.html';
      return;
    }

    // Load shirts with admin controls
    loadAdminShirts();

    // Create shirt
    $('#createShirtForm').submit(function(e) {
      e.preventDefault();

      const newShirt = {
        name: $('#shirtName').val().trim(),
        description: $('#shirtDescription').val().trim(),
        price: parseFloat($('#shirtPrice').val()),
        stock: parseInt($('#shirtStock').val(), 10)
      };

      if (!newShirt.name || isNaN(newShirt.price) || isNaN(newShirt.stock)) {
        alert('Please fill in valid shirt name, price and stock.');
        return;
      }

      fetch(`${API_BASE_URL}/shirts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newShirt)
      })
        .then(res => res.json())
        .then(data => {
          if (data.id) {
            alert('Shirt created successfully.');
            $('#createShirtForm')[0].reset();
            loadAdminShirts();
          } else {
            alert(data.error || 'Failed to create shirt.');
          }
        })
        .catch(() => alert('Network or server error while creating shirt.'));
    });

    // Logout handled above by #adminLogoutBtn click
  }

  // Load shirts for admin with edit & delete buttons
  function loadAdminShirts() {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/shirts`)
      .then(res => res.json())
      .then(shirts => {
        if (!Array.isArray(shirts)) {
          $('#shirtsAdminList').html('<p>Failed to load shirts.</p>');
          return;
        }

        let html = '';
        shirts.forEach(shirt => {
          html += `
            <div class="list-group-item mb-3">
              <h5>${shirt.name}</h5>
              <p>${shirt.description || ''}</p>
              <p><strong>Price:</strong> $${shirt.price}</p>
              <p><strong>Stock:</strong> ${shirt.stock}</p>
              <button class="btn btn-sm btn-primary me-2 editShirtBtn" data-id="${shirt.id}">Edit</button>
              <button class="btn btn-sm btn-danger deleteShirtBtn" data-id="${shirt.id}">Delete</button>
            </div>
          `;
        });

        $('#shirtsAdminList').html(html);

        // Bind edit buttons
        $('.editShirtBtn').click(function() {
          const id = $(this).data('id');
          editShirt(id);
        });

        // Bind delete buttons
        $('.deleteShirtBtn').click(function() {
          const id = $(this).data('id');
          if (confirm('Are you sure you want to delete this shirt?')) {
            deleteShirt(id);
          }
        });
      })
      .catch(() => {
        $('#shirtsAdminList').html('<p>Network or server error loading shirts.</p>');
      });
  }

  // Edit shirt: display prompt inputs and update
  function editShirt(id) {
    const token = localStorage.getItem('token');

    // Fetch shirt details
    fetch(`${API_BASE_URL}/shirts/${id}`)
      .then(res => res.json())
      .then(shirt => {
        if (!shirt.id) {
          alert('Failed to fetch shirt details.');
          return;
        }

        // Prompt user for updated details
        const name = prompt('Enter shirt name:', shirt.name);
        if (name === null) return; // Cancelled

        const description = prompt('Enter description:', shirt.description || '') || '';
        const priceRaw = prompt('Enter price:', shirt.price);
        if (priceRaw === null) return;
        const price = parseFloat(priceRaw);

        const stockRaw = prompt('Enter stock:', shirt.stock);
        if (stockRaw === null) return;
        const stock = parseInt(stockRaw, 10);

        if (!name || isNaN(price) || isNaN(stock)) {
          alert('Invalid input.');
          return;
        }

        // Send update request
        fetch(`${API_BASE_URL}/shirts/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name, description, price, stock })
        })
          .then(res => res.json())
          .then(data => {
            if (data.id) {
              alert('Shirt updated successfully.');
              loadAdminShirts();
            } else {
              alert(data.error || 'Failed to update shirt.');
            }
          })
          .catch(() => alert('Network or server error while updating shirt.'));
      })
      .catch(() => alert('Network or server error fetching shirt.'));
  }

  // Delete shirt function
  function deleteShirt(id) {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/shirts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          alert('Shirt deleted.');
          loadAdminShirts();
        } else {
          alert(data.error || 'Failed to delete shirt.');
        }
      })
      .catch(() => alert('Network or server error deleting shirt.'));
  }

  // On page load, load user info if token exists (for index.html)
  if ($('#userInfo').length) {
    loadUserInfo();
  }

});
