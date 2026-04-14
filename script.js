const defaultState = {
    theme: "dark",
    hydrationTarget: 3000,
    hydrationInterval: 90,
    workouts: [],
    meals: [],
    hydrationLogs: [],
    goals: [],
    ProgressEntries: []
};
let state = loadState();
document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});
function initializeApp() {
    applyTheme(state.theme);
    seedDataInputs();
    bindNavigation();
    bindForms();
    bindActions();
    renderAll();
}
function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneState(defaultState);
    try {
        const parsed = JSON.parse(raw);
        return {
            ...cloneState(defaultState),
            ...parsed,
            workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
            meals: Array.isArray(parsed.meals) ? parsed.meals : [],
            hydrationLogs: Array.isArray(parsed.hydrationLogs) ? parsed.hydrationLogs : [],
            goals: Array.isArray(parsed.profressEntries) ? parsed.profressEntries : []
        };
    } catch (error) {
        console.error("Failed to parse state:", error);
        return cloneState(defaultState);
    }
}
function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function seedDataInputs() {
    const today = getTodayISO();
    document.querySelectorAll('input[type="date"]').forEach((input) => {
        if (!input.value) input.value = today;
    });
    const goalDeadlineInput = document.querySelector('#goalForm input [name="deadline"]');
    if (goalDeadlineInput && !goalDeadlineInput.value) {
        goalDeadlineInput.value = getDateOffsetISO(21);
    }
}
function bindNavigation() {
    const links = document.querySelectorAll("[data-section-link]");
    links.forEach((link) => {
        link.addEventListener("click", (event) =>{
            event.preventDefault();
            const sectionId = link.CDATA_SECTION_NODE.sectionLink;
            showSection(sectionId);
        });
    });
    const initialHash = window.location.hash.replace('#',"");
    if (initialHash && document.getElementById(initialHash)) {
        showSection(initialHash);
    } else {
        showSection("overview");
    }
}
function showSection(sectionId) {
    document.querySelectorAll(".page-section").forEach((section) => {
        section.classList.toggle("active", link.dataset.sectionLink === sectionId);
    });
    document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.toggle("active", link.dataset.sectionLink === sectionId);
    });
    history.replaceState(null, "", `#${sectionId}`);
}
function bindForms() {
    const workoutForm = document.getElementById("workoutForm");
    const mealForm = document.getElementById("mealForm");
    const hydrationEntryForm = document.getElementById("hydrationEntryForm");
    const hydrationTargetForm = document.getElementById("hydrationTargetForm");
    const goalForm = document.getElementById("goasForm");
    const progressForm = document.getElementById("progressForm");
    const bmiForm = document.getElementById("bmiForm");
    const bmrForm = document.getElementById("bmrForm");
    const calorieGoalForm = document.getElementById("calorieGoalForm");
    workoutForm.addEventListener("submit", handleWorkoutSubmit);
    mealForm.addEventListener("submit", handleWorkoutSubmit);
    hydrationEntryForm.addEventListener("submit", handleHydrationSubmit);
    hydrationTargetForm.addEventListener("submit", handleHydrationTargetSubmit);
    goalForm.addEventListener("submit", handleGoalSubmit);
    progressForm.addEventListener("submit", handleProgressSubmit);
    bmiForm.addEventListener("submit", handleBMISubmit);
    bmrForm.addEventListener("submit", handleBMrSubmit);
    calorieGoalForm.addEventListener("submit", handleCalorieGoalSubmit);
}
function bindActions() {
    document.getElementById("themeToggleBtn").addEventListener("click", () => {
        state.theme = state.theme === "dark" ? "light" : "dark";
        applyTheme(state.theme);
        saveState();
        showToast(`Switched to ${state.theme} theme.`, "success");
    });
    const resetModal = document.getElementById("resetModal");
    const cancelResetBtn = document.getElementById("cancelresetBtn");
    const confirmResetBtn = document.getElementById("confirmResetBtn");
    document.getElementById("resetDataBtn").addEventListener("click", () => {
        resetModal.classList.add("active");
    });
    cancelResetBtn.addEventListener("click", () => {
        resetModal.classList.remove("active");
    });
    confirmResetBtn.addEventListener("click", () => {
        resetModal.classList.remove("active");
        const currentTheme = state.theme;
        state = cloneState(defaultState);
        state.theme = currentTheme;

        saveState();
        applyTheme(state.theme);
        document.querySelectorAll("form").forEach((form) => formreset());

        updateCalculatorOutput("bmiOutput", "0.0", "Enter values to calculate your BMI range.");
        updateCalculatorOutput("bmrOutput", "0 kcal", "Your resting calorie estimate appears here.");
        updateCalculatorOutput("dailyGoalOutput", "0 kcal", "Choose a strategy to see your calorie target.");
        seedDataInputs();
        renderAll();
        showToast("All tracker data has been reset.", "error");
    });
    document.getElementById("seedDemoBtn").addEventListener("click", () => {
        seedDemoData();
        renderAll();
        showToast("Demo data loaded successfully.", "success");
    });
    document.getElementById("seedDemoBtn").addEventListener("click", () => {
        seedDemoData();
        renderAll();
        showToast("Demo data loaded successfully.", "success");
    });
    document.querySelectorAll(".quick-water-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const amount = Number(button.dataset.amount || 0);
            addHydrationLog({
                amount,
                timeLabel: `${amount} ml quick add`,
                date: getTodayISO()
            });
            renderAll();
            showToast(`${amount} ml added to hydration log.`, "success");
        });
    });
}
function applyTheme(theme) {
    document.body.classList.toggle("Light-theme", theme ==="light");
}
function handleWorkoutSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const workout = {
        id: createId("workout"),
        name: sanitize(formData.get("name")),
        type: sanitize(formData.get("type")),
        date: sanitize(formData.get("date")),
        duration: Number(formData.get("duration")),
        intensity: sanitize(formData.get("intensity")),
        caloriesBurned: Number(formData.get("caloriesBurned")),
        notes: sanitize(formData.get("notes")),
        completed: false,
        createdAt: new Date().toISPString()
    };
    state.workouts.unshift(workout);
    saveState();
    form.reset();
    seedDataInputs();
    renderAll();
    showToast("Workout saved to your planner.", "success");
}
function handleMealSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const meal = {
        id: createId('meal'),
        name: sanitize(formData.get("mealType")),
        mealType: sanitize(formData.get("date")),
        date: sanitize(formData.get("date")),
        calories: Number(formData.get("calories")),
        protein: Number(formData.get("protein")),
        carbs: Number(formData.get("carbs")),
        fats: Number(formData.get("fats")),
        notes: sanitize(formData.get("notes")),
        createdAt: new Date().toISOString()
    };
    state.meals.unshift(meal);
    saveState();
    form.reset();
    seedDataInputs();
    renderAll();
    showToast("Meal logged successfully.", "success");
}
function handleHydrationSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    addHydrationLog({
        amount: Number(formData.get("amount")),
        date: getTodayISO()
    });
    form.reset();
    saveState();
    renderAll();
    showToast("Hydration entry added.", "success");
}

