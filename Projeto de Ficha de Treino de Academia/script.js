document.addEventListener('DOMContentLoaded', () => {
    // ---------------------- Navegação entre seções ----------------------
    const sectionButtons = {
        'workout-icon': 'workout-section',
        'nutrition-icon': 'nutrition-section',
        'progress-icon': 'progress-section',
        'measurements-icon': 'measurements-section',
        'motivation-icon': 'motivation-section'
    };

    const toggleSection = (sectionId) => {
        document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
        document.getElementById(sectionId)?.classList.remove('hidden');
    };

    toggleSection('workout-section');

    Object.entries(sectionButtons).forEach(([iconId, sectionId]) => {
        document.getElementById(iconId)?.addEventListener('click', () => toggleSection(sectionId));
    });

    // ---------------------- Utilitário: salvar e carregar do localStorage ----------------------
    const storage = {
        load: (key) => JSON.parse(localStorage.getItem(key)) || [],
        save: (key, data) => localStorage.setItem(key, JSON.stringify(data))
    };

    const confirmDelete = () => confirm("Tem certeza que deseja excluir este item?");

    // ---------------------- Treinos ----------------------
    const workoutForm = document.getElementById('workout-form');
    const workoutTable = document.getElementById('workout-table');

    const renderWorkouts = () => {
        const workouts = storage.load('workouts');
        workoutTable.innerHTML = workouts.map((w, i) => `
            <tr>
                <td>${w.name}</td>
                <td>${w.sets}</td>
                <td>${w.reps}</td>
                <td>${w.division}</td>
                <td><button onclick="removeWorkout(${i})">🗑️</button></td>
            </tr>
        `).join('');
    };

    const saveWorkout = (e) => {
        e.preventDefault();
        const name = document.getElementById('exercise-name').value.trim();
        const sets = +document.getElementById('sets').value;
        const reps = +document.getElementById('reps').value;
        const division = document.getElementById('workout-type').value;

        if (!name || sets <= 0 || reps <= 0 || !division) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        const workouts = storage.load('workouts');
        workouts.push({ name, sets, reps, division });
        storage.save('workouts', workouts);
        renderWorkouts();
        workoutForm.reset();
    };

    window.removeWorkout = (i) => {
        if (!confirmDelete()) return;
        const workouts = storage.load('workouts');
        workouts.splice(i, 1);
        storage.save('workouts', workouts);
        renderWorkouts();
    };

    workoutForm.addEventListener('submit', saveWorkout);
    renderWorkouts();

    // ---------------------- Nutrição ----------------------
    const nutritionForm = document.getElementById('nutrition-form');
    const nutritionTable = document.getElementById('nutrition-table');

    const renderNutrition = () => {
        const data = storage.load('nutrition');
        nutritionTable.innerHTML = data.map((n, i) => `
            <tr>
                <td>${n.day || '-'}</td>
                <td>${n.food}</td>
                <td>${n.quantity}</td>
                <td>${n.calories}</td>
                <td><button onclick="removeNutrition(${i})">🗑️</button></td>
            </tr>
        `).join('');
    };

    const saveNutrition = (e) => {
        e.preventDefault();
        const food = document.getElementById('food-name').value.trim();
        const quantity = +document.getElementById('quantity').value;
        const calories = +document.getElementById('calories').value;
        const day = document.getElementById('nutrition-day').value;

        if (!food || quantity <= 0 || calories <= 0 || !day) {
            alert("Preencha todos os campos corretamente.");
            return;
        }

        const data = storage.load('nutrition');
        data.push({ food, quantity, calories, day });
        storage.save('nutrition', data);
        renderNutrition();
        nutritionForm.reset();
    };

    window.removeNutrition = (i) => {
        if (!confirmDelete()) return;
        const data = storage.load('nutrition');
        data.splice(i, 1);
        storage.save('nutrition', data);
        renderNutrition();
    };

    nutritionForm.addEventListener('submit', saveNutrition);
    renderNutrition();

    // ---------------------- Medições ----------------------
    const measurementsForm = document.getElementById('measurements-form');
    const measurementsTable = document.getElementById('measurements-table');

    const renderMeasurements = () => {
        const data = storage.load('measurements');
        measurementsTable.innerHTML = data.map((m, i) => `
            <tr>
                <td>${m.date}</td>
                <td>${m.chest}</td>
                <td>${m.waist}</td>
                <td>${m.hips}</td>
                <td>${m.arms}</td>
                <td>${m.thighs}</td>
                <td><button onclick="removeMeasurement(${i})">🗑️</button></td>
            </tr>
        `).join('');
    };

    const saveMeasurement = (e) => {
        e.preventDefault();
        const date = new Date().toLocaleDateString();
        const chest = +document.getElementById('chest').value;
        const waist = +document.getElementById('waist').value;
        const hips = +document.getElementById('hips').value;
        const arms = +document.getElementById('arms').value;
        const thighs = +document.getElementById('thighs').value;

        if ([chest, waist, hips, arms, thighs].some(v => v <= 0)) {
            alert("Preencha todos os campos com valores válidos.");
            return;
        }

        const data = storage.load('measurements');
        data.push({ date, chest, waist, hips, arms, thighs });
        storage.save('measurements', data);
        renderMeasurements();
        measurementsForm.reset();
    };

    window.removeMeasurement = (i) => {
        if (!confirmDelete()) return;
        const data = storage.load('measurements');
        data.splice(i, 1);
        storage.save('measurements', data);
        renderMeasurements();
    };

    measurementsForm.addEventListener('submit', saveMeasurement);
    renderMeasurements();

    // ---------------------- Exportar PDF ----------------------
    const exportPDF = (title, headers, fileName, data) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text(title, 14, 10);
        doc.autoTable({
            startY: 14,
            head: [headers],
            body: data,
            theme: 'grid'
        });

        doc.save(fileName);
    };

    document.getElementById('export-workout-pdf').addEventListener('click', () => {
        const workouts = storage.load('workouts');
        exportPDF('Treinos', ['Exercício', 'Séries', 'Repetições', 'Divisão'], 'treinos.pdf',
            workouts.map(w => [w.name, w.sets, w.reps, w.division])
        );
    });

    document.getElementById('export-nutrition-pdf').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const nutrition = storage.load('nutrition');

        const grouped = nutrition.reduce((acc, item) => {
            const day = item.day || 'Sem dia';
            acc[day] = acc[day] || [];
            acc[day].push([item.food, item.quantity, item.calories]);
            return acc;
        }, {});

        let y = 10;
        doc.text("Nutrição por Dia da Semana", 14, y);
        y += 6;

        Object.entries(grouped).forEach(([day, items]) => {
            doc.text(day, 14, y);
            y += 4;

            doc.autoTable({
                startY: y,
                head: [['Alimento', 'Quantidade (g)', 'Calorias']],
                body: items,
                theme: 'striped',
                margin: { top: 10 },
                didDrawPage: (data) => {
                    y = data.cursor.y + 10;
                }
            });
        });

        doc.save('nutricao_por_dia.pdf');
    });

    document.getElementById('export-measurements-pdf').addEventListener('click', () => {
        const measurements = storage.load('measurements');
        exportPDF('Medições', ['Peito', 'Cintura', 'Quadril', 'Braços', 'Coxas'], 'medicoes.pdf',
            measurements.map(m => [m.chest, m.waist, m.hips, m.arms, m.thighs])
        );
    });
});