import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://vdeuzepsaqplhixnhfok.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZXV6ZXBzYXFwbGhpeG5oZm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTc1NjksImV4cCI6MjA3NDk5MzU2OX0.x4Zd7ncK1LJJZkYx8uYwK02Jy1e2UCLoz6RCukeWz3U';
const UNSPLASH_ACCESS_KEY = 'hNW7fCcfsZNDJ9QFYa_bro9LdQPVksJmKq2R9l3I6tc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userId = localStorage.getItem('userId');
if (!userId) {
  userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(7);
  localStorage.setItem('userId', userId);
}

console.log('=== NEW TAB LOADED ===');
console.log('User ID:', userId);

async function loadUnsplashBackground() {
  console.log('>>> Starting loadUnsplashBackground');

  const now = Date.now();
  const cachedImage = localStorage.getItem('unsplashImage');
  const cachedTime = localStorage.getItem('unsplashImageTime');
  const cacheExpiry = 3600000;

  if (cachedImage && cachedTime && (now - parseInt(cachedTime)) < cacheExpiry) {
    console.log('>>> Using cached image:', cachedImage);
    document.body.style.backgroundImage = `url("${cachedImage}")`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.classList.add('loaded');
    return;
  }

  console.log('>>> Cache expired or not found, fetching from Unsplash API');

  try {
    const apiUrl = `https://api.unsplash.com/photos/random?orientation=landscape&query=nature,mountains,ocean,landscape&client_id=${UNSPLASH_ACCESS_KEY}`;
    console.log('>>> Fetching:', apiUrl.substring(0, 100) + '...');

    const response = await fetch(apiUrl);
    console.log('>>> Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('>>> Unsplash API error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('>>> Unsplash response data:', { id: data.id, urls: data.urls });

    const imageUrl = data.urls.regular;
    console.log('>>> Applying background:', imageUrl);

    document.body.style.backgroundImage = `url("${imageUrl}")`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.classList.add('loaded');

    localStorage.setItem('unsplashImage', imageUrl);
    localStorage.setItem('unsplashImageTime', now.toString());
    console.log('>>> Background applied and cached successfully!');

  } catch (err) {
    console.error('>>> Failed to load Unsplash:', err);
    console.log('>>> Using fallback gradient');
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    document.body.style.backgroundSize = 'cover';
    document.body.classList.add('loaded');
  }
}

async function inlineSvgs() {
  console.log('>>> Loading SVG icons');
  const nodes = document.querySelectorAll('.svg-inline[data-src]');
  console.log('>>> Found', nodes.length, 'SVG elements');

  for (const node of nodes) {
    const url = node.dataset.src;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed ' + url);
      const text = await res.text();
      const iconContainer = node.querySelector('.link-icon');
      if (iconContainer) {
        iconContainer.innerHTML = text;
        const svgs = iconContainer.querySelectorAll('svg');
        svgs.forEach(svg => {
          svg.style.width = '20px';
          svg.style.height = '20px';
          svg.style.display = 'block';
          svg.querySelectorAll('path, circle, rect, line, polyline, polygon').forEach(el => {
            el.setAttribute('fill', 'white');
            el.setAttribute('stroke', 'white');
          });
        });
        console.log('>>> Loaded SVG:', url);
      }
    } catch (err) {
      console.error('>>> Failed to load SVG', url, err);
    }
  }
}

function updateTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeString = `${hours}:${minutes.toString().padStart(2, '0')}`;
  document.getElementById('time').textContent = timeString;

  let greeting = 'Good evening';
  if (hours < 12) {
    greeting = 'Good morning';
  } else if (hours < 18) {
    greeting = 'Good afternoon';
  }
  document.getElementById('greeting').textContent = greeting;
}

async function loadMainTask() {
  const mainTaskWrapper = document.getElementById('main-task-wrapper');
  const mainTaskCheckbox = document.getElementById('main-task-checkbox');
  const mainTaskText = document.getElementById('main-task-text');

  const savedCompleted = localStorage.getItem('mainTaskCompleted') === 'true';

  if (savedCompleted) {
    mainTaskCheckbox.classList.add('completed');
    mainTaskText.classList.add('completed');
  }

  mainTaskWrapper.addEventListener('click', () => {
    const isCompleted = mainTaskCheckbox.classList.contains('completed');

    if (isCompleted) {
      mainTaskCheckbox.classList.remove('completed');
      mainTaskText.classList.remove('completed');
      localStorage.setItem('mainTaskCompleted', 'false');
    } else {
      mainTaskCheckbox.classList.add('completed');
      mainTaskText.classList.add('completed');
      localStorage.setItem('mainTaskCompleted', 'true');
    }
  });
}

