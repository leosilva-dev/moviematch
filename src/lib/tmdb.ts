export const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface FetchOptions extends RequestInit {
  next?: {
    revalidate: number;
  };
}

export async function fetchFromTMDB(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  if (!url.searchParams.has("language")) {
    url.searchParams.append("language", "pt-BR");
  }

  const fetchOptions: FetchOptions = {
    next: { revalidate: options.next?.revalidate || 3600 },
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    },
    ...options,
  };

  return fetch(url.toString(), fetchOptions);
}
