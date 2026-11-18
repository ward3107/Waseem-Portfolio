import { createRoot } from 'react-dom/client';
import WorkShelf from './WorkShelf';
const root = document.getElementById('gallery-published-works');
const lang = document.documentElement.lang;
if (root)
  createRoot(root).render(
    <WorkShelf scope="gallery" language={lang === 'en' || lang === 'ar' ? lang : 'he'} />
  );
