import { Patient, Medication, HealthMetric, Prescription, Interaction } from '../models';
import { Op } from 'sequelize';

interface PersonalizationFactors {
  bmi_score: number;
  age_score: number;
  condition_match: number;
  interaction_safety: number;
  contraindication_check: number;
  monitoring_readiness: number;
  allergy_safety: number;
}

interface PersonalizationOutput {
  recommended_medication: any;
  personalization_score: number;
  factors: PersonalizationFactors;
  warnings: string[];
  alternative_medications: any[];
  dosage_recommendation: string;
  monitoring_plan: string;
}

export class PersonalizationEngine {
  /**
   * CORE ALGORITHM: Personalize prescription for a patient
   * 
   * This is the heart of the platform — it analyzes patient health data,
   * medical history, current metrics, and medication profiles to recommend
   * the optimal personalized prescription.
   * 
   * Scoring Breakdown (0-100):
   *   - BMI Compatibility:        25 points
   *   - Age Appropriateness:      15 points
   *   - Condition Match:          20 points
   *   - Drug Interaction Safety:  15 points
   *   - Contraindication Check:   10 points
   *   - Allergy Safety:           10 points
   *   - Monitoring Readiness:      5 points
   */
  static async personalize(patientId: number, targetCondition: string): Promise<PersonalizationOutput> {
    const patient = await Patient.findByPk(patientId, {
      include: [
        { model: HealthMetric, as: 'healthMetrics', limit: 50, order: [['recorded_at', 'DESC']] },
        { model: Prescription, as: 'prescriptions', include: [{ model: Medication, as: 'medication' }] },
      ],
    });

    if (!patient) throw new Error('Patient not found');

    // Get eligible medications for the target condition
    const isWeightLoss = targetCondition.toLowerCase().includes('weight');
    const medications = await Medication.findAll({
      where: isWeightLoss ? { weight_loss_applicable: true } : { category: { [Op.iLike]: `%${targetCondition}%` } },
    });

    if (medications.length === 0) {
      throw new Error(`No medications found for condition: ${targetCondition}`);
    }

    // Score each medication for this patient
    const scored = await Promise.all(
      medications.map(async (med) => {
        const factors = await this.calculateFactors(patient, med);
        const score = this.computeScore(factors);
        const warnings = this.generateWarnings(patient, med, factors);
        return { medication: med, score, factors, warnings };
      })
    );

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    const alternatives = scored.slice(1, 4).map((s) => s.medication);

    return {
      recommended_medication: best.medication,
      personalization_score: best.score,
      factors: best.factors,
      warnings: best.warnings,
      alternative_medications: alternatives,
      dosage_recommendation: this.recommendDosage(patient, best.medication),
      monitoring_plan: this.generateMonitoringPlan(patient, best.medication),
    };
  }

