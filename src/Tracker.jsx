import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Download,
  Upload,
  Save,
  Calendar,
  Check,
  Settings,
  Plus,
  Trash2,
  Star,
  BarChart2,
  BookOpen,
  Flame,
  LogOut,
  Cloud,
  CloudOff,
  Loader2,
} from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { useLifeData } from "./hooks/useLifeData";

const TOTAL_YEARS = 61; // Age 0 to 60
const WEEKS_PER_YEAR = 52;
const TOTAL_WEEKS = TOTAL_YEARS * WEEKS_PER_YEAR;

const getDefaultDay = () => ({
  subgoals: [{ text: "", done: false }],
  habits: Array(10).fill(false),
  score: 0,
});

const getDefaultWeek = () => ({
  weeklyGoal: "",
  weeklyReview: "",
  milestone: "",
  weeklyScore: 0,
  days: Array(7).fill(null).map(getDefaultDay),
});

export default function Tracker() {
  const { user, signOut } = useAuth();
  const {
    lifeData,
    yearData,
    habitLabels,
    birthDate,
    userName,
    setLifeData,
    setYearData,
    setHabitLabels,
    setBirthDate,
    setUserName,
    replaceAll,
    syncStatus,
  } = useLifeData(user.id);

  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (showSettings) {
        setShowSettings(false);
      } else if (showStats) {
        setShowStats(false);
      } else if (selectedWeek) {
        setSelectedWeek(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSettings, showStats, selectedWeek]);

  const handleWeekClick = (index) => {
    setSelectedWeek(index);
    const weekData = lifeData[index]
      ? JSON.parse(JSON.stringify(lifeData[index]))
      : getDefaultWeek();
    weekData.days.forEach((day) => {
      if (!day.subgoals)
        day.subgoals = day.goal ? [{ text: day.goal, done: false }] : [];
    });
    setEditData(weekData);
  };

  const saveWeekData = () => {
    setLifeData((prev) => ({ ...prev, [selectedWeek]: editData }));
    setSelectedWeek(null);
    showMessage("Progress saved successfully.", "success");
  };

  const addSubgoal = (dayIndex) => {
    const newData = { ...editData, days: [...editData.days] };
    newData.days[dayIndex].subgoals.push({ text: "", done: false });
    setEditData(newData);
  };

  const updateSubgoal = (dayIndex, sgIndex, field, value) => {
    const newData = { ...editData, days: [...editData.days] };
    newData.days[dayIndex].subgoals[sgIndex][field] = value;
    setEditData(newData);
  };

  const removeSubgoal = (dayIndex, sgIndex) => {
    const newData = { ...editData, days: [...editData.days] };
    newData.days[dayIndex].subgoals.splice(sgIndex, 1);
    setEditData(newData);
  };

  const getCurrentWeekIndex = () => {
    if (!birthDate) return -1;
    const parts = birthDate.split("-");
    if (parts.length !== 3) return -1;

    const [year, month, day] = parts.map(Number);
    const gridStartDate = new Date(year, month - 1, day);
    const now = new Date();

    const utcGrid = Date.UTC(
      gridStartDate.getFullYear(),
      gridStartDate.getMonth(),
      gridStartDate.getDate(),
    );
    const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

    const diffDays = Math.floor((utcNow - utcGrid) / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  };
  const currentWeekIndex = getCurrentWeekIndex();

  const getDayLabel = (weekIndex, dayIndex) => {
    const defaultDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    if (!birthDate) return defaultDays[dayIndex];

    const parts = birthDate.split("-");
    if (parts.length !== 3) return defaultDays[dayIndex];

    const [year, month, day] = parts.map(Number);
    const date = new Date(year, month - 1, day + weekIndex * 7 + dayIndex);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const getWeekDateRange = (weekIndex) => {
    if (!birthDate) return null;
    const parts = birthDate.split("-");
    if (parts.length !== 3) return null;

    const [year, month, day] = parts.map(Number);
    const startDate = new Date(year, month - 1, day + weekIndex * 7);
    const endDate = new Date(year, month - 1, day + weekIndex * 7 + 6);

    const formatOpts = { month: "short", day: "numeric", year: "numeric" };
    return `${startDate.toLocaleDateString(undefined, formatOpts)} — ${endDate.toLocaleDateString(undefined, formatOpts)}`;
  };

  const getStats = () => {
    let totalScoredWeeks = 0;
    let scoreSum = 0;
    let totalSubgoalsDone = 0;
    let totalHabitsDone = 0;
    let milestonesCount = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let scoreDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (let i = 0; i < TOTAL_WEEKS; i++) {
      const week = lifeData[i];
      if (week && week.weeklyScore > 0) {
        totalScoredWeeks++;
        scoreSum += week.weeklyScore;
        tempStreak++;
        scoreDistribution[week.weeklyScore]++;

        if (tempStreak > longestStreak) longestStreak = tempStreak;
        if (week.milestone && week.milestone.trim() !== "") milestonesCount++;
        week.days.forEach((day) => {
          if (day.subgoals)
            totalSubgoalsDone += day.subgoals.filter((sg) => sg.done).length;
          if (day.habits) totalHabitsDone += day.habits.filter(Boolean).length;
        });
      } else {
        tempStreak = 0;
      }
    }

    let calcCurrentStreak = 0;
    let startIdx = currentWeekIndex >= 0 ? currentWeekIndex : TOTAL_WEEKS - 1;
    if (
      currentWeekIndex >= 0 &&
      (!lifeData[currentWeekIndex] ||
        lifeData[currentWeekIndex].weeklyScore === 0)
    ) {
      startIdx = currentWeekIndex - 1;
    }
    for (let i = startIdx; i >= 0; i--) {
      if (lifeData[i] && lifeData[i].weeklyScore > 0) calcCurrentStreak++;
      else break;
    }

    const lifeProgress =
      currentWeekIndex >= 0
        ? ((currentWeekIndex / TOTAL_WEEKS) * 100).toFixed(2)
        : 0;

    return {
      avgScore: totalScoredWeeks
        ? (scoreSum / totalScoredWeeks).toFixed(1)
        : "0.0",
      totalScoredWeeks,
      totalSubgoalsDone,
      totalHabitsDone,
      milestonesCount,
      longestStreak,
      currentStreak: calcCurrentStreak,
      lifeProgress,
      scoreDistribution,
    };
  };

  const handleExport = () => {
    const exportPayload = {
      data: lifeData,
      yearData: yearData,
      habits: habitLabels,
      birthDate: birthDate,
      userName: userName,
    };
    const dataStr = JSON.stringify(exportPayload);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "memento-mori-backup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showMessage("Data exported securely.", "success");
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        replaceAll({
          life_data: importedData.data || {},
          year_data: importedData.yearData || {},
          habit_labels: importedData.habits || Array(10).fill(""),
          birth_date: importedData.birthDate || null,
          user_name:
            importedData.userName !== undefined ? importedData.userName : "",
        });
        showMessage("Data restored successfully.", "success");
      } catch {
        showMessage("Invalid file format.", "error");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getScoreColor = (score) => {
    switch (score) {
      case 1:
        return "bg-rose-500/90 shadow-[0_0_10px_rgba(244,63,94,0.4)]";
      case 2:
        return "bg-orange-500/90 shadow-[0_0_10px_rgba(249,115,22,0.4)]";
      case 3:
        return "bg-amber-400/90 shadow-[0_0_10px_rgba(251,191,36,0.4)]";
      case 4:
        return "bg-emerald-400/90 shadow-[0_0_10px_rgba(52,211,153,0.4)]";
      case 5:
        return "bg-emerald-600/90 shadow-[0_0_10px_rgba(5,150,105,0.6)]";
      default:
        return "bg-zinc-800/40 border border-white/5";
    }
  };

  const getScoreColorSolid = (score) => {
    switch (score) {
      case 1:
        return "bg-rose-500 text-white border-rose-500";
      case 2:
        return "bg-orange-500 text-white border-orange-500";
      case 3:
        return "bg-amber-400 text-zinc-900 border-amber-400";
      case 4:
        return "bg-emerald-400 text-zinc-900 border-emerald-400";
      case 5:
        return "bg-emerald-600 text-white border-emerald-600";
      default:
        return "bg-zinc-900/50 text-zinc-500 border-zinc-700/50 hover:bg-zinc-800";
    }
  };

  const getScoreChartColor = (score) => {
    switch (score) {
      case 1:
        return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]";
      case 2:
        return "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]";
      case 3:
        return "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]";
      case 4:
        return "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]";
      case 5:
        return "bg-emerald-600 shadow-[0_0_10px_rgba(5,150,105,0.4)]";
      default:
        return "bg-zinc-800";
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans selection:bg-indigo-500/30 pb-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-[#09090b] to-[#09090b]">
      {message && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md border text-sm font-medium tracking-wide animate-in slide-in-from-top-4 fade-in duration-300 ${
            message.type === "error"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <header className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Calendar className="w-5 h-5 text-indigo-400" />
            </div>
            {userName ? (
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm font-bold">
                {userName}'s Tracker
              </span>
            ) : (
              "Life Tracker"
            )}
          </h1>
          <p className="text-[13px] text-zinc-500 mt-1 font-medium tracking-wide">
            {birthDate &&
            currentWeekIndex >= 0 &&
            currentWeekIndex < TOTAL_WEEKS ? (
              <span className="text-indigo-400">
                Currently Age {Math.floor(currentWeekIndex / 52)} • Week{" "}
                {(currentWeekIndex % 52) + 1} of 52
              </span>
            ) : (
              "Age 0 to 60 • Document your timeline"
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowStats(true)}
            className="p-2.5 text-zinc-400 hover:text-zinc-100 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all"
            title="Statistics"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 text-zinc-400 hover:text-zinc-100 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all"
          >
            <Upload className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">Import</span>
          </button>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
          />
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          <div
            className="flex items-center gap-1.5 px-1"
            title={
              syncStatus === "saving"
                ? "Saving to cloud..."
                : syncStatus === "offline"
                  ? "Offline - changes saved locally, will sync when back online"
                  : "Synced to cloud"
            }
          >
            {syncStatus === "saving" && (
              <Loader2 className="w-3.5 h-3.5 text-zinc-500 animate-spin" />
            )}
            {syncStatus === "offline" && (
              <CloudOff className="w-3.5 h-3.5 text-amber-500" />
            )}
            {syncStatus === "synced" && (
              <Cloud className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </div>
          <button
            onClick={signOut}
            className="p-2.5 text-zinc-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 rounded-xl transition-all"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="p-6 md:p-10 max-w-[1400px] mx-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="min-w-[850px]">
          <div
            className="grid gap-1 mb-2 items-end"
            style={{
              gridTemplateColumns: `44px repeat(${WEEKS_PER_YEAR}, minmax(0, 1fr)) 32px`,
            }}
          >
            <div className="text-[11px] font-semibold tracking-widest uppercase text-zinc-500 text-right pr-3 pb-1">
              Age
            </div>
            {Array.from({ length: WEEKS_PER_YEAR }).map((_, w) => (
              <div
                key={`col-${w}`}
                className="text-[10px] font-medium text-zinc-600 text-center"
              >
                {(w + 1) % 10 === 0 || w === 0 || w === 51 ? w + 1 : ""}
              </div>
            ))}
            <div className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 text-center">
              Rev
            </div>
          </div>

          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `44px repeat(${WEEKS_PER_YEAR}, minmax(0, 1fr)) 32px`,
            }}
          >
            {Array.from({ length: TOTAL_YEARS }).map((_, yearIndex) => {
              const age = yearIndex;
              return (
                <React.Fragment key={`year-${yearIndex}`}>
                  <div className="text-[11px] font-medium text-zinc-500 text-right pr-3 flex items-center justify-end">
                    {age % 5 === 0 ? age : ""}
                  </div>

                  {Array.from({ length: WEEKS_PER_YEAR }).map(
                    (_, weekIndex) => {
                      const i = yearIndex * WEEKS_PER_YEAR + weekIndex;
                      const weekOfYear = weekIndex + 1;
                      const score = lifeData[i]?.weeklyScore || 0;
                      const hasData =
                        lifeData[i] &&
                        (lifeData[i].weeklyGoal || lifeData[i].weeklyScore > 0);
                      const isCurrentWeek = i === currentWeekIndex;
                      const hasMilestone =
                        lifeData[i]?.milestone &&
                        lifeData[i].milestone.trim() !== "";

                      return (
                        <div
                          key={i}
                          onClick={() => handleWeekClick(i)}
                          title={`Age ${age}, Week ${weekOfYear}${hasMilestone ? " ⭐ " + lifeData[i].milestone : ""}`}
                          className={`
                          relative aspect-square rounded-[3px] cursor-pointer transition-all duration-200 
                          hover:scale-[1.3] hover:z-20 hover:ring-2 hover:ring-indigo-400 hover:ring-offset-1 hover:ring-offset-[#09090b]
                          ${getScoreColor(score)}
                          ${hasData && score === 0 ? "bg-zinc-700" : ""}
                          ${isCurrentWeek ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#09090b] scale-[1.15] z-10 shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-pulse" : ""}
                        `}
                        >
                          {hasMilestone && (
                            <Star
                              className="w-2.5 h-2.5 text-white/90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-md"
                              fill="currentColor"
                            />
                          )}
                        </div>
                      );
                    },
                  )}

                  <div
                    onClick={() => setSelectedYear(yearIndex)}
                    title={`Year in Review: Age ${age}`}
                    className={`flex items-center justify-center cursor-pointer transition-all duration-200 rounded-[3px] hover:scale-110 
                      ${yearData[yearIndex]?.review ? "bg-indigo-500/20 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]" : "text-zinc-700 hover:text-zinc-300 hover:bg-white/5 border border-transparent hover:border-white/10"}`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </main>

      {/* Stats Modal */}
      {showStats && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto pt-10 pb-20 px-4 flex justify-center animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden h-max">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2.5">
                <BarChart2 className="w-5 h-5 text-indigo-400" /> Detailed Stats
              </h2>
              <button
                onClick={() => setShowStats(false)}
                className="p-1.5 text-zinc-500 hover:text-zinc-200 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {birthDate && (
              <div className="px-6 pt-6 pb-2">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    Life Progress
                  </span>
                  <span className="text-xs font-semibold text-zinc-300">
                    {getStats().lifeProgress}%
                  </span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-2 border border-white/5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    style={{
                      width: `${Math.min(getStats().lifeProgress, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            <div className="p-6 pt-4 space-y-6">
              <div className="bg-black/20 p-5 rounded-xl border border-white/5">
                <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-6">
                  Score Distribution
                </h3>
                <div className="flex items-end justify-between h-32 gap-3">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const stats = getStats();
                    const maxScoreCount = Math.max(
                      ...Object.values(stats.scoreDistribution),
                      1,
                    );
                    const count = stats.scoreDistribution[score];
                    const heightPercent =
                      count === 0 ? 2 : (count / maxScoreCount) * 100;

                    return (
                      <div
                        key={score}
                        className="flex flex-col items-center flex-1 h-full gap-2 group"
                      >
                        <span className="text-[10px] text-zinc-500 font-semibold group-hover:text-zinc-300 transition-colors">
                          {count}
                        </span>
                        <div className="w-full bg-black/40 rounded-t-md flex items-end h-full relative">
                          <div
                            className={`w-full rounded-t-md transition-all duration-700 ease-out ${getScoreChartColor(score)}`}
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-bold text-zinc-400">
                          {score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                  <div className="text-3xl font-bold text-indigo-400">
                    {getStats().totalScoredWeeks}
                  </div>
                  <div className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mt-2">
                    Weeks Scored
                  </div>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                  <div className="text-3xl font-bold text-emerald-400">
                    {getStats().avgScore}
                  </div>
                  <div className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mt-2">
                    Avg Score
                  </div>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                  <div className="text-3xl font-bold text-orange-400 flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5" /> {getStats().currentStreak}
                  </div>
                  <div className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mt-2">
                    Current Streak
                  </div>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                  <div className="text-3xl font-bold text-rose-400">
                    {getStats().longestStreak}
                  </div>
                  <div className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mt-2">
                    Longest Streak
                  </div>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                  <div className="text-3xl font-bold text-violet-400">
                    {getStats().totalSubgoalsDone}
                  </div>
                  <div className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mt-2">
                    Goals Met
                  </div>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                  <div className="text-3xl font-bold text-cyan-400">
                    {getStats().totalHabitsDone}
                  </div>
                  <div className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mt-2">
                    Habits Built
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto pt-10 pb-20 px-4 flex justify-center animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden h-max">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-zinc-400" /> Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 text-zinc-500 hover:text-zinc-200 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-8">
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
                  Identity
                </h3>
                <p className="text-xs text-zinc-400">
                  Personalize your tracker's title.
                </p>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
                  Temporal Anchor
                </h3>
                <p className="text-xs text-zinc-400">
                  Set your birthdate to track your current exact week.
                </p>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
                  Daily Disciplines
                </h3>
                <p className="text-xs text-zinc-400">
                  Define up to 10 core habits. Empty fields remain hidden.
                </p>
                {habitLabels.map((label, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <span className="text-xs font-medium text-zinc-600 w-4 group-focus-within:text-indigo-400 transition-colors">
                      {i + 1}.
                    </span>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => {
                        const newLabels = [...habitLabels];
                        newLabels[i] = e.target.value;
                        setHabitLabels(newLabels);
                      }}
                      placeholder={`e.g. ${i === 0 ? "Workout" : "Reading"}`}
                      className="flex-1 bg-black/20 border border-transparent hover:border-white/5 rounded-xl p-2.5 text-sm text-zinc-200 focus:outline-none focus:bg-black/40 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 border-t border-white/5 bg-zinc-900/50">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-200 py-3 rounded-xl font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Week Modal */}
      {selectedWeek !== null && editData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto pt-6 pb-20 px-4 flex justify-center animate-in fade-in duration-200">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col h-max my-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-zinc-900/40 backdrop-blur-xl sticky top-0 z-20">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-3">
                  Age {Math.floor(selectedWeek / WEEKS_PER_YEAR)}{" "}
                  <span className="text-zinc-600 font-light">|</span> Week{" "}
                  {(selectedWeek % WEEKS_PER_YEAR) + 1}
                </h2>
                {getWeekDateRange(selectedWeek) && (
                  <span className="text-[12px] font-medium text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 w-max tracking-wide">
                    {getWeekDateRange(selectedWeek)}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedWeek(null)}
                className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
                    Primary Objective
                  </label>
                  <textarea
                    value={editData.weeklyGoal}
                    onChange={(e) =>
                      setEditData({ ...editData, weeklyGoal: e.target.value })
                    }
                    placeholder="The ONE goal that makes this week a success..."
                    className="w-full bg-black/20 border border-white/5 hover:border-white/10 rounded-xl p-4 text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none h-24 transition-all placeholder:text-zinc-600"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" /> Milestone Log
                  </label>
                  <textarea
                    value={editData.milestone || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, milestone: e.target.value })
                    }
                    placeholder="Significant events to pin to the timeline..."
                    className="w-full bg-black/20 border border-white/5 hover:border-white/10 rounded-xl p-4 text-zinc-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 resize-none h-24 transition-all placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-3">
                  Daily Operations
                </h3>

                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const dayName = getDayLabel(selectedWeek, dayIndex);
                  return (
                    <div
                      key={dayIndex}
                      className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5 space-y-5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <h4 className="font-medium text-zinc-200 tracking-wide">
                          {dayName}
                        </h4>
                        <div className="flex items-center gap-1.5 bg-black/30 rounded-xl p-1 border border-white/5">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              onClick={() => {
                                const newDays = [...editData.days];
                                newDays[dayIndex].score = score;
                                setEditData({ ...editData, days: newDays });
                              }}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                editData.days[dayIndex].score === score
                                  ? getScoreColorSolid(score) +
                                    " scale-105 shadow-lg"
                                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent"
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                          Tactical Subgoals
                        </span>
                        {(editData.days[dayIndex].subgoals || []).map(
                          (sg, sgIndex) => (
                            <div
                              key={sgIndex}
                              className="flex items-center gap-3 group"
                            >
                              <button
                                onClick={() =>
                                  updateSubgoal(
                                    dayIndex,
                                    sgIndex,
                                    "done",
                                    !sg.done,
                                  )
                                }
                                className={`flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${sg.done ? "bg-indigo-500 border-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]" : "bg-black/40 border-zinc-700 text-transparent hover:border-zinc-500"}`}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="text"
                                value={sg.text}
                                onChange={(e) =>
                                  updateSubgoal(
                                    dayIndex,
                                    sgIndex,
                                    "text",
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g. Complete module or practice HackerRank..."
                                className={`flex-1 bg-transparent border-none p-0 text-sm focus:outline-none focus:ring-0 transition-colors placeholder:text-zinc-700 ${sg.done ? "text-zinc-600 line-through" : "text-zinc-300"}`}
                              />
                              <button
                                onClick={() => removeSubgoal(dayIndex, sgIndex)}
                                className="text-zinc-700 opacity-0 group-hover:opacity-100 hover:text-rose-400 p-1 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ),
                        )}
                        <button
                          onClick={() => addSubgoal(dayIndex)}
                          className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 mt-1 py-1 px-2 rounded-lg hover:bg-indigo-500/10 transition-colors w-max"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Subgoal
                        </button>
                      </div>

                      {habitLabels.some((l) => l.trim() !== "") && (
                        <div className="pt-2">
                          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3 block">
                            Habit Tracker
                          </span>
                          <div className="flex flex-wrap gap-2.5">
                            {habitLabels.map((label, habitIndex) => {
                              if (label.trim() === "") return null;
                              const isDone =
                                editData.days[dayIndex].habits[habitIndex];

                              return (
                                <button
                                  key={habitIndex}
                                  onClick={() => {
                                    const newDays = [...editData.days];
                                    newDays[dayIndex].habits[habitIndex] =
                                      !isDone;
                                    setEditData({ ...editData, days: newDays });
                                  }}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 ${
                                    isDone
                                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                                      : "bg-black/20 border-white/5 text-zinc-400 hover:border-white/10 hover:bg-white/5"
                                  }`}
                                >
                                  <div
                                    className={`flex-shrink-0 w-3.5 h-3.5 rounded-sm flex items-center justify-center border transition-colors ${isDone ? "bg-indigo-500 border-indigo-500 text-white" : "bg-transparent border-zinc-600"}`}
                                  >
                                    {isDone && (
                                      <Check className="w-2.5 h-2.5" />
                                    )}
                                  </div>
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Retrospective
                </label>
                <textarea
                  value={editData.weeklyReview || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, weeklyReview: e.target.value })
                  }
                  placeholder="Analyze your execution. What went well? What needs adjustment?"
                  className="w-full bg-black/20 border border-white/5 hover:border-white/10 rounded-2xl p-5 text-zinc-300 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 resize-none h-36 leading-relaxed transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="border-t border-white/5 bg-[#121214] p-5 sm:px-8 sticky bottom-0 z-20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between w-full sm:w-auto gap-5">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Final Assessment
                </span>
                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() =>
                        setEditData({ ...editData, weeklyScore: score })
                      }
                      className={`w-9 h-9 rounded-lg font-bold transition-all duration-200 ${
                        editData.weeklyScore === score
                          ? getScoreColorSolid(score) +
                            " scale-[1.15] shadow-lg"
                          : "bg-transparent text-zinc-500 border border-transparent hover:bg-white/5 hover:text-zinc-300"
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={saveWeekData}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Save className="w-4 h-4" /> Save Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Year in Review Modal */}
      {selectedYear !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto pt-10 pb-20 px-4 flex justify-center animate-in fade-in duration-200">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden h-max">
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-zinc-900/40 backdrop-blur-xl sticky top-0">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-indigo-400" /> Age{" "}
                {selectedYear} Archive
              </h2>
              <button
                onClick={() => setSelectedYear(null)}
                className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <label className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest block mb-4">
                Annual Synthesis
              </label>
              <textarea
                value={yearData[selectedYear]?.review || ""}
                onChange={(e) =>
                  setYearData({
                    ...yearData,
                    [selectedYear]: { review: e.target.value },
                  })
                }
                placeholder={`Reflect on this year of your life, your challenges, and your personal growth. What defined being ${selectedYear}?`}
                className="w-full bg-black/20 border border-white/5 hover:border-white/10 rounded-2xl p-6 text-zinc-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none h-72 leading-relaxed text-lg transition-all placeholder:text-zinc-700"
              />
            </div>
            <div className="p-5 border-t border-white/5 bg-zinc-900/50 flex justify-end">
              <button
                onClick={() => {
                  setSelectedYear(null);
                  showMessage("Archive saved.", "success");
                }}
                className="flex items-center justify-center gap-2 bg-white text-zinc-900 hover:bg-zinc-200 px-8 py-3 rounded-xl font-semibold transition-all"
              >
                <Save className="w-4 h-4" /> Seal Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
