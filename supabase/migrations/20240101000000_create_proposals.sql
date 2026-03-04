-- proposals 테이블 생성
CREATE TABLE IF NOT EXISTS proposals (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url        TEXT NOT NULL,
  title      TEXT,
  prompt     TEXT NOT NULL,
  content    JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security 활성화
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- 익명 사용자 읽기/쓰기 허용 (인증 없이 사용)
CREATE POLICY "public_insert" ON proposals
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "public_select" ON proposals
  FOR SELECT TO anon
  USING (true);
