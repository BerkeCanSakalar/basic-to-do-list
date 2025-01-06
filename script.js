// Elemanları Seç
const taskInput = document.getElementById("taskInput");
const categorySelect = document.getElementById("categorySelect");
const dateInput = document.getElementById("dateInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const completedTaskList = document.getElementById("completedTaskList");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const searchInput = document.getElementById("searchInput");
const prioritySelect = document.getElementById("prioritySelect");
const filterCategory = document.getElementById("filterCategory");
const darkModeToggle = document.getElementById("darkModeToggle");

let taskCount = 0;
let completedCount = 0;

// Karanlık modu tarayıcıda saklamak için localStorage kullanıyoruz
function setDarkMode(isEnabled) {
  if (isEnabled) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("darkMode", "enabled");
    darkModeToggle.textContent = "☀️ Açık Mod";
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("darkMode", "disabled");
    darkModeToggle.textContent = "🌙 Karanlık Mod";
  }
}

function groupTasksByCategory() {
  const groupedTasks = {};

  tasks.forEach(task => {
    if (!groupedTasks[task.category]) {
      groupedTasks[task.category] = [];
    }
    groupedTasks[task.category].push(task);
  });

  return groupedTasks;
}

// Sayfa yüklendiğinde karanlık mod durumu kontrol edilir
const darkModeStatus = localStorage.getItem("darkMode");
if (darkModeStatus === "enabled") {
  setDarkMode(true);
} else {
  setDarkMode(false);
}

// Görev Sayaçlarını Güncelle
function updateCounters() {
  totalTasks.textContent = `Toplam Görevler: ${taskCount}`;
  completedTasks.textContent = `Tamamlanan Görevler: ${completedCount}`;
}

// Butona tıklandığında karanlık mod değiştirilir
darkModeToggle.addEventListener("click", () => {
  const isDarkModeEnabled = document.body.classList.contains("dark-mode");
  setDarkMode(!isDarkModeEnabled);
});

// LocalStorage'dan görevleri yükle
function loadTasks() {
  const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  storedTasks.forEach(task => {
    addTask(task.text, task.category, task.date, task.priority, task.isCompleted);
  });
}

// Görev Ekle
function addTask(text, category, date, priority = "Orta", isCompleted = false) {
  const li = document.createElement("li");
  li.className = isCompleted ? "completed" : "";
  li.classList.add(
    priority === "Yüksek" ? "priority-high" : priority === "Düşük" ? "priority-low" : "priority-medium"
  );
  li.setAttribute("draggable", "true");
  li.innerHTML = `
    <span>
      <strong>${text}</strong> 
      <span class="category">(${category})</span> 
      <span class="date">${date ? `| ${date}` : ""}</span>
      <span class="priority">${priority} Öncelik</span>
    </span>
    <div>
      <button class="edit-btn">Düzenle</button>
      <button class="delete-btn">Sil</button>
    </div>
  `;

  // Sürükle ve bırak işlevselliği
  li.addEventListener("dragstart", (e) => {
    e.target.classList.add("dragging");
  });

  li.addEventListener("dragend", (e) => {
    e.target.classList.remove("dragging");
    saveTasks(); // Sürükleme işlemi bitince görevlerin kaydını güncelle
  });

  taskList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const draggingItem = document.querySelector(".dragging");
    const listItems = [...taskList.children];
    const closestItem = listItems.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = e.clientY - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;

    if (closestItem) {
      taskList.insertBefore(draggingItem, closestItem);
    } else {
      taskList.appendChild(draggingItem);
    }
  });

  taskList.addEventListener("drop", (e) => {
    e.preventDefault();
    saveTasks(); // Bırakma işleminden sonra görevleri kaydet
  });

  li.querySelector(".delete-btn").addEventListener("click", () => {
    li.remove();
    if (li.classList.contains("completed")) {
      completedCount--;
    } else {
      taskCount--;
    }
    updateCounters();
    saveTasks();
  });

  li.querySelector(".edit-btn").addEventListener("click", () => {
    taskInput.value = text;
    categorySelect.value = category;
    dateInput.value = date || "";
    li.remove();
    if (!isCompleted) taskCount--;
    updateCounters();
    saveTasks();
  });

  li.addEventListener("dblclick", (e) => {
    if (e.target.className.includes("btn")) return;
    li.classList.toggle("completed");
    if (li.classList.contains("completed")) {
      completedTaskList.appendChild(li);
      taskCount--;
      completedCount++;
    } else {
      taskList.appendChild(li);
      taskCount++;
      completedCount--;
    }
    updateCounters();
    saveTasks();
  });

  if (isCompleted) {
    completedTaskList.appendChild(li);
    completedCount++;
  } else {
    taskList.appendChild(li);
    taskCount++;
  }

  updateCounters();
  saveTasks();
}

// Arama Kutusu
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  document.querySelectorAll("li").forEach((li) => {
    const taskText = li.textContent.toLowerCase();
    li.style.display = taskText.includes(query) ? "" : "none";
  });
});

filterCategory.addEventListener("change", () => {
  const selectedCategory = filterCategory.value;
  document.querySelectorAll("#taskList li").forEach((task) => {
    const category = task.querySelector(".category").textContent.replace(/[()]/g, "");
    task.style.display = selectedCategory === "Hepsi" || category === selectedCategory ? "" : "none";
  });
});

// Görev Ekle Butonu
addTaskButton.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const category = categorySelect.value;
  const date = dateInput.value;
  const priority = prioritySelect.value;

  if (!text) {
    alert("Görev metni boş olamaz!");
    return;
  }

  addTask(text, category, date, priority);
  taskInput.value = "";
  dateInput.value = "";
});

// Enter Tuşuyla Görev Ekleme
taskInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    addTaskButton.click();
  }
});

// Tasks'ı localStorage'a kaydet
function saveTasks() {
  const tasks = [];
  document.querySelectorAll("#taskList li, #completedTaskList li").forEach((li) => {
    const text = li.querySelector("strong").textContent;
    const category = li.querySelector(".category").textContent.replace(/[()]/g, "");
    const date = li.querySelector(".date").textContent.replace("|", "").trim();
    const priority = li.querySelector(".priority").textContent.split(" ")[0];
    const isCompleted = li.classList.contains("completed");

    tasks.push({ text, category, date, priority, isCompleted });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Sayfa yüklendiğinde görevleri yükle
loadTasks();
