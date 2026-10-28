<img src="apps/web/public/logo.svg" alt="Logo de F1 Race Strategist" width="72">

# F1 Race Strategist

App web para elegir una carrera de F1, armar una estrategia de neumáticos con un piloto y simular cuánto tarda en terminarla, con el detalle de dónde se ganó o se perdió tiempo.

## Cómo levantarlo

Necesitas Node.js 24 (`node -v` para ver tu versión). Desde la carpeta del proyecto:

```bash
npm install
npm run dev
```

Abre **http://localhost:5173**. La primera carga puede tardar hasta un minuto porque la API de F1 se duerme cuando nadie la usa.

## Supuestos de la simulación

- Sin azar: la misma estrategia da siempre el mismo tiempo, sin safety car ni variación entre vueltas.
- Cada vuelta parte del tiempo base del circuito y se ajusta por el piloto y su auto, el neumático, su desgaste, el combustible y la lluvia.
- El desgaste crece igual en cada vuelta y la lluvia penaliza al neumático que no es el adecuado.
- Temperatura, constancia del piloto y dificultad de adelantamiento se muestran pero no cambian el resultado.

## Decisiones

- La web solo habla con nuestra API, que junta los datos de la API de F1 para cada pantalla.
- La web y la API validan la estrategia con las mismas reglas.
- Sin base de datos: los datos no cambian y alcanza con guardarlos en memoria.

## Qué mejoraría con más tiempo

Sugerir la mejor estrategia, ver la carrera animada, tests en un navegador real, guardar estrategias en una base de datos y publicarla online.

---

Más detalle en [`docs/proyecto.md`](docs/proyecto.md): cómo está organizado, comandos, cómo probar la API y las fórmulas. Cómo se trabajó, con la especificación y los tickets, en [`docs/proceso.md`](docs/proceso.md).
