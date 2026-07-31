/**
 * Explicit icon registry — named imports only, one per icon actually used in the app.
 *
 * The first version of this component imported lucide-react's blanket `icons` map,
 * which pulls in every one of its ~1,500 icons regardless of how many are actually
 * used — that produced a 934KB main bundle in the very first production build of this
 * sprint, directly contradicting the "tree-shakable, one import per icon" claim in
 * docs/build/01-BRAND-SYSTEM.md §5 and the performance budget in
 * docs/build/09-SEO-PERFORMANCE-CHECKLIST.md §5. This file is the fix: only icons
 * listed here ever end up in the bundle.
 *
 * Add a new icon by adding one named import + one map entry — never widen this back to
 * the blanket `icons` object.
 */
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronUp,
  Compass,
  ConciergeBell,
  Cross,
  Eye,
  Factory,
  FileText,
  Flame,
  FlameKindling,
  GraduationCap,
  Hammer,
  Landmark,
  Mail,
  MapPin,
  Menu,
  Package,
  Phone,
  Plane,
  Recycle,
  Server,
  Shield,
  ShieldCheck,
  ShoppingBag,
  SprayCan,
  Target,
  Theater,
  Users,
  Utensils,
  Wrench,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const ICON_REGISTRY: Record<string, LucideIcon> = {
  'arrow-right': ArrowRight,
  'badge-check': BadgeCheck,
  briefcase: Briefcase,
  'building-2': Building2,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  compass: Compass,
  'concierge-bell': ConciergeBell,
  cross: Cross,
  eye: Eye,
  factory: Factory,
  'file-text': FileText,
  flame: Flame,
  'flame-kindling': FlameKindling,
  'graduation-cap': GraduationCap,
  hammer: Hammer,
  landmark: Landmark,
  mail: Mail,
  'map-pin': MapPin,
  menu: Menu,
  package: Package,
  phone: Phone,
  plane: Plane,
  recycle: Recycle,
  server: Server,
  shield: Shield,
  'shield-check': ShieldCheck,
  'shopping-bag': ShoppingBag,
  'spray-can': SprayCan,
  target: Target,
  theater: Theater,
  users: Users,
  utensils: Utensils,
  wrench: Wrench,
  x: X,
  zap: Zap,
};
