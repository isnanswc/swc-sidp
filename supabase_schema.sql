-- ==============================================================================
-- M-LABEL COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Ready for 1-Click Execution in Supabase SQL Editor
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uniq_id TEXT UNIQUE,
    supplier TEXT,
    spk TEXT,
    lot TEXT,
    turunan TEXT,
    operator TEXT,
    kode_operator TEXT,
    jenis TEXT,
    type TEXT,
    kode TEXT,
    thickness NUMERIC,
    width NUMERIC,
    length NUMERIC,
    meter NUMERIC,
    joint NUMERIC DEFAULT 0,
    netto NUMERIC,
    paper_core NUMERIC,
    kode_pack TEXT,
    sub_kode TEXT,
    status TEXT DEFAULT 'PASS',
    treatment TEXT,
    od TEXT,
    tanggal TEXT,
    jenis_print TEXT,
    verified BOOLEAN DEFAULT FALSE,
    synced_by TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_labels_tanggal ON public.labels(tanggal);
CREATE INDEX IF NOT EXISTS idx_labels_lot ON public.labels(lot);
CREATE INDEX IF NOT EXISTS idx_labels_spk ON public.labels(spk);
CREATE INDEX IF NOT EXISTS idx_labels_is_deleted ON public.labels(is_deleted);

DROP TRIGGER IF EXISTS trg_labels_updated_at ON public.labels;
CREATE TRIGGER trg_labels_updated_at
BEFORE UPDATE ON public.labels
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.data_rolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE,
    upload_id TEXT,
    batch_id TEXT,
    kode_fg TEXT,
    lot TEXT,
    turunan TEXT,
    jenis TEXT,
    kode_formula TEXT,
    thickness NUMERIC,
    width NUMERIC,
    length NUMERIC,
    core NUMERIC,
    treatment TEXT,
    od TEXT,
    slitting TEXT,
    rewind TEXT,
    sml TEXT,
    machine_name TEXT,
    tanggal TEXT,
    tanggal_formatted TEXT,
    spk TEXT,
    kode_pack TEXT,
    sub_kode TEXT,
    quality_status TEXT,
    verified BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_rolls_tanggal ON public.data_rolls(tanggal);
CREATE INDEX IF NOT EXISTS idx_data_rolls_lot ON public.data_rolls(lot);
CREATE INDEX IF NOT EXISTS idx_data_rolls_spk ON public.data_rolls(spk);

DROP TRIGGER IF EXISTS trg_data_rolls_updated_at ON public.data_rolls;
CREATE TRIGGER trg_data_rolls_updated_at
BEFORE UPDATE ON public.data_rolls
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.spk_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE NOT NULL,
    batch_name TEXT NOT NULL,
    doc_no TEXT DEFAULT '3B-PROD',
    tanggal TEXT NOT NULL,
    total_items INTEGER DEFAULT 0,
    total_jumbo INTEGER DEFAULT 0,
    total_meter NUMERIC DEFAULT 0,
    source TEXT DEFAULT 'AI_SCAN',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_spk_batches_updated_at ON public.spk_batches;
CREATE TRIGGER trg_spk_batches_updated_at
BEFORE UPDATE ON public.spk_batches
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.spk_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE NOT NULL,
    batch_id TEXT,
    seq INTEGER DEFAULT 1,
    spk_no TEXT NOT NULL,
    doc_no TEXT DEFAULT '3B-PROD',
    formula TEXT,
    jenis TEXT,
    thickness NUMERIC,
    lebar_parent NUMERIC,
    panjang_parent NUMERIC,
    jumlah_jumbo INTEGER DEFAULT 1,
    total_planned_rolls INTEGER DEFAULT 0,
    total_planned_meter NUMERIC DEFAULT 0,
    total_planned_kg NUMERIC DEFAULT 0,
    charting_json JSONB DEFAULT '[]'::jsonb,
    trim_auto NUMERIC DEFAULT 0,
    keterangan TEXT,
    status TEXT DEFAULT 'PLANNED',
    source TEXT DEFAULT 'AI_SCAN',
    revisions_count INTEGER DEFAULT 0,
    tanggal TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spk_plans_batch_id ON public.spk_plans(batch_id);
