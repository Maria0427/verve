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

        // Отправка в VK API
        const response = await fetch('https://api.vk.com/method/messages.send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                user_id: 'ВАШ_ID_ВК',      // ваш числовой ID
                message: message,
                random_id: Math.floor(Math.random() * 2147483647),
                access_token: 'vk1.a.-36omM8FL7-Q5qA2uT41kwlLDA-L02MlU7EUS4QZt17pNguK5FEILvLi6nYWiyphUsnnkRWsMdmUxHKtJS6A9B8ci1LMVuCDKCHXEfSxB642rPGM0UYd8AWqJfUQVh1FuS8cnLaPRNF_qo3CpPMw98BKbIRKE2XXV8LtvQC7uyXl8vWHxjJ5MUn1wHtKvBoMG2AdK3dL-NBajhgD5d7Zwg',  // токен сообщества
                v: '5.131'
            })
        });

        const result = await response.json();

        if (result.response) {
            return res.status(200).json({ success: true });
        } else {
            console.error('VK API Error:', result);
            return res.status(500).json({ 
                success: false, 
                error: 'Ошибка отправки в VK' 
            });
        }
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Внутренняя ошибка сервера' 
        });
    }
}
