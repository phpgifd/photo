(function() {
    // Удаляем инициализацию EmailJS, так как теперь используем Telegram
})();

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация...');
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

    const loginForm = document.getElementById('login-form');
    const adminPanel = document.getElementById('admin-panel');
    if (!loginForm || !adminPanel) {
        console.error('Элементы login-form или admin-panel не найдены в DOM');
        alert('Ошибка: Проверьте структуру HTML.');
        return;
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
    console.log('Попытка входа в админ-панель...');
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
    console.log('Запуск функции addSession...');
    const name = document.getElementById('session-name').value;
    const password = document.getElementById('session-password').value;
    const files = document.getElementById('session-files').files;
    
    if (!name || !password || files.length === 0) {
        console.error('Ошибка: не все поля заполнены или не выбраны файлы');
        alert('Заполните все поля и выберите файлы');
        return;
    }

    try {
        const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
        console.log(`Текущее количество сессий: ${sessions.length}`);
        const readerPromises = Array.from(files).map(file => {
            return new Promise((resolve, reject) => {
                console.log(`Чтение файла: ${file.name}`);
                const reader = new FileReader();
                reader.onload = () => {
                    console.log(`Файл ${file.name} успешно прочитан`);
                    resolve({ name: file.name, data: reader.result });
                };
                reader.onerror = () => {
                    console.error(`Ошибка чтения файла ${file.name}`);
                    reject(new Error(`Ошибка чтения файла ${file.name}`));
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readerPromises)
            .then(images => {
                console.log(`Все изображения прочитаны, добавляем сессию...`);
                const newSession = {
                    id: sessions.length + 1,
                    name,
                    password,
                    photos: images
                };
                sessions.push(newSession);
                try {
                    // Проверка объёма localStorage перед сохранением
                    const totalSize = new Blob([localStorage.getItem('sessions') || '[]']).size + JSON.stringify(sessions).length;
                    if (totalSize > 5 * 1024 * 1024) { // 5MB лимит
                        console.error('Превышен лимит localStorage');
                        alert('Ошибка: Превышен лимит хранения. Удалите старые данные или уменьшите количество/размер изображений.');
                        return;
                    }
                    localStorage.setItem('sessions', JSON.stringify(sessions));
                    console.log('Сессия сохранена в localStorage');
                    loadSessions();
                    alert(`Фотосессия "${name}" добавлена! Название и пароль отправьте клиенту.`);
                    document.getElementById('session-name').value = '';
                    document.getElementById('session-password').value = '';
                    document.getElementById('session-files').value = '';
                } catch (e) {
                    console.error('Ошибка сохранения в localStorage:', e);
                    alert('Ошибка сохранения фотосессии. Возможно, localStorage переполнен.');
                }
            })
            .catch(error => {
                console.error('Ошибка обработки изображений:', error);
                alert('Ошибка при обработке изображений. Проверьте консоль для деталей.');
            });
    } catch (e) {
        console.error('Общая ошибка в функции addSession:', e);
        alert('Произошла ошибка. Проверьте консоль для деталей.');
    }
}

function deleteSession() {
    console.log('Запуск функции deleteSession...');
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
    console.log('Запуск функции accessSession...');
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
            img.src = photo.data;
            img.alt = photo.name;
            img.onerror = () => {
                console.error(`Ошибка отображения изображения: ${photo.name}`);
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
    console.log('Запуск функции addReview...');
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
    console.log('Запуск функции deleteReview...');
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
    console.log('Запуск функции addPortfolioPhoto...');
    const photo = document.getElementById('portfolio-photo').files[0];
    if (!photo) {
        console.error('Ошибка: файл не выбран');
        alert('Выберите фото');
        return;
    }

    try {
        const photos = JSON.parse(localStorage.getItem('portfolioPhotos') || '[]');
        console.log(`Текущее количество фото в портфолио: ${photos.length}`);
        const reader = new FileReader();
        reader.onload = () => {
            console.log(`Файл ${photo.name} успешно прочитан`);
            const photoId = photos.length + 1;
            photos.push({ id: photoId, name: photo.name, data: reader.result });
            try {
                // Проверка объёма localStorage перед сохранением
                const totalSize = new Blob([localStorage.getItem('portfolioPhotos') || '[]']).size + JSON.stringify(photos).length;
                if (totalSize > 5 * 1024 * 1024) { // 5MB лимит
                    console.error('Превышен лимит localStorage');
                    alert('Ошибка: Превышен лимит хранения. Удалите старые данные или уменьшите количество/размер изображений.');
                    return;
                }
                localStorage.setItem('portfolioPhotos', JSON.stringify(photos));
                console.log('Фото сохранено в localStorage');
                loadPortfolioPhotos();
                alert('Фото добавлено!');
                document.getElementById('portfolio-photo').value = '';
            } catch (e) {
                console.error('Ошибка сохранения в localStorage:', e);
                alert('Ошибка сохранения фото. Возможно, localStorage переполнен.');
            }
        };
        reader.onerror = () => {
            console.error(`Ошибка чтения файла ${photo.name}`);
            alert('Ошибка чтения файла. Проверьте консоль для деталей.');
        };
        reader.readAsDataURL(photo);
    } catch (e) {
        console.error('Общая ошибка в функции addPortfolioPhoto:', e);
        alert('Произошла ошибка. Проверьте консоль для деталей.');
    }
}

function deletePortfolioPhoto() {
    console.log('Запуск функции deletePortfolioPhoto...');
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
    console.log('Запуск функции updateHomeText...');
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
    console.log('Запуск функции updateAboutText...');
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
    console.log('Запуск функции updateContactText...');
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
    console.log('Запуск функции updateSocialLinks...');
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
    console.log('Запуск функции updateDesign...');
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
    console.log('Запуск функции addAdmin...');
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
    console.log('Запуск функции deleteAdmin...');
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
    console.log('Запуск функции saveContactRequest...');
    const requests = JSON.parse(localStorage.getItem('contactRequests') || '[]');
    requests.push(formData);
    localStorage.setItem('contactRequests', JSON.stringify(requests));
    loadContactRequests();
}

function deleteContactRequest() {
    console.log('Запуск функции deleteContactRequest...');
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
    console.log('Запуск функции loadReviews...');
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
    console.log('Запуск функции loadContactRequests...');
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
    console.log('Запуск функции loadPortfolioPhotos...');
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
            img.src = photo.data;
            img.alt = `Photo ${photo.id}`;
            img.onerror = () => {
                console.error(`Ошибка отображения изображения: ${photo.name}`);
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
    console.log('Запуск функции loadHomeText...');
    const homeTextDiv = document.getElementById('home-text');
    if (homeTextDiv) {
        const text = localStorage.getItem('homeText') || `<p>Создаю воспоминания через объектив</p>`;
        homeTextDiv.innerHTML = text;
    }
}

function loadAboutText() {
    console.log('Запуск функции loadAboutText...');
    const aboutTextDiv = document.getElementById('about-text');
    if (aboutTextDiv) {
        const text = localStorage.getItem('aboutText') || `<p>Привет! Я Mishgun Photo, профессиональный фотограф. Специализируюсь на портретной, семейной и свадебной фотографии. Моя цель — запечатлеть ваши эмоции и создать воспоминания, которые останутся с вами навсегда.</p><p>Я использую современное оборудование и индивидуальный подход к каждому клиенту. Свяжитесь со мной, чтобы обсудить вашу фотосессию!</p>`;
        aboutTextDiv.innerHTML = text;
    }
}

function loadContactText() {
    console.log('Запуск функции loadContactText...');
    const contactTextDiv = document.getElementById('contact-text');
    if (contactTextDiv) {
        const text = localStorage.getItem('contactText') || '';
        contactTextDiv.innerHTML = text;
    }
}

function loadSocialLinks() {
    console.log('Запуск функции loadSocialLinks...');
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
    console.log('Запуск функции loadAdmins...');
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
    console.log('Запуск функции loadSessions...');
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
    console.log('Запуск функции applyDesign...');
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
    console.log('Запуск функции loadAll...');
    loadReviews();
    loadContactRequests();
    loadPortfolioPhotos();
    loadSessions();
    loadAdmins();
}

// Инициализация админов
if (!localStorage.getItem('admins')) {
    console.log('Инициализация админов...');
    localStorage.setItem('admins', JSON.stringify([
        { username: 'mishgunh', password: '123456' },
        { username: 'mishaph', password: '1511misha' }
    ]));
}

// Функция для отправки в Telegram
function sendToTelegram(formData) {
    console.log('Запуск функции sendToTelegram...');
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