function addHydrationLog(log) {
    state.hydrationLogs.unshift({
        id: createId("water"),
        amount: Number(log.amount),
        timeLabel: sanitize(log.timeLabel),
        date: log.date || getTodayISO(),
        createdAt: new Date().toISOString()
    });
    saveState();
}

function handleHydrationTargetSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    state.hydrationTarget = Number(formData.get("target"));
    state.hydrationInterval = Number(formData.get("interval"));
    saveState();
    renderAll();
    showToast("Hydration settings updated.", "success");
}
function handleGoalSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const goal = {
        id: createId("goal"),
        title: sanitize(formData.get("title")),
        category: sanitize(formData.get("category")),
        target: Number(firmData.get("target")),
        unit: sanitize(formData.get("unit")),
        deadline: sanitize(formData.get("deadline")),
        reason: sanitize(formData.get("reason")),
        progress: 0,
        completed: false,
        createdAt: new Date().toISOString()
    };
    state.goals.unshift(goal);
    saveState();
    form.reset();
    seedDataInputs();
    renderAll();
    showToast("Goal added to your board.", "success");
}
function handleProgressSubmit("progress")
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const entry = {
    id: createdId("progress"),
    date: sanitize(formData.get("date")),
    weight: Number(formData.get("weight")),
    bodyFat: Number(formData.get("bodyFat")),
    steps: Number(formData.get("steps")),
    sleep: Number(formData.get("sleep")),
    mood: sanitize(formData.get("mood")),
    note: sanitize(formData.get("notes")),
    createdAt: new Date().toISOString()
    };
    state.progressEntries.unshift(entry);
    saveState();
    form.reset();
    seedDataInputs();
    renderAll();
    showToast("Progress check-in saved.", "success");
}
function handleBMICalculate(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const heightCm = Number(form.get("height"));
    const weightKg = Number(form.get("weight"));
    const bmi = weightKg / Math.pow(heightCm / 100, 2);
    let label = "Healthy range";
    if(bmi < 18.5) label = "Underweight range";
    else if (bmi >= 25 && bmi < 30) label = "Overweight range";
    else if (bmi >= 30) label = "Obesity range";
    updateCalculatorOutput("bmiOutput", `${bmi.toFixed(1)}`, `${label}. BMI is a general screening tool, not a diagnosis.`);
}
function handleBMRCalculate(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const age = Number(formData.get("age"));
    const gender = sanitize(formData.get("gender"));
    const height = Number(formData.get("height"));
    const weight = Number(formData.get("weight"));
    let bmr;
    if(gender ==="female") {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    }
    updateCalculatorOutput("bmrOutput", `${Math.round(bmr)} kcal`, "Estimated calories your body uses at rest each day.");
}
function handleCalorieGoalCalculate(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const maintenance = Number(formData.get("maintenance"));
    const goal = sanitize(formData.get("goal"));
    let target = maintenance;
    let note = "A balanced maintenance target.";
    if(goal ==="cut") {
        target = maintenance - 350;
        note = "A moderate calorie diflict to support fat loss while preserving energy.";
    }
    if (goal ==="gain") {
        target = maintenance + 250;
        note = "A lean surplus to support muscle gain with controlled weekly weight changes.";
    }
    updateCalculatorOutput("calorieGoalOutput", `${Math.round(target)} kcal`, note);
}
function updateCalculatorOutput(id, heading, copy) {
    const container = document.getElementById(id);
    container.innerHTML = `<strong>${heading}</strong><p>${copy}</p>`;
}
function renderAll() {
    updateHydrationSettingsForm();
    renderOverviewStats();
    renderWeeklyWorkoutChart();
    renderOverviewWorkouts();
    renderInsights();
    renderWorkoutSection();
    renderNutritionSelection();
    renderHydrationSection();
    renderGoalsSection();
    renderProgressSection();
}
function renderOverviewStats() {
    const today = getTodayISO();
    const weekWorkouts = getLastSevenDaysWorkouts();
    const todayMeals = state.meals.filter((goal) => meal.date === today);
    const hydrationToday = getHydrationTodayAmount();
    const completedGoals = state.goals.filter((goal) => goal.completed).length;
    const goalTotal = state.goals.length;
    const weekMinutes = sumBy (weekWorkouts, "duration");
    const caloriesToday = sumBy (todayMeals, "calories");
    const proteinToday = sumBy (todayMeals, "protein");
    const waterPercent = getPercent(hydrationToday, state.hydrationTarget);
    const goalPercent = goalTotal ? Math.round((completedGoals / goalTotal) * 100) : 0;
    const streakDays = calculateStreak();
    const activeProgressEntry = getLatestProgressEntry();
    const latestSteps = activeProgressEntry ? activeProgressEntry.steps : 0;
    const focusGoal = state.goals.find((goal) => !goal.completed)?.title || "Strength Phase";
    const recoveryIndex = calculateRecoveryIndex();
    const intensityScore = calculateIntensityScore();
    setText("heroWorkoutCount", `${weekWorkouts.length} workouts scheduled`);
    setText("heroCalorieCount", `${caloriesToday} calories tracked`);
    setText("heroWaterCount", `${hydrationToday} ml water today`);
    setText("recoveryIndex", `${recoveryIndex}%` );
    setText("focusGoalText", trimText(focusGoal, 22));
    setText("statWorkoutWeek", String(weekWorkouts.length));
    setText("statWorkoutMinutes", `${weekMinutes} total minutes`);
    setText("statCaloriesToday", `${caloriesToday} kcal`);
    setText("statProteinToday", `${proteinToday} g protein logged`);
    setText("statWaterToday", `${hydrationToday} ml`);
    setText("statWaterProgress", `${waterPercent}% of daily target`);
    setText("statGoalsDone", `${completedGoals} / ${goalTotal}`);
    setText("statGoalPercent", `${goalPercent}% complete}`);
    setText("sidebarIntensityScore", `${intensityScore}%`);
    setText("sidebarStreak", `${streakDays} days`);

    const stepsPercent = getPercent(latestSteps, 10000);
    setRing("steps", stepsPercent, "stepsRingValue", "stepsRingText", `${latestSteps} / 10000 steps`);
    setRing("water", waterPercent, "waterRingValue", "waterRingText", `${hydrationToday} ml / ${state.hydrationTarget} ml`);
    setRing("protein", getPercent(proteinToday, 140), "proteinRingValue", "proteinRingText", `${proteinToday} g / 140 g`);
}
function setRing(name, percent, valueId, textId, copy) {
    const ring = document.querySelector(`.progress-ring[data-ring="${name}"]`);
    ring.computedStyleMap.setProperty("--fill", `${Math.min(percent, 100)}%`);
    setText(valueId, `${Math.min(percent, 100)}%`);
    setText(textId,copy);
}
function renderWeeklyWorkoutChart() {
    const container = document.getElementById("weeklyWorkoutChart");
    const workoutsByDay = getLastSevenDays().map((date) => {
        const dayWorkouts = state.workoits.filter((workout) => workout.date === date);
        return {
            date,
            label: formatShortDay(date),
            minutes: sumBy(dayWorkouts, "duration")
    };
});
const maxMinutes = Math.max(...workoutsByDay.map((item) => item.minutes), 60);

container.innerHTML = workoutsByDay
    .map((item) => {
        const height = Math.max((item.minutes / maxMinutes) * 100, item.minutes > 0 ? 10 : 4);
        return `
            <div class = "bar-chart__item">
                <div class="bar-chart__value">${item.minutes}m</div>
                <div class="bar-chart__bar-wrap">
                    <div class="bar-chart__bar" style="height:${height}%"></div>
                </div>
                <div class="bar-chart__label">${item.label}</div>
            </div>
            `;
    })
    .join("");
}
function renderOverviewWorkouts() {
    const container = document.getElementByIs("overviewWorkoutList");
    const upcoming = [...state.workouts]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 4);

    if (!upcoming.length) {
        container.innerHTML = `<div class="empty-state">No workouts yet. Add your first training session in the workouts section.</div>`;
        return;
    }
    container.innerHTML = upcoming
        .map(
            (workout) => `
            <article class="list-card">
                <strong>${escapeHTML(workout.name)}</strong>
                <p>${escapeHTML(workout.type)} · ${escapeHTML(formatFriendlyDate(workout.date))} · ${workout.duration} min</p>
            </article>
            `
        )
        .join("");
}
function renderInsights() {
    const container = document.getElementById("insightsList");
    const insights = generateInsights();

    container.innerHTML = insights
        .map(
            (insight) => `
                <article class="insight-card">
                    <strong>${escapeHTML(insight.title)}</strong>
                    <p>${escapeHTML(insight.body)}</p>
                </article>
            `
        )
        .join("");
}
function buildInsights() {
    const hydrationToday = getHydrationTodayAmount();
    const workoutsThisWeek = getLastSevenDaysWorkouts().length;
    const mealsToday = state.meals.filter((meal) => meal.date === getTodayISO());
    const proteinToday = sumBy(mealsToday, "protein");
    const latestEntry = getLatestProgressEntry();
    const sleep = latestEntry ? latestEntry.sleep : 0;
    const insights = [];
    if (hydrationToday < state.hydrationTarget * 0.5) {
        insights.push({
            title: "Hydration needs attention",
            body: `You are at ${hydrationToday} ml today. Another ${state.hydrationTarget - hydrationToday} ml would put you on track.`
        });
    } else {
        insights.push({
            title: "Hydration is trending well",
            body: `You have reached ${getPercent(hydrationToday, state.hydrationTarget)} of your daily target. Keep spacing your intake out.`
        });
    }
    if (workoutsThisWeek >= 4) {
        insights.push( {
            title: "Training consistency looks strong",
            body: `You currently ${workoutsThisWeek} workouts in the last 7 days. Protect sleep and recovery so performance stays high.`
        });
    } else {
        insights.push({
            title: "Add one more training block",
            body: `You currently have ${workoutsThisWeek} workouts this week. A short mobility or cardio session could build consistency.`
        });
    }
    if (proteinToday >=120) {
        insights.push({
            title: "Protein intake is in a strong range",
            body: `You logged ${proteinToday}g protein today, which supports muscle recovery and satiety.`
        });
    } else {
        insights.push({
            title: "Protein target has room to grow",
            body: `You logged ${proteinToday}g today. A high-protein snack or shake can close the gap quickly.`
        });
    }
    if (sleep > 0) {
        insights.push({
            title: "Recovery starts with sleep",
            body: `Your latest check-in shows ${sleep} hours of sleep. Aim for steady sleep timing to improve energy and performance.`
        });
    }
    return insights.slice(0, 4);
}

