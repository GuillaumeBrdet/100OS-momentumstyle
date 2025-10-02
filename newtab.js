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

async function loadUnsplashBackground() {
  try {
    const cachedImage = localStorage.getItem('unsplashImage');
    const cachedTime = localStorage.getItem('unsplashImageTime');
    const now = Date.now();

    if (cachedImage && cachedTime && (now - parseInt(cachedTime)) < 3600000) {
      document.body.style.backgroundImage = `url(${cachedImage})`;
      document.body.classList.add('loaded');
      return;
    }

    const response = await fetch(
      `https://api.unsplash.com/photos/random?orientation=landscape&query=nature,peaceful,mountains,ocean&client_id=${UNSPLASH_ACCESS_KEY}`
    );

    if (!response.ok) throw new Error('Failed to fetch from Unsplash');

    const data = await response.json();
    const imageUrl = data.urls.regular;

    const img = new Image();
    img.onload = () => {
      document.body.style.backgroundImage = `url(${imageUrl})`;
      document.body.classList.add('loaded');
      localStorage.setItem('unsplashImage', imageUrl);
      localStorage.setItem('unsplashImageTime', now.toString());
    };
    img.src = imageUrl;

  } catch (err) {
    console.error('Failed to load Unsplash background:', err);
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    document.body.classList.add('loaded');
  }
}

async function inlineSvgs() {
  const nodes = document.querySelectorAll('.svg-inline[data-src]');
  await Promise.all(Array.from(nodes).map(async node => {
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
          svg.style.width = '100%';
          svg.style.height = '100%';
          svg.querySelectorAll('path, circle, rect, line, polyline, polygon').forEach(el => {
            if (!el.getAttribute('fill') || el.getAttribute('fill') === 'black' || el.getAttribute('fill') === '#000') {
              el.setAttribute('fill', 'white');
            }
            if (!el.getAttribute('stroke') || el.getAttribute('stroke') === 'black' || el.getAttribute('stroke') === '#000') {
              el.setAttribute('stroke', 'white');
            }
          });
        });
      }
      node.querySelectorAll('[tabindex]').forEach(el => el.removeAttribute('tabindex'));
    } catch (err) {
      console.error('Failed to inline SVG', url, err);
    }
  }));
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
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error loading tasks:', error);
      return;
    }

    renderTasks(data || []);
  } catch (err) {
    console.error('Failed to load tasks:', err);
  }
}

function renderTasks(tasks) {
  const tasksList = document.getElementById('tasks-list');
  const inputContainer = tasksList.querySelector('.task-input-container');

  tasksList.innerHTML = '';

  tasks.forEach(task => {
    const taskItem = createTaskElement(task);
    tasksList.appendChild(taskItem);
  });

  tasksList.appendChild(inputContainer);
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
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('position')
      .eq('user_id', userId)
      .order('position', { ascending: false })
      .limit(1);

    const newPosition = existingTasks && existingTasks.length > 0
      ? existingTasks[0].position + 1
      : 0;

    const { error } = await supabase
      .from('tasks')
      .insert([{
        text: text.trim(),
        user_id: userId,
        position: newPosition,
        completed: false
      }]);

    if (error) {
      console.error('Error adding task:', error);
      return;
    }

    await loadTasks();
  } catch (err) {
    console.error('Failed to add task:', err);
  }
}

async function toggleTask(taskId, completed) {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error toggling task:', error);
      return;
    }

    await loadTasks();
  } catch (err) {
    console.error('Failed to toggle task:', err);
  }
}

async function deleteTask(taskId) {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting task:', error);
      return;
    }

    await loadTasks();
  } catch (err) {
    console.error('Failed to delete task:', err);
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

function setupSettingsButton() {
  const settingsBtn = document.getElementById('settings-btn');
  settingsBtn.addEventListener('click', () => {
    alert('Settings functionality coming soon!');
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  loadUnsplashBackground();
  await inlineSvgs();
  updateTime();
  setInterval(updateTime, 1000);

  await loadMainTask();
  await loadTasks();
  setupTaskInput();
  setupSettingsButton();
});
