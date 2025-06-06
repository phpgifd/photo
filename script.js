(function() {
    // Удаляем инициализацию EmailJS, так как теперь используем Telegram
})();

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = {
                name: this.name.value,
                email: this.email.value,
                message: this.message.value,
                id: Date.now()
            };
            sendToTelegram(formData);
            this.reset();
        });
    }

    if (document.getElementById('reviews-list') || document.getElementById('review-select')) loadReviews();
    if (document.getElementById('contact-requests') || document.getElementById('request-select')) loadContactRequests();
    if (document.getElementById('portfolio-select') || document.getElementById('portfolio-gallery')) loadPortfolioPhotos();
    if (document.getElementById('about-text')) loadAboutText();
    if (document.getElementById('home-text')) loadHomeText();
    if (document.getElementById('contact-text')) loadContactText();
    if (document.getElementById('social-links')) loadSocialLinks();
    if (document.getElementById('admin-select')) loadAdmins();
    if (document.getElementById('session-select')) loadSessions();
    applyDesign();
});

function loginAdmin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    if (admins.some(a => a.username === username && a.password === password)) {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        alert('Вход успешен!');
        loadAll();
    } else {
        alert('Неверное имя пользователя или пароль');
    }
}

function addSession() {
    const name = document.getElementById('session-name').value;
    const password = document.getElementById('session-password').value;
    const files = document.getElementById('session-files').files;
    if (name && password && files.length > 0) {
        const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
        const newSession = {
            id: sessions.length + 1,
            name,
            password,
            photos: Array.from(files).map(f => f.name)
        };
        sessions.push(newSession);
        localStorage.setItem('sessions', JSON.stringify(sessions));
        loadSessions();
        alert(`Фотосессия "${name}" добавлена! Название и пароль отправьте клиенту.`);
        document.getElementById('session-name').value = '';
        document.getElementById('session-password').value = '';
        document.getElementById('session-files').value = '';
    } else {
        alert('Заполните все поля и выберите файлы');
    }
}

function deleteSession() {
    const select = document.getElementById('session-select');
    const sessionId = select.value;
    if (sessionId) {
        let sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
        sessions = sessions.filter(s => s.id != sessionId);
        localStorage.setItem('sessions', JSON.stringify(sessions));
        loadSessions();
        alert('Фотосессия удалена!');
    } else {
        alert('Выберите фотосессию');
    }
}

function accessSession() {
    const name = document.getElementById('session-name-input').value;
    const password = document.getElementById('session-pass-input').value;
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    const session = sessions.find(s => s.name === name && s.password === password);
    if (session) {
        document.getElementById('session-access').style.display = 'none';
        const gallery = document.getElementById('session-gallery');
        gallery.style.display = 'grid';
        gallery.innerHTML = '';
        session.photos.forEach(photo => {
            const img = document.createElement('img');
            img.src = `images/${photo}`;
            img.alt = photo;
            img.onload = () => console.log(`Изображение загружено: images/${photo}`);
            img.onerror = () => {
                console.error(`Ошибка загрузки изображения: images/${photo}`);
                img.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
                img.style.border = '2px solid red';
            };
            gallery.appendChild(img);
        });
    } else {
        alert('Неверное название или пароль');
    }
}

function addReview() {
    const author = document.getElementById('review-author').value;
    const text = document.getElementById('review-text').value;
    if (author && text) {
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        const reviewId = reviews.length + 1;
        reviews.push({ id: reviewId, author, text });
        localStorage.setItem('reviews', JSON.stringify(reviews));
        loadReviews();
        alert('Отзыв добавлен!');
        document.getElementById('review-author').value = '';
        document.getElementById('review-text').value = '';
    } else {
        alert('Заполните все поля');
    }
}

function deleteReview() {
    const select = document.getElementById('review-select');
    const reviewId = select.value;
    if (reviewId) {
        let reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        reviews = reviews.filter(r => r.id != reviewId);
        localStorage.setItem('reviews', JSON.stringify(reviews));
        loadReviews();
        alert('Отзыв удалён!');
    } else {
        alert('Выберите отзыв');
    }
}