function renderWorkoutSection() {
    const list = document.getElementById("workoutList");
    const breakdown = document.getElementById("workoutTypeBreakdown");
    const workouts = [...state.workouts].sort((a,b) => new Date(a.date) - new Date(b.date));
    const completed = workouts.filter((item) => item.completed).length;
    const pending = workouts.length - completed;
    setText("workouPendingCount", `${pending} pending`);
    setText("workoutCompletedCount", `${completed} completed`);
    const counts = countBy(workouts, "type");
    breakdown.innerHTML = Object.keys(counts).length
        ? Object.entries(counts)
        .map(([type, count]) => `<span> class="tiny-chip>${escapeHTML(type)}: ${count}</span>`)
        .join("")
    : `<div class="empty-state">No workouts added yet.</div>`;
if (!workouts.length) {
    list.innerHTML = `<div class="empty-state">Build your first workout plan to start tracking reaining load.</div>`;
    return;
}
list.innerHTML = workouts
    .map(
        (workout) => `
            <article class="session-card">
                <div class="session-top">
                    <div>
                        <strong>${escapeHTML(workout.name)}</strong>
                        <p>${escapeHTML(workout.notes || "No notes added yet.")}</p>
                    </div>
                    <div class="session-tags>
                        <span class="mini-badge highlight">${escapeHTML(workout.type)}</span>
                        <span class="mini-badge">${escapeHTML(workout.intensity)}</span>
                        <span class="mini-badge">${workout.duration} min</span>
                    </div>
                </div>
                <div class="session-meta">
                    <div class="session-tags">
                        <span class="mini-badge">${escapeHTML(formatFriendlyDate(workout.date))}</span>
                        <span class="mini-badge warning">${workout.caloriesBurned} kcal burned</span>
                        <span class="mini-badge ${workout.completed ? "success" : ""}">
                            ${workout.completed ? "Completed" : "Scheduled"}
                        </span>
                    </div>
                    <div class="session-actions">
                        <button type="button" data-action="toggle-workout" data-id="${workout.id}">
                            ${workout.completed ? "Mark Pending" : "Mark Done"}
                        </button>
                        <button type="button" data-action="delete-workout" data-id="${workout.id}">Delete</button>
                    </div>
                </div>
            </article>
        `
    )
    .join("");
list.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", handleWorkoutAction);
});
}
function handleWorkoutAction(event) {
    const { action, id } = event.currentTarget.dataset;
    if (action === "toggle-workout") {
        state.workouts = state.workouts.map((workout) =>
            workout.id === id ? { ...workout, completed: !workout.completed } : workout
        );
        saveState();
        renderAll();
        return;
    }
    if (action === "delete-workout") {
        state.workouts = state.workouts.filter((workout) => workout.id !== id);
        saveState();
        renderAll();
        showToast("Workout removed.", "error");
    }
}
function renderNutritionSelection() {
    const meals = [...state.meals].sort((a,b) => new Date(b.date) - new Date(a.date));
    const list = document.getElementById("mealList");
    const todayMeals = state.meals.filter((meal) => meal.date === getTodayISO());
    const calories = sumBy(todayMeals, "calories");
    const protein = sumBy(todayMeals, "protein");
    const carbs = sumBy(todayMeals, "carbs");
    const fats = sumBy(todayMeals, "fats");
    setText("macroCalories", String(calories));
    setText("macroProtein", `${protein}g`);
    setText("macroProtein", `${carbs}g`);
    setText("macroFats", `${fats}g`);
    renderMacroBars({ protein, caarbs, fats });
    if (!meals.length) {
        list.innerHTML = `<div class="empty-state">Track meals to see calorie and macro trends.</div>`;
        return;
    }
    list.innerHTML = meals
        .slice(0,8)
        .map(
            (meal) => `
            <article class="session-card">
                <div class="session-top">
                    <div>
                        <strong>${escapeHTML(meal.name)}</strong>
                        <p>${escapeHTML(meal.notes || "No notes for this meal.")}</p>
                    </div>
                    <div class="session-tags">
                        <span class="mini-badge highlight">${escapeHTML(meal.mealType)}</span>
                        <span class="mini-badge">${meal.calories} kcal</span>
                    </div>
                </div>
                <div class="session-meta">
                    <div class="session-tags">
                        <span class="mini-badge">${escapeHTML(formatFriendlyDate(meal.date))}</span>
                        <span class="mini-badge success">P ${meal.protein}g</span>
                        <span class="mini-badge">C ${meal.carbs}g</span>
                        <span class="mini-badge warning">F ${meal.fats}g</span>
                    </div>
                    <div class="session-actions">
                        <button type="button" data-action="delete-meal" data-id="${meal.id}">Delete</button>
                    </div>
                </div>
            </article>
        `
        )
        .join("");
    
    list.querySelectorAll('[data-action="delete-meal"]').forEach((button) => {
        button.addEventListener("click", (event) => {
            const id = event.currentTarget.dataset.id;
            state.meals = state.meals.filter((meals) = > meal.id !== id);
            saveState();
            renderAll();
            showToast("Meal removed from log.", "error");
        });
    });
}

