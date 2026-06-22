-- Comunidades principales (carreras)
-- parent_id es NULL porque son comunidades raíz
-- created_by es NULL porque las crea el sistema
INSERT INTO communities (name, slug, description, parent_id, created_by) VALUES
  ('Administración', 'administracion', 'Comunidad de la carrera de Administración', NULL, NULL),
  ('Arquitectura', 'arquitectura', 'Comunidad de la carrera de Arquitectura', NULL, NULL),
  ('Contaduría Pública', 'contaduria-publica', 'Comunidad de la carrera de Contaduría Pública', NULL, NULL),
  ('Ingeniería Civil', 'ingenieria-civil', 'Comunidad de la carrera de Ingeniería Civil', NULL, NULL),
  ('Ingeniería de Petróleo', 'ingenieria-de-petroleo', 'Comunidad de la carrera de Ingeniería de Petróleo', NULL, NULL),
  ('Ingeniería de Sistemas', 'ingenieria-de-sistemas', 'Comunidad de la carrera de Ingeniería de Sistemas', NULL, NULL),
  ('Ingeniería en Computación', 'ingenieria-en-computacion', 'Comunidad de la carrera de Ingeniería en Computación', NULL, NULL),
  ('Ingeniería Industrial', 'ingenieria-industrial', 'Comunidad de la carrera de Ingeniería Industrial', NULL, NULL),
  ('Ingeniería Mecánica', 'ingenieria-mecanica', 'Comunidad de la carrera de Ingeniería Mecánica', NULL, NULL),
  ('Ingeniería Eléctrica', 'ingenieria-electrica', 'Comunidad de la carrera de Ingeniería Eléctrica', NULL, NULL),
  ('Ingeniería Química', 'ingenieria-quimica', 'Comunidad de la carrera de Ingeniería Química', NULL, NULL),
  ('Licenciatura en Turismo', 'licenciatura-en-turismo', 'Comunidad de la carrera de Licenciatura en Turismo', NULL, NULL),
  ('Medicina', 'medicina', 'Comunidad de la carrera de Medicina', NULL, NULL),
  ('Tecnología en Electrónica', 'tecnologia-en-electronica', 'Comunidad de la carrera de Tecnología en Electrónica', NULL, NULL),
  ('Tecnología en Fabricación Mecánica', 'tecnologia-en-fabricacion-mecanica', 'Comunidad de la carrera de Tecnología en Fabricación Mecánica', NULL, NULL),
  ('Temas Generales', 'temas-generales', 'Comunidad abierta para todos los usuarios', NULL, NULL);