function addPortfolioPhoto() {
    const photo = document.getElementById('portfolio-photo').files[0];
    if (photo) {
        const photos = JSON.parse(localStorage.getItem('portfolioPhotos') || '[]');
        const photoId = photos.length + 1;
        photos.push({ id: photoId, name: photo.name });
        localStorage.setItem('portfolioPhotos', JSON.stringify(photos));
        loadPortfolioPhotos();
        alert('Фото добавлено!');
        document.getElementById('portfolio-photo').value = '';
    } else {
        alert('Выберите фото');
    }
}

function deletePortfolioPhoto() {
    const select = document.getElementById('portfolio-select');
    const photoId = select.value;
    if (photoId) {
        let photos = JSON.parse(localStorage.getItem('portfolioPhotos') || '[]');
        photos = photos.filter(p => p.id != photoId);
        localStorage.setItem('portfolioPhotos', JSON.stringify(photos));
        loadPortfolioPhotos();
        alert('Фото удалено!');
    } else {
        alert('Выберите фото');
    }
}

function updateHomeText() {
    const text = document.getElementById('home-text').value;
    if (text) {
        localStorage.setItem('homeText', text);
        loadHomeText();
        alert('Текст главной обновлён!');
        document.getElementById('home-text').value = '';
    } else {
        alert('Введите текст');
    }
}

function updateAboutText() {
    const text = document.getElementById('about-text-input').value;
    if (text) {
        localStorage.setItem('aboutText', text);
        loadAboutText();
        alert('Текст "Обо мне" обновлён!');
        document.getElementById('about-text-input').value = '';
    } else {
        alert('Введите текст');
    }
}

function updateContactText() {
    const text = document.getElementById('contact-text').value;
    if (text) {
        localStorage.setItem('contactText', text);
        loadContactText();
        alert('Текст контактов обновлён!');
        document.getElementById('contact-text').value = '';
    } else {
        alert('Введите текст');
    }
}

function updateSocialLinks() {
    const instagram = document.getElementById('instagram-url').value;
    const vk = document.getElementById('vk-url').value;
    if (instagram || vk) {
        const socialLinks = { instagram, vk };
        localStorage.setItem('socialLinks', JSON.stringify(socialLinks));
        loadSocialLinks();
        alert('Соцсети обновлены!');
        document.getElementById('instagram-url').value = '';
        document.getElementById('vk-url').value = '';
    } else {
        alert('Введите хотя бы одну ссылку');
    }
}

function updateDesign() {
    const color = document.getElementById('primary-color').value;
    const bgImage = document.getElementById('background-image').value;
    if (color || bgImage) {
        const design = { color: color || '#ff6f61', bgImage: bgImage || 'https://via.placeholder.com/1920x600' };
        localStorage.setItem('design', JSON.stringify(design));
        applyDesign();
        alert('Дизайн обновлён!');
        document.getElementById('background-image').value = '';
    } else {
        alert('Выберите цвет или изображение');
    }
}

function addAdmin() {
    const username = document.getElementById('new-admin-username').value;
    const password = document.getElementById('new-admin-password').value;
    if (username && password) {
        const admins = JSON.parse(localStorage.getItem('admins') || '[]');
        if (!admins.some(a => a.username === username)) {
            admins.push({ username, password });
            localStorage.setItem('admins', JSON.stringify(admins));
            loadAdmins();
            alert('Админ добавлен!');
            document.getElementById('new-admin-username').value = '';
            document.getElementById('new-admin-password').value = '';
        } else {
            alert('Имя пользователя занято');
        }
    } else {
        alert('Заполните все поля');
    }
}

function deleteAdmin() {
    const select = document.getElementById('admin-select');
    const username = select.value;
    if (username) {
        let admins = JSON.parse(localStorage.getItem('admins') || '[]');
        admins = admins.filter(a => a.username !== username);
        localStorage.setItem('admins', JSON.stringify(admins));
        loadAdmins();
        alert('Админ удалён!');
    } else {
        alert('Выберите админа');
    }
}

