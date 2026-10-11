import React, { useState } from 'react';
import { 
  Plus, 
  Target, 
  Sparkles, 
  PauseCircle, 
  PlayCircle, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Clock, 
  Info, 
  ChevronRight, 
  Smartphone, 
  CreditCard, 
  Laptop, 
  Home, 
  GraduationCap, 
  Briefcase, 
  ShieldAlert, 
  MapPin, 
  Car, 
  Key, 
  Plane, 
  Tv, 
  AlertCircle,
  X
} from 'lucide-react';
import { SavingsGoal, GoalPriority, GoalStatus } from '../types';
import { SUGGESTED_GOAL_TEMPLATES, GoalTemplate } from '../utils/goalTemplates';
import { formatMoney, APP_NAME } from '../utils/currency';

interface GoalsViewProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Partial<SavingsGoal>) => void;
  onUpdateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  onDeleteGoal: (id: string) => void;
  theme?: 'dark' | 'light';
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Smartphone,
  CreditCard,
  Laptop,
  Home,
  GraduationCap,
  Briefcase,
  ShieldAlert,
  MapPin,
  Car,
  Key,
  Plane,
  Tv,
  Sparkles,
};

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [selectedGoalDetail, setSelectedGoalDetail] = useState<SavingsGoal | null>(null);

  // Form states for Create/Edit
  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formPriority, setFormPriority] = useState<GoalPriority>('medium');
  const [formDeadline, setFormDeadline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('Target');

  // Filter tab
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');

  const openCreateModal = (template?: GoalTemplate) => {
    if (template) {
      setFormName(template.name);
      setFormTarget(template.defaultTargetKES.toString());
      setFormPriority(template.priority);
      setFormDescription(template.description);
      setFormIcon(template.icon);
    } else {
      setFormName('');
      setFormTarget('');
      setFormPriority('medium');
      setFormDescription('');
      setFormIcon('Target');
    }
    setEditingGoal(null);
    setFormDeadline(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIsTemplateModalOpen(false);
    setIsCreateEditModalOpen(true);
  };

  const openEditModal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setFormName(goal.name);
    setFormTarget(goal.targetAmount.toString());
    setFormPriority(goal.priority);
    setFormDeadline(goal.deadline || '');
    setFormDescription(goal.description || '');
    setFormIcon(goal.iconName || 'Target');
    setIsCreateEditModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTarget || Number(formTarget) <= 0) return;

    const targetVal = Number(formTarget);

    if (editingGoal) {
      const remaining = Math.max(0, targetVal - editingGoal.currentVerifiedSaved);
      const progress = Math.min(100, Math.round((editingGoal.currentVerifiedSaved / targetVal) * 100));
      onUpdateGoal(editingGoal.id, {
        name: formName.trim(),
        targetAmount: targetVal,
        priority: formPriority,
        deadline: formDeadline,
        description: formDescription,
        remainingAmount: remaining,
        progressPercentage: progress,
        status: progress >= 100 ? 'completed' : editingGoal.status,
      });
    } else {
      onAddGoal({
        name: formName.trim(),
        targetAmount: targetVal,
        currency: 'KES',
        priority: formPriority,
        deadline: formDeadline,
        description: formDescription,
        iconName: formIcon,
        currentVerifiedSaved: 0,
        remainingAmount: targetVal,
        progressPercentage: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    }

    setIsCreateEditModalOpen(false);
  };

  const filteredGoals = goals.filter((g) => {
    if (statusFilter === 'all') return true;
    return g.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Savings Goals</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              {goals.length} Goals
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Create multi-tier goals for rent, electronics, school fees, or property. Auto-allocation stops when a goal reaches 100% and redistributes excess funds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-300 bg-slate-100 text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Suggested Templates</span>
          </button>

          <button
            type="button"
            onClick={() => openCreateModal()}
            className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Custom Goal</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {(['all', 'active', 'completed', 'paused'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-full font-semibold capitalize transition-all ${
              statusFilter === tab
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : isDark ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {tab} ({goals.filter((g) => tab === 'all' || g.status === tab).length})
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-base text-white mb-1">No goals in this section</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Pick from ready-made templates like Buy a House, Laptop, or School Fees to jumpstart your savings.
          </p>
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
          >
            Explore 13 Suggested Goals
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => {
            const IconComponent = ICON_MAP[goal.iconName || 'Target'] || Target;
            const isCompleted = goal.status === 'completed' || goal.currentVerifiedSaved >= goal.targetAmount;
            const isPaused = goal.status === 'paused';

            return (
              <div
                key={goal.id}
                className={`p-5 rounded-3xl border transition-all relative flex flex-col justify-between ${
                  isCompleted
                    ? 'border-emerald-500/50 bg-emerald-950/20 shadow-md shadow-emerald-500/5'
                    : isPaused
                    ? 'border-slate-800/60 bg-slate-900/40 opacity-75'
                    : isDark ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  {/* Top card pill & actions */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        goal.priority === 'high' 
                          ? 'bg-rose-500/20 text-rose-300' 
                          : goal.priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-500/20 text-slate-300'
                      }`}>
                        {goal.priority} priority
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>100% Goal Met</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onUpdateGoal(goal.id, { status: isPaused ? 'active' : 'paused' })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                          title={isPaused ? 'Resume auto-allocation' : 'Pause auto-allocation'}
                        >
                          {isPaused ? <PlayCircle className="w-4 h-4 text-emerald-400" /> : <PauseCircle className="w-4 h-4 text-amber-400" />}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openEditModal(goal)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="Edit goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Goal Name & Description */}
                  <h3 className="font-extrabold text-base text-white mb-1 leading-snug">{goal.name}</h3>
                  {goal.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{goal.description}</p>
                  )}

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between mb-1.5 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">Verified Saved</span>
                      <span className="text-base font-extrabold text-emerald-400">
                        {formatMoney(goal.currentVerifiedSaved, goal.currency)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">Target</span>
                      <span className="text-xs font-semibold text-slate-300">
                        {formatMoney(goal.targetAmount, goal.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-emerald-400' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{goal.progressPercentage}% reached</span>
                    <span>
                      {goal.remainingAmount > 0 
                        ? `${formatMoney(goal.remainingAmount, goal.currency)} to go` 
                        : 'Fully funded!'}
                    </span>
                  </div>
                </div>

                {/* Bottom link to details modal */}
                <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between">
                  {goal.deadline ? (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Due: {goal.deadline}</span>
                    </div>
                  ) : <div />}

                  <button
                    type="button"
                    onClick={() => setSelectedGoalDetail(goal)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: SUGGESTED GOAL TEMPLATES */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`max-w-2xl w-full p-6 sm:p-8 rounded-3xl border shadow-2xl max-h-[90vh] flex flex-col ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-black text-white">Suggested Goal Templates</h3>
                <p className="text-xs text-slate-400">Select any template to customize target amounts and deadlines.</p>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-2.5 flex-1 pr-1">
              {SUGGESTED_GOAL_TEMPLATES.map((tpl) => {
                const IconComponent = ICON_MAP[tpl.icon] || Target;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => openCreateModal(tpl)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                      isDark ? 'border-slate-800 bg-slate-950/60 hover:border-emerald-500 hover:bg-emerald-500/5' : 'border-slate-200 bg-slate-50 hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                            {tpl.name}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-1.5 rounded ${
                            tpl.priority === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-500/20 text-slate-300'
                          }`}>
                            {tpl.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{tpl.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <span className="text-xs font-mono font-bold text-emerald-400 block">
                        {formatMoney(tpl.defaultTargetKES, 'KES', 0)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">Recommended</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE OR EDIT GOAL */}
      {isCreateEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`max-w-md w-full p-6 sm:p-8 rounded-3xl border shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-black text-white">
                {editingGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
              </h3>
              <button
                onClick={() => setIsCreateEditModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Goal Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Buy a Laptop, December Vacation"
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs border outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Amount (KES)</label>
                <input
                  type="number"
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  placeholder="e.g. 50000"
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-mono font-bold border outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as GoalPriority)}
                    className={`w-full px-3 py-2.5 rounded-2xl text-xs border outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                    }`}
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-2xl text-xs border outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description (Optional)</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Notes about vendors, specs, or commitments..."
                  className={`w-full px-3.5 py-2 rounded-2xl text-xs border outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateEditModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                >
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: GOAL DETAILS SCREEN */}
      {selectedGoalDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`max-w-lg w-full p-6 sm:p-8 rounded-3xl border shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">{selectedGoalDetail.name}</h3>
              </div>
              <button
                onClick={() => setSelectedGoalDetail(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Progress Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 font-mono text-[11px]">Funding Completion</span>
                  <span className="font-bold text-emerald-400">{selectedGoalDetail.progressPercentage}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden mb-3">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${Math.min(100, selectedGoalDetail.progressPercentage)}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Verified Saved</span>
                    <div className="font-mono font-bold text-sm text-white">
                      {formatMoney(selectedGoalDetail.currentVerifiedSaved, selectedGoalDetail.currency)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Target Amount</span>
                    <div className="font-mono font-bold text-sm text-white">
                      {formatMoney(selectedGoalDetail.targetAmount, selectedGoalDetail.currency)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Allocation Policy Details */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Status:</span>
                  <span className="font-bold text-emerald-400 capitalize">{selectedGoalDetail.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Allocation Priority:</span>
                  <span className="font-bold text-white capitalize">{selectedGoalDetail.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Deadline:</span>
                  <span className="font-mono text-slate-200">{selectedGoalDetail.deadline || 'No deadline'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Creation Date:</span>
                  <span className="font-mono text-slate-200">{selectedGoalDetail.createdAt.split('T')[0]}</span>
                </div>
              </div>

              {selectedGoalDetail.description && (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-300">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Description</span>
                  <p>{selectedGoalDetail.description}</p>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {APP_NAME} allocation engine guarantees this goal will not exceed {formatMoney(selectedGoalDetail.targetAmount, selectedGoalDetail.currency)}. Future savings automatically redistribute to other goals.
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedGoalDetail(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
