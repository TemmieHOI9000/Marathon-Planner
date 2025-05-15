import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

function App() {
  const [workout_types, setworkout_types] = useState([]);

  useEffect(() => {
    getworkout_types();
  }, []);

  async function getworkout_types() {
    const { data } = await supabase.from("workout_types").select();
    setworkout_types(data);
  }

  return (
    <ul>
      {workout_types.map((instrument) => (
        <li key={instrument.name}>{instrument.name}</li>
      ))}
    </ul>
  );
}

export default App;