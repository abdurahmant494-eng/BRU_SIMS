/**
 * Borana University Academic Regulations & Grading Engine
 * Aligned with the national Ethiopian Higher Education Proclamation & Borana University Senate Legislation.
 */

import { AcademicStatus } from '../types';

export interface GradeScaleTier {
  min: number;
  max: number;
  letter: string;
  gradePoint: number;
  description: string;
}

export const BORANA_UNIVERSITY_GRADING_SCALE: GradeScaleTier[] = [
  { min: 90, max: 100, letter: 'A+', gradePoint: 4.0, description: 'Excellent / Distinction' },
  { min: 85, max: 89.99, letter: 'A', gradePoint: 4.0, description: 'Excellent' },
  { min: 80, max: 84.99, letter: 'A-', gradePoint: 3.75, description: 'Very Good' },
  { min: 75, max: 79.99, letter: 'B+', gradePoint: 3.5, description: 'Good' },
  { min: 70, max: 74.99, letter: 'B', gradePoint: 3.0, description: 'Satisfactory' },
  { min: 65, max: 69.99, letter: 'B-', gradePoint: 2.75, description: 'Fair' },
  { min: 60, max: 64.99, letter: 'C+', gradePoint: 2.5, description: 'Adequate' },
  { min: 50, max: 59.99, letter: 'C', gradePoint: 2.0, description: 'Pass' },
  { min: 45, max: 49.99, letter: 'C-', gradePoint: 1.5, description: 'Conditional Pass' },
  { min: 40, max: 44.99, letter: 'D', gradePoint: 1.0, description: 'Poor / Borderline' },
  { min: 0, max: 39.99, letter: 'F', gradePoint: 0.0, description: 'Fail' },
];

/**
 * Calculates letter grade and grade point from a total numeric mark (0-100)
 */
export function calculateGrade(totalMark: number): { letterGrade: string; gradePoint: number; description: string } {
  const rounded = Math.round(totalMark * 10) / 10;
  for (const tier of BORANA_UNIVERSITY_GRADING_SCALE) {
    if (rounded >= tier.min && rounded <= tier.max) {
      return {
        letterGrade: tier.letter,
        gradePoint: tier.gradePoint,
        description: tier.description,
      };
    }
  }
  return { letterGrade: 'F', gradePoint: 0.0, description: 'Fail' };
}

export interface CourseGradeItem {
  creditHours: number;
  gradePoint: number;
  letterGrade: string;
}

/**
 * Computes Semester GPA
 */
export function calculateSemesterGPA(courses: CourseGradeItem[]): { gpa: number; totalCredits: number } {
  let totalQualityPoints = 0;
  let totalCredits = 0;

  for (const course of courses) {
    if (course.creditHours > 0) {
      totalQualityPoints += course.creditHours * course.gradePoint;
      totalCredits += course.creditHours;
    }
  }

  const gpa = totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0.0;
  return { gpa, totalCredits };
}

/**
 * Evaluates academic standing based on Borana University Senate Legislation rules
 */
export function evaluateAcademicStanding(cgpa: number, currentSemesterGPA?: number): {
  status: AcademicStatus;
  standingLabel: string;
  supportNeeded: boolean;
  notes: string;
} {
  if (cgpa >= 3.8) {
    return {
      status: 'Active',
      standingLabel: 'Very High Distinction (Dean\'s List)',
      supportNeeded: false,
      notes: 'Exceptional academic standing. Eligible for honors recognition.',
    };
  }
  if (cgpa >= 3.5) {
    return {
      status: 'Active',
      standingLabel: 'Distinction (Honor Roll)',
      supportNeeded: false,
      notes: 'Excellent academic performance.',
    };
  }
  if (cgpa >= 2.0) {
    return {
      status: 'Active',
      standingLabel: 'Good Standing',
      supportNeeded: false,
      notes: 'Satisfactory progress towards degree completion.',
    };
  }
  if (cgpa >= 1.75) {
    return {
      status: 'Academic Warning',
      standingLabel: 'Academic Warning',
      supportNeeded: true,
      notes: 'CGPA is below the minimum graduation standard (2.00). Academic tutoring & faculty counseling advised.',
    };
  }
  if (cgpa >= 1.5) {
    return {
      status: 'Academic Probation',
      standingLabel: 'Academic Probation',
      supportNeeded: true,
      notes: 'Placed on official probation. Course load restricted to maximum 12 credit hours until standing improves.',
    };
  }
  return {
    status: 'Suspended',
    standingLabel: 'Academic Dismissal / Suspension Review',
    supportNeeded: true,
    notes: 'CGPA below 1.50 triggers formal Academic Commission review for suspension.',
  };
}

/**
 * Evaluates graduation eligibility for Borana University degree programs
 */
export function evaluateGraduationEligibility(params: {
  cgpa: number;
  creditsEarned: number;
  requiredCredits: number;
  hasFailingGrade: boolean;
  hasIncomplete: boolean;
}): {
  eligible: boolean;
  reasons: string[];
  classification: string;
} {
  const reasons: string[] = [];
  let eligible = true;

  if (params.cgpa < 2.0) {
    eligible = false;
    reasons.push(`CGPA (${params.cgpa.toFixed(2)}) is below the minimum graduation requirement of 2.00.`);
  }

  if (params.creditsEarned < params.requiredCredits) {
    eligible = false;
    reasons.push(`Credits completed (${params.creditsEarned}) are less than required (${params.requiredCredits}).`);
  }

  if (params.hasFailingGrade) {
    eligible = false;
    reasons.push('Contains unrepeated or un-cleared F grades in mandatory coursework.');
  }

  if (params.hasIncomplete) {
    eligible = false;
    reasons.push('Has pending Incomplete (I) or un-submitted course grades.');
  }

  let classification = 'Standard Pass';
  if (params.cgpa >= 3.8) classification = 'Very High Distinction';
  else if (params.cgpa >= 3.5) classification = 'Distinction';
  else if (params.cgpa >= 3.0) classification = 'Very Good';
  else if (params.cgpa >= 2.5) classification = 'Good';

  if (eligible) {
    reasons.push('All institutional, department, and academic senate requirements fulfilled.');
  }

  return { eligible, reasons, classification };
}
