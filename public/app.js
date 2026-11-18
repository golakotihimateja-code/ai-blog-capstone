const STORAGE_KEY = 'insight-journal-posts';
const TITLE_LIMIT = 120;
const CONTENT_LIMIT = 4000;
const SUMMARY_LIMIT = 280;

const defaultBlogs = [
  {
    id: 'post-1',
    title: 'The power of small daily habits',
    content:
      'A consistent routine can transform vague intentions into measurable progress. Small habits, such as writing for ten minutes each morning, help people create momentum without requiring dramatic lifestyle changes. Over time, these repeated actions compound into meaningful results. The key is to make them easy to begin, visible in your day, and enjoyable enough to continue. That approach creates sustainable growth rather than short bursts of motivation.',
    summary:
      'Build momentum through small, repeatable actions that are easy to sustain and gradually compound into meaningful progress.',
    createdAt: '2024-09-05T10:00:00.000Z'
  },
  {
    id: 'post-2',
    title: 'Why thoughtful design matters',
    content:
      'Design is not only about visual appearance but also about clarity and usability. When a product is easy to understand, users can focus on the value it provides instead of struggling with confusion. Thoughtful design reduces friction, increases trust, and supports better decision-making. Teams that prioritize usability create experiences that feel intuitive, calm, and productive for everyone involved.',
    summary:
      'Great design combines clarity, usability, and trust to reduce friction and help users focus on value.',
    createdAt: '2024-09-12T09:30:00.000Z'
  }
];

const blogListEl = document.getElementById('blog-list');
const detailEl = document.getElementById('blog-detail');
const appStatusEl = document.getElementById('app-status');
const createBlogBtn = document.getElementById('create-blog-btn');
const modalBackdrop = document.getElementById('modal-backdrop');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelBtn = document.getElementById('cancel-btn');
const form = document.getElementById('blog-form');
const titleInput = document.getElementById('blog-title');
const contentInput = document.getElementById('blog-content');
const summaryInput = document.getElementById('blog-summary');
const formErrorEl = document.getElementById('form-error');
const generateSummaryBtn = document.getElementById('generate-summary-btn');

let blogs = loadBlogs();
let selectedBlogId = blogs[0]?.id ?? null;

function showStorageNotice(message) {
  appStatusEl.textContent = message;
  appStatusEl.hidden = false;
}

function loadBlogs() {
  let storedBlogs;

  try {
    storedBlogs = localStorage.getItem(STORAGE_KEY);
  } catch {
    showStorageNotice('Browser storage is unavailable. New blogs may not persist after you leave this page.');
    return defaultBlogs.slice();
  }

  if (storedBlogs === null) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBlogs));
    } catch {
      showStorageNotice('Browser storage is unavailable. New blogs may not persist after you leave this page.');
    }
    return defaultBlogs.slice();
  }

  try {
    const parsedBlogs = JSON.parse(storedBlogs);
    if (Array.isArray(parsedBlogs) && parsedBlogs.every(isBlog)) {
      return parsedBlogs;
    }
  } catch {
    showStorageNotice('Saved blogs could not be read. Creating a blog will replace the invalid saved data.');
    return [];
  }

  showStorageNotice('Saved blogs have an invalid format. Creating a blog will replace the invalid saved data.');
  return [];
}

function isBlog(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.content === 'string' &&
    typeof value.summary === 'string' &&
    typeof value.createdAt === 'string'
  );
}

function saveBlogs(nextBlogs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBlogs));
    appStatusEl.hidden = true;
    return true;
  } catch {
    showStorageNotice('Your blog could not be saved to browser storage. Check available storage and try again.');
    return false;
  }
}