CREATE INDEX IF NOT EXISTS idx_spk_plans_spk_no ON public.spk_plans(spk_no);
CREATE INDEX IF NOT EXISTS idx_spk_plans_seq ON public.spk_plans(seq);

DROP TRIGGER IF EXISTS trg_spk_plans_updated_at ON public.spk_plans;
CREATE TRIGGER trg_spk_plans_updated_at
BEFORE UPDATE ON public.spk_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.spk_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id TEXT,
    spk_no TEXT,
    rev_number INTEGER,
    previous_data_json JSONB,
    new_data_json JSONB,
    changes_diff_json JSONB,
    reason TEXT,
    revised_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wip_rolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uuid TEXT UNIQUE NOT NULL,
    update_id TEXT,
    tanggal_spk TEXT,
    spk TEXT,
    lot TEXT,
    jenis TEXT,
    kode_formula TEXT,
    thickness NUMERIC,
    width NUMERIC,
    length NUMERIC,
    core NUMERIC,
    od TEXT,
    tanda TEXT,
    berat_aktual NUMERIC,
    berat_teori NUMERIC,
    lokasi_aktif TEXT,
    posisi_aktif TEXT,
    description_excel TEXT,
    description_nav TEXT,
    keterangan TEXT,
    status TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wip_rolls_lot ON public.wip_rolls(lot);
CREATE INDEX IF NOT EXISTS idx_wip_rolls_lokasi ON public.wip_rolls(lokasi_aktif);

DROP TRIGGER IF EXISTS trg_wip_rolls_updated_at ON public.wip_rolls;
CREATE TRIGGER trg_wip_rolls_updated_at
BEFORE UPDATE ON public.wip_rolls
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.operator_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    mesin TEXT,
    kode_grup TEXT,
    kode_operator TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mesin_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL UNIQUE,
    pra_kode_pack TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.film_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jenis TEXT,
    kode_formula TEXT,
    alias TEXT,
    tipe_bahan TEXT,
    jenis_bahan TEXT,
    kategori_film TEXT,
    keterangan TEXT,
    supplier TEXT,
    density NUMERIC DEFAULT 0.91,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.location_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    jenis TEXT,
    alias TEXT,
    kapasitas INTEGER DEFAULT 0,
    keterangan TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spk_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spk_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spk_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wip_rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesin_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DO \$\$
BEGIN
    DROP POLICY IF EXISTS "Allow anon all on labels" ON public.labels;
    CREATE POLICY "Allow anon all on labels" ON public.labels FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on data_rolls" ON public.data_rolls;
    CREATE POLICY "Allow anon all on data_rolls" ON public.data_rolls FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on spk_batches" ON public.spk_batches;
    CREATE POLICY "Allow anon all on spk_batches" ON public.spk_batches FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on spk_plans" ON public.spk_plans;
    CREATE POLICY "Allow anon all on spk_plans" ON public.spk_plans FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on spk_revisions" ON public.spk_revisions;
    CREATE POLICY "Allow anon all on spk_revisions" ON public.spk_revisions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on wip_rolls" ON public.wip_rolls;
    CREATE POLICY "Allow anon all on wip_rolls" ON public.wip_rolls FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on operator_list" ON public.operator_list;
    CREATE POLICY "Allow anon all on operator_list" ON public.operator_list FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on mesin_list" ON public.mesin_list;
    CREATE POLICY "Allow anon all on mesin_list" ON public.mesin_list FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on film_configs" ON public.film_configs;
    CREATE POLICY "Allow anon all on film_configs" ON public.film_configs FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on location_list" ON public.location_list;
    CREATE POLICY "Allow anon all on location_list" ON public.location_list FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on settings" ON public.settings;
    CREATE POLICY "Allow anon all on settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
END \$\$;

DO \$\$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
        public.labels, 
        public.data_rolls, 
        public.spk_batches, 
        public.spk_plans, 
        public.wip_rolls, 
        public.operator_list;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END \$\$;
