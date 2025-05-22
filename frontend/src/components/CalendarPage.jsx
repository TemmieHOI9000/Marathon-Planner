import { useState, useEffect } from "react";

function CalendarPage({ supabase, user, trainingPlan }) {
  const [viewType, setViewType] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trainingPlan) {
      fetchWorkouts();
    }
  }, [trainingPlan, currentDate, viewType]);

  async function fetchWorkouts() {
    if (!trainingPlan) return;
    
    setLoading(true);
    try {
      const { data: workoutData } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_types (name, description)
        `)
        .eq('training_plan_id', trainingPlan.plan_id)
        .order('week_number')
        .order('day_of_week');

      setWorkouts(workoutData || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrentPeriod = () => {
    const options = { 
      year: 'numeric', 
      month: 'long',
      ...(viewType === 'day' && { day: 'numeric' })
    };
    
    if (viewType === 'week') {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      startOfWeek.setDate(currentDate.getDate() - day);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `Week of ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    
    return currentDate.toLocaleDateString('en-US', options);
  };

  const getWorkoutsForPeriod = () => {
    if (!trainingPlan || !workouts.length) return [];

    const planStartDate = new Date(trainingPlan.creation_date);
    
    return workouts.filter(workout => {
      const workoutDate = new Date(planStartDate);
      workoutDate.setDate(planStartDate.getDate() + ((workout.week_number - 1) * 7) + (workout.day_of_week - 1));
      
      if (viewType === 'month') {
        return workoutDate.getMonth() === currentDate.getMonth() && 
               workoutDate.getFullYear() === currentDate.getFullYear();
      } else if (viewType === 'week') {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(currentDate.getDate() - day);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
      } else if (viewType === 'day') {
        return workoutDate.toDateString() === currentDate.toDateString();
      }
      
      return false;
    });
  };

  const formatWorkoutDate = (workout) => {
    if (!trainingPlan) return '';
    
    const planStartDate = new Date(trainingPlan.creation_date);
    const workoutDate = new Date(planStartDate);
    workoutDate.setDate(planStartDate.getDate() + ((workout.week_number - 1) * 7) + (workout.day_of_week - 1));
    
    return workoutDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    
    switch (viewType) {
      case 'month':
        newDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(currentDate.getDate() - 1);
        break;
    }
    
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    
    switch (viewType) {
      case 'month':
        newDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(currentDate.getDate() + 1);
        break;
    }
    
    setCurrentDate(newDate);
  };

  return (
    <div className="calendar-container">
      <h1>Calendar Page</h1>
      
      <div className="view-toggle">
        <button 
          className={`view-button ${viewType === 'month' ? 'active' : ''}`}
          onClick={() => setViewType('month')}
        >
          Month
        </button>
        <button 
          className={`view-button ${viewType === 'week' ? 'active' : ''}`}
          onClick={() => setViewType('week')}
        >
          Week
        </button>
        <button 
          className={`view-button ${viewType === 'day' ? 'active' : ''}`}
          onClick={() => setViewType('day')}
        >
          Day
        </button>
      </div>

      <div className="calendar-header">
        <button className="nav-button" onClick={navigatePrevious}>
          ← Previous
        </button>
        
        <div className="current-period">
          {formatCurrentPeriod()}
        </div>
        
        <button className="nav-button" onClick={navigateNext}>
          Next →
        </button>
      </div>

      <div className="calendar-content">
        {!trainingPlan ? (
          <div className="no-plan-state">
            <p>No active training plan found.</p>
            <p>Create a training plan to see your workouts here.</p>
          </div>
        ) : loading ? (
          <div className="loading-state">
            <p>Loading workouts...</p>
          </div>
        ) : (
          <div className="workouts-display">
            <h3>Workouts for {formatCurrentPeriod()}</h3>
            {getWorkoutsForPeriod().length === 0 ? (
              <p className="no-workouts">No workouts scheduled for this period.</p>
            ) : (
              <div className="workout-list">
                {getWorkoutsForPeriod().map((workout) => (
                  <div key={workout.workout_id} className="workout-card">
                    <div className="workout-header">
                      <h4>{workout.title}</h4>
                      <span className="workout-date">{formatWorkoutDate(workout)}</span>
                    </div>
                    <div className="workout-details">
                      <p><strong>Type:</strong> {workout.workout_types?.name}</p>
                      {workout.distance_miles && (
                        <p><strong>Distance:</strong> {workout.distance_miles} miles</p>
                      )}
                      {workout.duration_minutes && (
                        <p><strong>Duration:</strong> {workout.duration_minutes} minutes</p>
                      )}
                      {workout.target_pace && (
                        <p><strong>Target Pace:</strong> {workout.target_pace}</p>
                      )}
                      {workout.description && (
                        <p><strong>Description:</strong> {workout.description}</p>
                      )}
                      <div className="workout-status">
                        <span className={`status-badge ${workout.is_completed ? 'completed' : 'pending'}`}>
                          {workout.is_completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarPage;