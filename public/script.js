// Particle Background Implementation
function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.color = `rgba(241, 196, 15, ${Math.random() * 0.5})`;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 100; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

initParticles();

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');

function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}

// Register Handler
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const full_name = document.getElementById('full_name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const dob = document.getElementById('dob').value;
        const fathers_name = document.getElementById('fathers_name').value;
        const password = document.getElementById('password').value;
        const user_type = document.getElementById('user_type').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name, email, phone, dob, fathers_name, password, user_type })
            });
            const data = await response.json();
            if (response.ok) {
                showMessage(data.message + ' Redirecting...', 'success');
                setTimeout(() => window.location.href = 'login.html', 1500);
            } else {
                showMessage(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            showMessage('Network error.', 'error');
        }
    });
}

// Login Handler
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'index.html';
            } else {
                showMessage(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            showMessage('Network error.', 'error');
        }
    });
}

// Dashboard Initializer
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!token || !user) {
        window.location.href = 'login.html';
    } else {
        const userNameElem = document.getElementById('userName');
        if (userNameElem) {
            userNameElem.textContent = user.full_name;
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userType').textContent = user.user_type;
            loadRentalItems();
        }
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}

async function loadRentalItems() {
    const grid = document.getElementById('rentalsGrid');
    try {
        const response = await fetch('/api/rentals');
        const items = await response.json();
        
        // Fetch user bookings to show status
        const user = JSON.parse(localStorage.getItem('user'));
        const bRes = await fetch(`/api/bookings/${user.id}`);
        const userBookings = await bRes.json();
        const bookedIds = userBookings.map(b => b.item_id);

        grid.innerHTML = items.map(item => `
            <div class="rental-card" style="position: relative;">
                ${bookedIds.includes(item.id) ? '<span class="booking-badge">Booked</span>' : ''}
                <div style="font-size: 3.5rem; margin-bottom: 1rem;">${item.image_url}</div>
                <h3 style="margin:0; color: var(--secondary-color);">${item.name}</h3>
                <p style="margin: 0.5rem 0; font-size: 0.8rem; color: #666;">${item.type}</p>
                <div class="price" style="color: var(--accent-color);">$${item.price_per_day}/day</div>
                <button class="btn" style="padding: 0.6rem; margin-top: 1.2rem; font-size: 0.85rem; width: 100%; border-radius: 8px;" 
                        onclick="handleRent(${item.id}, '${item.name}')" 
                        ${bookedIds.includes(item.id) ? 'disabled style="background: #ccc; box-shadow: none;"' : ''}>
                    ${bookedIds.includes(item.id) ? 'Reserved' : 'Rent Now'}
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

async function handleRent(itemId, itemName) {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, item_id: itemId })
        });
        if (response.ok) {
            alert(`Success! You have rented the ${itemName}. Check your dashboard for updates.`);
            loadRentalItems(); // Refresh
        }
    } catch (error) {
        alert('Booking failed. Please try again.');
    }
}