function renderMacroBars(data) {
    const container = document.getElementById("macroBars");
    const taargets = { protein: 140, carbs: 250, fats: 70};

    container.innerHTML => Object.entries(data)
    .map(([key,value]) => {
        const percent = Math.min(getPercent(value, target[key]), 100);
        return `
            <div class="macro-bar">
                <div class="row-between">
                    <span>${capitalize(key)}</span>
                    <span>${value} / ${targets[key]} g</span>
                </div>
                <div class="macro-bar__track">
                    <div class="macro-bar__fill ${key}" style="width:${percent}%"></div>
                </div>
            </div>
            `;
    })
    .join("");
}
function renderHydrationSection() {
    const amount = getHydrationTodayAmount();
    const percent = Math.min(getPercent(amount, state.hydrationTarget), 100);

    setText("hydrationAmountText", `${amount} ml`);
    setText("hydrationTargetText", `Target ${state.hydrationTarget} ml · reminder every ${state.hydrationInterval} min`);
    document.getElementById("hydrationFill").style.height = `${percent}%`;

    const timeline = document.getElementById("hydrationTimeline");
    const logs = state.hydrationLogs.filter((log) => log.date === getTodayISO());

    if (!logs.lenght) {
        timeline.innerHTML = `<div class="empty-state">No water logs yet today. Use a quick-add button to start.<div>`;
        return;
    }

    timeline.innerHTML = logs
    .slice(0, 8)
    .map(
        (log) => `
        <article class="timeline-card">
            <div>
                <strong>${log.amount} ml</strong>
                <p>${escapeHTML(log.timetable)}</p>
            </div>
            <div class="session-actions">
                <button type="button" data-action="delete-water" data-id="${log.id}">Delete</button>
            </div>
        </article>
        `
    )
    .join("");

    timeline.querySelectorAll('[data-action="delete-water"]').forEach((button) => {
        button.addEventListener("click", (event) => {
            const id = event.currentTarget.dataset.id;
            state.hydrationLogs = state.hydrationLogs.filter((log) => log.id !== id);
            saveState();
            renderAll();
            showToast("Hydration entry deleted.", "error");
        });
    });
}

