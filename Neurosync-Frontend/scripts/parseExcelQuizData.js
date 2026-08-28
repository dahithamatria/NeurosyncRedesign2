const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const projectRoot = path.resolve(__dirname, '..');
const excelFiles = [
  'Memory Recall.xlsx',
  'PatternRecognition.xlsx',
  'Sentence Completion.xlsx',
  'Word Sequencing.xlsx',
];

const OPTION_ALIASES = [
  ['option_a', 'optionA', 'option_1', 'Option A', 'A'],
  ['option_b', 'optionB', 'option_2', 'Option B', 'B'],
  ['option_c', 'optionC', 'option_3', 'Option C', 'C'],
  ['option_d', 'optionD', 'option_4', 'Option D', 'D'],
];

function normalizeDifficulty(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return 'Medium';
  if (['easy', 'e'].includes(raw)) return 'Easy';
  if (['medium', 'moderate', 'm'].includes(raw)) return 'Medium';
  if (['hard', 'high', 'difficult', 'diff', 'h'].includes(raw)) return 'Hard';
  return 'Medium';
}

function resolveOptionValue(row, index) {
  const aliases = OPTION_ALIASES[index] || [];
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== null && String(row[alias]).trim() !== '') {
      return String(row[alias]).trim();
    }
  }
  return '';
}

function toQuestion(row, fileName, index) {
  const questionText = String(row.question ?? row.Question ?? row.prompt ?? row.Prompt ?? '').trim();
  if (!questionText) return null;

  const options = Array.from({ length: 4 }, (_, i) => resolveOptionValue(row, i)).filter((value) => value !== '');
  if (options.length < 4) return null;

  const correctAnswer = String(row.correct_answer ?? row.correctAnswer ?? row.correct ?? row['Correct Answer'] ?? 'A').trim().toUpperCase();
  const correctIndex = ['A', 'B', 'C', 'D'].indexOf(correctAnswer);
  const difficulty = normalizeDifficulty(row.difficulty ?? row.Difficulty);

  return {
    id: `${path.basename(fileName, path.extname(fileName)).replace(/\s+/g, '-').toLowerCase()}-${String(row.question_id ?? row.questionId ?? row.id ?? index + 1).trim()}`,
    sourceFile: fileName,
    category: String(row.category ?? row.Category ?? path.basename(fileName, path.extname(fileName))).trim() || path.basename(fileName, path.extname(fileName)),
    difficulty,
    question: questionText,
    options,
    correctAnswer: correctIndex >= 0 ? ['A', 'B', 'C', 'D'][correctIndex] : 'A',
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  };
}

function parseExcelFile(fileName) {
  const filePath = path.join(projectRoot, fileName);
  const workbook = XLSX.readFile(filePath);
  const firstSheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: '', raw: false });

  return rows
    .map((row, index) => toQuestion(row, fileName, index))
    .filter(Boolean);
}

const allQuestions = excelFiles.flatMap(parseExcelFile);
const outputFile = path.join(projectRoot, 'react-app/src/data/excelQuizDataset.js');
const output = `export const EXCEL_QUESTION_POOL = ${JSON.stringify(allQuestions, null, 2)};\n\nexport default EXCEL_QUESTION_POOL;\n`;

fs.writeFileSync(outputFile, output, 'utf8');
console.log(`Generated ${allQuestions.length} normalized questions in ${outputFile}`);
console.log('Per file counts:', Object.entries(
  allQuestions.reduce((acc, question) => {
    acc[question.sourceFile] = (acc[question.sourceFile] || 0) + 1;
    return acc;
  }, {}),
).map(([file, count]) => `${file}: ${count}`).join(', '));
