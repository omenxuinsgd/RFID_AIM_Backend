const qrcode = require('qrcode');

class PaymentService {
    static async generatePaymentQR(amount, reference) {
        const paymentUrl = `https://example.com/pay?amount=${amount}&ref=${reference}`;
        const qrCode = await qrcode.toDataURL(paymentUrl); // Generate QR Code sebagai base64
        return qrCode;
    }
}

module.exports = PaymentService;