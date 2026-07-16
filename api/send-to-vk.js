// api/send-to-vk.js
export default async function handler(req, res) {
  // Принимаем только POST-запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Метод не поддерживается' });
  }

  try {
    // Данные, отправленные формой
    const { name, phone, contact_method, email, tariff } = req.body;

    // Формируем текст сообщения
    const messageText = `
🟢 Новая заявка с сайта Verve

👤 Имя: ${name}
📞 Телефон: ${phone}
📬 Способ связи: ${contact_method === 'email' ? 'Почта' : contact_method === 'max' ? 'MAX' : 'Telegram'}
${contact_method === 'email' ? `📧 Email: ${email}` : ''}
📋 Тариф: ${tariff}
    `.trim();

    // ID администратора, которому придёт сообщение (узнайте его ниже)
    const adminUserId = 123456789; // ← ЗАМЕНИТЕ на свой ID ВКонтакте!

    // Отправляем запрос к VK API
    const vkResponse = await fetch('https://api.vk.com/method/messages.send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        access_token: process.env.VK_ACCESS_TOKEN, // БЕРЁМ ТОКЕН ИЗ ПЕРЕМЕННОЙ ОКРУЖЕНИЯ
        v: '5.199',
        user_id: adminUserId,
        message: messageText,
        random_id: Math.floor(Math.random() * 100000000)
      })
    });

    const vkData = await vkResponse.json();

    if (vkData.error) {
      console.error('Ошибка VK API:', vkData.error);
      return res.status(500).json({ success: false, error: 'Не удалось отправить сообщение в VK' });
    }

    // Всё хорошо
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Ошибка сервера:', error);
    return res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
}
