-- ============================================================================
-- SQL EKSTENSI: TABEL DATA CONFIGURATION KE SUPABASE
-- Jalankan query ini di Supabase SQL Editor untuk melengkapi sinkronisasi Master Data
-- ============================================================================

-- 1. Tabel Item Resin (Master Resin)
CREATE TABLE IF NOT EXISTS public.resin_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resin TEXT NOT NULL,
    kode TEXT,
    nomor_item TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_resin_name UNIQUE (resin)
);

-- 2. Tabel BOM Formula (Bill of Materials)
CREATE TABLE IF NOT EXISTS public.bom_formulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formula TEXT NOT NULL,
    rm TEXT NOT NULL,
    persen NUMERIC DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_formula_rm UNIQUE (formula, rm)
);

-- 3. Tabel Standar Panjang Roll (FG & Jumbo)
CREATE TABLE IF NOT EXISTS public.standard_lengths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thickness NUMERIC NOT NULL UNIQUE,
    max_panjang_fg NUMERIC DEFAULT 0,
    max_panjang_jumbo NUMERIC DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Constraint Unique untuk film_configs dan operator_list jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_film_configs_formula'
    ) THEN
        ALTER TABLE public.film_configs ADD CONSTRAINT uq_film_configs_formula UNIQUE (jenis, kode_formula);
    END IF;
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- 5. Enable RLS
ALTER TABLE public.resin_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bom_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standard_lengths ENABLE ROW LEVEL SECURITY;

-- 6. Grant Policies untuk anon (Public App)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow anon all on resin_items" ON public.resin_items;
    CREATE POLICY "Allow anon all on resin_items" ON public.resin_items FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on bom_formulas" ON public.bom_formulas;
    CREATE POLICY "Allow anon all on bom_formulas" ON public.bom_formulas FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on standard_lengths" ON public.standard_lengths;
    CREATE POLICY "Allow anon all on standard_lengths" ON public.standard_lengths FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 7. Tambahkan ke Realtime publication agar saat diimport di PC, HP langsung terupdate seketika
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
        public.film_configs,
        public.resin_items,
        public.bom_formulas,
        public.mesin_list,
        public.location_list,
        public.standard_lengths;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;
