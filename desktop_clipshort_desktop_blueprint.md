# Blueprint técnico: clon funcional de clipshort.co como app de escritorio nativa

## 1) Diseño de arquitectura (diagrama conceptual explicado)

### 1.1 Estilo arquitectónico recomendado
Se propone una **arquitectura hexagonal + clean architecture**:

- **Core de dominio (independiente de frameworks)** con entidades, casos de uso y reglas de negocio.
- **Adapters / Infraestructura** para API de IA, FFmpeg, SQLite, almacenamiento, licencias y publicación.
- **App Shell de escritorio** (Tauri + frontend React/Vue o WPF) como capa de presentación.

Esto permite:
- Mantener el negocio desacoplado de proveedores IA.
- Sustituir TTS/STT/LLM por otros proveedores sin romper el producto.
- Evolucionar a arquitectura híbrida cloud en fases futuras.

### 1.2 Diagrama conceptual (texto)

```text
┌───────────────────────────────────────────────────────────────────────┐
│                            Desktop App Shell                          │
│       (Tauri/WPF) UI + UX + Wizard + Timeline + Preview              │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                         [Application Layer]
                                │
      ┌─────────────────────────┼──────────────────────────┐
      │                         │                          │
 [Use Cases]              [Orchestrators]          [Plugin Manager]
      │                         │                          │
      └───────────────┬─────────┴─────────┬────────────────┘
                      │                   │
               [Domain Core]        [Job/Queue Engine]
    (scripting rules, hooks,      (render, subtitling,
     series logic, scoring)        publish, retries)
                      │                   │
    ┌─────────────────┴───────────────────┴────────────────────────────┐
    │                         Ports (interfaces)                        │
    └───────┬──────────────┬──────────────┬──────────────┬────────────┘
            │              │              │              │
      LLM Adapter      TTS Adapter    STT Adapter   Video Adapter(FFmpeg)
            │              │              │              │
      Image Adapter    Music Adapter  Storage/DB     Social Publish APIs
            │              │              │              │
          OpenAI/       ElevenLabs/     SQLite      TikTok/Meta/YT wrappers
       Anthropic/etc      Azure/etc
```

### 1.3 Principios clave
- **Offline-first parcial**: edición y gestión local sin depender de red; IA opcional bajo demanda.
- **Async by design**: cola de trabajos para render, transcripción, análisis y export.
- **Observabilidad local**: logs estructurados + trazabilidad por `projectId`.
- **Secure-by-default**: claves API cifradas con keychain del SO.

---

## 2) Módulos principales del sistema

1. **Project Studio**
   - CRUD de proyectos, escenas, assets y versiones.
   - Timeline simplificada con drag & drop.

2. **AI Script Engine**
   - Generación de guiones virales por nicho/público/objetivo.
   - Biblioteca de hooks iniciales + variantes A/B.

3. **Voice & Audio Engine**
   - TTS multi-voz, multi-idioma, tono emocional y velocidad.
   - Banco de música libre de derechos con normalización LUFS.

4. **Subtitle Intelligence**
   - STT automático.
   - Subtítulos animados por palabra/frase con presets “viral”.

5. **Smart Cut Engine**
   - Detección de pausas, energía vocal y beats de música.
   - Auto-corte configurable por ritmo narrativo.

6. **Template & Branding System**
   - Plantillas verticales 9:16 para TikTok/Reels/Shorts.
   - Branding global (logo, color, tipografía, animaciones).

7. **Render Orchestrator (FFmpeg)**
   - Pipelines de composición, overlays, transiciones, subtítulos.
   - Export presets por plataforma + aceleración GPU.

8. **Metadata Generator**
   - Títulos, hashtags, descripción y CTA por plataforma.

9. **Series Manager**
   - Lógica de episodios: continuidad de guion, tono y branding.
   - Calendario editorial local.

10. **Engagement Predictor (heurístico)**
    - Score basado en hook strength, duración, ritmo y legibilidad.
    - Recomendaciones accionables (“reduce intro 2s”, “mejorar CTA”).

11. **Licensing/Billing Module**
    - Activación de licencia, suscripción, créditos IA y consumo.

12. **Marketplace Module**
    - Instalación/actualización de plantillas, packs de estilos y voces.

