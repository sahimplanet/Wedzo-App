import { GoalPriority } from '../types';

export interface GoalTemplate {
  id: string;
  name: string;
  category: string;
  defaultTargetKES: number;
  priority: GoalPriority;
  description: string;
  icon: string;
}

export const SUGGESTED_GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: 'tpl-smartphone',
    name: 'Buy a Smartphone',
    category: 'tech',
    defaultTargetKES: 35000,
    priority: 'medium',
    description: 'Save for an updated smartphone for work, communication, and banking.',
    icon: 'Smartphone',
  },
  {
    id: 'tpl-card',
    name: 'Buy a Bank Card & Cover Card Expenses',
    category: 'banking',
    defaultTargetKES: 5000,
    priority: 'low',
    description: 'Cover debit card issuance fees, annual maintenance, and emergency card wallet.',
    icon: 'CreditCard',
  },
  {
    id: 'tpl-laptop',
    name: 'Buy a Laptop',
    category: 'tech',
    defaultTargetKES: 65000,
    priority: 'medium',
    description: 'Work or study laptop with reliable performance and battery life.',
    icon: 'Laptop',
  },
  {
    id: 'tpl-house',
    name: 'Buy a House',
    category: 'property',
    defaultTargetKES: 3500000,
    priority: 'high',
    description: 'Long-term home ownership down payment and closing costs.',
    icon: 'Home',
  },
  {
    id: 'tpl-school-fees',
    name: 'Pay School Fees',
    category: 'education',
    defaultTargetKES: 55000,
    priority: 'high',
    description: 'Term tuition, books, uniform, and school transport expenses.',
    icon: 'GraduationCap',
  },
  {
    id: 'tpl-business',
    name: 'Start a Business',
    category: 'career',
    defaultTargetKES: 150000,
    priority: 'high',
    description: 'Seed capital, stock purchase, and business registration.',
    icon: 'Briefcase',
  },
  {
    id: 'tpl-emergency',
    name: 'Emergency Fund',
    category: 'safety',
    defaultTargetKES: 100000,
    priority: 'high',
    description: '3 to 6 months of living expenses for peace of mind.',
    icon: 'ShieldAlert',
  },
  {
    id: 'tpl-land',
    name: 'Buy Land',
    category: 'property',
    defaultTargetKES: 1200000,
    priority: 'high',
    description: 'Quarter-acre or plot deposit and title deed processing.',
    icon: 'MapPin',
  },
  {
    id: 'tpl-transport',
    name: 'Save for Transport',
    category: 'mobility',
    defaultTargetKES: 25000,
    priority: 'medium',
    description: 'Monthly commuter pass, vehicle servicing, or motorbike deposit.',
    icon: 'Car',
  },
  {
    id: 'tpl-rent',
    name: 'Pay Rent Reserve',
    category: 'housing',
    defaultTargetKES: 45000,
    priority: 'high',
    description: 'Keep 2-3 months rent ahead of schedule to avoid eviction worries.',
    icon: 'Key',
  },
  {
    id: 'tpl-travel',
    name: 'Travel & Holiday',
    category: 'lifestyle',
    defaultTargetKES: 80000,
    priority: 'low',
    description: 'Coast vacation, safari trip, or family holiday celebration.',
    icon: 'Plane',
  },
  {
    id: 'tpl-household',
    name: 'Buy Household Items',
    category: 'living',
    defaultTargetKES: 40000,
    priority: 'medium',
    description: 'Cooker, refrigerator, water dispenser, or solar backup installation.',
    icon: 'Tv',
  },
  {
    id: 'tpl-custom',
    name: 'Custom Goal',
    category: 'custom',
    defaultTargetKES: 20000,
    priority: 'medium',
    description: 'Define your own personal financial milestone.',
    icon: 'Sparkles',
  },
];
