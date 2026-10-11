import { SavingsGoal, GoalAllocationItem } from '../types';

export interface AllocationCalculationResult {
  allocations: GoalAllocationItem[];
  totalAllocated: number;
  unallocatedAmount: number;
  completedGoalIds: string[];
  explanation: string;
}

/**
 * Calculates allocation of verified money across active savings goals
 */
export function calculateAllocations(
  amount: number,
  goals: SavingsGoal[],
  mode: 'equal' | 'percentage' = 'equal',
  customPercentages?: Record<string, number>
): AllocationCalculationResult {
  if (amount <= 0 || !goals || goals.length === 0) {
    return {
      allocations: [],
      totalAllocated: 0,
      unallocatedAmount: Math.max(0, amount),
      completedGoalIds: [],
      explanation: 'No active eligible goals found. Amount placed into general savings reserve.',
    };
  }

  // Filter only active goals with remaining capacity
  const eligibleGoals = goals.filter(
    (g) => g.status === 'active' && g.currentVerifiedSaved < g.targetAmount
  );

  if (eligibleGoals.length === 0) {
    return {
      allocations: [],
      totalAllocated: 0,
      unallocatedAmount: amount,
      completedGoalIds: [],
      explanation: 'All active goals are already 100% completed or paused! Full amount saved to unallocated balance.',
    };
  }

  // Single goal case: gets full eligible amount up to target
  if (eligibleGoals.length === 1) {
    const singleGoal = eligibleGoals[0];
    const remaining = singleGoal.targetAmount - singleGoal.currentVerifiedSaved;
    const allocated = Math.min(amount, remaining);
    const unallocated = amount - allocated;
    const isCompleted = singleGoal.currentVerifiedSaved + allocated >= singleGoal.targetAmount;

    return {
      allocations: [
        {
          goalId: singleGoal.id,
          goalName: singleGoal.name,
          amount: allocated,
          percentage: 100,
          priorSaved: singleGoal.currentVerifiedSaved,
          newSaved: singleGoal.currentVerifiedSaved + allocated,
          isCompletedAfter: isCompleted,
        },
      ],
      totalAllocated: allocated,
      unallocatedAmount: unallocated,
      completedGoalIds: isCompleted ? [singleGoal.id] : [],
      explanation: `Single active goal "${singleGoal.name}" allocated ${allocated.toLocaleString()} KES${
        unallocated > 0 ? ` (Target reached! ${unallocated.toLocaleString()} KES placed in unallocated reserve)` : ''
      }.`,
    };
  }

  let remainingToDistribute = amount;
  const allocations: GoalAllocationItem[] = [];
  const completedIds: string[] = [];

  if (mode === 'percentage' && customPercentages) {
    // Mode B: Percentage allocation
    // Normalize percentages among eligible goals
    let totalConfiguredPct = 0;
    eligibleGoals.forEach((g) => {
      totalConfiguredPct += customPercentages[g.id] || 0;
    });

    eligibleGoals.forEach((goal) => {
      if (remainingToDistribute <= 0) return;

      const rawPct = customPercentages[goal.id] || (100 / eligibleGoals.length);
      const normalizedPct = totalConfiguredPct > 0 ? (rawPct / totalConfiguredPct) * 100 : 100 / eligibleGoals.length;
      const targetAllocation = Math.floor((amount * normalizedPct) / 100);

      const remainingCap = goal.targetAmount - goal.currentVerifiedSaved;
      const actualAlloc = Math.min(targetAllocation, remainingCap, remainingToDistribute);

      if (actualAlloc > 0) {
        remainingToDistribute -= actualAlloc;
        const isComplete = goal.currentVerifiedSaved + actualAlloc >= goal.targetAmount;
        if (isComplete) completedIds.push(goal.id);

        allocations.push({
          goalId: goal.id,
          goalName: goal.name,
          amount: actualAlloc,
          percentage: Math.round(normalizedPct),
          priorSaved: goal.currentVerifiedSaved,
          newSaved: goal.currentVerifiedSaved + actualAlloc,
          isCompletedAfter: isComplete,
        });
      }
    });

    // If there's surplus due to capping, redistribute to remaining eligible goals
    if (remainingToDistribute > 0) {
      for (const alloc of allocations) {
        if (remainingToDistribute <= 0) break;
        const goal = eligibleGoals.find((g) => g.id === alloc.goalId);
        if (!goal) continue;
        const extraCap = goal.targetAmount - alloc.newSaved;
        if (extraCap > 0) {
          const addOn = Math.min(extraCap, remainingToDistribute);
          alloc.amount += addOn;
          alloc.newSaved += addOn;
          remainingToDistribute -= addOn;
          if (alloc.newSaved >= goal.targetAmount && !completedIds.includes(goal.id)) {
            completedIds.push(goal.id);
            alloc.isCompletedAfter = true;
          }
        }
      }
    }
  } else {
    // Mode A: Equal allocation
    const splitBase = Math.floor(amount / eligibleGoals.length);

    eligibleGoals.forEach((goal) => {
      const remainingCap = goal.targetAmount - goal.currentVerifiedSaved;
      const actualAlloc = Math.min(splitBase, remainingCap, remainingToDistribute);

      if (actualAlloc > 0) {
        remainingToDistribute -= actualAlloc;
        const isComplete = goal.currentVerifiedSaved + actualAlloc >= goal.targetAmount;
        if (isComplete) completedIds.push(goal.id);

        allocations.push({
          goalId: goal.id,
          goalName: goal.name,
          amount: actualAlloc,
          percentage: Math.round((actualAlloc / amount) * 100),
          priorSaved: goal.currentVerifiedSaved,
          newSaved: goal.currentVerifiedSaved + actualAlloc,
          isCompletedAfter: isComplete,
        });
      }
    });

    // Redistribute leftover from capped goals across remaining goals with room
    if (remainingToDistribute > 0) {
      for (const alloc of allocations) {
        if (remainingToDistribute <= 0) break;
        const goal = eligibleGoals.find((g) => g.id === alloc.goalId);
        if (!goal) continue;
        const extraRoom = goal.targetAmount - alloc.newSaved;
        if (extraRoom > 0) {
          const addOn = Math.min(extraRoom, remainingToDistribute);
          alloc.amount += addOn;
          alloc.newSaved += addOn;
          remainingToDistribute -= addOn;
          if (alloc.newSaved >= goal.targetAmount && !completedIds.includes(goal.id)) {
            completedIds.push(goal.id);
            alloc.isCompletedAfter = true;
          }
        }
      }
    }
  }

  const totalAllocated = amount - remainingToDistribute;

  return {
    allocations,
    totalAllocated,
    unallocatedAmount: remainingToDistribute,
    completedGoalIds: completedIds,
    explanation: `Distributed ${totalAllocated.toLocaleString()} KES across ${allocations.length} active goals.${
      remainingToDistribute > 0 ? ` ${remainingToDistribute.toLocaleString()} KES placed in unallocated reserve because goals reached capacity.` : ''
    }`,
  };
}
