import React, { useState } from 'react';
import { BookOpen, GraduationCap, Search, Award, TrendingUp, Sparkles, UserCheck } from 'lucide-react';
import { CourseCard, ProgressCard, StatCard } from '../components/reusable';
import { UserRole } from '../types';

export default function LearnPage({
  courses,
  enrollments,
  profile,
  onNavigateCourse,
  onNavigateCertificates
}: {
  courses: any[];
  enrollments: any[];
  profile: any;
  onNavigateCourse: (id: number) => void;
  onNavigateCertificates: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'my_learning' | 'catalog'>('my_learning');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const activeProfile = profile || {
    role: 'JUNIOR_EMPLOYEE' as UserRole,
    department: 'Software Engineering'
  };

  const userRole = activeProfile.role as UserRole;
  const userDept = activeProfile.department || 'Operations';

  // Categories for filtering
  const categories = ['All', 'AI & ML', 'Security', 'Leadership', 'Data Science', 'Cloud & DevOps', 'Product'];

  // Map progress to course data
  const coursesWithProgress = courses.map(c => {
    const e = enrollments.find(env => Number(env.course_id) === Number(c.id));
    return { ...c, progress: e ? e.progress : 0, enrolled: !!e };
  });

  // ==========================================
  // SECTIONING & RECOMMENDATION LOGIC (PHASE 2)
  // ==========================================

  // 1. Continue Learning: progress > 0 and < 100
  const continueLearning = coursesWithProgress.filter(c => c.enrolled && c.progress > 0 && c.progress < 100);

  // 2. Recommended for You: based on Department
  const recommendedForYou = coursesWithProgress.filter(c => {
    if (c.progress === 100) return false;
    const dept = userDept.toLowerCase();
    if (dept.includes('software') || dept.includes('it')) {
      return c.category === 'AI & ML' || c.category === 'Cloud & DevOps' || c.category === 'Data Science';
    }
    if (dept.includes('robotics') || dept.includes('automation')) {
      return c.category === 'Cloud & DevOps' || c.category === 'AI & ML' || c.category === 'Security';
    }
    if (dept.includes('hr') || dept.includes('training') || dept.includes('corporate')) {
      return c.category === 'Leadership' || c.category === 'Product';
    }
    // Fallback: Operational/Safety for plant workers
    return c.category === 'Security' || c.category === 'Leadership';
  });

  // 3. Based on Your Role
  const basedOnYourRole = coursesWithProgress.filter(c => {
    if (c.progress === 100) return false;
    switch (userRole) {
      case 'SHOP_FLOOR_WORKER':
        return c.category === 'Security' || c.title.toLowerCase().includes('safety');
      case 'JUNIOR_EMPLOYEE':
        return c.difficulty === 'Beginner' || c.category === 'Data Science' || c.category === 'AI & ML';
      case 'SENIOR_EMPLOYEE':
        return c.difficulty === 'Advanced' || c.category === 'AI & ML' || c.category === 'Cloud & DevOps';
      case 'OFFICER_MANAGER':
        return c.category === 'Leadership' || c.category === 'Product';
      case 'RETIRED_EMPLOYEE':
        return c.category === 'Leadership' || c.title.toLowerCase().includes('turbine') || c.title.toLowerCase().includes('valve');
      default:
        return true;
    }
  });

  // 4. Trending in Your Department: Highest rated non-completed
  const trendingInDepartment = coursesWithProgress
    .filter(c => c.progress < 100)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 2);

  // 5. AI & ML Skills: Category AI & ML
  const aiMLSkills = coursesWithProgress.filter(c => c.category === 'AI & ML');

  // 6. Completed
  const completedCourses = coursesWithProgress.filter(c => c.enrolled && c.progress === 100);

  // Catalog tab filtering
  const filteredCatalog = coursesWithProgress.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  const enrolledCourses = coursesWithProgress.filter(c => c.enrolled);
  const avgProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((acc, curr) => acc + (curr.progress || 0), 0) / enrolledCourses.length)
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Learning Hub</h2>
          <p className="text-muted-foreground text-sm">Expand your expertise through courses and structured skill paths.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('my_learning')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'my_learning' ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
          >
            My Learning
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'catalog' ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
          >
            Browse Catalog
          </button>
        </div>
      </div>

      {activeTab === 'my_learning' ? (
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              label="Active Courses"
              value={enrolledCourses.filter(c => c.progress < 100).length}
              icon={<BookOpen size={20} />}
            />
            <ProgressCard
              title="Average Progress"
              value={avgProgress}
              description={`${completedCourses.length} completed courses`}
            />
            <StatCard
              label="Earned Certifications"
              value={completedCourses.length}
              delta="View passport"
              icon={<Award size={20} />}
              onAction={onNavigateCertificates}
              className="cursor-pointer hover:border-primary/20 transition-all"
            />
          </div>

          {/* 1. Continue Learning */}
          {continueLearning.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BookOpen size={18} className="text-primary" /> Continue Learning
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {continueLearning.map(course => (
                  <CourseCard
                    key={course.id}
                    title={course.title}
                    duration={course.duration}
                    rating={course.rating}
                    progress={course.progress}
                    thumbnail={course.thumbnail}
                    category={course.category}
                    onNavigate={() => onNavigateCourse(course.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 2. Recommended for You */}
          {recommendedForYou.length > 0 && (
            <div className="space-y-4 border-t border-border/50 pt-6">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles size={18} className="text-primary" /> Recommended for You
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedForYou.slice(0, 3).map(course => (
                  <CourseCard
                    key={course.id}
                    title={course.title}
                    duration={course.duration}
                    rating={course.rating}
                    progress={course.enrolled ? course.progress : undefined}
                    thumbnail={course.thumbnail}
                    category={course.category}
                    onNavigate={() => onNavigateCourse(course.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. Based on Your Role */}
          {basedOnYourRole.length > 0 && (
            <div className="space-y-4 border-t border-border/50 pt-6">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <UserCheck size={18} className="text-primary" /> Based on Your Role
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {basedOnYourRole.slice(0, 3).map(course => (
                  <CourseCard
                    key={course.id}
                    title={course.title}
                    duration={course.duration}
                    rating={course.rating}
                    progress={course.enrolled ? course.progress : undefined}
                    thumbnail={course.thumbnail}
                    category={course.category}
                    onNavigate={() => onNavigateCourse(course.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 4. Trending in Your Department */}
          {trendingInDepartment.length > 0 && (
            <div className="space-y-4 border-t border-border/50 pt-6">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" /> Trending in {userDept}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingInDepartment.map(course => (
                  <CourseCard
                    key={course.id}
                    title={course.title}
                    duration={course.duration}
                    rating={course.rating}
                    progress={course.enrolled ? course.progress : undefined}
                    thumbnail={course.thumbnail}
                    category={course.category}
                    onNavigate={() => onNavigateCourse(course.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 5. AI & ML Skills */}
          {aiMLSkills.length > 0 && (
            <div className="space-y-4 border-t border-border/50 pt-6">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles size={18} className="text-primary" /> AI &amp; ML Skills
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiMLSkills.slice(0, 3).map(course => (
                  <CourseCard
                    key={course.id}
                    title={course.title}
                    duration={course.duration}
                    rating={course.rating}
                    progress={course.enrolled ? course.progress : undefined}
                    thumbnail={course.thumbnail}
                    category={course.category}
                    onNavigate={() => onNavigateCourse(course.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 6. Completed */}
          {completedCourses.length > 0 && (
            <div className="space-y-4 border-t border-border/50 pt-6">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Award size={18} className="text-emerald-400" /> Completed
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    title={course.title}
                    duration={course.duration}
                    rating={course.rating}
                    progress={course.progress}
                    thumbnail={course.thumbnail}
                    category={course.category}
                    onNavigate={() => onNavigateCourse(course.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {enrolledCourses.length === 0 && (
            <div className="border border-border border-dashed rounded-2xl p-12 text-center max-w-md mx-auto mt-6">
              <GraduationCap size={44} className="text-muted-foreground mx-auto mb-4" />
              <h4 className="font-bold text-foreground mb-1">No active courses</h4>
              <p className="text-xs text-muted-foreground mb-6">You haven't enrolled in any courses yet. Browse the catalog to start learning!</p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary/95 transition-all"
              >
                Explore Catalog
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search courses, instructors..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground w-full outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeCategory === c ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog grid */}
          {filteredCatalog.length === 0 ? (
            <div className="text-center py-20">
              <Search size={40} className="text-border mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-1 text-foreground">No courses found</h4>
              <p className="text-muted-foreground text-xs">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalog.map(course => (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  duration={course.duration}
                  rating={course.rating}
                  progress={course.progress || undefined}
                  thumbnail={course.thumbnail}
                  category={course.category}
                  onNavigate={() => onNavigateCourse(course.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
