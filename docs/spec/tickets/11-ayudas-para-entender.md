# 11: Ayudas para entender la estrategia y el resultado

**Qué construir:** el usuario detecta antes de simular si un compuesto no sirve para la lluvia de su tramo, entiende los términos técnicos sin saber de F1, lee una conclusión del resultado y llega al resultado sin hacer scroll.

**Depende de:** 10

- [x] Avisos de banda de lluvia: función pura que, con los stints del formulario, el pronóstico y los neumáticos, devuelve por stint las vueltas donde la lluvia queda fuera de la banda óptima del compuesto. En la barra de estrategia esos tramos se marcan con rayado rojo y debajo se listan avisos breves ("Stint 1 · Blando: vueltas 1–16 con lluvia 0.45, fuera de su banda 0.00–0.05"). Test unitario de la función
- [x] Conclusión del resultado: función pura sobre la respuesta que arma 1–2 frases en español (mayor pérdida por término; si la carrera tiene lluvia, si la elección de gomas costó o no tiempo y en qué stint). Se muestra arriba del resultado. Test unitario
- [x] Ayudas en términos técnicos: ícono de información con tooltip de una línea en vuelta base, desgaste, dificultad de adelantamiento, pérdida en boxes, ritmo, degradación, rendimiento en mojado, lluvia óptima, consistencia (aclara que no entra en la simulación) y la referencia de "Dónde se fue el tiempo"
- [x] Tras una simulación exitosa la página baja hasta el resultado (desplazamiento suave salvo `prefers-reduced-motion`) y el foco pasa al título del resultado
