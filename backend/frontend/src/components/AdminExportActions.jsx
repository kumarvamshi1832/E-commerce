import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "./AdminExportActions.css";

function AdminExportActions({
  title,
  columns,
  data,
  filename,
}) {
  const [showDownload, setShowDownload] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const adminName = user?.username || "Admin";

  const formatDate = () => {
    return new Date().toLocaleDateString("en-IN");
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getValue = (row, key) => {
    const keys = key.split(".");

    let value = row;

    keys.forEach((item) => {
      value = value?.[item];
    });

    return value ?? "";
  };

  const escapeCsv = (value) => {
    const text = String(value ?? "");

    if (
      text.includes(",") ||
      text.includes('"') ||
      text.includes("\n")
    ) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  };

  const downloadCSV = () => {
    const header = columns
      .map((column) => escapeCsv(column.label))
      .join(",");

    const rows = data.map((row) =>
      columns
        .map((column) =>
          escapeCsv(getValue(row, column.key))
        )
        .join(",")
    );

    const metadata = [
      `Downloaded By,${escapeCsv(adminName)}`,
      `Date,${escapeCsv(formatDate())}`,
      `Time,${escapeCsv(formatTime())}`,
      "",
    ];

    const csv = [
      ...metadata,
      header,
      ...rows,
    ].join("\n");

    const blob = new Blob(
      ["\ufeff" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${filename}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setShowDownload(false);
  };

  
const downloadPDF = () => {
    const doc = new jsPDF("landscape", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // MyStore header
    doc.setFillColor(17, 24, 39);
    doc.roundedRect(15, 12, 12, 12, 2, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("🛍", 17, 20);

    doc.setTextColor(17, 24, 39);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("MyStore", 32, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Admin Panel", 32, 23);

    // Page title
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth - 15, 19, {
        align: "right",
    });

    // Header line
    doc.setDrawColor(17, 24, 39);
    doc.setLineWidth(0.5);
    doc.line(15, 30, pageWidth - 15, 30);

    // Table
    autoTable(doc, {
        startY: 38,

        head: [
            columns.map((column) => column.label),
        ],

        body: data.map((row) =>
            columns.map((column) =>
                getValue(row, column.key)
            )
        ),

        theme: "grid",

        styles: {
            fontSize: 8,
            cellPadding: 3,
            textColor: [17, 24, 39],
        },

        headStyles: {
            fillColor: [243, 244, 246],
            textColor: [17, 24, 39],
            fontStyle: "bold",
        },

        alternateRowStyles: {
            fillColor: [250, 250, 250],
        },

        margin: {
            top: 38,
            left: 15,
            right: 15,
            bottom: 35,
        },

        // Reserve space for footer
        pageBreak: "auto",

        didDrawPage: () => {
            const footerY = pageHeight - 15;

            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(107, 114, 128);

            doc.text(
                `Downloaded By: ${adminName}`,
                pageWidth - 15,
                footerY - 8,
                {
                    align: "right",
                }
            );

            doc.text(
                `Date: ${formatDate()}`,
                pageWidth - 15,
                footerY - 4,
                {
                    align: "right",
                }
            );

            doc.text(
                `Time: ${formatTime()}`,
                pageWidth - 15,
                footerY,
                {
                    align: "right",
                }
            );
        },
    });

    // Download actual PDF
    doc.save(`${filename}.pdf`);

    setShowDownload(false);
};

  const handlePrint = () => {
    const printWindow = window.open(
      "",
      "_blank",
      "width=1000,height=800"
    );

    if (!printWindow) {
      alert("Please allow pop-ups to print.");
      return;
    }

    const tableHeader = columns
      .map(
        (column) =>
          `<th>${column.label}</th>`
      )
      .join("");

    const tableRows = data
      .map((row) => {
        return `
          <tr>
            ${columns
              .map(
                (column) =>
                  `<td>${getValue(row, column.key)}</td>`
              )
              .join("")}
          </tr>
        `;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 35px;
              font-family: Arial, sans-serif;
              color: #111827;
            }

            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding-bottom: 18px;
              margin-bottom: 25px;
              border-bottom: 2px solid #111827;
            }

            .brand {
              display: flex;
              align-items: center;
              gap: 12px;
            }

            .logo {
              width: 45px;
              height: 45px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #111827;
              color: #ffffff;
              border-radius: 10px;
              font-size: 21px;
            }

            .brand-name {
              margin: 0;
              font-size: 22px;
              font-weight: 800;
            }

            .brand-subtitle {
              margin: 3px 0 0;
              font-size: 11px;
              color: #6b7280;
            }

            .page-title {
              margin: 0;
              font-size: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th {
              padding: 11px 10px;
              background: #f3f4f6;
              border: 1px solid #d1d5db;
              text-align: left;
              font-size: 12px;
            }

            td {
              padding: 10px;
              border: 1px solid #e5e7eb;
              font-size: 12px;
            }

            tr:nth-child(even) td {
              background: #fafafa;
            }

            .footer {
              position: fixed;
              bottom: 20px;
              right: 35px;
              text-align: right;
              color: #6b7280;
              font-size: 10px;
              line-height: 1.6;
            }
          </style>
        </head>

        <body>

          <div class="header">

            <div class="brand">
              <div class="logo">🛍️</div>

              <div>
                <h1 class="brand-name">
                  MyStore
                </h1>

                <p class="brand-subtitle">
                  Admin Panel
                </p>
              </div>
            </div>

            <h2 class="page-title">
              ${title}
            </h2>

          </div>

          <table>

            <thead>
              <tr>
                ${tableHeader}
              </tr>
            </thead>

            <tbody>
              ${tableRows}
            </tbody>

          </table>

          <div class="footer">
            <div>
              Downloaded By: ${adminName}
            </div>

            <div>
              Date: ${formatDate()}
            </div>

            <div>
              Time: ${formatTime()}
            </div>
          </div>

        </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <div className="admin-export-actions">

      <div className="admin-download-wrapper">

        <button
          type="button"
          className="admin-export-btn"
          onClick={() =>
            setShowDownload(!showDownload)
          }
        >
          <span>⬇️</span>
          Download
          <span className="admin-download-arrow">
            ▾
          </span>
        </button>

        {showDownload && (
          <div className="admin-download-menu">

            <button
              type="button"
              onClick={downloadPDF}
            >
              <span>📄</span>
              Download PDF
            </button>

            <button
              type="button"
              onClick={downloadCSV}
            >
              <span>📊</span>
              Download CSV
            </button>

          </div>
        )}

      </div>

      <button
        type="button"
        className="admin-export-btn print-btn"
        onClick={handlePrint}
      >
        <span>🖨️</span>
        Print
      </button>

    </div>
  );
}

export default AdminExportActions;