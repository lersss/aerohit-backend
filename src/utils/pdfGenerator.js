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

      doc.fontSize(20).text('Р—Р°РєР°Р· в„–' + order.id, { align: 'center' });
      doc.moveDown();

      doc.fontSize(12);
      doc.text(РљР»РёРµРЅС‚: );
      doc.text(РўРµР»РµС„РѕРЅ: );
      doc.text(Email: );
      if (order.comment) doc.text(РљРѕРјРјРµРЅС‚Р°СЂРёР№: );
      doc.moveDown();
      doc.text(Р”Р°С‚Р°: );
      doc.moveDown();

      const tableTop = doc.y + 20;
      let position = tableTop;

      doc.font('Helvetica-Bold');
      doc.text('РњРѕРґРµР»СЊ', 50, position);
      doc.text('РњРѕС‰РЅРѕСЃС‚СЊ', 200, position);
      doc.text('РљРѕР»-РІРѕ', 350, position);
      doc.text('Р¦РµРЅР° Р·Р° С€С‚.', 420, position);
      doc.text('РЎСѓРјРјР°', 500, position);
      doc.moveDown();
      position += 30;

      doc.font('Helvetica');
      for (const item of order.items) {
        const product = item.product;
        const rowY = position;
        doc.text(product.model, 50, rowY);
        doc.text(product.power, 200, rowY);
        doc.text(item.quantity.toString(), 350, rowY);
        doc.text(item.price.toFixed(2) + ' в‚Ѕ', 420, rowY);
        doc.text((item.price * item.quantity).toFixed(2) + ' в‚Ѕ', 500, rowY);
        position += 25;
      }

      position += 20;
      doc.font('Helvetica-Bold');
      doc.text(РС‚РѕРіРѕ:  в‚Ѕ, 500, position, { align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export default generatePDF;