  private static async calculateFactors(patient: any, medication: any): Promise<PersonalizationFactors> {
    const heightM = patient.height_cm / 100;
    const bmi = patient.weight_kg / (heightM * heightM);
    const age = this.calculateAge(patient.date_of_birth);

    // 1. BMI Score (25 pts) — How well does this medication fit the patient's BMI?
    let bmi_score = 25;
    if (medication.min_bmi_threshold && bmi < medication.min_bmi_threshold) {
      bmi_score = Math.max(0, 25 - (medication.min_bmi_threshold - bmi) * 3);
    }
    if (bmi >= 30 && medication.weight_loss_applicable) bmi_score = 25;

    // 2. Age Score (15 pts) — Age-appropriate medication
    let age_score = 15;
    if (age < 18) age_score = 5;
    else if (age > 65) age_score = 10;

    // 3. Condition Match (20 pts)
    const patientConditions = patient.medical_conditions || [];
    const conditionOverlap = medication.contraindications?.filter(
      (c: string) => patientConditions.some((pc: string) => pc.toLowerCase().includes(c.toLowerCase()))
    ) || [];
    const condition_match = conditionOverlap.length > 0 ? Math.max(0, 20 - conditionOverlap.length * 5) : 20;

    // 4. Drug Interaction Safety (15 pts)
    const currentMeds = (patient.prescriptions || [])
      .filter((p: any) => p.status === 'active')
      .map((p: any) => p.medication_id);
    
    let interaction_safety = 15;
    if (currentMeds.length > 0) {
      const interactions = await Interaction.findAll({
        where: {
          [Op.or]: [
            { medication_a_id: medication.id, medication_b_id: { [Op.in]: currentMeds } },
            { medication_b_id: medication.id, medication_a_id: { [Op.in]: currentMeds } },
          ],
        },
      });
      for (const inter of interactions) {
        if (inter.severity === 'contraindicated') interaction_safety -= 15;
        else if (inter.severity === 'severe') interaction_safety -= 10;
        else if (inter.severity === 'moderate') interaction_safety -= 5;
        else interaction_safety -= 2;
      }
      interaction_safety = Math.max(0, interaction_safety);
    }

    // 5. Contraindication Check (10 pts)
    const allergyMatch = (patient.allergies || []).some(
      (allergy: string) => medication.name.toLowerCase().includes(allergy.toLowerCase()) ||
        medication.generic_name.toLowerCase().includes(allergy.toLowerCase())
    );
    const contraindication_check = allergyMatch ? 0 : 10;

    // 6. Allergy Safety (10 pts)
    const allergy_safety = allergyMatch ? 0 : 10;

    // 7. Monitoring Readiness (5 pts)
    const recentMetrics = (patient.healthMetrics || []).filter((m: any) => {
      const daysSince = (Date.now() - new Date(m.recorded_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });
    const monitoring_readiness = medication.requires_monitoring
      ? recentMetrics.length >= 3 ? 5 : recentMetrics.length >= 1 ? 3 : 1
      : 5;

    return {
      bmi_score,
      age_score,
      condition_match,
      interaction_safety,
      contraindication_check,
      monitoring_readiness,
      allergy_safety,
    };
  }

  private static computeScore(factors: PersonalizationFactors): number {
    return parseFloat(
      (
        factors.bmi_score +
        factors.age_score +
        factors.condition_match +
        factors.interaction_safety +
        factors.contraindication_check +
        factors.monitoring_readiness +
        factors.allergy_safety
      ).toFixed(1)
    );
  }

  private static generateWarnings(patient: any, medication: any, factors: PersonalizationFactors): string[] {
    const warnings: string[] = [];
    if (factors.interaction_safety < 10) warnings.push('Potential drug interactions detected with current medications');
    if (factors.contraindication_check === 0) warnings.push('Patient has allergies matching this medication');
    if (factors.bmi_score < 15) warnings.push('BMI may not meet minimum threshold for this medication');
    if (factors.age_score < 10) warnings.push('Age-related dosage adjustment may be needed');
    if (factors.monitoring_readiness < 3) warnings.push('Insufficient recent health metrics — monitoring recommended before starting');
    if (medication.requires_monitoring) warnings.push('This medication requires regular monitoring');
    return warnings;
  }

  private static recommendDosage(patient: any, medication: any): string {
    const heightM = patient.height_cm / 100;
    const bmi = patient.weight_kg / (heightM * heightM);
    const forms = medication.dosage_forms || [];
    const form = forms[0] || 'tablet';

    if (medication.name.toLowerCase().includes('semaglutide')) {
      if (bmi >= 40) return `Start with 0.25mg ${form} weekly for 4 weeks, then escalate to 0.5mg weekly`;
      if (bmi >= 35) return `Start with 0.25mg ${form} weekly for 4 weeks, then 0.5mg weekly`;
      return `Start with 0.25mg ${form} weekly for 4 weeks, gradual titration per response`;
    }

    if (bmi >= 35) return `Standard dose ${form}, consider higher end of therapeutic range`;
    return `Standard dose ${form}, titrate based on response and tolerance`;
  }

  private static generateMonitoringPlan(patient: any, medication: any): string {
    const plans: string[] = ['Baseline health metrics before starting'];

    if (medication.requires_monitoring) {
      plans.push('Weekly weight tracking');
      plans.push('Monthly blood pressure check');
      plans.push('Blood work at 4 weeks and 12 weeks');
      plans.push('Regular assessment of side effects');
    }

    plans.push('Follow-up appointment at 2 weeks');
    plans.push('Comprehensive review at 3 months');

    return plans.join('. ') + '.';
  }

  private static calculateAge(dob: Date | string): number {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  /**
   * Generate weight progress report for a patient
   */
  static async weightProgress(patientId: number, goalWeight: number) {
    const patient = await Patient.findByPk(patientId, {
      include: [{ model: HealthMetric, as: 'healthMetrics', where: { metric_type: 'weight' }, order: [['recorded_at', 'ASC']], required: false }],
    });

    if (!patient) throw new Error('Patient not found');

    const metrics = (patient as any).healthMetrics || [];
    const weights = metrics.map((m: any) => m.value);
    const startingWeight = weights.length > 0 ? weights[0] : patient.weight_kg;
    const currentWeight = weights.length > 0 ? weights[weights.length - 1] : patient.weight_kg;
    const weightLost = startingWeight - currentWeight;
    const totalToLose = startingWeight - goalWeight;
    const percentToGoal = totalToLose > 0 ? Math.min(100, (weightLost / totalToLose) * 100) : 0;

    // Weekly trend (last 8 data points)
    const weeklyTrend = weights.slice(-8);

    // Project goal date based on average weekly loss
    let projectedGoalDate: string | null = null;
    if (weights.length >= 2) {
      const weeksBetween = metrics.length > 1
        ? (new Date(metrics[metrics.length - 1].recorded_at).getTime() - new Date(metrics[0].recorded_at).getTime()) / (7 * 24 * 60 * 60 * 1000)
        : 1;
      const avgWeeklyLoss = weightLost / Math.max(weeksBetween, 1);
      if (avgWeeklyLoss > 0) {
        const remainingKg = currentWeight - goalWeight;
        const weeksLeft = remainingKg / avgWeeklyLoss;
        const goalDate = new Date();
        goalDate.setDate(goalDate.getDate() + weeksLeft * 7);
        projectedGoalDate = goalDate.toISOString().split('T')[0];
      }
    }

    let recommendation = '';
    if (currentWeight <= goalWeight) recommendation = 'Goal achieved! Transition to maintenance phase.';
    else if (percentToGoal >= 75) recommendation = 'Excellent progress! Stay on current regimen.';
    else if (percentToGoal >= 50) recommendation = 'Good progress. Consider adjusting dosage for optimal results.';
    else if (percentToGoal >= 25) recommendation = 'Moderate progress. Review diet and exercise adherence.';
    else recommendation = 'Early stage — continue current plan and monitor closely.';

    return {
      patient,
      starting_weight: startingWeight,
      current_weight: currentWeight,
      goal_weight: goalWeight,
      weight_lost: parseFloat(weightLost.toFixed(1)),
      percent_to_goal: parseFloat(percentToGoal.toFixed(1)),
      weekly_trend: weeklyTrend,
      projected_goal_date: projectedGoalDate,
      recommendation,
    };
  }
}
