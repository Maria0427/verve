export default async function handler(req, res) {
    // CORS заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Метод не поддерживается' });
    }

    try {
        const { name, phone, contact_method, email, tariff } = req.body;

        // Валидация
        if (!name || !phone || !contact_method || !tariff) {
            return res.status(400).json({ 
                success: false, 
                error: 'Заполните все обязательные поля' 
            });
        }

        // Формируем сообщение
        let message = `📋 Новая заявка с сайта Verve\n\n`;
        message += `👤 Имя: ${name}\n`;
        message += `📱 Телефон: ${phone}\n`;
        message += `📨 Способ связи: ${contact_method}\n`;
        if (contact_method === 'email' && email) {
            message += `📧 Email: ${email}\n`;
        }
        message += `💎 Тариф: ${tariff}\n`;
        message += `🕐 Дата: ${new Date().toLocaleString('ru-RU')}\n`;
        message += `🌐 Источник: Сайт Verve`;

        const VK_USER_ID = '312306507';

        // Отправка в VK API
        const response = await fetch('https://api.vk.com/method/messages.send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                user_id: VK_USER_ID,
                message: message,
                random_id: Math.floor(Math.random() * 2147483647),
                // ⚠️ ВАЖНО! Токен берется из переменных окружения, а не из кода
                access_token: process.env.VK_ACCESS_TOKEN, 
                v: '5.131'
            })
        });

        const result = await response.json();

        if (result.response) {
            return res.status(200).json({ success: true });
        } else {
            // Логируем полный ответ VK в консоль сервера Vercel
            console.error('VK API Full Response:', JSON.stringify(result));
            
            // Универсальное извлечение текста ошибки
            let errorMsg = 'Ошибка отправки в VK';
            if (result.error && typeof result.error === 'object' && result.error.error_msg) {
                errorMsg = result.error.error_msg;
            } else if (result.error && typeof result.error === 'string') {
                errorMsg = result.error;
            }
            
            return res.status(500).json({ 
                success: false, 
                error: errorMsg
            });
        }
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Внутренняя ошибка сервера: ' + error.message 
        });
    }
}
