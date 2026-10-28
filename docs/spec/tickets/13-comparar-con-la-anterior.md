# 13: Comparar con la simulación anterior

**Qué construir:** al simular de nuevo en la misma carrera, el usuario ve cuánto mejoró o empeoró frente a la simulación anterior, en total y por factor.

**Depende de:** 12

- [x] Se guarda la simulación exitosa anterior (resultado y estrategia) de la carrera actual; cambiar de carrera la descarta
- [x] Tarjeta del tiempo total: diferencia con la anterior ("−32.400 s frente a la anterior" en verde si es más rápida, rojo si es más lenta, neutro si es igual) y resumen de la estrategia anterior (compuestos y vueltas, piloto si cambió)
- [x] "Dónde se fue el tiempo": diferencia por factor frente a la anterior
- [x] Sin simulación anterior no se muestra nada de comparación
- [x] README: se quita la comparación de "qué mejoraría"
- [x] Función pura que calcula las diferencias, con test unitario; test de la app que simula dos veces y ve la diferencia