async function loadTasks() {
  try {
    console.log('>>> Loading tasks for user:', userId);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true });

    if (error) {
      console.error('>>> Error loading tasks:', error);
      return;
    }

    console.log('>>> Tasks loaded:', data.length, 'tasks');
    renderTasks(data || []);
  } catch (err) {
    console.error('>>> Failed to load tasks:', err);
  }
}

function renderTasks(tasks) {
  const tasksList = document.getElementById('tasks-list');
  const existingInput = tasksList.querySelector('.task-input-container');

  tasksList.innerHTML = '';

  tasks.forEach(task => {
    const taskItem = createTaskElement(task);
    tasksList.appendChild(taskItem);
  });

  if (existingInput) {
    tasksList.appendChild(existingInput);
  }
}

function createTaskElement(task) {
  const taskItem = document.createElement('div');
  taskItem.className = 'task-item';
  taskItem.dataset.taskId = task.id;

  const checkbox = document.createElement('div');
  checkbox.className = `task-checkbox ${task.completed ? 'completed' : ''}`;
  checkbox.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTask(task.id, !task.completed);
  });

  const taskText = document.createElement('div');
  taskText.className = `task-text ${task.completed ? 'completed' : ''}`;
  taskText.textContent = task.text;

  const deleteBtn = document.createElement('div');
  deleteBtn.className = 'task-delete';
  deleteBtn.textContent = '\u00d7';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteTask(task.id);
  });

  taskItem.appendChild(checkbox);
  taskItem.appendChild(taskText);
  taskItem.appendChild(deleteBtn);

  return taskItem;
}

async function addTask(text) {
  if (!text.trim()) return;

  try {
    console.log('>>> Adding task:', text);
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('position')
      .eq('user_id', userId)
      .order('position', { ascending: false })
      .limit(1);

    const newPosition = existingTasks && existingTasks.length > 0
      ? existingTasks[0].position + 1
      : 0;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        text: text.trim(),
        user_id: userId,
        position: newPosition,
        completed: false
      }])
      .select();

    if (error) {
      console.error('>>> Error adding task:', error);
      return;
    }

    console.log('>>> Task added successfully');
    await loadTasks();
  } catch (err) {
    console.error('>>> Failed to add task:', err);
  }
}

async function toggleTask(taskId, completed) {
  try {
    console.log('>>> Toggling task:', taskId, 'to', completed);
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', taskId)
      .select();

    if (error) {
      console.error('>>> Error toggling task:', error);
      return;
    }

    console.log('>>> Task toggled successfully');
    await loadTasks();
  } catch (err) {
    console.error('>>> Failed to toggle task:', err);
  }
}

async function deleteTask(taskId) {
  try {
    console.log('>>> Deleting task:', taskId);
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('>>> Error deleting task:', error);
      return;
    }

    console.log('>>> Task deleted successfully');
    await loadTasks();
  } catch (err) {
    console.error('>>> Failed to delete task:', err);
  }
}

function setupTaskInput() {
  const taskInput = document.getElementById('new-task-input');

  taskInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && taskInput.value.trim()) {
      await addTask(taskInput.value);
      taskInput.value = '';
    }
  });
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  console.log('>>> Theme loaded:', savedTheme);
  return savedTheme;
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  console.log('>>> Theme changed to:', newTheme);
}

function setupSettingsButton() {
  const settingsBtn = document.getElementById('settings-btn');
  settingsBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const themeName = currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
    const nextTheme = currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode';

    const choice = confirm(`Current theme: ${themeName}\n\nOptions:\n- Click OK to switch to ${nextTheme}\n- Click Cancel to refresh background image`);

    if (choice) {
      toggleTheme();
    } else {
      console.log('>>> Forcing background refresh');
      localStorage.removeItem('unsplashImage');
      localStorage.removeItem('unsplashImageTime');
      loadUnsplashBackground();
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('>>> DOM loaded, initializing...');

  loadTheme();
  loadUnsplashBackground();
  await inlineSvgs();
  updateTime();
  setInterval(updateTime, 1000);

  await loadMainTask();
  await loadTasks();
  setupTaskInput();
  setupSettingsButton();

  console.log('>>> All initialization complete!');
});