function saveContactRequest(formData) {
    const requests = JSON.parse(localStorage.getItem('contactRequests') || '[]');
    requests.push(formData);
    localStorage.setItem('contactRequests', JSON.stringify(requests));
    loadContactRequests();
}

function deleteContactRequest() {
    const select = document.getElementById('request-select');
    const requestId = select.value;
    if (requestId) {
        let requests = JSON.parse(localStorage.getItem('contactRequests') || '[]');
        requests = requests.filter(r => r.id != requestId);
        localStorage.setItem('contactRequests', JSON.stringify(requests));
        loadContactRequests();
        alert('Заявка удалена!');
    } else {
        alert('Выберите заявку');
    }
}

function loadReviews() {
    const reviewsList = document.getElementById('reviews-list');
    const reviewSelect = document.getElementById('review-select');
    if (reviewsList) {
        reviewsList.innerHTML = '';
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        reviews.forEach(review => {
            const blockquote = document.createElement('blockquote');
            blockquote.setAttribute('data-id', review.id);
            blockquote.innerHTML = `"${review.text}"<br>— ${review.author}`;
            reviewsList.appendChild(blockquote);
        });
    }
    if (reviewSelect) {
        reviewSelect.innerHTML = '<option value="">Select review</option>';
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        reviews.forEach(review => {
            const option = document.createElement('option');
            option.value = review.id;
            option.textContent = `${review.author}: ${review.text.substring(0, 20)}...`;
            reviewSelect.appendChild(option);
        });
    }
}

function loadContactRequests() {
    const requestsDiv = document.getElementById('contact-requests');
    const requestSelect = document.getElementById('request-select');
    if (requestsDiv) {
        requestsDiv.innerHTML = '';
        const requests = JSON.parse(localStorage.getItem('contactRequests') || '[]');
        requests.forEach(req => {
            const div = document.createElement('div');
            div.setAttribute('data-id', req.id);
            div.innerHTML = `<strong>${req.name}</strong> (${req.email}): ${req.message}`;
            requestsDiv.appendChild(div);
        });
    }
    if (requestSelect) {
        requestSelect.innerHTML = '<option value="">Select request</option>';
        const requests = JSON.parse(localStorage.getItem('contactRequests') || '[]');
        requests.forEach(req => {
            const option = document.createElement('option');
            option.value = req.id;
            option.textContent = `${req.name}: ${req.message.substring(0, 20)}...`;
            requestSelect.appendChild(option);
        });
    }
}

function loadPortfolioPhotos() {
    const portfolioGallery = document.getElementById('portfolio-gallery');
    const portfolioSelect = document.getElementById('portfolio-select');
    if (portfolioGallery) {
        portfolioGallery.innerHTML = '';
        const photos = JSON.parse(localStorage.getItem('portfolioPhotos') || '[]');
        if (photos.length === 0) {
            console.log('Нет загруженных фото в портфолио');
            portfolioGallery.innerHTML = '<p>Нет фото. Добавьте через админ-панель.</p>';
        }
        photos.forEach(photo => {
            const img = document.createElement('img');
            img.src = `images/${photo.name}`;
            img.alt = `Photo ${photo.id}`;
            img.onload = () => console.log(`Изображение загружено: images/${photo.name}`);
            img.onerror = () => {
                console.error(`Ошибка загрузки изображения: images/${photo.name}`);
                img.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
                img.style.border = '2px solid red';
            };
            portfolioGallery.appendChild(img);
        });
    }
    if (portfolioSelect) {
        portfolioSelect.innerHTML = '<option value="">Select photo</option>';
        const photos = JSON.parse(localStorage.getItem('portfolioPhotos') || '[]');
        photos.forEach(photo => {
            const option = document.createElement('option');
            option.value = photo.id;
            option.textContent = `Photo ${photo.id}: ${photo.name}`;
            portfolioSelect.appendChild(option);
        });
    }
}

function loadHomeText() {
    const homeTextDiv = document.getElementById('home-text');
    if (homeTextDiv) {
        const text = localStorage.getItem('homeText') || `<p>Создаю воспоминания через объектив</p>`;
        homeTextDiv.innerHTML = text;
    }
}

