const crypto = require('crypto');

const OCTO_CONFIG = {
  shop_id: 43006,
  secret: 'eb315898-9da4-4035-ac0f-c7c69ca5cfcd',
  apiUrl: 'https://secure.octo.uz/prepare_payment',
  checkUrl: 'https://secure.octo.uz/check_status'
};

// Pending payments tracker
const pendingPayments = new Map();

/**
 * Initiates payment with Octo Payment Service
 * Supports: Uzcard, Humo, Click, Payme, Visa, Mastercard
 */
async function prepareOctoPayment({
  amount,
  username,
  message,
  creator = 'trolluz',
  returnUrl,
  notifyUrl,
  isTest = (process.env.OCTO_TEST_MODE !== 'false')
}) {
  const transactionId = 'donat_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const numAmount = Number(amount) || 15000;
  const donorName = (username || 'Aziz obunachi').trim();
  const donorMsg = (message || "Ijodingizga ulkan omad!").trim();

  const payload = {
    octo_shop_id: OCTO_CONFIG.shop_id,
    octo_secret: OCTO_CONFIG.secret,
    shop_transaction_id: transactionId,
    auto_capture: true,
    test: isTest,
    init_time: nowStr,
    user_data: {
      user_id: donorName,
      phone: '998900000000',
      email: 'donor@donat.uz'
    },
    total_sum: numAmount,
    currency: 'UZS',
    description: `DonatUZ: ${donorName} -> ${creator} (${numAmount.toLocaleString('uz-UZ')} so'm)`,
    return_url: returnUrl || `http://localhost:3000/${creator}?status=success&trx=${transactionId}&amount=${numAmount}&donor=${encodeURIComponent(donorName)}&msg=${encodeURIComponent(donorMsg)}`,
    notify_url: notifyUrl || 'http://localhost:3000/api/payments/octo/notify',
    language: 'uz'
  };

  let isTestMode = isTest;
  let response = await fetch(OCTO_CONFIG.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  let data = await response.json();

  // Agar do'kon hali yangi ("new") bo'lsa, 1.1s kutib test rejimiga o'tkazish
  if (data.error !== 0 && !isTestMode && ((data.errMessage || '').includes('new') || (data.errorMessage || '').includes('new'))) {
    console.log('[Octo] Do\'kon holati "new", 1 soniya kutib test rejimiga o\'tkazilmoqda...');
    await new Promise(r => setTimeout(r, 1100));
    payload.test = true;
    isTestMode = true;
    response = await fetch(OCTO_CONFIG.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    data = await response.json();
  }

  if (data.error === 0 && data.data && data.data.octo_pay_url) {
    const record = {
      transactionId,
      octoUUID: data.data.octo_payment_UUID,
      amount: numAmount,
      username: donorName,
      message: donorMsg,
      creator,
      status: 'created',
      isTest: isTestMode,
      payUrl: data.data.octo_pay_url,
      createdAt: new Date().toISOString()
    };
    pendingPayments.set(transactionId, record);

    return {
      success: true,
      transactionId,
      octoUUID: data.data.octo_payment_UUID,
      payUrl: data.data.octo_pay_url,
      isTest: isTestMode,
      record
    };
  } else {
    const errMsg = data.errMessage || data.errorMessage || 'Octo to\'lovini tayyorlashda xatolik';
    console.error('Octo prepare_payment error:', data);
    throw new Error(errMsg);
  }
}

function getPendingPayment(transactionId) {
  return pendingPayments.get(transactionId);
}

function markPaymentSuccess(transactionId) {
  const item = pendingPayments.get(transactionId);
  if (item) {
    item.status = 'succeeded';
    item.paidAt = new Date().toISOString();
  }
  return item;
}

module.exports = {
  OCTO_CONFIG,
  prepareOctoPayment,
  getPendingPayment,
  markPaymentSuccess
};
