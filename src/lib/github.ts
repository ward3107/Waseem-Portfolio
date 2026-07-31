export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname !== 'github.com' && u.hostname !== 'www.github.com') return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, '');
    if (!owner || !repo) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}

export async function fetchRepoMeta(
  url: string
): Promise<{ title: string; description: string; tech: string[]; github: string } | null> {
  const parsed = parseRepoUrl(url);
  if (!parsed) return null;
  const { owner, repo } = parsed;
  const base = `https://api.github.com/repos/${owner}/${repo}`;
  try {
    const [repoRes, langRes] = await Promise.all([
      fetch(base),
      fetch(`${base}/languages`),
    ]);
    if (!repoRes.ok) return null;
    const info = await repoRes.json();
    const langs = langRes.ok ? await langRes.json() : {};
    return {
      title: info.name ?? repo,
      description: info.description ?? '',
      tech: Object.keys(langs),
      github: `https://github.com/${owner}/${repo}`,
    };
  } catch {
    return null;
  }
}
