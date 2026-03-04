-- 익명 사용자 삭제 허용
CREATE POLICY "public_delete" ON proposals
  FOR DELETE TO anon
  USING (true);
