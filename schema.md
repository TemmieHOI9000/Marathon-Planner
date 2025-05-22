Database
# users #

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| user_id | integer | not null | nextval('users_user_id_seq'::regclass) | users_pkey |
| name                     | character varying(100)      | not null | | |
| email                    | character varying(255)      | not null | | UNIQUE |
| current_training_plan_id | integer                     | yes | |  fk_current_training_plan|
| created_at               | timestamp without time zone | yes | CURRENT_TIMESTAMP| |

# training_plans #
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
|  plan_id         | integer                |  not null | nextval('training_plans_plan_id_seq'::regclass) | training_plans_pkey |
| user_id         | integer                |  not null | | training_plans_user_id_fkey |
| plan_name       | character varying(100) |  not null | | |
| race_date       | date                   |  not null | 
| creation_date   | date                   |  not null | CURRENT_DATE
| fitness_level   | character varying(50)  | not null |
| target_distance | character varying(50)  |  not null |
total_weeks     | integer                |   yes  | generated always as (ceil(((race_date - creation_date) / 7)::double precision)::integer) stored

# workouts #
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| workout_id       | integer                |  not null | nextval('workouts_workout_id_seq'::regclass) | workouts_pkey
| training_plan_id | integer                | not null | | uniqueness, fk_training_plan
| workout_type_id  | integer                | not null | | fk_workout_type
| week_number      | integer                | not null | | uniqueness,  CHECK (week_number > 0)
|  day_of_week      | integer               | not null | | uniqueness,  CHECK (day_of_week >= 1 AND day_of_week <= 7)
| title            | character varying(100) | not null |
| description      | text                   | 
| distance_miles   | numeric(5,2)           |
| duration_minutes | integer                | 
| target_pace      | character varying(20)  |
| is_completed     | boolean                | | false | |
| completion_notes | text                   | 

# workout_types #
| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id          | integer               | not null | nextval('workout_types_id_seq'::regclass) | workout_types_pkey
| name        | character varying(50) | not null | | UNIQUE |
| description | text                  |