-- ==============================================================================
-- 1. ACTUALIZACIONES DE TABLAS EXISTENTES (Notificaciones y Users)
-- ==============================================================================

-- Agregar preferencias de notificaciones (Módulo 4)
ALTER TABLE "public"."users" ADD COLUMN "notification_preferences" jsonb not null default '{"vote": true, "reply": true, "report": true, "mention": true, "warning": true}'::jsonb;

-- Ajustar el tipo de dato de la reputación a bigint
ALTER TABLE "public"."users" ALTER COLUMN "reputation" SET DATA TYPE bigint USING "reputation"::bigint;

-- Actualizar restricción de notificaciones para admitir 'mention'
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_type_check";
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_type_check" CHECK ((type = ANY (ARRAY['reply'::text, 'vote'::text, 'warning'::text, 'report'::text, 'mention'::text])));



-- ==============================================================================
-- 2. CREACIÓN DE NUEVAS TABLAS (Gamificación y Enlaces)
-- ==============================================================================

-- Secuencias
CREATE SEQUENCE "public"."badges_id_seq";
CREATE SEQUENCE "public"."reputacion_id_seq";
CREATE SEQUENCE "public"."users_badges_id_seq";

-- Tabla: Badges
CREATE TABLE "public"."badges" (
    "id" bigint not null default nextval('public.badges_id_seq'::regclass),
    "name" text not null,
    "description" text,
    "icon_url" text,
    "create_at" timestamp with time zone default now()
);

-- Tabla: Reputation
CREATE TABLE "public"."reputation" (
    "id" bigint not null default nextval('public.reputacion_id_seq'::regclass),
    "user_id" uuid,
    "points" integer default 0,
    "level" integer default 1,
    "updated_at" timestamp with time zone default now()
);

-- Tabla: Users Badges
CREATE TABLE "public"."users_badges" (
    "id" bigint not null default nextval('public.users_badges_id_seq'::regclass),
    "user_id" uuid,
    "badge_id" bigint,
    "earned_at" timestamp with time zone default now()
);

-- Tabla: Post Links
CREATE TABLE "public"."post_links" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid not null,
    "url" text not null,
    "title" text,
    "description" text,
    "image_url" text,
    "created_at" timestamp with time zone not null default now()
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE "public"."badges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reputation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users_badges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."post_links" ENABLE ROW LEVEL SECURITY;



-- ==============================================================================
-- 3. ÍNDICES Y RESTRICCIONES (Primary Keys y Foreign Keys)
-- ==============================================================================

-- Asignar dueños de secuencias
ALTER SEQUENCE "public"."badges_id_seq" OWNED BY "public"."badges"."id";
ALTER SEQUENCE "public"."reputacion_id_seq" OWNED BY "public"."reputation"."id";
ALTER SEQUENCE "public"."users_badges_id_seq" OWNED BY "public"."users_badges"."id";

-- Índices Únicos y B-Trees
CREATE UNIQUE INDEX badges_name_key ON public.badges USING btree (name);
CREATE UNIQUE INDEX badges_pkey ON public.badges USING btree (id);
CREATE UNIQUE INDEX reputacion_pkey ON public.reputation USING btree (id);
CREATE UNIQUE INDEX reputacion_user_id_key ON public.reputation USING btree (user_id);
CREATE UNIQUE INDEX users_badges_pkey ON public.users_badges USING btree (id);
CREATE UNIQUE INDEX users_badges_user_id_badge_id_key ON public.users_badges USING btree (user_id, badge_id);
CREATE UNIQUE INDEX post_links_pkey ON public.post_links USING btree (id);
CREATE INDEX idx_post_links_post_id ON public.post_links USING btree (post_id);
CREATE INDEX idx_posts_visibility ON public.posts USING btree (id) WHERE ((is_hidden = false) AND (is_private = false));

-- Claves Primarias (PK)
ALTER TABLE "public"."badges" ADD CONSTRAINT "badges_pkey" PRIMARY KEY USING INDEX "badges_pkey";
ALTER TABLE "public"."reputation" ADD CONSTRAINT "reputacion_pkey" PRIMARY KEY USING INDEX "reputacion_pkey";
ALTER TABLE "public"."users_badges" ADD CONSTRAINT "users_badges_pkey" PRIMARY KEY USING INDEX "users_badges_pkey";
ALTER TABLE "public"."post_links" ADD CONSTRAINT "post_links_pkey" PRIMARY KEY USING INDEX "post_links_pkey";

-- Claves Foráneas (FK) y Restricciones Únicas
ALTER TABLE "public"."badges" ADD CONSTRAINT "badges_name_key" UNIQUE USING INDEX "badges_name_key";

ALTER TABLE "public"."reputation" ADD CONSTRAINT "reputacion_user_id_key" UNIQUE USING INDEX "reputacion_user_id_key";
ALTER TABLE "public"."reputation" ADD CONSTRAINT "reputation_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE "public"."users_badges" ADD CONSTRAINT "users_badges_user_id_badge_id_key" UNIQUE USING INDEX "users_badges_user_id_badge_id_key";
ALTER TABLE "public"."users_badges" ADD CONSTRAINT "users_badges_badge_id_fkey" FOREIGN KEY (badge_id) REFERENCES public.badges(id) ON DELETE CASCADE;
ALTER TABLE "public"."users_badges" ADD CONSTRAINT "users_badges_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE "public"."post_links" ADD CONSTRAINT "post_links_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;



-- ==============================================================================
-- 4. FUNCIONES Y TRIGGERS (Autenticación de Usuarios)
-- ==============================================================================

