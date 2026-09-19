import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "./InvoiceActions.css";

function InvoiceActions({ order }) {
  const [open, setOpen] = useState(false);

  const money = (value) =>
    Number(value || 0).toFixed(2);

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const left = 18;
    const right = pageWidth - 18;

    /*
      COLOURS
    */

    const primary = [37, 99, 235];
    const dark = [31, 41, 55];
    const gray = [107, 114, 128];
    const lightGray = [243, 244, 246];
    const border = [220, 224, 230];
    const white = [255, 255, 255];

    /*
      PAGE BACKGROUND
    */

    doc.setFillColor(
      250,
      251,
      253
    );

    doc.rect(
      0,
      0,
      pageWidth,
      pageHeight,
      "F"
    );

    /*
      WHITE INVOICE AREA
    */

    doc.setFillColor(
      ...white
    );

    doc.roundedRect(
      8,
      8,
      pageWidth - 16,
      pageHeight - 16,
      3,
      3,
      "F"
    );

    /*
      HEADER
    */

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(25);

    doc.setTextColor(
      ...primary
    );

    doc.text(
      "MyStore",
      left,
      27
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(27);

    doc.setTextColor(
      ...dark
    );

    doc.text(
      "INVOICE",
      right,
      27,
      {
        align: "right",
      }
    );

    /*
      BLUE HEADER LINE
    */

    doc.setDrawColor(
      ...primary
    );

    doc.setLineWidth(1);

    doc.line(
      left,
      34,
      right,
      34
    );

    /*
      BILLED TO
    */

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.setTextColor(
      ...dark
    );

    doc.text(
      "BILLED TO:",
      left,
      49
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(10);

    doc.setTextColor(
      50,
      50,
      50
    );

    let addressY = 57;

    if (order.address) {
      const addressLines = [
        order.address.full_name,
        order.address.phone,
        order.address.address_line1,
        order.address.address_line2,
        `${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
        order.address.landmark
          ? `Landmark: ${order.address.landmark}`
          : "",
      ].filter(Boolean);

      addressLines.forEach(
        (line) => {
          doc.text(
            line,
            left,
            addressY
          );

          addressY += 5.5;
        }
      );
    }

    /*
      ORDER INFORMATION
    */

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.setTextColor(
      ...dark
    );

    doc.text(
      `Invoice No. ${order.id}`,
      right,
      49,
      {
        align: "right",
      }
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(10);

    doc.setTextColor(
      ...gray
    );

    doc.text(
      new Date(
        order.created_at
      ).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),
      right,
      57,
      {
        align: "right",
      }
    );

    /*
      STATUS BADGE
    */

    const status =
      order.status || "Pending";

    const statusWidth = 30;
    const statusHeight = 8;

    doc.setFillColor(
      ...primary
    );

    doc.roundedRect(
      right - statusWidth,
      63,
      statusWidth,
      statusHeight,
      2,
      2,
      "F"
    );

    doc.setTextColor(
      ...white
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(8);

    doc.text(
      status.toUpperCase(),
      right - statusWidth / 2,
      68.5,
      {
        align: "center",
      }
    );

    /*
      PRODUCTS TABLE
    */

    const tableStartY =
      Math.max(
        addressY + 8,
        88
      );

    autoTable(doc, {
      startY: tableStartY,

      margin: {
        left,
        right: 18,
      },

      head: [
        [
          "Item",
          "Quantity",
          "Unit Price",
          "Total",
        ],
      ],

      body: order.items.map(
        (item) => [
          item.product_name,
          item.quantity,
          `Rs. ${money(
            item.price
          )}`,
          `Rs. ${money(
            item.item_total
          )}`,
        ]
      ),

      theme: "plain",

      styles: {
        font: "helvetica",
        fontSize: 10,
        textColor: [45, 45, 45],
        cellPadding: {
          top: 6,
          bottom: 6,
          left: 2,
          right: 2,
        },
      },

      headStyles: {
        fontStyle: "bold",
        fontSize: 10,
        textColor: white,
        fillColor: primary,
        lineWidth: 0,
      },

      bodyStyles: {
        fillColor: white,
      },

      alternateRowStyles: {
        fillColor: [
          248,
          250,
          252,
        ],
      },

      columnStyles: {
        0: {
          cellWidth: 82,
        },

        1: {
          cellWidth: 30,
          halign: "center",
        },

        2: {
          cellWidth: 38,
          halign: "right",
        },

        3: {
          cellWidth: 30,
          halign: "right",
        },
      },

      didDrawCell: (data) => {
        if (
          data.section ===
            "body" &&
          data.column.index === 3
        ) {
          doc.setDrawColor(
            ...border
          );

          doc.setLineWidth(
            0.2
          );

          doc.line(
            left,
            data.cell.y +
              data.cell.height,
            right,
            data.cell.y +
              data.cell.height
          );
        }
      },
    });

    /*
      SUMMARY
    */

    let summaryY =
      doc.lastAutoTable.finalY +
      14;

    const summaryLabelX = 135;
    const summaryValueX = right;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(10);

    doc.setTextColor(
      ...gray
    );

    /*
      SUBTOTAL
    */

    doc.text(
      "Subtotal",
      summaryLabelX,
      summaryY
    );

    doc.setTextColor(
      ...dark
    );

    doc.text(
      `Rs. ${money(
        order.subtotal
      )}`,
      summaryValueX,
      summaryY,
      {
        align: "right",
      }
    );

    summaryY += 7;

    /*
      DISCOUNT
    */

    doc.setTextColor(
      ...gray
    );

    doc.text(
      "Discount",
      summaryLabelX,
      summaryY
    );

    doc.setTextColor(
      22,
      163,
      74
    );

    doc.text(
      `-Rs. ${money(
        order.discount
      )}`,
      summaryValueX,
      summaryY,
      {
        align: "right",
      }
    );

    summaryY += 7;

    /*
      COUPON
    */

    if (order.coupon_code) {
      doc.setTextColor(
        ...gray
      );

      doc.text(
        "Coupon",
        summaryLabelX,
        summaryY
      );

      doc.setFillColor(
        239,
        246,
        255
      );

      doc.roundedRect(
        summaryValueX - 32,
        summaryY - 5,
        32,
        7,
        1.5,
        1.5,
        "F"
      );

      doc.setTextColor(
        ...primary
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        order.coupon_code,
        summaryValueX - 16,
        summaryY,
        {
          align: "center",
        }
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      summaryY += 7;
    }

    /*
      DELIVERY
    */

    doc.setTextColor(
      ...gray
    );

    doc.text(
      "Delivery",
      summaryLabelX,
      summaryY
    );

    doc.setTextColor(
      ...dark
    );

    doc.text(
      `Rs. ${money(
        order.delivery_charge
      )}`,
      summaryValueX,
      summaryY,
      {
        align: "right",
      }
    );

    summaryY += 9;

    /*
      TOTAL BOX
    */

    const totalBoxX = 120;
    const totalBoxWidth =
      right - totalBoxX;

    const totalBoxHeight = 17;

    doc.setFillColor(
      ...primary
    );

    doc.roundedRect(
      totalBoxX,
      summaryY,
      totalBoxWidth,
      totalBoxHeight,
      2,
      2,
      "F"
    );

    doc.setTextColor(
      ...white
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(13);

    doc.text(
      "TOTAL",
      totalBoxX + 7,
      summaryY + 11
    );

    doc.text(
      `Rs. ${money(
        order.total_amount
      )}`,
      right - 7,
      summaryY + 11,
      {
        align: "right",
      }
    );

    /*
      THANK YOU
    */

    doc.setTextColor(
      ...dark
    );

    doc.setFont(
      "helvetica",
      "italic"
    );

    doc.setFontSize(19);

    doc.text(
      "Thank You!",
      left,
      summaryY + 40
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    doc.setTextColor(
      ...gray
    );

    doc.text(
      "Thank you for shopping with MyStore.",
      left,
      summaryY + 48
    );

    /*
      FOOTER
    */

    doc.setDrawColor(
      ...border
    );

    doc.setLineWidth(
      0.3
    );

    doc.line(
      left,
      pageHeight - 25,
      right,
      pageHeight - 25
    );

    doc.setFontSize(8);

    doc.setTextColor(
      ...gray
    );

    doc.text(
      "MyStore • Your trusted online shopping destination",
      left,
      pageHeight - 18
    );

    doc.setTextColor(
      ...primary
    );

    doc.text(
      `Order #${order.id}`,
      right,
      pageHeight - 18,
      {
        align: "right",
      }
    );

    doc.save(
      `MyStore-Invoice-${order.id}.pdf`
    );

    setOpen(false);
  };

  const downloadCSV = () => {
    const rows = [
      ["MyStore Invoice"],
      [],
      ["Order ID", order.id],
      [
        "Order Date",
        new Date(
          order.created_at
        ).toLocaleDateString(),
      ],
      ["Status", order.status],
      [],
      [
        "Customer Name",
        order.address?.full_name ||
          "",
      ],
      [
        "Phone",
        order.address?.phone ||
          "",
      ],
      [
        "Address",
        order.address?.address_line1 ||
          "",
      ],
      [
        "City",
        order.address?.city ||
          "",
      ],
      [
        "State",
        order.address?.state ||
          "",
      ],
      [
        "Pincode",
        order.address?.pincode ||
          "",
      ],
      [],
      [
        "Product",
        "Quantity",
        "Unit Price",
        "Total",
      ],
    ];

    order.items.forEach(
      (item) => {
        rows.push([
          item.product_name,
          item.quantity,
          `₹${money(
            item.price
          )}`,
          `₹${money(
            item.item_total
          )}`,
        ]);
      }
    );

    rows.push([]);

    rows.push([
      "Subtotal",
      `₹${money(
        order.subtotal
      )}`,
    ]);

    rows.push([
      "Discount",
      `-₹${money(
        order.discount
      )}`,
    ]);

    if (order.coupon_code) {
      rows.push([
        "Coupon",
        order.coupon_code,
      ]);
    }

    rows.push([
      "Delivery",
      `₹${money(
        order.delivery_charge
      )}`,
    ]);

    rows.push([
      "Total",
      `₹${money(
        order.total_amount
      )}`,
    ]);

    const csv = rows
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? ""
              ).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `MyStore-Invoice-${order.id}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setOpen(false);
  };

  const printInvoice = () => {
    const printWindow =
      window.open("", "_blank");

    if (!printWindow) {
      return;
    }

    const itemsHTML =
      order.items
        .map(
          (item) => `
            <tr>
              <td>${item.product_name}</td>
              <td>${item.quantity}</td>
              <td>₹${money(
                item.price
              )}</td>
              <td>₹${money(
                item.item_total
              )}</td>
            </tr>
          `
        )
        .join("");

    const addressHTML =
      order.address
        ? `
          <div class="address">
            <strong>
              ${order.address.full_name}
            </strong>
            <br>
            ${order.address.phone}
            <br>
            ${order.address.address_line1}
            ${
              order.address.address_line2
                ? `<br>${order.address.address_line2}`
                : ""
            }
            <br>
            ${order.address.city},
            ${order.address.state} -
            ${order.address.pincode}
            ${
              order.address.landmark
                ? `<br>Landmark:
                   ${order.address.landmark}`
                : ""
            }
          </div>
        `
        : "";

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>

        <head>

          <title>
            MyStore Invoice #${order.id}
          </title>

          <style>

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 45px;
              font-family: Arial, sans-serif;
              color: #222;
              background: #fff;
            }

            .invoice {
              max-width: 900px;
              margin: auto;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding-bottom: 22px;
              border-bottom: 2px solid #2563eb;
            }

            .brand {
              font-size: 30px;
              font-weight: 700;
              color: #2563eb;
            }

            .invoice-title {
              font-size: 42px;
              font-weight: 300;
              color: #222;
            }

            .info {
              display: flex;
              justify-content: space-between;
              margin-top: 55px;
              margin-bottom: 55px;
            }

            .billed h3 {
              margin: 0 0 14px;
              font-size: 15px;
              text-transform: uppercase;
            }

            .address {
              font-size: 14px;
              line-height: 1.65;
            }

            .order-info {
              text-align: right;
              font-size: 14px;
              line-height: 1.8;
            }

            .products {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }

            .products th {
              text-align: left;
              font-size: 14px;
              padding: 12px 0;
              color: #fff;
              background: #2563eb;
              padding-left: 8px;
            }

            .products td {
              padding: 17px 8px;
              font-size: 14px;
              border-bottom: 1px solid #ddd;
            }

            .products th:nth-child(2),
            .products td:nth-child(2) {
              text-align: center;
              width: 110px;
            }

            .products th:nth-child(3),
            .products td:nth-child(3) {
              text-align: right;
              width: 150px;
            }

            .products th:nth-child(4),
            .products td:nth-child(4) {
              text-align: right;
              width: 150px;
            }

            .summary {
              width: 360px;
              margin-left: auto;
              margin-top: 28px;
            }

            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 7px 0;
              font-size: 14px;
            }

            .summary-row strong {
              font-weight: 600;
            }

            .total {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #2563eb;
              color: #fff;
              padding: 15px 18px;
              margin-top: 10px;
              font-size: 19px;
              font-weight: 700;
              border-radius: 4px;
            }

            .thank-you {
              margin-top: 65px;
              font-size: 27px;
              font-style: italic;
            }

            .footer {
              margin-top: 70px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              color: #777;
              font-size: 12px;
              text-align: center;
            }

            @media print {

              body {
                padding: 25px;
              }

              .invoice {
                max-width: none;
              }

            }

          </style>

        </head>

        <body>

          <div class="invoice">

            <div class="header">

              <div class="brand">
                MyStore
              </div>

              <div class="invoice-title">
                Invoice
              </div>

            </div>

            <div class="info">

              <div class="billed">

                <h3>
                  Billed to:
                </h3>

                ${addressHTML}

              </div>

              <div class="order-info">

                <strong>
                  Invoice No. ${order.id}
                </strong>

                <br>

                ${new Date(
                  order.created_at
                ).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }
                )}

                <br>

                Status: ${order.status}

              </div>

            </div>

            <table class="products">

              <thead>

                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>

              </thead>

              <tbody>
                ${itemsHTML}
              </tbody>

            </table>

            <div class="summary">

              <div class="summary-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹${money(
                    order.subtotal
                  )}
                </strong>

              </div>

              <div class="summary-row">

                <span>
                  Discount
                </span>

                <strong style="color: #16a34a;">
                  -₹${money(
                    order.discount
                  )}
                </strong>

              </div>

              ${
                order.coupon_code
                  ? `
                    <div class="summary-row">

                      <span>
                        Coupon
                      </span>

                      <strong style="color: #2563eb;">
                        ${order.coupon_code}
                      </strong>

                    </div>
                  `
                  : ""
              }

              <div class="summary-row">

                <span>
                  Delivery
                </span>

                <strong>
                  ₹${money(
                    order.delivery_charge
                  )}
                </strong>

              </div>

              <div class="total">

                <span>
                  Total
                </span>

                <span>
                  ₹${money(
                    order.total_amount
                  )}
                </span>

              </div>

            </div>

            <div class="thank-you">
              Thank You!
            </div>

            <div class="footer">

              Thank you for shopping with MyStore.

              <br>

              Order #${order.id}

            </div>

          </div>

          <script>

            window.onload = function() {
              window.print();
            };

          </script>

        </body>

      </html>
    `);

    printWindow.document.close();

    setOpen(false);
  };

  return (
    <div className="invoice-actions">

      <button
        type="button"
        className="invoice-download-button"
        onClick={() =>
          setOpen((prev) => !prev)
        }
      >
        Download ▾
      </button>

      {open && (
        <div className="invoice-dropdown">

          <button
            type="button"
            onClick={downloadPDF}
          >
            Download as PDF
          </button>

          <button
            type="button"
            onClick={downloadCSV}
          >
            Download as CSV
          </button>

        </div>
      )}

      <button
        type="button"
        className="invoice-print-button"
        onClick={printInvoice}
      >
        Print
      </button>

    </div>
  );
}

export default InvoiceActions;