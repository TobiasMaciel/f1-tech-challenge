# 02: Trazados de circuitos

**Qué construir:** el frontend puede dibujar el trazado real de cualquiera de los 7 circuitos del challenge. Ver [spec](../spec.md), sección "Frontend".

**Depende de:** 01

- [x] Script versionado que descarga los GeoJSON de bacinger/f1-circuits (MIT) de los 7 circuitos y los convierte a SVG normalizados (mismo tamaño de lienzo, proporción conservada)
- [x] Los SVG generados quedan versionados en el frontend; la app no depende del dataset en tiempo de ejecución
- [x] Tabla propia de correspondencia de id de circuito de la API (`circuit-01` … `circuit-07`) a trazado
- [x] Componente que dibuja el trazado de un circuito por su id y no muestra nada si no hay trazado
- [x] La atribución y licencia del dataset quedan registradas para el README
