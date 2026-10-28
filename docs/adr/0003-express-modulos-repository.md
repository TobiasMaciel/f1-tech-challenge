# 0003. Express 5 con módulos, capas y patrón repository

## Contexto

El backend integra una API externa, valida entradas y ejecuta un motor de cálculo. Mezclar estas responsabilidades en los handlers dificulta probar cada una.

## Decisión

Express 5 organizado en módulos (`races`, `drivers`, `simulation`), cada uno con rutas, controlador y servicio. El acceso a la API F1 está detrás de la interfaz `F1Repository`, con una implementación HTTP. El motor de simulación son funciones puras sin dependencias de Express ni de red. El servicio orquesta; el motor decide.

## Consecuencias

- (+) El motor se prueba sin servidor ni mocks.
- (+) El repository se puede sustituir (otro origen de datos, tests) sin tocar los servicios.
- (+) Express 5 propaga los errores de handlers async al manejador de errores sin envoltorios.
- (−) Más archivos que un único `app.ts`; se acepta a cambio de límites claros entre capas.
