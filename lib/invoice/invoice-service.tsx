import { renderToBuffer } from '@react-pdf/renderer';
import ImageKit from 'imagekit';
import { prisma } from '@/prisma/db';
import { buildInvoiceData } from './invoice-data';
import { InvoicePDFDocument } from './invoice-pdf';

export async function generateAndUploadInvoice(
  order: any, // OrderWithItems
  siteConfig: any | null
): Promise<string | null> {
  try {
    // Idempotency check: if invoice URL already exists, just return it
    if (order.invoiceUrl) {
      return order.invoiceUrl;
    }

    // 1. Build the data
    const invoiceData = buildInvoiceData(order, siteConfig);

    // 2. Generate PDF buffer
    // renderToBuffer takes a React element and returns a Node Buffer
    const pdfBuffer = await renderToBuffer(<InvoicePDFDocument data={invoiceData} />);

    // 3. Initialize ImageKit server SDK
    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
    });

    // 4. Upload to ImageKit
    const fileName = `${invoiceData.invoiceNumber}-${order.id}.pdf`;
    const uploadResponse = await imagekit.upload({
      file: pdfBuffer,
      fileName,
      folder: '/invoices',
      useUniqueFileName: false, // Make it predictable so retries overwrite safely
    });

    const uploadedUrl = uploadResponse.url;

    // 5. Save the URL in the database
    await prisma.order.update({
      where: { id: order.id },
      data: { invoiceUrl: uploadedUrl },
    });

    return uploadedUrl;
  } catch (error) {
    console.error('Failed to generate and upload invoice:', error);
    // Return null so the main flow (like email sending or payment processing) doesn't crash
    return null;
  }
}
