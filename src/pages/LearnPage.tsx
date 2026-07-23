import React, { useState } from 'react';
import { BookOpen, GraduationCap, Search, Award, TrendingUp, Sparkles, UserCheck } from 'lucide-react';
import { CourseCard, StatCard } from '../components/reusable';
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
    const enrollment = enrollments.find(e => Number(e.course_id) === Number(c.id));
    return {
      ...c,
      enrolled: !!enrollment,
      progress: enrollment ? enrollment.progress : 0
    };
  });

  // Split into categories
  const enrolledCourses = coursesWithProgress.filter(c => c.enrolled);
  const continueLearning = enrolledCourses.filter(c => c.progress > 0 && c.progress < 100);
  const completedCourses = enrolledCourses.filter(c => c.progress === 100);

  // Recommendation engine
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
    return matchesSearch && matchesCategory;
  });

  // Helper to resolve journey-specific stats dynamically
  const getJourneyStats = (courseId: number) => {
    const courseStages = (journeyStages || []).filter(s => Number(s.course_id) === Number(courseId));
    const courseActivities = (learningActivities || []).filter(a => Number(a.course_id) === Number(courseId));
    const courseProgress = (activityProgress || []).filter(p => Number(p.course_id) === Number(courseId));
    
    const earnedXp = courseProgress.reduce((sum, p) => sum + (p.xp_earned || 0), 0);
    
    let currentStage = 'Beginner';
    if (courseActivities.length > 0) {
      const incompleteRequired = courseActivities
        .filter(a => a.is_required)
        .sort((a, b) => a.order_index - b.order_index)
        .find(a => {
          const prog = courseProgress.find(p => Number(p.activity_id) === Number(a.id));
          return !prog || prog.status !== 'completed';
        });
      
      if (incompleteRequired) {
        const stage = courseStages.find(s => Number(s.id) === Number(incompleteRequired.stage_id));
        if (stage) currentStage = stage.title;
      } else {
        const lastStage = courseStages.sort((a, b) => b.order_index - a.order_index)[0];
        if (lastStage) currentStage = lastStage.title;
      }
    }
    
    return {
      currentStage,
      earnedXp
    };
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {activeLearnMission && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
              🎯 Active Daily Mission In Progress
            </div>
            <h4 className="text-sm font-bold text-foreground mt-1">{activeLearnMission.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{activeLearnMission.description}</p>
            {Number(activeLearnMission.id) === 103 && (
              <p className="text-[11px] text-yellow-500 font-semibold mt-1">
                ⚠️ Required course "TypeScript Refactoring Module" is not configured in the system curriculum yet. Please perform your learning and click "Confirm Completion" manually below to complete this mission.
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
        </div>
      )}

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Enrolled Journeys" value={enrolledCourses.length} delta="Active Paths" type="courses" />
        <StatCard label="In Progress" value={continueLearning.length} delta="Learning" type="progress" />
        <StatCard label="Completed Paths" value={completedCourses.length} delta="Certifications" type="completions" />
        <StatCard
          label="Skill Passport"
          value="8 Skills"
          delta="Verify Skills"
          type="achievements"
          onAction={onNavigateCertificates}
          className="cursor-pointer hover:border-primary/20 transition-all"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 pb-px">
        <button
          onClick={() => setActiveTab('my_learning')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-px ${activeTab === 'my_learning' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          My Journeys
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-px ${activeTab === 'catalog' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Explore Learning Journeys
        </button>
      </div>

      {activeTab === 'my_learning' ? (
        <div className="space-y-6">
          {/* 1. Continue Journey */}
          {continueLearning.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BookOpen size={18} className="text-primary" /> Continue Your Journey
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            </div>
          )}

          {/* 2. Recommended Journeys */}
          {recommendedForYou.length > 0 && (
            <div className="space-y-4 border-t border-border/50 pt-6">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles size={18} className="text-primary" /> Recommended Journeys
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedForYou.slice(0, 3).map(course => {
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
            </div>
          )}

          {/* 3. Based on Your Role */}
          {basedOnYourRole.length > 0 && (
            <div className="space-y-4 border-t border-border/50 pt-6">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <UserCheck size={18} className="text-primary" /> Journeys for Your Role
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {basedOnYourRole.slice(0, 3).map(course => {
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
            </div>
          )}

          {/* 4. Trending in Your Department */}
          {trendingInDepartment.length > 0 && (
            <div className="space-y-4 border-t border-border/50 pt-6">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" /> Trending in {userDept}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingInDepartment.map(course => {
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
            </div>
          )}

          {/* 5. AI & ML Journeys */}
          {aiMLSkills.length > 0 && (
            <div className="space-y-4 border-t border-border/50 pt-6">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles size={18} className="text-primary" /> AI &amp; ML Learning Journeys
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiMLSkills.slice(0, 3).map(course => {
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
            </div>
          )}

          {/* 6. Completed */}
          {completedCourses.length > 0 && (
            <div className="space-y-4 border-t border-border/50 pt-6">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Award size={18} className="text-emerald-400" /> Completed Journeys
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map(course => {
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
            </div>
          )}

          {enrolledCourses.length === 0 && (
            <div className="border border-border border-dashed rounded-2xl p-12 text-center max-w-md mx-auto mt-6">
              <GraduationCap size={44} className="text-muted-foreground mx-auto mb-4" />
              <h4 className="font-bold text-foreground mb-1">No active journeys</h4>
              <p className="text-xs text-muted-foreground mb-6">You haven't started any learning journeys yet. Browse the catalog to start learning!</p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary/95 transition-all"
              >
                Explore Learning Journeys
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
                placeholder="Search journeys, instructors..."
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
              <h4 className="text-lg font-semibold mb-1 text-foreground">No journeys found</h4>
              <p className="text-muted-foreground text-xs">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      )}
    </div>
  );
}
