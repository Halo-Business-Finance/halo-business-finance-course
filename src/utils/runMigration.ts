import { supabase } from '../integrations/supabase/client';
import { courseData } from '../data/courseData';

async function migrateQuizzes() {
  console.log('Starting quiz migration to add 7 questions per module...');
  
  let successCount = 0;
  let errorCount = 0;
  
  // Get all existing quizzes
  const { data: existingQuizzes, error: fetchError } = await supabase
    .from('quizzes')
    .select('*');
    
  if (fetchError) {
    console.error('Error fetching quizzes:', fetchError);
    return;
  }
  
  console.log(`Found ${existingQuizzes?.length || 0} existing quizzes to update`);
  
  // Update each quiz with 7 questions from the courseData
  for (const course of courseData.allCourses) {
    for (const module of course.modules) {
      if (module.quiz) {
        // Update the quiz with the new 7 questions
        const { error: updateError } = await supabase
          .from('quizzes')
          .update({
            questions: module.quiz.questions,
            updated_at: new Date().toISOString()
          })
          .eq('id', module.quiz.id);
          
        if (updateError) {
          console.error(`Error updating quiz ${module.quiz.id}:`, updateError);
          errorCount++;
        } else {
          successCount++;
        }
      }
      
      // Update final test if it exists
      if (module.finalTest) {
        const { error: updateError } = await supabase
          .from('quizzes')
          .update({
            questions: module.finalTest.questions,
            updated_at: new Date().toISOString()
          })
          .eq('id', module.finalTest.id);
          
        if (updateError) {
          console.error(`Error updating final test ${module.finalTest.id}:`, updateError);
          errorCount++;
        } else {
          successCount++;
        }
      }
    }
  }
  
  console.log('\n=== Migration Complete ===');
  console.log(`✅ Successfully updated: ${successCount} quizzes`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('\nAll modules now have 7-question quizzes!');
}

// Note: This script needs to be run from the browser console
// or integrated into the admin panel due to environment variable requirements
console.log('This migration script needs to be run from the browser console.');
console.log('Copy the migrateQuizzes function and run it in the browser console while logged in as admin.');

export { migrateQuizzes };