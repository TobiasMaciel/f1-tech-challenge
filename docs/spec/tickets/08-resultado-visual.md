# 08: Resultado visual

**Qué construir:** el usuario entiende el resultado: dónde se fue el tiempo, las paradas, el gráfico por vuelta, y ve antes de simular si sus stints coinciden con la lluvia. Ver [spec](../spec.md): historias 17, 21, 23, 24.

**Depende de:** 07

- [x] "Dónde se fue el tiempo": suma por término en toda la carrera (desgaste, lluvia, boxes, combustible), calculada desde la respuesta
- [x] Lista de paradas: vuelta, compuesto saliente → entrante, tiempo perdido
- [x] Gráfico de tiempo por vuelta (Recharts) coloreado por compuesto, con el fondo sombreado según la lluvia
- [x] Barra de stints alineada vuelta a vuelta con la barra de clima en el constructor, con la vuelta de cada parada
- [x] Test de la app: tras simular se muestran el resumen de tiempo y las paradas
