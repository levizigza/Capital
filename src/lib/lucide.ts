import type { ComponentType, SVGProps } from "react";

// A very small shim layer to avoid importing from the lucide-react barrel,
// which can cause bundlers to touch many icon modules.
//
// Each lucide icon module exports a default React component.

export type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

import Activity from "lucide-react/dist/esm/icons/activity";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up";
import House from "lucide-react/dist/esm/icons/house";
import Award from "lucide-react/dist/esm/icons/award";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Bitcoin from "lucide-react/dist/esm/icons/bitcoin";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Brain from "lucide-react/dist/esm/icons/brain";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Clock from "lucide-react/dist/esm/icons/clock";
import Code from "lucide-react/dist/esm/icons/code";
import Coins from "lucide-react/dist/esm/icons/coins";
import Compass from "lucide-react/dist/esm/icons/compass";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Download from "lucide-react/dist/esm/icons/download";
import Eye from "lucide-react/dist/esm/icons/eye";
import Filter from "lucide-react/dist/esm/icons/filter";
import Fire from "lucide-react/dist/esm/icons/flame";
import Flag from "lucide-react/dist/esm/icons/flag";
import Gamepad2 from "lucide-react/dist/esm/icons/gamepad-2";
import Heart from "lucide-react/dist/esm/icons/heart";
import Info from "lucide-react/dist/esm/icons/info";
import Lightbulb from "lucide-react/dist/esm/icons/lightbulb";
import Loader from "lucide-react/dist/esm/icons/loader";
import Lock from "lucide-react/dist/esm/icons/lock";
import Mail from "lucide-react/dist/esm/icons/mail";
import Milestone from "lucide-react/dist/esm/icons/milestone";
import Package from "lucide-react/dist/esm/icons/package";
import Palette from "lucide-react/dist/esm/icons/palette";
import Pause from "lucide-react/dist/esm/icons/pause";
import PieChart from "lucide-react/dist/esm/icons/pie-chart";
import Play from "lucide-react/dist/esm/icons/play";
import PlayCircle from "lucide-react/dist/esm/icons/play-circle";
import Puzzle from "lucide-react/dist/esm/icons/puzzle";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import Rocket from "lucide-react/dist/esm/icons/rocket";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw";
import Save from "lucide-react/dist/esm/icons/save";
import Search from "lucide-react/dist/esm/icons/search";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Shield from "lucide-react/dist/esm/icons/shield";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Star from "lucide-react/dist/esm/icons/star";
import Target from "lucide-react/dist/esm/icons/target";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Trophy from "lucide-react/dist/esm/icons/trophy";
import Unlock from "lucide-react/dist/esm/icons/unlock";
import Users from "lucide-react/dist/esm/icons/users";
import Zap from "lucide-react/dist/esm/icons/zap";

// Export common names used throughout the codebase
export {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Award,
  BarChart3,
  Bitcoin,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Code,
  Coins,
  Compass,
  DollarSign,
  Download,
  Eye,
  Filter,
  Fire,
  Flag,
  Gamepad2,
  Heart,
  House,
  Info,
  Loader,
  Lightbulb,
  Lock,
  Mail,
  Milestone,
  Package,
  Palette,
  Pause,
  PieChart,
  Play,
  PlayCircle,
  Puzzle,
  RefreshCw,
  Rocket,
  RotateCcw,
  Save,
  Search,
  Share2,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Unlock,
  Users,
  Zap,
};

// Aliases (some files use these names)
export const AlertTriangleIcon = AlertTriangle;
export const RefreshCwIcon = RefreshCw;
export const TrendUp = TrendingUp;
export const Lightning = Zap;