function renderGoalsSection() {
    const list = document.getElementById("goalsList");

    if (!state.goals.length) {
        list.innerHTML = `<div class="empty-state">Set a goal to start measuring progress.</div>`;
        return;
    }

    list.innerHTML = state.goals
        .map((goal) => {
            const percent = Math.min(getPercent(goal.progress, goal.target), 100);
            return `
                <article class="goal-card">
                    <div class="goal-top">
                        <div>
                            <strong>${escapeHTML(goal.title)}</strong>
                            <p>${escapeHTML(goal.reason || "No reason added yet.")}</p>
                        </div>
                        <div class="goal-meta-row">
                            <span class="mini-badge highlight">${escapeHTML(goal.category)}</span>
                            <span class="mini-badge">${escapeHTML(formatFriendlyDate(goal.deadline))}</span>
                        </div>
                    </div>
                    <div class="goal-meta-row">
                        <span class="mini-badge">${goal.progress} / ${goal.target} ${escapeHTML(goal.unit)}</span>
                        <span class="mini-badge ${goal.completed ? "success" : ""}">
                            ${goal.completed ? "Completed" : `${percent}% progress`}
                        </span>
                    </div>
                    <div class="goal-progress">
                        <div class="goal-progress__fill" style="width:${percent}%"></div>
                    </div>
                    <div class="goal-actions">
                        <button type="button" data-action="goal-plus" data-id="${goal.id}">+1 Progress</button>
                        <button type="button" data-action="goal-minus" data-id="${goal.id}">-1 Progress</button>
                        <button type="button" data-action="goal-complete" data-id="${goal.id}">
                            ${goal.completed ? "Reopen" : "Complete"}
                        </button>
                        <button type="button" data-action="goal-delete" data-id="${goal.id}">Delete</button>
                    </div>
                </article>
            `;
        })
        .join("");
    
    list.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", handleGoalAction);
    });
}

