# Plan de Mejoras de Diseño y Sincronización Web

Este documento detalla los pasos para asegurar que la aplicación local (`chilenos-young app`) coincida visual y funcionalmente con la versión web (`https://fch-noticias.vercel.app/`).

> [!NOTE]
> **Contexto Visual**: Por limitaciones técnicas no se pudieron adjuntar nuevas capturas. Utilice la web en vivo como referencia "Gold Standard".

## 1. Auditoría de Identidad Visual (Hallazgos)

### Tipografía (Corrección Necesaria)
Se detectó una discrepancia:
-   **Web (Objetivo)**: Utiliza `Inter` y `Oswald`.
-   **Local (Actual)**: Utiliza `Inter Tight`.

**Plan de Acción**:
1.  Actualizar `client/index.html` para importar `Inter` y `Oswald` desde Google Fonts.
2.  Configurar Tailwind para usar `Inter` como fuente sans por defecto y `Oswald` para encabezados (headings).

### Paleta de Colores (Premium Dark Mode)
Para igualar el diseño premium:
-   **Fondo**: Utilizar tonos oscuros profundos (`zinc-950` / `#09090b`) en lugar de negro puro.
-   **Tarjetas**: Fondos con ligera transparencia y bordes sutiles (`border-white/10`).
-   **Acentos**: Definir un color primario vibrante (posiblemente rojo/azul según la marca, a verificar en la web).

## 2. Componentes Clave

### Header / Navegación
-   Implementar efecto `backdrop-blur` (cristal esmerilado).
-   Asegurar que el logo coincida en tamaño y posición.

### Tarjetas de Noticias
-   Ajustar `border-radius` (e.g., `rounded-xl`).
-   Asegurar tipografía de títulos en `Oswald` font-weight 700.
-   Animaciones suaves en hover.

## 3. Próximos Pasos

Si estás de acuerdo con este plan, procederé a:
1.  [ ] Cambiar las fuentes en `client/index.html` y `tailwind.config`.
2.  [ ] Revisar y ajustar `index.css` para la paleta de colores.
3.  [ ] Pulir el diseño de las tarjetas de noticias.

---
*Generado por Antigravity*
