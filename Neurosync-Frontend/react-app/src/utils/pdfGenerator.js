import { jsPDF } from 'jspdf';

export function generateResultPDF({ results, risk, recommendations, timeTaken, userName }) {
  const doc = new jsPDF();
  const marginX = 20;
  let y = 24;

  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text('NeuroSync Screening Report', marginX, y);

  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated ${new Date().toLocaleDateString()}${userName ? ` for ${userName}` : ''}`, marginX, y);

  y += 14;
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, y, 190, y);

  y += 14;
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text(`Overall Score: ${results.totalPercent}%`, marginX, y);

  y += 8;
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Risk Level: ${risk.level}`, marginX, y);

  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Assessment Time: ${timeTaken}   |   Reading Speed: ${results.readingSpeed || '-'} wpm`, marginX, y);

  y += 16;
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Category Breakdown', marginX, y);
  y += 8;

  Object.entries(results.categoryScores).forEach(([label, data]) => {
    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`${label}: ${data.correct}/${data.total} (${data.percent}%)`, marginX, y);
    y += 7;
  });

  y += 8;
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Recommendations', marginX, y);
  y += 8;

  doc.setFontSize(10.5);
  doc.setTextColor(51, 65, 85);
  recommendations.forEach((rec) => {
    const lines = doc.splitTextToSize(`• ${rec}`, 170);
    doc.text(lines, marginX, y);
    y += lines.length * 6 + 2;
  });

  y += 10;
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, y, 190, y);
  y += 8;
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  const disclaimer = doc.splitTextToSize(
    'NeuroSync provides a cognitive screening estimate based on a short assessment. It is not a medical diagnosis. If reading difficulties persist, please consult a licensed specialist.',
    170
  );
  doc.text(disclaimer, marginX, y);

  doc.save('NeuroSync-Report.pdf');
}