13. **Plugin SDK Runtime**
    - Extensiones para nuevos proveedores (LLM/TTS/STT/publicación).

14. **Telemetry & Logging**
    - Logs técnicos + métricas de uso de features (opt-in).

---

## 3) Flujo de usuario completo

### 3.1 Onboarding (Wizard)
1. Selección de idioma, nicho, público objetivo.
2. Conexión opcional de APIs (OpenAI/TTS/STT).
3. Configuración rápida de branding y plataforma objetivo.
4. Tutorial contextual con tooltips inteligentes.

### 3.2 Modo Rápido (1 clic)
1. Usuario define tema + duración objetivo.
2. Motor genera guion + voz + visuales + subtítulos + música.
3. Render automático y previsualización.
4. Exportación optimizada + metadatos sugeridos.

### 3.3 Modo Pro
1. Creación por escenas en timeline simplificada.
2. Ajuste de guion, voz, cortes, subtítulos y animaciones.
3. Revisión de score de engagement y sugerencias.
4. Export multi-plataforma (batch).

### 3.4 Publicación / salida
- Export local MP4 + JSON de metadatos.
- Publicación asistida (si APIs disponibles).
- Historial de rendimiento simulado por proyecto.

---

## 4) Stack tecnológico recomendado

### Opción A (multiplataforma recomendada)
- **Desktop Shell**: Tauri 2 + Rust bridge.
- **Frontend**: React + TypeScript + Zustand + Tailwind + shadcn/ui.
- **Backend local (application services)**: Node.js 20 + NestJS/Fastify.
- **Motor vídeo**: FFmpeg + ffprobe + filtros GPU (NVENC/VideoToolbox/AMF).
- **DB local**: SQLite + Prisma/Drizzle.
- **Queue**: BullMQ (local Redis embebido) o cola propia en SQLite.
- **IA**:
  - LLM: OpenAI/Anthropic/Gemini mediante provider abstraction.
  - TTS: ElevenLabs/Azure/Google.
  - STT: Whisper local o API.
  - Imagen: SDXL/API (thumbnails y fondos).
- **Seguridad**: keytar (secrets), cifrado AES-GCM para configuración sensible.
- **Update delivery**: Tauri updater + firma de binarios.

### Opción B (Windows-first)
- **UI**: WPF + MVVM.
- **Backend**: .NET 8 Worker Services.
- **Persistencia**: EF Core + SQLite.
- **FFmpeg**: wrappers C# + tareas asíncronas.

---

## 5) Esquema de base de datos (SQLite)

```sql
users_local(id, name, email, created_at)
workspaces(id, name, theme, created_at)
projects(id, workspace_id, title, niche, audience, language, status, created_at, updated_at)
project_settings(id, project_id, target_duration_sec, cut_rhythm, subtitle_style, voice_speed, emotional_tone)
scenes(id, project_id, idx, script_text, visual_prompt, start_ms, end_ms)
assets(id, project_id, type, path, provider, meta_json, created_at)
voices(id, provider, voice_key, language, gender, style_json)
subtitle_tracks(id, project_id, language, format, path, style_json)
renders(id, project_id, preset, status, progress, output_path, logs_path, created_at, finished_at)
export_presets(id, platform, resolution, fps, bitrate, audio_bitrate)
series(id, workspace_id, name, niche, cadence, branding_json)
series_episodes(id, series_id, project_id, episode_number, status)
hooks_library(id, niche, text, score, tags)
metadata_suggestions(id, project_id, title, description, hashtags, platform)
engagement_scores(id, project_id, hook_score, pace_score, subtitle_score, overall_score, recommendations_json)
licenses(id, workspace_id, license_key, plan, status, expires_at)
credit_wallet(id, workspace_id, credits_balance, updated_at)
credit_transactions(id, workspace_id, type, amount, feature, created_at)
plugins(id, name, version, status, manifest_json, installed_at)
audit_logs(id, scope, level, message, payload_json, created_at)
```

Índices recomendados:
- `projects(workspace_id, updated_at)`
- `renders(project_id, status)`
- `series_episodes(series_id, episode_number)`
- `metadata_suggestions(project_id, platform)`

---

## 6) Ejemplo de estructura de carpetas