function loadAboutText() {
    const aboutTextDiv = document.getElementById('about-text');
    if (aboutTextDiv) {
        const text = localStorage.getItem('aboutText') || `<p>Привет! Я Mishgun Photo, профессиональный фотограф. Специализируюсь на портретной, семейной и свадебной фотографии. Моя цель — запечатлеть ваши эмоции и создать воспоминания, которые останутся с вами навсегда.</p><p>Я использую современное оборудование и индивидуальный подход к каждому клиенту. Свяжитесь со мной, чтобы обсудить вашу фотосессию!</p>`;
        aboutTextDiv.innerHTML = text;
    }
}

function loadContactText() {
    const contactTextDiv = document.getElementById('contact-text');
    if (contactTextDiv) {
        const text = localStorage.getItem('contactText') || '';
        contactTextDiv.innerHTML = text;
    }
}

function loadSocialLinks() {
    const socialLinksDiv = document.getElementById('social-links');
    if (socialLinksDiv) {
        const links = JSON.parse(localStorage.getItem('socialLinks') || '{}');
        socialLinksDiv.innerHTML = `
            ${links.instagram ? `<a href="${links.instagram}">Instagram</a>` : ''}
            ${links.vk ? `<a href="${links.vk}">VK</a>` : ''}
        `;
    }
}

function loadAdmins() {
    const adminSelect = document.getElementById('admin-select');
    if (adminSelect) {
        adminSelect.innerHTML = '<option value="">Select admin</option>';
        const admins = JSON.parse(localStorage.getItem('admins') || '[]');
        admins.forEach(admin => {
            const option = document.createElement('option');
            option.value = admin.username;
            option.textContent = admin.username;
            adminSelect.appendChild(option);
        });
    }
}

function loadSessions() {
    const sessionSelect = document.getElementById('session-select');
    if (sessionSelect) {
        sessionSelect.innerHTML = '<option value="">Select session</option>';
        const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
        sessions.forEach(session => {
            const option = document.createElement('option');
            option.value = session.id;
            option.textContent = session.name;
            sessionSelect.appendChild(option);
        });
    }
}

function applyDesign() {
    const design = JSON.parse(localStorage.getItem('design') || '{}');
    if (design.color) {
        document.documentElement.style.setProperty('--primary-color', design.color);
        document.querySelectorAll('.cta a, .contact button, #login-form button, .admin-section button, #session-access button').forEach(el => {
            el.style.backgroundColor = design.color;
        });
        document.querySelectorAll('.social a').forEach(el => {
            el.style.color = design.color;
        });
    }
    if (design.bgImage) {
        document.querySelector('header').style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${design.bgImage}')`;
    }
}

function loadAll() {
    loadReviews();
    loadContactRequests();
    loadPortfolioPhotos();
    loadSessions();
    loadAdmins();
}

// Инициализация админов
if (!localStorage.getItem('admins')) {
    localStorage.setItem('admins', JSON.stringify([
        { username: 'mishgunh', password: '123456' },
        { username: 'mishaph', password: '1511misha' }
    ]));
}

// Функция для отправки в Telegram
function sendToTelegram(formData) {
    const botToken = '7823221499:AAFlobI_DkYMsOCI8_gwMO2ATGOgeMuKlCU'; // Ваш токен
    const chatId = '7784884574'; // Ваш Chat ID
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const message = `Новая заявка:\nИмя: ${formData.name}\nEmail: ${formData.email}\nСообщение: ${formData.message}\nID: ${formData.id}\nДата: ${new Date().toLocaleString()}`;
    const params = {
        chat_id: chatId,
        text: message
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            alert('Заявка отправлена в Telegram!');
            saveContactRequest(formData); // Сохраняем в localStorage для админки
        } else {
            alert('Ошибка отправки в Telegram. Проверьте настройки.');
            console.error(data);
        }
    })
    .catch(error => {
        alert('Ошибка сети. Проверьте подключение.');
        console.error(error);
    });
}