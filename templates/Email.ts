// Email template for user when order is placed
export const orderPlacedUser = (orderDetails: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    mrp: number;
    variantName: string;
    sku: string | null;
    hsnCode: string | null;
    discountAmount: number;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    totalAmount: number;
  }>;
  totalAmount: number;
  shippingAddress: string;
  billingAddress?: string;
  gstNumber?: string;
  subtotal: number;
  discount: number;
  taxAmount: number;
  orderDate: string;
  invoiceNumber: string;
  invoiceDate: string;
  businessName?: string | null;
  businessAddress?: string | null;
  businessGstin?: string | null;
  businessPan?: string | null;
  businessCin?: string | null;
  businessPhone?: string | null;
  businessEmail?: string | null;
  cgstRate: number;
  sgstRate: number;
  shippingAddressObj: {
    name: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
    phone: string;
  };
  billingAddressObj?: {
    name: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
    phone: string;
  };
  invoiceUrl?: string | null;
}) => {
  const itemsList = orderDetails.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 12px; vertical-align: top; color: #374151;">
          ${item.name}
          ${item.hsnCode ? `<br><span style="font-size: 10px; font-weight: normal; color: #6b7280;">HSN: ${item.hsnCode}</span>` : ''}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 12px; vertical-align: top; font-weight: bold; color: #111827;">
          ${item.variantName || item.name}<br>
          ${item.sku ? `<span style="font-size: 10px; font-weight: normal; color: #6b7280;">SKU: ${item.sku}</span>` : ''}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center; font-size: 12px; vertical-align: top; color: #374151;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px; vertical-align: top; color: #374151;">${(item.price * item.quantity).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px; vertical-align: top; color: #374151;">${item.discountAmount > 0 ? `-${item.discountAmount.toFixed(2)}` : '0.00'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px; vertical-align: top; color: #374151;">${item.taxableAmount.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px; vertical-align: top; color: #374151;">
          ${item.cgstAmount.toFixed(2)}<br>
          <span style="font-size: 10px; color: #6b7280;">(${orderDetails.cgstRate}%)</span>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px; vertical-align: top; color: #374151;">
          ${item.sgstAmount.toFixed(2)}<br>
          <span style="font-size: 10px; color: #6b7280;">(${orderDetails.sgstRate}%)</span>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px; vertical-align: top; color: #374151;">${item.totalAmount.toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return {
    subject: `Tax Invoice - Order #${orderDetails.orderId}`,
    text: `Tax Invoice for Order #${orderDetails.orderId}

Order Date: ${orderDetails.orderDate}
Invoice Number: ${orderDetails.invoiceNumber}
Invoice Date: ${orderDetails.invoiceDate}

Sold By:
${orderDetails.businessName || "Vishti Store"}
${orderDetails.businessAddress || ""}
${orderDetails.businessGstin ? `GSTIN: ${orderDetails.businessGstin}` : ""}

Bill To:
${orderDetails.billingAddressObj?.name || orderDetails.customerName || ""}
${orderDetails.billingAddressObj?.address || ""}
${orderDetails.billingAddressObj?.city || ""}, ${orderDetails.billingAddressObj?.state || ""} ${orderDetails.billingAddressObj?.pinCode || ""}
Phone: ${orderDetails.billingAddressObj?.phone || ""}
${orderDetails.gstNumber ? `GSTIN: ${orderDetails.gstNumber}` : ""}

Ship To:
${orderDetails.shippingAddressObj.name}
${orderDetails.shippingAddressObj.address}
${orderDetails.shippingAddressObj.city}, ${orderDetails.shippingAddressObj.state} ${orderDetails.shippingAddressObj.pinCode}
Phone: ${orderDetails.shippingAddressObj.phone}

Items:
${orderDetails.items.map((item) => `- ${item.name} (${item.variantName}) ${item.hsnCode ? ` HSN: ${item.hsnCode}` : ""} x ${item.quantity} = ₹${item.totalAmount.toFixed(2)} (Taxable: ₹${item.taxableAmount.toFixed(2)}, CGST: ₹${item.cgstAmount.toFixed(2)}, SGST: ₹${item.sgstAmount.toFixed(2)})`).join("\n")}

Subtotal: ₹${orderDetails.subtotal.toFixed(2)}
Discount: -₹${orderDetails.discount.toFixed(2)}
Total Tax: ₹${orderDetails.taxAmount.toFixed(2)}
Grand Total: ₹${orderDetails.totalAmount.toFixed(2)}
${orderDetails.invoiceUrl ? `\nDownload Invoice: ${orderDetails.invoiceUrl}\n` : ''}
Thank you for shopping with us!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; background-color: #ffffff; color: #111827; padding: 20px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #000;">Tax Invoice</h2>
        </div>

        <!-- Seller Info & Invoice Number -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border-bottom: 1px solid #d1d5db; padding-bottom: 10px;">
          <tr>
            <td style="vertical-align: top; font-size: 13px; line-height: 1.5; color: #374151; width: 60%;">
              <strong>Sold By: ${orderDetails.businessName || "Vishti Store"}</strong><br>
              <span style="font-style: italic; font-size: 11px;">Ship-from Address:</span> ${orderDetails.businessAddress || "Not provided"}<br>
              ${orderDetails.businessGstin ? `<strong>GSTIN - ${orderDetails.businessGstin}</strong>` : ""}
            </td>
            <td style="vertical-align: top; text-align: right; width: 40%;">
              <div style="display: inline-block; border: 1px dashed #9ca3af; padding: 8px 12px; font-size: 13px; font-weight: bold;">
                Invoice Number # ${orderDetails.invoiceNumber}
              </div>
            </td>
          </tr>
        </table>

        <!-- Order & Addresses Info -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="vertical-align: top; width: 33%; font-size: 12px; padding-right: 15px; border-right: 1px solid #e5e7eb;">
              <strong>Order ID:</strong> ${orderDetails.orderId}<br><br>
              <strong>Order Date:</strong> ${orderDetails.orderDate}<br><br>
              <strong>Invoice Date:</strong> ${orderDetails.invoiceDate}<br><br>
              <strong>PAN:</strong> ${orderDetails.businessPan || "N/A"}<br><br>
              <strong>CIN:</strong> ${orderDetails.businessCin || "N/A"}
            </td>
            <td style="vertical-align: top; width: 33%; font-size: 12px; padding: 0 15px; border-right: 1px solid #e5e7eb;">
              <strong>Bill To</strong><br>
              <strong>${orderDetails.billingAddressObj?.name || orderDetails.customerName || ""}</strong><br>
              ${orderDetails.billingAddressObj?.address || ""}<br>
              ${orderDetails.billingAddressObj?.city || ""} ${orderDetails.billingAddressObj?.pinCode || ""} ${orderDetails.billingAddressObj?.state || ""}<br>
              Phone: ${orderDetails.billingAddressObj?.phone || "N/A"}
              ${orderDetails.gstNumber ? `<br><strong>GSTIN:</strong> ${orderDetails.gstNumber}` : ''}
            </td>
            <td style="vertical-align: top; width: 33%; font-size: 12px; padding-left: 15px;">
              <strong>Ship To</strong><br>
              <strong>${orderDetails.shippingAddressObj.name}</strong><br>
              ${orderDetails.shippingAddressObj.address}<br>
              ${orderDetails.shippingAddressObj.city} ${orderDetails.shippingAddressObj.pinCode} ${orderDetails.shippingAddressObj.state}<br>
              Phone: ${orderDetails.shippingAddressObj.phone || "N/A"}
            </td>
          </tr>
        </table>

        <!-- Items Table -->
        <div style="font-size: 12px; margin-bottom: 5px;">Total items: ${orderDetails.items.length}</div>
        <table style="width: 100%; border-collapse: collapse; border-top: 1px solid #d1d5db; border-bottom: 1px solid #d1d5db; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="padding: 10px 8px; text-align: left; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">Product</th>
              <th style="padding: 10px 8px; text-align: left; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">Title</th>
              <th style="padding: 10px 8px; text-align: center; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">Qty</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">Gross Amount ₹</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">Discount ₹</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">Taxable Value ₹</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">CGST ₹</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">SGST/UTGST ₹</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">Total ₹</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px;">Total</td>
              <td style="padding: 10px 8px; text-align: center; font-weight: bold; font-size: 13px;">${orderDetails.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px;">${orderDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px;">${orderDetails.items.reduce((sum, item) => sum + item.discountAmount, 0) > 0 ? `-${orderDetails.items.reduce((sum, item) => sum + item.discountAmount, 0).toFixed(2)}` : '0.00'}</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px;">${orderDetails.items.reduce((sum, item) => sum + item.taxableAmount, 0).toFixed(2)}</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px;">${orderDetails.items.reduce((sum, item) => sum + item.cgstAmount, 0).toFixed(2)}</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px;">${orderDetails.items.reduce((sum, item) => sum + item.sgstAmount, 0).toFixed(2)}</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px;">${orderDetails.items.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Grand Total -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
          <tr>
            <td style="text-align: right; font-size: 18px; color: #111827;">
              Grand Total <strong style="margin-left: 30px;">₹ ${orderDetails.items.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}</strong>
            </td>
          </tr>
        </table>
        
        ${orderDetails.invoiceUrl ? `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${orderDetails.invoiceUrl}" target="_blank" rel="noopener noreferrer"
             style="background-color: #000000; color: #ffffff; padding: 12px 24px;
                    text-decoration: none; display: inline-block; font-weight: 500;
                    font-size: 14px;">
            Download Invoice PDF
          </a>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="text-align: right; font-size: 14px; color: #374151; margin-top: 20px;">
          ${orderDetails.businessName || "Vishti Store"}
        </div>
      </div>
    `,
  };
};

// Email template for admin when new order is placed
export const orderPlacedAdmin = (orderDetails: Parameters<typeof orderPlacedUser>[0] & {
  customerPhone: string;
  paymentMethod: string;
}) => {
  const itemsList = orderDetails.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 12px; vertical-align: top; color: #374151;">
          ${item.name}
          ${item.hsnCode ? `<br><span style="font-size: 10px; font-weight: normal; color: #6b7280;">HSN: ${item.hsnCode}</span>` : ''}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 12px; vertical-align: top; font-weight: bold; color: #111827;">
          ${item.variantName || item.name}<br>
          ${item.sku ? `<span style="font-size: 10px; font-weight: normal; color: #6b7280;">SKU: ${item.sku}</span>` : ''}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center; font-size: 12px; vertical-align: top; color: #374151;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px; vertical-align: top; color: #374151;">${(item.price * item.quantity).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px; vertical-align: top; color: #374151;">${item.discountAmount > 0 ? `-${item.discountAmount.toFixed(2)}` : '0.00'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px; vertical-align: top; color: #374151;">${item.taxableAmount.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px; vertical-align: top; color: #374151;">
          ${item.cgstAmount.toFixed(2)}<br>
          <span style="font-size: 10px; color: #6b7280;">(${orderDetails.cgstRate}%)</span>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px; vertical-align: top; color: #374151;">
          ${item.sgstAmount.toFixed(2)}<br>
          <span style="font-size: 10px; color: #6b7280;">(${orderDetails.sgstRate}%)</span>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 12px; vertical-align: top; color: #374151;">${item.totalAmount.toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return {
    subject: `New Order Received - Order #${orderDetails.orderId}`,
    text: `New Order Alert!

Order ID: ${orderDetails.orderId}
Order Date: ${orderDetails.orderDate}

Customer Information:
Name: ${orderDetails.customerName || "Not provided"}
Email: ${orderDetails.customerEmail || "Not provided"}
Phone: ${orderDetails.customerPhone || "Not provided"}
Payment Method: ${orderDetails.paymentMethod}
${orderDetails.gstNumber ? `Customer GSTIN: ${orderDetails.gstNumber}` : ""}

Order Items:
${orderDetails.items.map((item) => `- ${item.name} (${item.variantName}) ${item.hsnCode ? ` HSN: ${item.hsnCode}` : ""} x ${item.quantity} = ₹${item.totalAmount.toFixed(2)}`).join("\n")}

Subtotal: ₹${orderDetails.subtotal.toFixed(2)}
Discount: -₹${orderDetails.discount.toFixed(2)}
Total Tax: ₹${orderDetails.taxAmount.toFixed(2)}
Total Amount: ₹${orderDetails.items.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}

Please process this order promptly.
Vishti Store Admin System`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; background-color: #ffffff; color: #111827; padding: 20px;">
        
        <!-- Header -->
        <div style="background-color: #000000; padding: 20px; border-bottom: 1px solid #e5e7eb; margin-bottom: 20px;">
          <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 20px; font-weight: 500; letter-spacing: 1px;">Vishti Store Admin</h1>
          <p style="color: #9ca3af; margin: 0; font-size: 13px;">New Order Alert: #${orderDetails.orderId}</p>
        </div>

        <!-- Customer & Order Info -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="vertical-align: top; width: 33%; font-size: 13px; padding-right: 15px; border-right: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 10px 0; font-size: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Order Details</h3>
              <strong>Order Date:</strong> ${orderDetails.orderDate}<br><br>
              <strong>Payment:</strong> ${orderDetails.paymentMethod}<br><br>
              <strong>Invoice:</strong> ${orderDetails.invoiceNumber}
            </td>
            <td style="vertical-align: top; width: 33%; font-size: 13px; padding: 0 15px; border-right: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 10px 0; font-size: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Customer / Bill To</h3>
              <strong>${orderDetails.billingAddressObj?.name || orderDetails.customerName || "N/A"}</strong><br>
              ${orderDetails.customerEmail ? `<a href="mailto:${orderDetails.customerEmail}" style="color: #2563eb; text-decoration: none;">${orderDetails.customerEmail}</a><br>` : ''}
              ${orderDetails.customerPhone ? `<a href="tel:${orderDetails.customerPhone}" style="color: #2563eb; text-decoration: none;">${orderDetails.customerPhone}</a><br><br>` : '<br>'}
              ${orderDetails.billingAddressObj?.address || ""}<br>
              ${orderDetails.billingAddressObj?.city || ""} ${orderDetails.billingAddressObj?.pinCode || ""} ${orderDetails.billingAddressObj?.state || ""}
              ${orderDetails.gstNumber ? `<br><strong>GSTIN:</strong> ${orderDetails.gstNumber}` : ''}
            </td>
            <td style="vertical-align: top; width: 33%; font-size: 13px; padding-left: 15px;">
              <h3 style="margin: 0 0 10px 0; font-size: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Ship To</h3>
              <strong>${orderDetails.shippingAddressObj.name}</strong><br>
              ${orderDetails.shippingAddressObj.phone ? `${orderDetails.shippingAddressObj.phone}<br><br>` : '<br>'}
              ${orderDetails.shippingAddressObj.address}<br>
              ${orderDetails.shippingAddressObj.city} ${orderDetails.shippingAddressObj.pinCode} ${orderDetails.shippingAddressObj.state}
            </td>
          </tr>
        </table>

        <!-- Items Table -->
        <h3 style="margin: 0 0 10px 0; font-size: 15px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; border-top: 1px solid #d1d5db; border-bottom: 1px solid #d1d5db; margin-bottom: 20px;">
          <thead style="background-color: #f9fafb;">
            <tr>
              <th style="padding: 10px 8px; text-align: left; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">Product</th>
              <th style="padding: 10px 8px; text-align: left; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">Title</th>
              <th style="padding: 10px 8px; text-align: center; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">Qty</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">Gross Amount ₹</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">Discount ₹</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">Taxable Value ₹</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">CGST ₹</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">SGST/UTGST ₹</th>
              <th style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 12px; border-bottom: 1px solid #d1d5db;">Total ₹</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
          <tfoot>
            <tr style="background-color: #f9fafb;">
              <td colspan="2" style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px;">Total</td>
              <td style="padding: 10px 8px; text-align: center; font-weight: bold; font-size: 13px;">${orderDetails.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px;">${orderDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px;">${orderDetails.items.reduce((sum, item) => sum + item.discountAmount, 0) > 0 ? `-${orderDetails.items.reduce((sum, item) => sum + item.discountAmount, 0).toFixed(2)}` : '0.00'}</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px;">${orderDetails.items.reduce((sum, item) => sum + item.taxableAmount, 0).toFixed(2)}</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px;">${orderDetails.items.reduce((sum, item) => sum + item.cgstAmount, 0).toFixed(2)}</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px;">${orderDetails.items.reduce((sum, item) => sum + item.sgstAmount, 0).toFixed(2)}</td>
              <td style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 13px;">${orderDetails.items.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Grand Total -->
        <div style="text-align: right; font-size: 16px; font-weight: bold; margin-bottom: 20px;">
          Grand Total: ₹ ${orderDetails.items.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}
        </div>
        
        ${orderDetails.invoiceUrl ? `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${orderDetails.invoiceUrl}" target="_blank" rel="noopener noreferrer"
             style="background-color: #000000; color: #ffffff; padding: 12px 24px;
                    text-decoration: none; display: inline-block; font-weight: 500;
                    font-size: 14px;">
            Download Invoice PDF
          </a>
        </div>
        ` : ''}
      </div>
    `,
  };
};

export const ResetPasswordEmailTemplate = ({ link }: { link: URL }) => {
  return {
    subject: "Reset your password - Vishti Store",
    text: `Click the link to reset your password: ${link}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #000000; padding: 32px 24px; border-bottom: 1px solid #e5e7eb;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 500; letter-spacing: 1px;">Vishti Store</h1>
        </div>
        
        <div style="padding: 40px 24px;">
          <h2 style="color: #111827; margin: 0 0 8px 0; font-size: 18px; font-weight: 500;">Reset Your Password</h2>
          <p style="color: #6b7280; margin: 0 0 32px 0; font-size: 14px; line-height: 1.6;">
            You requested to reset your password for your Vishti Store account. Click the button below to create a new password.
          </p>
          
          <div style="margin: 32px 0;">
            <a href="${link}" 
               style="background-color: #000000; color: #ffffff; padding: 14px 32px; text-decoration: none; display: inline-block; font-weight: 500; font-size: 14px;">
              Reset Password
            </a>
          </div>
          
          <div style="border-left: 3px solid #e5e7eb; padding-left: 16px; margin: 32px 0;">
            <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0; font-weight: 500;">Important</p>
            <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.6;">
              This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
            </p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 16px; margin-top: 32px; border: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
              If the button doesn't work, copy and paste this link:
            </p>
            <p style="word-break: break-all; color: #111827; font-size: 12px; margin: 0;">
              ${link}
            </p>
          </div>
        </div>
        
        <div style="background-color: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0; font-size: 13px; text-align: center;">Vishti Store</p>
        </div>
      </div>
    `,
  };
};
