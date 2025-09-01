import { supabase } from '@/integrations/supabase/client';
import { courseData } from '@/data/courseData';

export async function migrateCourseDataToSupabase() {
  try {
    console.log('Starting course data migration...');

    // First, migrate all courses
    const coursesToInsert = courseData.allCourses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      level: course.level,
      image_url: course.imageUrl || null,
      is_active: true,
      order_index: 0, // Will be set based on insertion order
    }));

    console.log(`Migrating ${coursesToInsert.length} courses...`);
    
    const { data: insertedCourses, error: coursesError } = await supabase
      .from('courses')
      .upsert(coursesToInsert, { onConflict: 'id' })
      .select();

    if (coursesError) {
      console.error('Error inserting courses:', coursesError);
      throw coursesError;
    }

    console.log(`Successfully inserted ${insertedCourses?.length || 0} courses`);

    // Now migrate all modules
    const modulesToInsert: any[] = [];
    
    courseData.allCourses.forEach(course => {
      course.modules.forEach((module, index) => {
        modulesToInsert.push({
          id: module.id,
          course_id: course.id,
          title: module.title,
          description: module.description,
          duration: module.duration,
          lessons_count: module.lessons,
          order_index: index,
          topics: module.topics || [],
          status: module.status,
          is_active: true,
        });
      });
    });

    console.log(`Migrating ${modulesToInsert.length} modules...`);
    
    const { data: insertedModules, error: modulesError } = await supabase
      .from('course_content_modules')
      .upsert(modulesToInsert, { onConflict: 'id' })
      .select();

    if (modulesError) {
      console.error('Error inserting modules:', modulesError);
      throw modulesError;
    }

    console.log(`Successfully inserted ${insertedModules?.length || 0} modules`);

    // Migrate quizzes
    const quizzesToInsert: any[] = [];
    const questionsToInsert: any[] = [];
    
    courseData.allCourses.forEach(course => {
      course.modules.forEach(module => {
        // Main quiz
        if (module.quiz) {
          quizzesToInsert.push({
            id: module.quiz.id,
            module_id: module.id,
            title: module.quiz.title,
            description: module.quiz.description,
            passing_score: module.quiz.passingScore,
            time_limit_minutes: module.quiz.timeLimit,
            max_attempts: module.quiz.maxAttempts,
            quiz_type: 'module',
          });

          // Quiz questions
          module.quiz.questions.forEach((question, qIndex) => {
            questionsToInsert.push({
              id: question.id,
              quiz_id: module.quiz.id,
              question: question.question,
              options: question.options,
              correct_answer: question.correctAnswer,
              explanation: question.explanation,
              order_index: qIndex,
            });
          });
        }

        // Final test
        if (module.finalTest) {
          quizzesToInsert.push({
            id: module.finalTest.id,
            module_id: module.id,
            title: module.finalTest.title,
            description: module.finalTest.description,
            passing_score: module.finalTest.passingScore,
            time_limit_minutes: module.finalTest.timeLimit,
            max_attempts: module.finalTest.maxAttempts,
            quiz_type: 'final',
          });

          // Final test questions
          module.finalTest.questions.forEach((question, qIndex) => {
            questionsToInsert.push({
              id: question.id,
              quiz_id: module.finalTest.id,
              question: question.question,
              options: question.options,
              correct_answer: question.correctAnswer,
              explanation: question.explanation,
              order_index: qIndex,
            });
          });
        }
      });
    });

    console.log(`Migrating ${quizzesToInsert.length} quizzes...`);
    
    const { data: insertedQuizzes, error: quizzesError } = await supabase
      .from('module_quizzes')
      .upsert(quizzesToInsert, { onConflict: 'id' })
      .select();

    if (quizzesError) {
      console.error('Error inserting quizzes:', quizzesError);
      throw quizzesError;
    }

    console.log(`Successfully inserted ${insertedQuizzes?.length || 0} quizzes`);

    console.log(`Migrating ${questionsToInsert.length} quiz questions...`);
    
    const { data: insertedQuestions, error: questionsError } = await supabase
      .from('module_quiz_questions')
      .upsert(questionsToInsert, { onConflict: 'id' })
      .select();

    if (questionsError) {
      console.error('Error inserting quiz questions:', questionsError);
      throw questionsError;
    }

    console.log(`Successfully inserted ${insertedQuestions?.length || 0} quiz questions`);

    // Migrate case studies
    const caseStudiesToInsert: any[] = [];
    
    courseData.allCourses.forEach(course => {
      course.modules.forEach(module => {
        module.caseStudies.forEach((caseStudy, index) => {
          caseStudiesToInsert.push({
            module_id: module.id,
            title: caseStudy.title,
            company: caseStudy.company,
            situation: caseStudy.situation,
            challenge: caseStudy.challenge,
            solution: caseStudy.solution,
            outcome: caseStudy.outcome,
            lessons_learned: caseStudy.lessonsLearned,
            order_index: index,
          });
        });
      });
    });

    if (caseStudiesToInsert.length > 0) {
      console.log(`Migrating ${caseStudiesToInsert.length} case studies...`);
      
      const { data: insertedCaseStudies, error: caseStudiesError } = await supabase
        .from('case_studies')
        .upsert(caseStudiesToInsert)
        .select();

      if (caseStudiesError) {
        console.error('Error inserting case studies:', caseStudiesError);
        throw caseStudiesError;
      }

      console.log(`Successfully inserted ${insertedCaseStudies?.length || 0} case studies`);
    }

    console.log('✅ Course data migration completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Course data migration failed:', error);
    throw error;
  }
}

// Function to run migration (call this from console or a button in admin)
export async function runMigration() {
  if (confirm('Are you sure you want to migrate course data to Supabase? This will overwrite existing data.')) {
    try {
      await migrateCourseDataToSupabase();
      alert('Migration completed successfully!');
    } catch (error) {
      alert('Migration failed. Check console for details.');
      console.error(error);
    }
  }
}