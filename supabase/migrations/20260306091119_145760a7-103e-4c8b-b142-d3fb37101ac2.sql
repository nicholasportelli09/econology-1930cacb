
-- Portfolio: stores user's tickers
CREATE TABLE public.user_portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, ticker)
);

ALTER TABLE public.user_portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio" ON public.user_portfolio
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolio" ON public.user_portfolio
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolio" ON public.user_portfolio
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Pinned articles: stores user's pinned news
CREATE TABLE public.pinned_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  image TEXT DEFAULT '',
  site TEXT DEFAULT '',
  symbol TEXT DEFAULT '',
  published_date TEXT DEFAULT '',
  snippet TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, url)
);

ALTER TABLE public.pinned_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pins" ON public.pinned_articles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pins" ON public.pinned_articles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own pins" ON public.pinned_articles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
