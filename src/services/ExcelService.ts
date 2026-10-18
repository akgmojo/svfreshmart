import * as XLSX from 'xlsx';
import { ExcelValidationResult, VariationUnit } from '../types';
import { getAllProducts, saveProduct, addAuditLog } from '../data/db';

const VALID_UNITS: VariationUnit[] = ['g', 'kg', 'piece', 'pieces', 'ml', 'L', 'Pack', 'Box', 'Bundle'];

export class ExcelService {
  /**
   * Generates an Excel workbook buffer populated with current products & variations
   */
  static generateCatalogueTemplate(): Buffer {
    const products = getAllProducts(true);
    const rows = [];

    for (const prod of products) {
      for (const v of prod.variations) {
        rows.push({
          'Product SKU': prod.productSku,
          'Variant SKU': v.variantSku,
          'Product Name': prod.name,
          'Quantity': v.quantity,
          'Unit': v.unit,
          'Selling Price (₹)': v.price,
          'MRP (₹)': v.mrp,
          'Stock Quantity': v.stock,
          'Stock Status': v.stock > 0 ? (v.stock <= 10 ? 'Low Stock' : 'In Stock') : 'Out of Stock',
          'Product Status': prod.isActive && v.isActive ? 'Active' : 'Inactive',
          'Category': prod.category,
          'Image URL': prod.imageUrl
        });
      }
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    // Set column widths for comfortable editing
    worksheet['!cols'] = [
      { wch: 22 }, // Product SKU
      { wch: 24 }, // Variant SKU
      { wch: 35 }, // Product Name
      { wch: 10 }, // Quantity
      { wch: 10 }, // Unit
      { wch: 16 }, // Selling Price
      { wch: 12 }, // MRP
      { wch: 14 }, // Stock Quantity
      { wch: 14 }, // Stock Status
      { wch: 14 }, // Product Status
      { wch: 16 }, // Category
      { wch: 50 }, // Image URL
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Price_Stock_Catalog');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Validates uploaded Excel file rows without applying changes
   */
  static validateUpload(buffer: Buffer): ExcelValidationResult {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawRows = XLSX.utils.sheet_to_json<any>(sheet);

    const errors: ExcelValidationResult['errors'] = [];
    const warnings: ExcelValidationResult['warnings'] = [];
    const previewDiffs: ExcelValidationResult['previewDiffs'] = [];

    const existingProducts = getAllProducts(true);
    // Map existing variations by SKU (case insensitive)
    const existingVarMap = new Map<string, { product: typeof existingProducts[0]; variation: typeof existingProducts[0]['variations'][0] }>();
    
    for (const prod of existingProducts) {
      for (const v of prod.variations) {
        existingVarMap.set(v.variantSku.toUpperCase(), { product: prod, variation: v });
      }
    }

    const seenSkusInFile = new Set<string>();

    let validCount = 0;
    let invalidCount = 0;

    rawRows.forEach((row, idx) => {
      const rowNum = idx + 2; // header is row 1
      const variantSku = String(row['Variant SKU'] || row['variantSku'] || '').trim();
      const productSku = String(row['Product SKU'] || row['productSku'] || '').trim();
      const sellingPrice = Number(row['Selling Price (₹)'] ?? row['Selling Price'] ?? row['sellingPrice']);
      const mrp = Number(row['MRP (₹)'] ?? row['MRP'] ?? row['mrp']);
      const stock = Number(row['Stock Quantity'] ?? row['Stock'] ?? row['stockQuantity']);
      const unit = String(row['Unit'] || row['unit'] || '').trim();
      const quantity = Number(row['Quantity'] || row['quantity']);

      let rowHasCriticalError = false;

      // 1. Missing SKU Check
      if (!variantSku) {
        errors.push({
          row: rowNum,
          sku: 'EMPTY',
          field: 'Variant SKU',
          message: 'Variant SKU is missing or blank.',
          critical: true
        });
        rowHasCriticalError = true;
      }

      // 2. Duplicate SKU in File Check
      if (variantSku) {
        const upperSku = variantSku.toUpperCase();
        if (seenSkusInFile.has(upperSku)) {
          errors.push({
            row: rowNum,
            sku: variantSku,
            field: 'Variant SKU',
            message: `Duplicate Variant SKU "${variantSku}" found in upload file.`,
            critical: true
          });
          rowHasCriticalError = true;
        } else {
          seenSkusInFile.add(upperSku);
        }
      }

      // 3. Price Validation
      if (isNaN(sellingPrice) || sellingPrice <= 0) {
        errors.push({
          row: rowNum,
          sku: variantSku,
          field: 'Selling Price',
          message: `Invalid selling price: "${sellingPrice}". Must be greater than ₹0.`,
          critical: true
        });
        rowHasCriticalError = true;
      }

      if (isNaN(mrp) || mrp <= 0) {
        errors.push({
          row: rowNum,
          sku: variantSku,
          field: 'MRP',
          message: `Invalid MRP: "${mrp}". Must be greater than ₹0.`,
          critical: true
        });
        rowHasCriticalError = true;
      }

      if (!isNaN(sellingPrice) && !isNaN(mrp) && sellingPrice > mrp) {
        errors.push({
          row: rowNum,
          sku: variantSku,
          field: 'Selling Price',
          message: `Selling price (₹${sellingPrice}) cannot exceed MRP (₹${mrp}).`,
          critical: true
        });
        rowHasCriticalError = true;
      }

      // 4. Stock Validation
      if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        errors.push({
          row: rowNum,
          sku: variantSku,
          field: 'Stock Quantity',
          message: `Invalid stock quantity: "${stock}". Must be a non-negative integer.`,
          critical: true
        });
        rowHasCriticalError = true;
      }

      // 5. Unit / Quantity Check
      if (unit && !VALID_UNITS.includes(unit as VariationUnit)) {
        errors.push({
          row: rowNum,
          sku: variantSku,
          field: 'Unit',
          message: `Invalid unit "${unit}". Supported: ${VALID_UNITS.join(', ')}.`,
          critical: true
        });
        rowHasCriticalError = true;
      }

      if (quantity && (isNaN(quantity) || quantity <= 0)) {
        errors.push({
          row: rowNum,
          sku: variantSku,
          field: 'Quantity',
          message: `Invalid quantity number: "${quantity}".`,
          critical: true
        });
        rowHasCriticalError = true;
      }

      // Compare with existing catalogue to detect changes and price fluctuations
      if (variantSku && existingVarMap.has(variantSku.toUpperCase())) {
        const { product, variation } = existingVarMap.get(variantSku.toUpperCase())!;
        
        let hasPriceWarning = false;
        if (!isNaN(sellingPrice) && variation.price > 0) {
          const priceDiffPct = Math.round(((sellingPrice - variation.price) / variation.price) * 100);
          
          // Large price change warning (> 30% jump or drop)
          if (Math.abs(priceDiffPct) >= 30) {
            hasPriceWarning = true;
            warnings.push({
              row: rowNum,
              sku: variantSku,
              message: `Large price fluctuation of ${priceDiffPct > 0 ? '+' : ''}${priceDiffPct}% from ₹${variation.price} to ₹${sellingPrice}.`,
              oldValue: variation.price,
              newValue: sellingPrice
            });
          }

          previewDiffs.push({
            variantSku,
            productName: product.name,
            variantLabel: variation.label,
            oldPrice: variation.price,
            newPrice: sellingPrice,
            priceDiffPct,
            oldMrp: variation.mrp,
            newMrp: isNaN(mrp) ? variation.mrp : mrp,
            oldStock: variation.stock,
            newStock: isNaN(stock) ? variation.stock : stock,
            hasPriceWarning
          });
        }
      }

      if (rowHasCriticalError) {
        invalidCount++;
      } else {
        validCount++;
      }
    });

    return {
      isValid: errors.filter(e => e.critical).length === 0,
      totalRows: rawRows.length,
      validRows: validCount,
      invalidRows: invalidCount,
      errors,
      warnings,
      previewDiffs
    };
  }

  /**
   * Commits validated Excel updates to catalogue and records audit trail
   */
  static commitUpdates(buffer: Buffer, actor = 'Admin'): { success: boolean; updatedCount: number; message: string } {
    const validation = this.validateUpload(buffer);
    if (!validation.isValid) {
      return {
        success: false,
        updatedCount: 0,
        message: `Cannot commit updates. Excel contains ${validation.errors.length} critical errors.`
      };
    }

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawRows = XLSX.utils.sheet_to_json<any>(sheet);

    const products = getAllProducts(true);
    let updatedCount = 0;

    for (const row of rawRows) {
      const variantSku = String(row['Variant SKU'] || row['variantSku'] || '').trim().toUpperCase();
      const sellingPrice = Number(row['Selling Price (₹)'] ?? row['Selling Price'] ?? row['sellingPrice']);
      const mrp = Number(row['MRP (₹)'] ?? row['MRP'] ?? row['mrp']);
      const stock = Number(row['Stock Quantity'] ?? row['Stock'] ?? row['stockQuantity']);
      const productStatus = String(row['Product Status'] || row['productStatus'] || '').toLowerCase();

      for (const prod of products) {
        const v = prod.variations.find(varItem => varItem.variantSku.toUpperCase() === variantSku);
        if (v) {
          if (!isNaN(sellingPrice)) v.price = sellingPrice;
          if (!isNaN(mrp)) v.mrp = mrp;
          if (!isNaN(stock)) v.stock = stock;
          if (productStatus) {
            v.isActive = productStatus === 'active';
          }
          saveProduct(prod, `ExcelBulkUpdate (${actor})`);
          updatedCount++;
          break;
        }
      }
    }

    addAuditLog('EXCEL_BULK_UPDATE', `Updated ${updatedCount} variations via Excel price & stock import`, actor);

    return {
      success: true,
      updatedCount,
      message: `Successfully updated ${updatedCount} variations from Excel!`
    };
  }
}