```text
/desktop-app
  /apps
    /shell-ui                  # Tauri/WPF UI
    /local-api                 # Node/.NET app services
  /packages
    /domain                    # entidades, value objects, reglas
    /application               # casos de uso, orquestadores
    /ports                     # interfaces hexagonales
    /adapters
      /llm
      /tts
      /stt
      /image-gen
      /ffmpeg
      /publishers
      /billing
    /plugin-sdk
    /shared-kernel             # tipos comunes, errores, utilidades
  /infra
    /db                        # migraciones SQLite
    /queue
    /logging
    /security
  /assets
    /templates
    /music
    /fonts
  /docs
    /adr
    /api
    /ux
```

---

## 7) Roadmap de desarrollo por fases

### Fase 0 — Discovery & arquitectura (2–3 semanas)
- Definir MVP funcional y ADRs técnicos.
- Diseñar UX principal (Wizard, dashboard, timeline).

### Fase 1 — MVP Creator Engine (6–8 semanas)
- Proyectos + guion IA + TTS + plantillas verticales + export básico.
- Subtítulos automáticos simples.
- Modo Rápido operativo.

### Fase 2 — Pro Editing & calidad (6–10 semanas)
- Timeline Pro + auto-cortes + subtítulos animados avanzados.
- Presets por plataforma + preview en tiempo real optimizada.

### Fase 3 — Comercialización (4–6 semanas)
- Licencias, suscripción, créditos IA, billing y límites por plan.
- Telemetría opt-in, hardening de errores y logging avanzado.

### Fase 4 — Escalado y ecosistema (6+ semanas)
- Marketplace de plantillas/plugins.
- Publicación asistida en redes y versión cloud híbrida.

---

## 8) Diferenciadores estratégicos frente a clipshort.co

1. **Modo dual real (Rápido + Pro)** en escritorio sin latencia cloud.
2. **Pipeline híbrido local/cloud** con fallback offline para edición.
3. **Series-first**: continuidad narrativa y branding episódico.
4. **Predictor de engagement explicable** (no caja negra).
5. **Plugin marketplace** para ecosistema de extensiones.
6. **Control granular audiovisual** comparable a herramientas pro, con UX simplificada.

---

## 9) Estimación aproximada de complejidad técnica

- **Complejidad global**: Alta (8.5/10).
- **Equipo recomendado (mínimo)**:
  - 1 Product Manager
  - 1 UX/UI Senior
  - 2 Frontend/Desktop Engineers
  - 2 Backend/Media Engineers
  - 1 AI Engineer
  - 1 QA Automation
- **Horizonte MVP comercial**: 4–6 meses.
- **Horizonte versión robusta con marketplace**: 8–12 meses.

Riesgos técnicos principales:
- Variabilidad y costo de proveedores IA.
- Rendimiento de previsualización y render en hardware heterogéneo.
- Cumplimiento de políticas y APIs de publicación social.

Mitigaciones:
- Capa de abstracción de proveedores + caching de resultados.
- Benchmarks de FFmpeg por perfil de máquina + presets adaptativos.
- Diseño feature-flag para conectores sociales.

---

## 10) Propuesta de nombre comercial

### Nombre sugerido: **ViralForge Studio**

**Alternativas**:
- ClipForge Pro
- ReelSmith AI
- ShortPilot Studio
- SparkCut Creator

Racional: “ViralForge Studio” transmite fabricación de contenido viral con enfoque profesional, memorable para B2B creator tools y escalable a marca suite.

---

## Verificación final solicitada

- ✅ Funcionalidades clave cubiertas: guion IA, TTS/STT, subtítulos animados, plantillas 9:16, timeline, series, metadata, export, score de engagement, licensing y marketplace.
- ✅ Arquitectura coherente y escalable: hexagonal + clean, módulos desacoplados, plugin runtime y puertos/adaptadores.
- ✅ UX bien definida: onboarding wizard, modo rápido, modo pro, dashboard, tooltips contextuales, theming y drag & drop.
- ✅ Viabilidad comercial: monetización mixta (licencia/suscripción/créditos/marketplace) + roadmap realista.
- ✅ Lista para iniciar desarrollo: stack, módulos, DB schema, carpetas, roadmap y riesgos/mitigaciones accionables.