SET check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- 1. Insertar usuario principal en tabla users
  insert into public.users (id, email, username, avatar_url, role, reputation)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'username', 
      new.raw_user_meta_data ->> 'user_name', 
      new.raw_user_meta_data ->> 'name', 
      'user_' || substring(new.id::text from 1 for 8)
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    'regular',
    0
  );

  -- 2. Insertar registro de reputación inicial (puntos en 0)
  insert into public.reputation (user_id, points, level)
  values (new.id, 0, 1);

  return new;
end;
$function$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();



-- ==============================================================================
-- 5. PERMISOS BÁSICOS (GRANTS)
-- ==============================================================================
-- Asigna todos los permisos base necesarios para la API de Supabase en un solo bloque limpio.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;



-- ==============================================================================
-- 6. POLÍTICAS DE SEGURIDAD (RLS) Y STORAGE
-- ==============================================================================

-- Communities
CREATE POLICY "Admins can delete communities" ON "public"."communities" FOR DELETE USING (true);
CREATE POLICY "Anyone can read communities" ON "public"."communities" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create communities" ON "public"."communities" FOR INSERT WITH CHECK (true);
CREATE POLICY "Creator can update their subcommunity" ON "public"."communities" FOR UPDATE USING ((auth.uid() = created_by));

-- Notifications
CREATE POLICY "Authenticated users can create notifications" ON "public"."notifications" FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can read their notifications" ON "public"."notifications" FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can update their notifications" ON "public"."notifications" FOR UPDATE USING ((auth.uid() = user_id));

-- Post Links
CREATE POLICY "Anyone can view links of public posts" ON "public"."post_links" FOR SELECT USING (EXISTS ( SELECT 1 FROM public.posts WHERE ((posts.id = post_links.post_id) AND (posts.is_hidden = false) AND (posts.is_private = false))));
CREATE POLICY "Only post author can delete links" ON "public"."post_links" FOR UPDATE USING (EXISTS ( SELECT 1 FROM public.posts WHERE ((posts.id = post_links.post_id) AND (posts.author_id = auth.uid()))));
CREATE POLICY "Only post author can insert links" ON "public"."post_links" FOR INSERT WITH CHECK (EXISTS ( SELECT 1 FROM public.posts WHERE ((posts.id = post_links.post_id) AND (posts.author_id = auth.uid()))));
CREATE POLICY "Only post author can update links" ON "public"."post_links" FOR DELETE USING (EXISTS ( SELECT 1 FROM public.posts WHERE ((posts.id = post_links.post_id) AND (posts.author_id = auth.uid()))));

-- Post Tags
CREATE POLICY "Anyone can read post_tags" ON "public"."post_tags" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create post_tags" ON "public"."post_tags" FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));
CREATE POLICY "Authenticated users can delete post_tags" ON "public"."post_tags" FOR DELETE USING ((auth.uid() IS NOT NULL));

-- Posts
CREATE POLICY "Anyone can read visible posts" ON "public"."posts" FOR SELECT USING ((is_hidden = false));
CREATE POLICY "Authenticated users can create posts" ON "public"."posts" FOR INSERT WITH CHECK ((auth.uid() = author_id));
CREATE POLICY "Authors can delete their posts" ON "public"."posts" FOR DELETE USING ((auth.uid() = author_id));
CREATE POLICY "Authors can update their posts" ON "public"."posts" FOR UPDATE USING ((auth.uid() = author_id));

-- Replies
CREATE POLICY "Anyone can read visible replies" ON "public"."replies" FOR SELECT USING ((is_hidden = false));
CREATE POLICY "Authenticated users can create replies" ON "public"."replies" FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Authors can delete their replies" ON "public"."replies" FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Authors can update their replies" ON "public"."replies" FOR UPDATE USING ((auth.uid() = user_id));

-- Reports
CREATE POLICY "Authenticated users can create reports" ON "public"."reports" FOR INSERT WITH CHECK ((auth.uid() = reporter_id));
CREATE POLICY "Authenticated users can update reports" ON "public"."reports" FOR UPDATE USING ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can read their own reports" ON "public"."reports" FOR SELECT USING ((auth.uid() = reporter_id));

-- Tags
CREATE POLICY "Anyone can read tags" ON "public"."tags" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tags" ON "public"."tags" FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));

-- User Communities
CREATE POLICY "Anyone can read user_communities" ON "public"."user_communities" FOR SELECT USING (true);
CREATE POLICY "Users can join communities" ON "public"."user_communities" FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can leave communities" ON "public"."user_communities" FOR DELETE USING (true);

-- Users
CREATE POLICY "Anyone can read public profiles" ON "public"."users" FOR SELECT USING (true);
CREATE POLICY "Users can create their profile" ON "public"."users" FOR INSERT WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can update their profile" ON "public"."users" FOR UPDATE USING ((auth.uid() = id));

-- Votes
CREATE POLICY "Anyone can read votes" ON "public"."votes" FOR SELECT USING (true);
CREATE POLICY "Users can create votes" ON "public"."votes" FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can delete their votes" ON "public"."votes" FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Users can update their votes" ON "public"."votes" FOR UPDATE USING ((auth.uid() = user_id));

-- Warnings
CREATE POLICY "Authenticated users can create warnings" ON "public"."warnings" FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));
CREATE POLICY "Users can read their warnings" ON "public"."warnings" FOR SELECT USING ((auth.uid() = user_id));

-- Storage (Bucket Imágenes)
CREATE POLICY "Lectura pública de imágenes 1ffg0oo_0" ON "storage"."objects" FOR SELECT USING ((bucket_id = 'images'::text));
CREATE POLICY "Usuarios autenticados pueden eliminar 1ffg0oo_0" ON "storage"."objects" FOR DELETE USING ((bucket_id = 'images'::text));
CREATE POLICY "Usuarios autenticados pueden subir 1ffg0oo_0" ON "storage"."objects" FOR INSERT WITH CHECK ((bucket_id = 'images'::text));