import { useState, useEffect } from "react";
import CalendarPage from "./CalendarPage";

function TrainingPlanPage({ supabase, user, trainingPlan, setActiveTab }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [workoutTypes, setWorkoutTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTrainingPlans();
      fetchWorkoutTypes();
    }
  }, [user]);

  async function fetchTrainingPlans() {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data } = await supabase
        .from('training_plans')
        .select('*')
        .eq('user_id', user.user_id)
        .order('creation_date', { ascending: false });
      
      setTrainingPlans(data || []);
    } catch (error) {
      console.error('Error fetching training plans:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchWorkoutTypes() {
    try {
      const { data } = await supabase
        .from('workout_types')
        .select('*')
        .order('name');
      
      setWorkoutTypes(data || []);
    } catch (error) {
      console.error('Error fetching workout types:', error);
    }
  }

  if (showCalendar) {
    return (
      <div>
        <button 
          className="link-button"
          onClick={() => setShowCalendar(false)}
          style={{ marginBottom: '2rem' }}
        >
          ← Back to Training Plan
        </button>
        <CalendarPage 
          supabase={supabase} 
          user={user} 
          trainingPlan={trainingPlan} 
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="training-plan-container">
        <h1>Training Plan</h1>
        <div className="empty-state">
          <p>Please log in to view your training plans.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="training-plan-container">
      <h1>Training Plan</h1>
      
      {loading ? (
        <div className="loading-state">Loading training plans...</div>
      ) : (
        <>
          {trainingPlan && (
            <div className="current-plan">
              <h2>Current Training Plan</h2>
              <div className="plan-card active-plan">
                <h3>{trainingPlan.plan_name}</h3>
                <div className="plan-details">
                  <p><strong>Race Date:</strong> {new Date(trainingPlan.race_date).toLocaleDateString()}</p>
                  <p><strong>Target Distance:</strong> {trainingPlan.target_distance}</p>
                  <p><strong>Fitness Level:</strong> {trainingPlan.fitness_level}</p>
                  <p><strong>Total Weeks:</strong> {trainingPlan.total_weeks}</p>
                  <p><strong>Created:</strong> {new Date(trainingPlan.creation_date).toLocaleDateString()}</p>
                </div>
                <div className="plan-actions">
                  <button 
                    className="link-button"
                    onClick={() => setShowCalendar(true)}
                  >
                    View Calendar
                  </button>
                  <button 
                    className="link-button secondary"
                    onClick={() => setActiveTab('calendar')}
                  >
                    Go to Calendar Tab
                  </button>
                </div>
              </div>
            </div>
          )}

          {trainingPlans.length > 0 && (
            <div className="all-plans">
              <h2>All Training Plans</h2>
              <div className="plans-grid">
                {trainingPlans.map((plan) => (
                  <div 
                    key={plan.plan_id} 
                    className={`plan-card ${plan.plan_id === trainingPlan?.plan_id ? 'current' : ''}`}
                  >
                    <h3>{plan.plan_name}</h3>
                    <div className="plan-details">
                      <p><strong>Race Date:</strong> {new Date(plan.race_date).toLocaleDateString()}</p>
                      <p><strong>Target Distance:</strong> {plan.target_distance}</p>
                      <p><strong>Fitness Level:</strong> {plan.fitness_level}</p>
                      <p><strong>Total Weeks:</strong> {plan.total_weeks}</p>
                    </div>
                    {plan.plan_id === trainingPlan?.plan_id && (
                      <div className="current-badge">Current Plan</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {workoutTypes.length > 0 && (
            <div className="workout-types">
              <h2>Available Workout Types</h2>
              <div className="workout-types-grid">
                {workoutTypes.map((type) => (
                  <div key={type.id} className="workout-type-card">
                    <h4>{type.name}</h4>
                    {type.description && <p>{type.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {trainingPlans.length === 0 && (
            <div className="empty-state">
              <h2>No Training Plans Found</h2>
              <p>You don't have any training plans yet. Create one to get started!</p>
              <button 
                className="link-button"
                onClick={() => setShowCalendar(true)}
              >
                Access Calendar Page
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TrainingPlanPage;