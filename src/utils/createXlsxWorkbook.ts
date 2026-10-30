import { strToU8, zipSync } from 'fflate';

interface ClassReport {
  student: { code: string; name: string };
  startDate: string;
  endDate: string;
  totalPoints: number;
  transactions: Array<{
    date: string;
    actionName: string;
    points: number;
    status: string;
    note: string;
  }>;
}

function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function columnName(index: number): string {
  let value = index + 1;
  let result = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
}

export function createXlsxWorkbook(report: ClassReport): Uint8Array {
  const rows: unknown[][] = [
    ['Báo cáo hoạt động học sinh', report.student.name],
    ['Mã học sinh', report.student.code],
    ['Thời gian', `${report.startDate} – ${report.endDate}`],
    ['Tổng điểm đã duyệt', report.totalPoints],
    [],
    ['Ngày', 'Hoạt động', 'Điểm', 'Trạng thái', 'Ghi chú'],
    ...report.transactions.map((transaction) => [
      transaction.date,
      transaction.actionName,
      transaction.points,
      transaction.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt',
      transaction.note,
    ]),
  ];
  const sheetRows = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, colIndex) => {
          const reference = `${columnName(colIndex)}${rowIndex + 1}`;
          if (typeof value === 'number') return `<c r="${reference}"><v>${value}</v></c>`;
          return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
        })
        .join('');
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join('');
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '</Types>'
    ),
    '_rels/.rels': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        '</Relationships>'
    ),
    'xl/workbook.xml': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        '<sheets><sheet name="Báo cáo" sheetId="1" r:id="rId1"/></sheets></workbook>'
    ),
    'xl/_rels/workbook.xml.rels': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '</Relationships>'
    ),
    'xl/worksheets/sheet1.xml': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        `<sheetData>${sheetRows}</sheetData></worksheet>`
    ),
  };
  return zipSync(files);
}
