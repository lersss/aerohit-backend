import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

const generatePDF = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = new PassThrough();
      const buffers = [];

      stream.on('data', chunk => buffers.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(buffers)));
      stream.on('error', reject);

      doc.pipe(stream);

      doc.fontSize(20).text(`Заказ №${order.id}`, { align: 'center' });
      doc.moveDown();

      doc.fontSize(12);
      doc.text(`Клиент: ${order.name}`);
      doc.text(`Телефон: ${order.phone}`);
      doc.text(`Email: ${order.email}`);
      if (order.comment) doc.text(`Комментарий: ${order.comment}`);
      doc.moveDown();
      doc.text(`Дата: ${new Date(order.createdAt).toLocaleString()}`);
      doc.moveDown();

      const tableTop = doc.y + 20;
      let position = tableTop;

      doc.font('Helvetica-Bold');
      doc.text('Модель', 50, position);
      doc.text('Мощность', 200, position);
      doc.text('Кол-во', 350, position);
      doc.text('Цена за шт.', 420, position);
      doc.text('Сумма', 500, position);
      doc.moveDown();
      position += 30;

      doc.font('Helvetica');
      for (const item of order.items) {
        const product = item.product;
        const rowY = position;
        doc.text(product.model, 50, rowY);
        doc.text(product.power, 200, rowY);
        doc.text(item.quantity.toString(), 350, rowY);
        doc.text(item.price.toFixed(2) + ' ₽', 420, rowY);
        doc.text((item.price * item.quantity).toFixed(2) + ' ₽', 500, rowY);
        position += 25;
      }

      position += 20;
      doc.font('Helvetica-Bold');
      doc.text(`Итого: ${order.total.toFixed(2)} ₽`, 500, position, { align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export default generatePDF;
