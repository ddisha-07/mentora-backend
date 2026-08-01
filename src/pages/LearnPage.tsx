import React, { useState } from 'react';
import { BookOpen, GraduationCap, Search, Award, TrendingUp, Sparkles, UserCheck, Shield, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CourseCard, StatCard, PageHeader, EmptyState } from '../components/reusable';
import { UserRole } from '../types';
import { useApp } from '../../App';

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
  const { savedItems, toggleBookmark, journeyStages, learningActivities, activityProgress, activeMissions, completeMission } = useApp();

  const activeLearnMission = (activeMissions || []).find(
    (m: any) => m.status === 'in_progress' && (m.type === 'LEARNING' || m.type === 'QUIZ')
  );

  const handleToggleBookmark = async (course: any) => {
    await toggleBookmark({
      id: String(course.id),
      type: 'course',
      title: course.title,
      desc: `Journey guided by ${course.instructor || 'L&D Instructor'}.`,
      category: 'Journeys',
      page: 'learn'
    });
  };

  const [activeTab, setActiveTab] = useState<'my_learning' | 'catalog'>('my_learning');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');

  const activeProfile = profile || {
    role: 'JUNIOR_EMPLOYEE' as UserRole,
    department: 'Software Engineering'
  };

  const userRole = activeProfile.role as UserRole;
  const userDept = activeProfile.department || 'Operations';

  const categories = ['All', 'AI & ML', 'Security', 'Leadership', 'Data Science', 'Cloud & DevOps', 'Product'];

  // Map progress to course data
  const coursesWithProgress = courses.map(c => {
    const enrollment = enrollments.find(e => Number(e.course_id) === Number(c.id));
    return {
      ...c,
      enrolled: !!enrollment,
      progress: enrollment ? enrollment.progress : 0
    };
  });

  const enrolledCourses = coursesWithProgress.filter(c => c.enrolled);
  const continueLearning = enrolledCourses.filter(c => c.progress > 0 && c.progress < 100);
  const completedCourses = enrolledCourses.filter(c => c.progress === 100);

  const recommendedForYou = coursesWithProgress.filter(c => {
    if (c.progress === 100) return false;
    return c.category === 'AI & ML' || c.category === 'Data Science';
  });

  const basedOnYourRole = coursesWithProgress.filter(c => {
    if (c.progress === 100) return false;
    if (userRole === 'SHOP_FLOOR_WORKER') {
      return c.category === 'Security' || c.title.toLowerCase().includes('safety');
    }
    return c.category === 'Leadership' || c.category === 'Product';
  });

  const trendingInDepartment = coursesWithProgress.filter(c => {
    if (c.progress === 100) return false;
    const dept = userDept.toLowerCase();
    if (dept.includes('software') || dept.includes('it') || dept.includes('r&d')) {
      return c.category === 'Cloud & DevOps' || c.category === 'AI & ML';
    }
    return c.category === 'Security' || c.title.toLowerCase().includes('operational');
  });

  const aiMLSkills = coursesWithProgress.filter(c => c.category === 'AI & ML');

  // Filter Catalog
  const filteredCatalog = coursesWithProgress.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          (c.instructor || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    const matchesDifficulty = activeDifficulty === 'All' || c.difficulty_level === activeDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getJourneyStats = (courseId: number) => {
    const courseStages = (journeyStages || []).filter(s => Number(s.courseId) === Number(courseId));
    const courseActivities = (learningActivities || []).filter(a => Number(a.courseId) === Number(courseId));
    const courseProgress = (activityProgress || []).filter(p => Number(p.course_id) === Number(courseId));
    
    const earnedXp = courseProgress.reduce((sum, p) => sum + (p.xp_earned || 0), 0);
    
    let currentStage = 'Beginner';
    if (courseActivities.length > 0) {
      const incompleteRequired = courseActivities
        .filter(a => a.isRequired)
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .find(a => {
          const prog = courseProgress.find(p => Number(p.activity_id) === Number(a.id));
          return !prog || prog.status !== 'completed';
        });
      
      if (incompleteRequired) {
        const stage = courseStages.find(s => Number(s.id) === Number(incompleteRequired.stageId));
        if (stage) currentStage = stage.title;
      } else {
        const lastStage = courseStages.sort((a, b) => b.orderIndex - a.orderIndex)[0];
        if (lastStage) currentStage = lastStage.title;
      }
    }
    
    return {
      currentStage,
      earnedXp
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6 max-w-7xl mx-auto"
    >
      {/* Page Header */}
      <PageHeader
        title="Learning Journeys"
        description="Accelerate your operational intelligence with guided tracks, structured modules, and interactive assessments."
        breadcrumbs={[{ label: "Mentora" }, { label: "Learn" }]}
        primaryAction={{
          label: "View Skill Passport",
          onClick: onNavigateCertificates,
          icon: <Award size={14} />
        }}
      />

      {/* Daily Mission Banner */}
      {activeLearnMission && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-glass-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden border border-primary/20"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary uppercase tracking-wider">
              🎯 Active Daily Mission
            </span>
            <h4 className="text-sm font-bold text-foreground mt-1.5">{activeLearnMission.title}</h4>
            <p className="text-xs text-muted-foreground">{activeLearnMission.description}</p>
            {Number(activeLearnMission.id) === 103 && (
              <p className="text-[10px] text-yellow-500 font-semibold mt-1">
                ⚠️ Complete your study and click 'Confirm Completion' to log reward credits.
              </p>
            )}
          </div>
          <button
            onClick={async () => {
              await completeMission(activeLearnMission.id);
            }}
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/20"
          >
            Confirm Completion
          </button>
        </motion.div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Navigation & Filters Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          {/* Tabs Sidebar */}
          <div className="premium-glass-card p-3 space-y-1">
            <button
              onClick={() => setActiveTab('my_learning')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'my_learning'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/15'
              }`}
            >
              <span className="flex items-center gap-2">
                <GraduationCap size={15} /> My Learning
              </span>
              <span className="px-2 py-0.5 rounded-md text-[9px] bg-black/10 text-inherit font-mono">
                {enrolledCourses.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/15'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen size={15} /> Course Catalog
              </span>
              <span className="px-2 py-0.5 rounded-md text-[9px] bg-black/10 text-inherit font-mono">
                {courses.length}
              </span>
            </button>
          </div>

          {/* Quick Stats Widget */}
          <div className="premium-glass-card p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">My Milestones</h4>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">In Progress</span>
                <span className="font-bold text-foreground">{continueLearning.length} paths</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-bold text-emerald-400">{completedCourses.length} paths</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Verification status</span>
                <span className="font-bold text-primary">8 Skills verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Page Content */}
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'my_learning' ? (
              <motion.div
                key="my_learning"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-8"
              >
                {/* 1. Continue Learning */}
                {continueLearning.length > 0 && (
                  <motion.div variants={itemVariants} className="space-y-4">
                    <h3 className="text-base font-extrabold text-foreground flex items-center gap-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
                      <BookOpen size={16} className="text-primary" /> Continue Learning
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {continueLearning.map(course => {
                        const stats = getJourneyStats(course.id);
                        return (
                          <CourseCard
                            key={course.id}
                            title={course.title}
                            duration={course.duration}
                            rating={course.rating}
                            progress={course.progress}
                            thumbnail={course.thumbnail}
                            category={course.category}
                            onNavigate={() => onNavigateCourse(course.id)}
                            isBookmarked={(savedItems || []).some(x => Number(x.id) === Number(course.id) && x.type === 'course')}
                            onBookmarkToggle={() => handleToggleBookmark(course)}
                            currentStage={course.journey_type ? stats.currentStage : undefined}
                            dailyMinutes={course.daily_minutes}
                            totalXp={course.total_xp}
                            earnedXp={stats.earnedXp}
                            difficultyLevel={course.difficulty_level}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 2. Recommended */}
                {recommendedForYou.length > 0 && (
                  <motion.div variants={itemVariants} className="space-y-4">
                    <h3 className="text-base font-extrabold text-foreground flex items-center gap-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
                      <Sparkles size={16} className="text-primary" /> Recommended for You
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {recommendedForYou.slice(0, 2).map(course => {
                        const stats = getJourneyStats(course.id);
                        return (
                          <CourseCard
                            key={course.id}
                            title={course.title}
                            duration={course.duration}
                            rating={course.rating}
                            progress={course.enrolled ? course.progress : undefined}
                            thumbnail={course.thumbnail}
                            category={course.category}
                            onNavigate={() => onNavigateCourse(course.id)}
                            isBookmarked={(savedItems || []).some(x => Number(x.id) === Number(course.id) && x.type === 'course')}
                            onBookmarkToggle={() => handleToggleBookmark(course)}
                            currentStage={course.journey_type ? stats.currentStage : undefined}
                            dailyMinutes={course.daily_minutes}
                            totalXp={course.total_xp}
                            earnedXp={stats.earnedXp}
                            difficultyLevel={course.difficulty_level}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 3. Role-Based */}
                {basedOnYourRole.length > 0 && (
                  <motion.div variants={itemVariants} className="space-y-4">
                    <h3 className="text-base font-extrabold text-foreground flex items-center gap-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
                      <UserCheck size={16} className="text-primary" /> Journeys for Your Role
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {basedOnYourRole.slice(0, 2).map(course => {
                        const stats = getJourneyStats(course.id);
                        return (
                          <CourseCard
                            key={course.id}
                            title={course.title}
                            duration={course.duration}
                            rating={course.rating}
                            progress={course.enrolled ? course.progress : undefined}
                            thumbnail={course.thumbnail}
                            category={course.category}
                            onNavigate={() => onNavigateCourse(course.id)}
                            isBookmarked={(savedItems || []).some(x => Number(x.id) === Number(course.id) && x.type === 'course')}
                            onBookmarkToggle={() => handleToggleBookmark(course)}
                            currentStage={course.journey_type ? stats.currentStage : undefined}
                            dailyMinutes={course.daily_minutes}
                            totalXp={course.total_xp}
                            earnedXp={stats.earnedXp}
                            difficultyLevel={course.difficulty_level}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 4. Department Trending */}
                {trendingInDepartment.length > 0 && (
                  <motion.div variants={itemVariants} className="space-y-4">
                    <h3 className="text-base font-extrabold text-foreground flex items-center gap-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
                      <TrendingUp size={16} className="text-primary" /> Trending in {userDept}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {trendingInDepartment.slice(0, 2).map(course => {
                        const stats = getJourneyStats(course.id);
                        return (
                          <CourseCard
                            key={course.id}
                            title={course.title}
                            duration={course.duration}
                            rating={course.rating}
                            progress={course.enrolled ? course.progress : undefined}
                            thumbnail={course.thumbnail}
                            category={course.category}
                            onNavigate={() => onNavigateCourse(course.id)}
                            isBookmarked={(savedItems || []).some(x => Number(x.id) === Number(course.id) && x.type === 'course')}
                            onBookmarkToggle={() => handleToggleBookmark(course)}
                            currentStage={course.journey_type ? stats.currentStage : undefined}
                            dailyMinutes={course.daily_minutes}
                            totalXp={course.total_xp}
                            earnedXp={stats.earnedXp}
                            difficultyLevel={course.difficulty_level}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Empty State */}
                {enrolledCourses.length === 0 && (
                  <EmptyState
                    title="No active journeys"
                    message="You haven't enrolled in any learning paths yet. Explore the catalog to kickstart your learning!"
                    icon={<GraduationCap size={24} />}
                    actionText="Browse Catalog"
                    onAction={() => setActiveTab('catalog')}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="catalog"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {/* Search and Filters Bar */}
                <div className="premium-glass-card p-4 space-y-4">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    {/* Search query input */}
                    <div className="relative w-full md:w-72">
                      <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground pointer-events-none">
                        <Search size={14} />
                      </span>
                      <input
                        placeholder="Search journeys, instructors..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-secondary/35 border border-border/15 focus:border-primary/30 rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground transition-all"
                      />
                    </div>

                    {/* Difficulty selector */}
                    <div className="flex items-center gap-1.5 bg-secondary/20 p-1 rounded-xl border border-border/10">
                      {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map(level => (
                        <button
                          key={level}
                          onClick={() => setActiveDifficulty(level)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            activeDifficulty === level
                              ? 'bg-primary text-white shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category selector chips */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                    {categories.map(c => (
                      <button
                        key={c}
                        onClick={() => setActiveCategory(c)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                          activeCategory === c
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-secondary/10 border-border/10 text-muted-foreground hover:text-foreground hover:border-border/30'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Catalog Grid */}
                {filteredCatalog.length === 0 ? (
                  <EmptyState
                    title="No journeys found"
                    message="We couldn't find any courses matching your specific filter combinations. Try resetting search fields."
                    icon={<Search size={24} />}
                    actionText="Reset Filters"
                    onAction={() => {
                      setSearch('');
                      setActiveCategory('All');
                      setActiveDifficulty('All');
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredCatalog.map(course => {
                      const stats = getJourneyStats(course.id);
                      return (
                        <CourseCard
                          key={course.id}
                          title={course.title}
                          duration={course.duration}
                          rating={course.rating}
                          progress={course.progress || undefined}
                          thumbnail={course.thumbnail}
                          category={course.category}
                          onNavigate={() => onNavigateCourse(course.id)}
                          isBookmarked={(savedItems || []).some(x => Number(x.id) === Number(course.id) && x.type === 'course')}
                          onBookmarkToggle={() => handleToggleBookmark(course)}
                          currentStage={course.journey_type ? stats.currentStage : undefined}
                          dailyMinutes={course.daily_minutes}
                          totalXp={course.total_xp}
                          earnedXp={stats.earnedXp}
                          difficultyLevel={course.difficulty_level}
                        />
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
      </div>

    </motion.div>
  );
}
