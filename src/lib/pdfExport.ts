import { jsPDF } from 'jspdf';
import { Course, Lesson } from '../types';

/**
 * Helper to strip markdown characters for clean PDF printing
 */
function cleanMarkdownText(text: string): string {
  return text
    .replace(/[\#\*\_`\>]/g, '') // strip common markdown tokens
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Formats and exports the entire course outline and summary as a PDF.
 */
export function exportCourseOutlinePDF(course: Course) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);

  let y = margin;
  let pageCount = 1;

  // Header / Footer draw helper for new pages
  const drawPageDecorations = (pageNumber: number) => {
    // Top border accent (Amber)
    doc.setFillColor(255, 215, 0); // #FFD700
    doc.rect(margin, margin - 10, contentWidth, 1.5, 'F');

    // Header label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('E-COURSE AI  //  OFFLINE CURRICULUM SYLLABUS', margin, margin - 5);

    // Running footer
    doc.text(`E-Course AI Learning OS  |  ${course.title.toUpperCase()}`, margin, pageHeight - 10);
    doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  };

  const checkNewPage = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - margin - 10) {
      doc.addPage();
      pageCount++;
      y = margin + 10;
      drawPageDecorations(pageCount);
    }
  };

  // 1. First Page Decorations
  drawPageDecorations(pageCount);

  // 2. Document Title Block
  y = margin + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(17, 17, 19); // Deep charcoal
  const titleLines = doc.splitTextToSize(course.title.toUpperCase(), contentWidth);
  doc.text(titleLines, margin, y);
  y += (titleLines.length * 8) + 3;

  // Subtitle
  if (course.subtitle) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    const subtitleLines = doc.splitTextToSize(course.subtitle, contentWidth);
    doc.text(subtitleLines, margin, y);
    y += (subtitleLines.length * 5) + 4;
  }

  // Accent Line separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 8;

  // 3. Metadata box (Difficulty, Est Time, Resource Name)
  checkNewPage(24);
  doc.setFillColor(248, 247, 244); // Off-white / Cream background
  doc.rect(margin, y, contentWidth, 20, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.rect(margin, y, contentWidth, 20, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text('DIFFICULTY', margin + 6, y + 6);
  doc.text('ESTIMATED TIME', margin + 45, y + 6);
  doc.text('INGESTED SOURCE', margin + 95, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 17, 19);
  doc.text(course.difficulty.toUpperCase(), margin + 6, y + 13);
  doc.text(course.estimatedTime.toUpperCase(), margin + 45, y + 13);
  
  const sourceName = (course.pdfName || 'Course Context Document').toUpperCase();
  doc.text(sourceName, margin + 95, y + 13, { maxWidth: contentWidth - 100 });

  y += 28;

  // 4. Description Section
  checkNewPage(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 17, 19);
  doc.text('COURSE DESCRIPTION & COGNITIVE SUMMARY', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 60, 60);
  const descLines = doc.splitTextToSize(course.description, contentWidth);
  doc.text(descLines, margin, y);
  y += (descLines.length * 5) + 8;

  // 5. Learning Objectives
  if (course.learningObjectives && course.learningObjectives.length > 0) {
    checkNewPage(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(17, 17, 19);
    doc.text('LEARNING OBJECTIVES', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    course.learningObjectives.forEach((obj) => {
      const objLines = doc.splitTextToSize(`•  ${obj}`, contentWidth - 4);
      checkNewPage(objLines.length * 5 + 2);
      doc.text(objLines, margin + 2, y);
      y += (objLines.length * 5) + 1.5;
    });
    y += 6;
  }

  // 6. Core Skills metrics
  if (course.skillsLearned && course.skillsLearned.length > 0) {
    checkNewPage(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(17, 17, 19);
    doc.text('CORE SKILLS METRICS', margin, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(17, 17, 19);

    let badgeX = margin;
    course.skillsLearned.forEach((skill) => {
      const txt = `[ ${skill.toUpperCase()} ]`;
      const txtWidth = doc.getTextWidth(txt);
      if (badgeX + txtWidth > margin + contentWidth) {
        badgeX = margin;
        y += 6;
        checkNewPage(10);
      }
      doc.text(txt, badgeX, y);
      badgeX += txtWidth + 4;
    });
    y += 12;
  }

  // 7. Syllabus Chapters & Lessons Outline
  checkNewPage(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(17, 17, 19);
  doc.text('DETAILED CURRICULUM OUTLINE', margin, y);
  y += 8;

  course.chapters.forEach((chapter, chIdx) => {
    checkNewPage(35);

    // Chapter Header Banner
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(17, 17, 19);
    doc.text(`CHAPTER ${chIdx + 1}: ${chapter.title.toUpperCase()}`, margin + 3, y + 5.5);
    y += 12;

    // Chapter description
    if (chapter.description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const chDescLines = doc.splitTextToSize(chapter.description, contentWidth - 6);
      doc.text(chDescLines, margin + 3, y);
      y += (chDescLines.length * 4.5) + 5;
    }

    // Lessons list
    chapter.lessons.forEach((lesson, lesIdx) => {
      checkNewPage(12);

      // Lesson bullet
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(17, 17, 19);
      doc.text(`${chIdx + 1}.${lesIdx + 1}  ${lesson.title.toUpperCase()}`, margin + 4, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(120, 120, 120);
      doc.text(lesson.readingTime || '10 min', margin + contentWidth - 4, y, { align: 'right' });
      y += 6;
    });

    y += 4; // space after chapter
  });

  // Save the complete Syllabus
  const safeTitle = course.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  doc.save(`${safeTitle}_syllabus_outline.pdf`);
}

/**
 * Formats and exports a specific lesson's content as a clean PDF study sheet.
 */
export function exportLessonPDF(course: Course, lesson: Lesson) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);

  let y = margin;
  let pageCount = 1;

  // Header / Footer decoration helper
  const drawPageDecorations = (pageNumber: number) => {
    // Top border accent (Amber)
    doc.setFillColor(255, 215, 0); // #FFD700
    doc.rect(margin, margin - 10, contentWidth, 1.5, 'F');

    // Header label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`E-COURSE AI  //  OFFLINE STUDENT TEXTBOOK`, margin, margin - 5);

    // Running footer
    doc.text(`E-Course AI Learning OS  |  ${course.title.toUpperCase()}`, margin, pageHeight - 10);
    doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  };

  const checkNewPage = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - margin - 10) {
      doc.addPage();
      pageCount++;
      y = margin + 10;
      drawPageDecorations(pageCount);
    }
  };

  // Initial setup
  drawPageDecorations(pageCount);

  // Course small parent context tag
  y = margin + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(218, 165, 32); // Golden accent
  doc.text(`COURSE: ${course.title.toUpperCase()}`, margin, y);
  y += 5;

  // Lesson Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(17, 17, 19);
  const titleLines = doc.splitTextToSize(lesson.title.toUpperCase(), contentWidth);
  doc.text(titleLines, margin, y);
  y += (titleLines.length * 8) + 2;

  // Reading time and offline stamp
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(`ESTIMATED STUDY TIME: ${lesson.readingTime || '10 MIN'}  |  DOWNLOADED FOR OFFLINE STUDY`, margin, y);
  y += 5;

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 8;

  // Lesson Body parsing
  const rawContent = lesson.content || 'No lesson material compiled yet. Access the OS terminal or generate this lesson with the Companion AI.';
  
  // Split raw text by newline to render paragraph blocks and heading tags
  const rawLines = rawContent.split('\n');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  rawLines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      y += 3; // blank lines spacing
      return;
    }

    // Custom layout parser for headings vs bullet items vs normal text block
    if (trimmed.startsWith('###')) {
      // H3 heading
      const cleanHeading = cleanMarkdownText(trimmed);
      checkNewPage(12);
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(17, 17, 19);
      doc.text(cleanHeading, margin, y);
      y += 6;
    } else if (trimmed.startsWith('##') || trimmed.startsWith('#')) {
      // H1 or H2 heading
      const cleanHeading = cleanMarkdownText(trimmed);
      checkNewPage(15);
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(218, 165, 32); // Goldenrod heading
      doc.text(cleanHeading, margin, y);
      y += 7;
    } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      // Bullet list item
      const cleanBullet = cleanMarkdownText(trimmed);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const bulletLines = doc.splitTextToSize(`•  ${cleanBullet}`, contentWidth - 4);
      checkNewPage(bulletLines.length * 5 + 1);
      doc.text(bulletLines, margin + 3, y);
      y += (bulletLines.length * 5) + 1;
    } else {
      // Normal text paragraph
      const cleanPara = cleanMarkdownText(trimmed);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const paraLines = doc.splitTextToSize(cleanPara, contentWidth);
      checkNewPage(paraLines.length * 5 + 3);
      doc.text(paraLines, margin, y);
      y += (paraLines.length * 5) + 4;
    }
  });

  // Exercises / Sandbox challenges inclusion
  if (lesson.exercises && lesson.exercises.length > 0) {
    y += 4;
    checkNewPage(30);
    doc.setFillColor(248, 247, 244); // Off-white box
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(17, 17, 19);
    doc.text('PRACTICAL OUTLINE & STUDY CHALLENGES', margin + 3, y + 5);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    lesson.exercises.forEach((ex, idx) => {
      const exLines = doc.splitTextToSize(`${idx + 1}.  ${ex}`, contentWidth - 4);
      checkNewPage(exLines.length * 5 + 2);
      doc.text(exLines, margin + 2, y);
      y += (exLines.length * 5) + 2;
    });
  }

  // Save the lesson PDF
  const safeLessonTitle = lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  doc.save(`${safeLessonTitle}_lesson_note.pdf`);
}
