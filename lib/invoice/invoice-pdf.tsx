import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { InvoiceData } from './invoice-data';

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 30,
    color: '#111827',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sellerInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 10,
    marginBottom: 20,
  },
  sellerLeft: {
    width: '60%',
  },
  sellerRight: {
    width: '40%',
    alignItems: 'flex-end',
  },
  invoiceBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#9ca3af',
    padding: 8,
  },
  invoiceBoxText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  sectionRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  sectionCol33: {
    width: '33.33%',
    paddingRight: 10,
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  tableFooter: {
    flexDirection: 'row',
    paddingVertical: 8,
    fontWeight: 'bold',
  },
  colProduct: { width: '18%', paddingHorizontal: 4 },
  colTitle: { width: '15%', paddingHorizontal: 4 },
  colQty: { width: '7%', textAlign: 'center' },
  colGross: { width: '10%', textAlign: 'right', paddingHorizontal: 4 },
  colDisc: { width: '10%', textAlign: 'right', paddingHorizontal: 4 },
  colTaxable: { width: '10%', textAlign: 'right', paddingHorizontal: 4 },
  colCgst: { width: '10%', textAlign: 'right', paddingHorizontal: 4 },
  colSgst: { width: '10%', textAlign: 'right', paddingHorizontal: 4 },
  colTotal: { width: '10%', textAlign: 'right', paddingHorizontal: 4 },
  grandTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  grandTotalText: {
    fontSize: 14,
  },
  grandTotalAmount: {
    fontWeight: 'bold',
    marginLeft: 20,
  },
  footer: {
    textAlign: 'right',
    color: '#374151',
    marginTop: 20,
  },
  smallText: {
    fontSize: 8,
    color: '#6b7280',
  }
});