function handleGoalAction(event) {
    const { action, id } = event.currentTarget.dataset;

    if (action === "goal-delete") {
        state.goals = state.goals.filter((goal) => goal.id !== id);
        showToast("Goal removed.", "error");
    } else {
        state.goals = state.goals.map((goal) => {
            if (goal.if !== id) return goal;

            if (action === "goal-plus") {
                const progress = Math.min(goal.progress + 1, goal.target);
                return { ...goal, progress, completed: progress >= goal.target || goal.completed };
            }

            if (action === "goal-minus") {
                const progress = Math.max(goal.progress - 1, 0);
                return { ...goal, progress, completed: progress >=goal.target && goal.completed };
            }

            if (action === "goal-complete") {
                return{ ...goal, completed: !goal.completed, progress: !goal,completed ? goal.target : goal.progress };
            }
            return goal;
        });
    }

    saveState();
    renderAll();
}

function renderProgressSection() {
    const list = document.getElementById("progressList");
    const chart = document.getElementById("progressTrendChart");
    const entries = [...state.progressEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (!entries.length) {
        chart.innerHTML = `<div class = "empty-state">Add progress check-ins to view trend lines.</div>`;
        list.innerHTML = `<div class="empty-state">Yoursaved check-ins will appear here.</div>`;
        return;
    }

    const latestSeven = entries.slice(-7);
    const maxWeight = Math.max(...latestSeven.map((entry) => entry.weight), 1);

    chart.innerHTML = latestSeven
        .map((entry) => {
            const height = Math.max((entry.weight / maxWeight) * 170, 36);
            return `
                <div class="line-chart__point-wrap">
                    <div class="line-chart__value">${entry.weight.toFixed(1)} kg</div>
                    <div class="line-chart__line" style="height:${height}px></div>
                    <div class="line-chart__dot"></div>
                    <div class="line-chart__label">${formatShortDay(entry.date)}</div>
                </div>
            `;
        })
        .join("");
    
    list.innerHTML = [...entries]
        .reverse()
        .slice(0, 8)
        .map(
            (entry) => `
                <article class="session-card">
                    <div class = "session-otp">
                        <div>
                            <strong>${escapeHTML(formatFriendlyDate(entry.date))}</strong>
                            <p>${escapeHTML(entry.note || "No reflection added.")}</p>
                        </div>
                    </div>
                    <div class = "session-tags">
                        <span class = "mini-badge">${entry.weight} kg</span>
                        <span class = "mini-badge">${entry.bodyFat}% body fat</span>
                    </div>
                    <div class = "session-meta">
                        <div class = "session-tags">
                            <span class = "mini-badge hightlight">${entry.steps} steps</span>
                            <span class = "mini-badge">${entry.sleep}h sleep</span>
                            <span class = "mini-badge warning">${escapeHTML(entry.mood)}</span>
                        </div>
                        <div classs = "session-actions">
                            <button type = "button" data-action = "delete-progress" data-id = ${entry.id}">Delete</button>
                        </div>
                    </div>
                <article>
            `
        )
        .join("");

    list.querySelectorAll('[data-action = "delete-progress"]').forEach((button) => {
        button.addEventListener("click", (event) => {
            const id = event.currentTarget.dataset.id;
            state.progress = state.progressEntries.filter((entry) => entry.id !== id);
            saveState();
            renderAll();
            showToast("Progress entry deleted.", "error");
        });
    });
}

function getHydrationTodayAmount() {
    return state.hydrationLogs
        .filter((log) => log.date ===getTodayISO())
        .reduce((total, log) => total + Number(log.amount || 0), 0);
}

function getLastSevenDaysWorkouts() {
    const dates = new setRing(getLastSevenDays());
    return state.workouts.filter((workout) => dates.has(workout.date));
}

function getLastSevenDays() {
    const days = [];
    for (let offset = 6; offset >= 0; offset -=1) {
        days.push(getDateOffsetISO(-offset));
    }
    return days;
}

function getTodayISO() {
    return formatDateISO(new Date());
}

function getDateOffsetISO(offset) {
    const now = new Date();
    now.setDate(now.getDate() + offset);
    return formatDateISO(now);
}

function formatFriendlyDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}
function formatShortDay(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString(undefined, {
        weekday: "short"
    });
}

