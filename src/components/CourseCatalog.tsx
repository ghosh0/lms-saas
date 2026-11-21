"use client";

// =============================================================================
// CourseCatalog — Interactive Search & Multi-Subject Filter (Black & Emerald)
// =============================================================================

import { useState, useMemo } from "react";
import { LessonCard } from "@/components/LessonCard";
import { Search, Filter, X, BookOpen, Terminal, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseItem {
  id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  durationMins: number;
  priceInRupees?: number;
  creatorId?: string | null;
  creator?: {
    id: string;
    name: string;
    role?: string | null;
  } | null;
  pdfUrl?: string | null;
  pdfName?: string | null;
  isCreator?: boolean;
  isPurchased?: boolean;
  hasAccess?: boolean;
}

interface CourseCatalogProps {
  initialLessons: CourseItem[];
}

export function CourseCatalog({ initialLessons }: CourseCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // Extract all unique subjects from the courses list
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    initialLessons.forEach((l) => {
      if (l.subject) set.add(l.subject.trim());
    });
    return Array.from(set).sort();
  }, [initialLessons]);

  // Toggle a subject in the multi-select filter
  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSubjects([]);
  };

  // Filtered lessons based on search query and selected subjects
  const filteredLessons = useMemo(() => {
    return initialLessons.filter((lesson) => {
      // 1. Search Query filter (matches title or description)
      const matchesSearch =
        searchQuery.trim() === "" ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Subject filter (matches any of the selected subjects)
      const matchesSubject =
        selectedSubjects.length === 0 || selectedSubjects.includes(lesson.subject);

      return matchesSearch && matchesSubject;
    });
  }, [initialLessons, searchQuery, selectedSubjects]);

  return (
    <div className="space-y-6">
      {/* Search and Subject Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by name or keyword..."
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 font-sans transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 p-0.5 rounded cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Trigger Button */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            className={`font-mono text-xs w-full sm:w-auto flex items-center justify-between gap-2 border-zinc-800 ${
              selectedSubjects.length > 0
                ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>Subjects</span>
            </div>
            {selectedSubjects.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">
                {selectedSubjects.length}
              </span>
            )}
          </Button>

          {/* Filter Dropdown Popover */}
          {filterMenuOpen && (
            <div className="absolute right-0 top-12 z-50 w-64 p-3 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-900 text-xs font-mono">
                <span className="text-zinc-400 uppercase tracking-wider font-semibold">Filter by Subject</span>
                {selectedSubjects.length > 0 && (
                  <button
                    onClick={() => setSelectedSubjects([])}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-1 max-h-56 overflow-y-auto">
                {availableSubjects.map((sub) => {
                  const isChecked = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors text-left cursor-pointer ${
                        isChecked
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      }`}
                    >
                      <span>{sub}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Subject Pills Bar */}
      {selectedSubjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
          <span className="text-zinc-500 text-[11px]">Active filters:</span>
          {selectedSubjects.map((sub) => (
            <span
              key={sub}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs"
            >
              <span>{sub}</span>
              <button
                onClick={() => toggleSubject(sub)}
                className="hover:text-emerald-100 cursor-pointer"
                title={`Remove ${sub} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearFilters}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 underline underline-offset-4 ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Section Header with count */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold tracking-wider uppercase font-mono text-zinc-300">
            Curriculum & Marketplace
          </h2>
        </div>
        <span className="text-xs text-zinc-500 font-mono">
          Showing {filteredLessons.length} of {initialLessons.length} Courses
        </span>
      </div>

      {/* Course Cards Grid or Empty Results */}
      {filteredLessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40">
          <Terminal className="w-10 h-10 text-zinc-600 mb-3" />
          <p className="text-base font-semibold text-zinc-300">No matching courses found</p>
          <p className="text-xs text-zinc-500 mt-1 mb-4 max-w-sm">
            No courses match your current search and subject filters.
          </p>
          <Button size="sm" variant="outline" onClick={clearFilters} className="font-mono text-xs">
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <LessonCard key={lesson.id} {...lesson} />
          ))}
        </div>
      )}
    </div>
  );
}