export const InvoicePDFDocument = ({ data }: { data: InvoiceData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Tax Invoice</Text>
        </View>

        {/* Seller Info & Invoice Number */}
        <View style={styles.sellerInfoContainer}>
          <View style={styles.sellerLeft}>
            <Text style={styles.bold}>Sold By: {data.businessName || 'Vishti Store'}</Text>
            <Text>Ship-from Address: {data.businessAddress || 'Not provided'}</Text>
            {data.businessGstin && <Text style={styles.bold}>GSTIN - {data.businessGstin}</Text>}
          </View>
          <View style={styles.sellerRight}>
            <View style={styles.invoiceBox}>
              <Text style={styles.invoiceBoxText}>Invoice Number # {data.invoiceNumber}</Text>
            </View>
          </View>
        </View>

        {/* Order & Addresses Info */}
        <View style={styles.sectionRow}>
          <View style={[styles.sectionCol33, { borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>
            <Text><Text style={styles.bold}>Order ID:</Text> {data.orderId}</Text>
            <Text><Text style={styles.bold}>Order Date:</Text> {data.orderDate}</Text>
            <Text><Text style={styles.bold}>Invoice Date:</Text> {data.invoiceDate}</Text>
            <Text><Text style={styles.bold}>PAN:</Text> {data.businessPan || 'N/A'}</Text>
            <Text><Text style={styles.bold}>CIN:</Text> {data.businessCin || 'N/A'}</Text>
          </View>
          <View style={[styles.sectionCol33, { paddingLeft: 10, borderRightWidth: 1, borderRightColor: '#e5e7eb' }]}>
            <Text style={styles.bold}>Bill To</Text>
            <Text style={styles.bold}>{data.billingAddressObj?.name || data.customerName || ''}</Text>
            <Text>{data.billingAddressObj?.address || ''}</Text>
            <Text>{data.billingAddressObj?.city || ''} {data.billingAddressObj?.pinCode || ''} {data.billingAddressObj?.state || ''}</Text>
            <Text>Phone: {data.billingAddressObj?.phone || 'N/A'}</Text>
            {data.gstNumber && <Text><Text style={styles.bold}>GSTIN:</Text> {data.gstNumber}</Text>}
          </View>
          <View style={[styles.sectionCol33, { paddingLeft: 10 }]}>
            <Text style={styles.bold}>Ship To</Text>
            <Text style={styles.bold}>{data.shippingAddressObj.name}</Text>
            <Text>{data.shippingAddressObj.address}</Text>
            <Text>{data.shippingAddressObj.city} {data.shippingAddressObj.pinCode} {data.shippingAddressObj.state}</Text>
            <Text>Phone: {data.shippingAddressObj.phone || 'N/A'}</Text>
          </View>
        </View>

        {/* Items Table */}
        <Text style={{ marginBottom: 5 }}>Total items: {data.items.length}</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colProduct, styles.bold]}>Product</Text>
            <Text style={[styles.colTitle, styles.bold]}>Title</Text>
            <Text style={[styles.colQty, styles.bold]}>Qty</Text>
            <Text style={[styles.colGross, styles.bold]}>Gross Amount</Text>
            <Text style={[styles.colDisc, styles.bold]}>Discount</Text>
            <Text style={[styles.colTaxable, styles.bold]}>Taxable Value</Text>
            <Text style={[styles.colCgst, styles.bold]}>CGST</Text>
            <Text style={[styles.colSgst, styles.bold]}>SGST/UTGST</Text>
            <Text style={[styles.colTotal, styles.bold]}>Total</Text>
          </View>

          {/* Table Body */}
          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.colProduct}>
                <Text>{item.name}</Text>
                {item.hsnCode && <Text style={styles.smallText}>HSN: {item.hsnCode}</Text>}
              </View>
              <View style={styles.colTitle}>
                <Text style={styles.bold}>{item.variantName || item.name}</Text>
                {item.sku && <Text style={styles.smallText}>SKU: {item.sku}</Text>}
              </View>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colGross}>{(item.price * item.quantity).toFixed(2)}</Text>
              <Text style={styles.colDisc}>{item.discountAmount > 0 ? `-${item.discountAmount.toFixed(2)}` : '0.00'}</Text>
              <Text style={styles.colTaxable}>{item.taxableAmount.toFixed(2)}</Text>
              <View style={styles.colCgst}>
                <Text>{item.cgstAmount.toFixed(2)}</Text>
                <Text style={styles.smallText}>({data.cgstRate}%)</Text>
              </View>
              <View style={styles.colSgst}>
                <Text>{item.sgstAmount.toFixed(2)}</Text>
                <Text style={styles.smallText}>({data.sgstRate}%)</Text>
              </View>
              <Text style={styles.colTotal}>{item.totalAmount.toFixed(2)}</Text>
            </View>
          ))}

          {/* Table Footer */}
          <View style={[styles.tableFooter, { backgroundColor: '#f9fafb' }]}>
            <Text style={[{ width: '33%', textAlign: 'right', paddingRight: 4 }]}>Total</Text>
            <Text style={styles.colQty}>{data.items.reduce((sum, item) => sum + item.quantity, 0)}</Text>
            <Text style={styles.colGross}>{data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</Text>
            <Text style={styles.colDisc}>{data.items.reduce((sum, item) => sum + item.discountAmount, 0) > 0 ? `-${data.items.reduce((sum, item) => sum + item.discountAmount, 0).toFixed(2)}` : '0.00'}</Text>
            <Text style={styles.colTaxable}>{data.items.reduce((sum, item) => sum + item.taxableAmount, 0).toFixed(2)}</Text>
            <Text style={styles.colCgst}>{data.items.reduce((sum, item) => sum + item.cgstAmount, 0).toFixed(2)}</Text>
            <Text style={styles.colSgst}>{data.items.reduce((sum, item) => sum + item.sgstAmount, 0).toFixed(2)}</Text>
            <Text style={styles.colTotal}>{data.items.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}</Text>
          </View>
        </View>

        {/* Grand Total */}
        <View style={styles.grandTotalContainer}>
          <Text style={styles.grandTotalText}>
            Grand Total <Text style={styles.grandTotalAmount}>₹ {data.items.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}</Text>
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>{data.businessName || 'Vishti Store'}</Text>

      </Page>
    </Document>
  );
};