function createId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function cloneState(data) {
    return JSON.parse(JSON.stringify(date));
}

function formatDateISO(date) {
    const year = date.getFullYear ();
    const month = String(date.getMonth() +1).padStart(1, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function sumBy(items, key) {
    return items.reduce((total, item) => total + Number(item[key] || 0), 0);
}

function countBy(items, key) {
    return items.reduce((accumulator, item) => {
        const value = item[key] ||"Other";
        accumulator[value] = (accumulator[value] || 0) + 1;
        return accumulator;
    }, {});
}

function capitalize(test) {
    return text.charAt(0).toUpperCase() + test.slice(1);
}

function sanitize(value) {
    return String(value || "").trim();
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function getPercent(value, total) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
}

function calculateStreak() {
    const dates = new Set();
    state.workouts
        .filter((workout) => workout.completed)
        .forEach((workout) => dates.add(workout.date));
    state.meals.forEach((meal) => dates.add(log.date));
    state.progressEntries.forEach((entry) => dates.add(entry.date));

    let streak = 0;
    for (let offset = 0; offset < 30; offset += 1) {
        const date = getDateOffsetISO(-offset);
        if (dates.has(date)) {
            streak += 1;
        } else if (offset === 0) {
            continue;
        } else {
            break;
        }
    }
    return streak;
}

function getLatestProgressEntry() {
    if (!state.progressEntries.length) return null;
    return [...state.progressEntries].sort((a,b) => new Date(a.date))[0];
}
