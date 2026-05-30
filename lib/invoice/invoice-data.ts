

export interface AddressObj {
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  phone: string;
}

export interface InvoiceItem {
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
}

export interface InvoiceData {
  orderId: string;
  invoiceNumber: string;
  invoiceDate: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  billingAddress?: string;
  shippingAddressObj: AddressObj;
  billingAddressObj?: AddressObj;
  gstNumber?: string;
  businessName: string | null;
  businessAddress: string | null;
  businessGstin: string | null;
  businessPan: string | null;
  businessCin: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
  cgstRate: number;
  sgstRate: number;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  invoiceUrl?: string | null;
}

export function buildInvoiceData(
  order: any, // Order with items and nested relations
  siteConfig: any | null
): InvoiceData {
  const orderDateFormatted = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  
  // Prefix + date + sequence
  const dateStr = new Date(order.createdAt).toISOString().split('T')[0].replace(/-/g, '');
  const sequenceMatch = order.orderNumber.match(/\d{3}$/);
  const sequence = sequenceMatch ? sequenceMatch[0] : "001";
  const invoiceNumber = `${siteConfig?.invoicePrefix || "INV"}${dateStr}${sequence}`;

  const subtotal = order.subtotal || 0;
  const discount = order.discount || 0;
  
  // Split discount among items proportionally based on their contribution to subtotal
  let remainingDiscount = discount;

  const items: InvoiceItem[] = order.items.map((item: any, index: number) => {
    const price = item.variantDetails?.sellingPrice || item.variantDetails?.price || 0;
    const grossAmount = price * item.quantity;
    
    // Calculate this item's share of the discount
    let itemDiscountAmount = 0;
    if (discount > 0 && subtotal > 0) {
      if (index === order.items.length - 1) {
        // Last item takes whatever discount is left to avoid rounding errors
        itemDiscountAmount = remainingDiscount;
      } else {
        itemDiscountAmount = (grossAmount / subtotal) * discount;
        remainingDiscount -= itemDiscountAmount;
      }
    }

    const taxableAmount = grossAmount - itemDiscountAmount;
    const cgstRate = siteConfig?.cgstRate ?? 9;
    const sgstRate = siteConfig?.sgstRate ?? 9;
    
    const cgstAmount = (taxableAmount * cgstRate) / 100;
    const sgstAmount = (taxableAmount * sgstRate) / 100;
    const totalAmount = taxableAmount + cgstAmount + sgstAmount;

    return {
      name: item.name,
      quantity: item.quantity,
      price: price,
      mrp: item.variantDetails?.mrp || price,
      variantName: item.variantDetails?.variantName || "",
      sku: item.variantDetails?.sku || null,
      hsnCode: item.hsnCode || null,
      discountAmount: itemDiscountAmount,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      totalAmount,
    };
  });

  const shippingAddressRaw = order.shippingAddress || {};
  const billingAddressRaw = order.billingAddress;

  const shippingAddressStr = [
    shippingAddressRaw.firstName && shippingAddressRaw.lastName
      ? `${shippingAddressRaw.firstName} ${shippingAddressRaw.lastName}`
      : null,
    shippingAddressRaw.address,
    shippingAddressRaw.city,
    shippingAddressRaw.state,
    shippingAddressRaw.pinCode,
    shippingAddressRaw.country,
  ].filter(Boolean).join(", ");

  const billingAddressStr = billingAddressRaw ? [
    billingAddressRaw.firstName && billingAddressRaw.lastName
      ? `${billingAddressRaw.firstName} ${billingAddressRaw.lastName}`
      : null,
    billingAddressRaw.address,
    billingAddressRaw.city,
    billingAddressRaw.state,
    billingAddressRaw.pinCode,
    billingAddressRaw.country,
  ].filter(Boolean).join(", ") : undefined;

  const shippingAddressObj: AddressObj = {
    name: [shippingAddressRaw.firstName, shippingAddressRaw.lastName].filter(Boolean).join(" "),
    address: shippingAddressRaw.address || "",
    city: shippingAddressRaw.city || "",
    state: shippingAddressRaw.state || "",
    pinCode: shippingAddressRaw.pinCode || "",
    country: shippingAddressRaw.country || "India",
    phone: shippingAddressRaw.phone || "",
  };

  const billingAddressObj: AddressObj | undefined = billingAddressRaw ? {
    name: [billingAddressRaw.firstName, billingAddressRaw.lastName].filter(Boolean).join(" "),
    address: billingAddressRaw.address || "",
    city: billingAddressRaw.city || "",
    state: billingAddressRaw.state || "",
    pinCode: billingAddressRaw.pinCode || "",
    country: billingAddressRaw.country || "India",
    phone: billingAddressRaw.phone || "",
  } : undefined;

  return {
    orderId: order.orderNumber,
    customerName: [shippingAddressRaw.firstName, shippingAddressRaw.lastName]
      .filter(Boolean)
      .join(" ") || "",
    customerEmail: shippingAddressRaw.email || "",
    customerPhone: shippingAddressRaw.phone || "",
    items,
    totalAmount: order.total,
    subtotal,
    discount,
    taxAmount: order.taxAmount || 0,
    shippingAddress: shippingAddressStr,
    billingAddress: billingAddressStr,
    gstNumber: billingAddressRaw?.gstNumber,
    paymentMethod: order.paymentMethod || "RAZORPAY",
    orderDate: orderDateFormatted,
    invoiceNumber,
    invoiceDate: orderDateFormatted,
    businessName: siteConfig?.businessName || null,
    businessAddress: siteConfig?.businessAddress || null,
    businessGstin: siteConfig?.businessGstin || null,
    businessPan: siteConfig?.businessPan || null,
    businessCin: siteConfig?.businessCin || null,
    businessPhone: siteConfig?.businessPhone || null,
    businessEmail: siteConfig?.businessEmail || null,
    cgstRate: siteConfig?.cgstRate ?? 9,
    sgstRate: siteConfig?.sgstRate ?? 9,
    shippingAddressObj,
    billingAddressObj,
    invoiceUrl: order.invoiceUrl
  };
}
