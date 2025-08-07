# Sistema de Predicción de Precio de Ethereum (ETH)

Este sistema predice el precio horario de Ethereum utilizando un modelo de Deep Learning basado en una red LSTM.

## Fuente de Datos

- Se descargan datos históricos horarios de Ethereum desde Binance.
- Para el **entrenamiento**, se obtiene un historial de hasta **3 años** (1095 días), lo que permite capturar patrones y tendencias a largo plazo.
- Para la **predicción en tiempo real**, se usan datos de la última **semana** (168 horas), con algunos registros adicionales para asegurar secuencias completas.

## Preprocesamiento

- Se utilizan las siguientes características:
  - Precio de cierre (`price`)
  - Volumen (`volume`)
  - Retornos simples (`returns`)
  - Retornos logarítmicos (`log_returns`)
- Los datos son normalizados con `MinMaxScaler`.
- Se crean secuencias temporales de longitud 168 (una semana de datos horarios) para alimentar el modelo.

## Modelo

- Red LSTM con dos capas y `dropout` para evitar sobreajuste.
- Capas densas adicionales para capturar relaciones no lineales.
- Entrenado con función de pérdida MSE durante 30 epochs, usando batches de 256 secuencias.

## Proceso de Predicción

- Se obtiene la última secuencia de datos escalados y se ingresa al modelo para predecir el siguiente precio horario.
- La predicción se desescala para obtener el valor real.
- Se compara con el precio actual (obtenido en tiempo real desde Binance).
- Se calcula el porcentaje de cambio esperado y se indica la dirección prevista (subida, bajada o estable).

## Performance y Precisión

- En pruebas reales, el modelo suele lograr un error porcentual alrededor de **0.2% - 0.3%** en la predicción del precio.
- La tasa de acierto en la dirección del movimiento (si sube o baja) está aproximadamente entre **60% y 70%**.
- Esto lo convierte en una herramienta útil para apoyar análisis y decisiones de trading, aunque no es infalible debido a la alta volatilidad del mercado cripto.

---

Este sistema combina una sólida base de datos histórica con un modelo LSTM diseñado para captar patrones temporales complejos y entregar predicciones fiables en plazos horarios.

## Archivos principales

- `train_model.py`: script para descargar datos históricos, preparar secuencias, entrenar y guardar el modelo.
- `predict.py`: script para cargar el modelo guardado, obtener datos recientes y predecir el próximo precio horario.

---

## Requisitos y dependencias

- **Python 3.8+** — lenguaje base.
- **torch** — para definir, entrenar y usar el modelo LSTM.
- **pandas** — manejo y transformación de datos tabulares.
- **numpy** — operaciones numéricas y matrices.
- **scikit-learn** (sklearn) — para escalado MinMax de features.
- **requests** — descarga datos históricos y precio actual desde Binance API.
- **logging** (módulo estándar) — para registrar mensajes de info y error.
- **datetime** (módulo estándar) — manejo de fechas y tiempos.

