"use client";

/**
 * SSR-safe localStorage store.
 * All reads go through a useEffect on the client, so server rendering never touches localStorage.
 */

const STORE_KEY = "mingli_store_v1";

function load() {
  if (typeof window === "undefined") return { charts: [], user: null, posts: [] };
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{"charts":[],"user":null,"posts":[]}');
  } catch {
    return { charts: [], user: null, posts: [] };
  }
}

function save(data: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

let listeners: Array<() => void> = [];

export function subscribe(fn: () => void) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(f => f !== fn); };
}

function notify() {
  listeners.forEach(fn => fn());
}

// ---- Charts ----

export function getCharts() {
  return load().charts;
}

export function addChart(chart: Record<string, unknown>) {
  const data = load();
  data.charts.unshift({ ...chart, id: Date.now().toString(36), createdAt: new Date().toISOString() });
  if (data.charts.length > 50) data.charts = data.charts.slice(0, 50);
  save(data);
  notify();
}

export function removeChart(id: string) {
  const data = load();
  data.charts = data.charts.filter((c: { id: string }) => c.id !== id);
  save(data);
  notify();
}

// ---- User ----

export function getUser() {
  return load().user;
}

export function setUser(user: Record<string, unknown>) {
  const data = load();
  data.user = user;
  save(data);
  notify();
}

export function logout() {
  const data = load();
  data.user = null;
  save(data);
  notify();
}

// ---- Posts ----

export function getPosts() {
  return load().posts;
}

export function addPost(post: Record<string, unknown>) {
  const data = load();
  data.posts.unshift({
    ...post,
    id: Date.now().toString(36),
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: [],
  });
  save(data);
  notify();
}

export function toggleLike(postId: string) {
  const data = load();
  const post = data.posts.find((p: { id: string }) => p.id === postId);
  if (post) post.likes += 1;
  save(data);
  notify();
}

export function addComment(postId: string, text: string, author: string) {
  const data = load();
  const post = data.posts.find((p: { id: string }) => p.id === postId);
  if (post) {
    post.comments.push({
      id: Date.now().toString(36),
      text,
      author,
      createdAt: new Date().toISOString(),
    });
  }
  save(data);
  notify();
}