function formatDate(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function generateSummary(content) {
  const cleanText = content.trim().replace(/\s+/g, ' ');
  if (!cleanText) {
    return '';
  }

  const sentences = cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleanText];
  let summary = '';

  for (const sentence of sentences) {
    const candidate = summary ? `${summary} ${sentence.trim()}` : sentence.trim();
    if (candidate.length > SUMMARY_LIMIT) {
      if (!summary) {
        return `${candidate.slice(0, SUMMARY_LIMIT - 1).trimEnd()}…`;
      }
      break;
    }
    summary = candidate;
  }

  return summary || cleanText.slice(0, SUMMARY_LIMIT).trimEnd();
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function renderBlogList() {
  blogListEl.replaceChildren();

  if (!blogs.length) {
    blogListEl.append(createTextElement('p', 'list-empty', 'No blogs yet. Create one to get started.'));
    return;
  }

  const sortedBlogs = blogs.slice().sort((first, second) => {
    return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
  });

  for (const blog of sortedBlogs) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `blog-card-button${blog.id === selectedBlogId ? ' active' : ''}`;
    card.setAttribute('aria-current', blog.id === selectedBlogId ? 'true' : 'false');
    card.append(
      createTextElement('span', 'blog-card-title', blog.title),
      createTextElement('span', 'blog-card-meta', formatDate(blog.createdAt)),
      createTextElement('span', 'blog-card-excerpt', blog.summary || generateSummary(blog.content))
    );
    card.addEventListener('click', () => {
      selectedBlogId = blog.id;
      renderBlogList();
      renderSelectedBlog();
    });

    const cardWrapper = document.createElement('article');
    cardWrapper.className = `blog-card${blog.id === selectedBlogId ? ' active' : ''}`;
    cardWrapper.append(card);
    blogListEl.append(cardWrapper);
  }
}

function renderSelectedBlog() {
  const blog = blogs.find((item) => item.id === selectedBlogId);
  detailEl.replaceChildren();

  if (!blog) {
    detailEl.className = 'blog-detail empty-state';
    detailEl.append(
      createTextElement('h2', '', 'Select a blog to read'),
      createTextElement('p', '', 'Choose an article from the sidebar to view the full content.')
    );
    return;
  }

  detailEl.className = 'blog-detail';
  detailEl.append(
    createTextElement('div', 'blog-meta', formatDate(blog.createdAt)),
    createTextElement('h2', '', blog.title)
  );

  const summaryBox = document.createElement('section');
  summaryBox.className = 'summary-box';
  summaryBox.setAttribute('aria-label', 'Generated summary');
  summaryBox.append(
    createTextElement('h3', '', 'Generated summary'),
    createTextElement('p', '', blog.summary || generateSummary(blog.content))
  );
  detailEl.append(summaryBox, createTextElement('div', 'content', blog.content));
}

function clearFormError() {
  formErrorEl.textContent = '';
  formErrorEl.hidden = true;
}

function showFormError(message) {
  formErrorEl.textContent = message;
  formErrorEl.hidden = false;
}

function openModal() {
  form.reset();
  clearFormError();
  modalBackdrop.classList.remove('hidden');
  modalBackdrop.setAttribute('aria-hidden', 'false');
  titleInput.focus();
}

function closeModal() {
  modalBackdrop.classList.add('hidden');
  modalBackdrop.setAttribute('aria-hidden', 'true');
  clearFormError();
  form.reset();
  createBlogBtn.focus();
}

function validateInput(title, content) {
  if (!title) {
    throw new Error('Enter a title before saving.');
  }
  if (title.length > TITLE_LIMIT) {
    throw new Error(`The title must be ${TITLE_LIMIT} characters or fewer.`);
  }
  if (!content) {
    throw new Error('Enter article content before saving.');
  }
  if (content.length > CONTENT_LIMIT) {
    throw new Error(`The content must be ${CONTENT_LIMIT} characters or fewer.`);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearFormError();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  try {
    validateInput(title, content);
  } catch (error) {
    showFormError(error.message);
    return;
  }

  const newBlog = {
    id: globalThis.crypto?.randomUUID?.() || `blog-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    content,
    summary: summaryInput.value.trim() || generateSummary(content),
    createdAt: new Date().toISOString()
  };
  const nextBlogs = [newBlog, ...blogs];

  if (!saveBlogs(nextBlogs)) {
    return;
  }

  blogs = nextBlogs;
  selectedBlogId = newBlog.id;
  renderBlogList();
  renderSelectedBlog();
  closeModal();
});

generateSummaryBtn.addEventListener('click', () => {
  const content = contentInput.value.trim();
  if (!content) {
    showFormError('Enter article content before generating a summary.');
    contentInput.focus();
    return;
  }

  clearFormError();
  summaryInput.value = generateSummary(content);
});

createBlogBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

modalBackdrop.addEventListener('click', (event) => {
  if (event.target === modalBackdrop) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modalBackdrop.classList.contains('hidden')) {
    closeModal();
  }
});

renderBlogList();
renderSelectedBlog();
