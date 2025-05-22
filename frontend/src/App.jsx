import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import CalendarPage from "./components/CalendarPage";
import TrainingPlanPage from "./components/TrainingPlanPage";
import "./App.css";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

function App() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [user, setUser] = useState(null);
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeData();
  }, []);

  async function initializeData() {
    try {
      // For demo purposes, we'll use the first user
      // In a real app, you'd get this from authentication
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (userData && userData.length > 0) {
        const currentUser = userData[0];
        setUser(currentUser);

        // Get current training plan if exists
        if (currentUser.current_training_plan_id) {
          const { data: planData } = await supabase
            .from('training_plans')
            .select('*')
            .eq('plan_id', currentUser.current_training_plan_id)
            .single();
          
          setTrainingPlan(planData);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="App">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <nav className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === "calendar" ? "active" : ""}`}
          onClick={() => setActiveTab("calendar")}
        >
          Calendar Page
        </button>
        <button 
          className={`tab-button ${activeTab === "training" ? "active" : ""}`}
          onClick={() => setActiveTab("training")}
        >
          Training Plan
        </button>
      </nav>

      <main className="tab-content">
        {activeTab === "calendar" && (
          <CalendarPage 
            supabase={supabase} 
            user={user} 
            trainingPlan={trainingPlan} 
          />
        )}
        {activeTab === "training" && (
          <TrainingPlanPage 
            supabase={supabase} 
            user={user} 
            trainingPlan={trainingPlan}
            setActiveTab={setActiveTab}
          />
        )}
      </main>
    </div>
  );
}

export default App;