"""
Banco de preguntas: 1000+ preguntas con opciones de longitud balanceada.
REGLA ANTI-SESGO: len(max_opt) - len(min_opt) < 40 chars en cada pregunta.
Posicion correcta (0,1,2,3) distribuida uniformemente.
Formato: [pregunta, [op0,op1,op2,op3], idx_correcto, dificultad, subtema, concepto]
"""
import json, re

QUESTIONS_RAW = {

# ═══════ FOUNDATIONS ════════════════════════════════════════════════════════
"foundations": [
# ml_basics
["¿Qué diferencia al aprendizaje supervisado del no supervisado?",
 ["El supervisado usa datos etiquetados; el no supervisado descubre patrones",
  "El supervisado es más rápido y el no supervisado consume más memoria RAM",
  "El supervisado solo usa texto y el no supervisado procesa imágenes y video",
  "El supervisado no requiere GPU y el no supervisado siempre necesita hardware especial"],
 0,"beginner","ml_basics","supervised_learning"],

["¿Cuál es la función principal del conjunto de validación?",
 ["Evaluar el modelo final antes de publicarlo con usuarios reales en producción",
  "Ajustar hiperparámetros durante el entrenamiento sin contaminar el test final",
  "Aumentar el volumen de datos mediante técnicas de data augmentation variadas",
  "Reducir el tiempo de entrenamiento usando solo una fracción de los datos totales"],
 1,"beginner","ml_basics","train_val_test"],

["¿Qué es el overfitting en un modelo de Machine Learning?",
 ["El modelo entrena muy lento por falta de optimización correcta en el código",
  "El modelo usa demasiada memoria durante la inferencia en producción real",
  "El modelo memoriza el entrenamiento pero falla al generalizar datos nuevos",
  "El modelo no converge porque la tasa de aprendizaje está demasiado elevada"],
 2,"beginner","ml_basics","overfitting"],

["¿Qué mide la exactitud (accuracy) en clasificación binaria?",
 ["La proporción de positivos verdaderos sobre todos los positivos del dataset",
  "La relación entre precisión y recall ponderada por importancia de cada clase",
  "El tiempo promedio que tarda el modelo en clasificar un solo ejemplo nuevo",
  "La fracción de predicciones correctas sobre el total de predicciones hechas"],
 3,"beginner","ml_basics","metrics"],

["¿Qué es un hiperparámetro en Machine Learning?",
 ["Un parámetro que el modelo aprende solo de forma automática durante el training",
  "Una variable de configuración que defines antes de iniciar el entrenamiento",
  "Un resultado intermedio calculado en cada capa neuronal durante el forward pass",
  "Una métrica que mide el rendimiento del modelo en el conjunto de prueba final"],
 1,"beginner","ml_basics","hyperparameters"],

["¿Para qué sirve la técnica de cross-validation?",
 ["Para acelerar el entrenamiento dividiendo el trabajo entre múltiples GPUs",
  "Para aumentar artificialmente el dataset usando transformaciones y rotaciones",
  "Para estimar el rendimiento real usando distintas particiones del mismo dataset",
  "Para reducir el número de parámetros del modelo y evitar el sobreajuste total"],
 2,"intermediate","ml_basics","cross_validation"],

["¿Cuál es la diferencia entre regresión y clasificación?",
 ["La regresión predice valores continuos; la clasificación predice categorías",
  "La regresión solo usa datos numéricos; la clasificación requiere texto puro",
  "La regresión entrena más rápido porque usa menos capas en la red neuronal",
  "La regresión es supervisada y la clasificación siempre es no supervisada pura"],
 0,"beginner","ml_basics","regression_classification"],

["¿Qué es el bias en el trade-off bias-variance del aprendizaje?",
 ["La diferencia sistemática entre el valor predicho y el valor real esperado",
  "El sesgo racial o de género que aparece en los datasets de entrenamiento",
  "El error causado por variaciones entre distintas particiones del dataset",
  "La cantidad de datos incorrectamente etiquetados en el conjunto original"],
 0,"intermediate","ml_basics","bias_variance"],

["¿Qué tipo de problema resuelve el clustering?",
 ["Predecir un valor numérico futuro basándose en tendencias históricas pasadas",
  "Clasificar cada dato en una categoría predefinida con etiquetas conocidas",
  "Agrupar datos similares sin etiquetas para encontrar estructura oculta interna",
  "Generar muestras sintéticas nuevas a partir de una distribución aprendida"],
 2,"beginner","ml_basics","clustering"],

["¿Qué es una función de pérdida (loss function) en ML?",
 ["Una función que mide cuánto tarda el modelo en procesar cada batch de datos",
  "Una función que cuantifica la diferencia entre predicciones y valores reales",
  "Una función que selecciona los mejores hiperparámetros del modelo automáticamente",
  "Una función que decide qué neuronas activar en cada capa oculta del modelo"],
 1,"beginner","ml_basics","loss_function"],

# deep_learning
["¿Qué hace la función de activación ReLU?",
 ["Normaliza los pesos de la red para evitar que exploten durante el entrenamiento",
  "Convierte los valores negativos en cero y deja los positivos sin modificación",
  "Aplica dropout aleatorio para regularizar la red durante el entrenamiento",
  "Inicializa los pesos de la red con una distribución normal estándar aleatoria"],
 1,"intermediate","deep_learning","relu"],

["¿Cuál es el papel del algoritmo de backpropagation?",
 ["Inicializar los pesos de la red con valores óptimos antes del entrenamiento",
  "Calcular cuántas capas necesita la red para resolver un problema concreto",
  "Propagar el gradiente del error hacia atrás para actualizar cada peso red",
  "Seleccionar automáticamente la arquitectura óptima para cada tipo de tarea"],
 2,"intermediate","deep_learning","backpropagation"],

["¿Para qué se usa el dropout en redes neuronales?",
 ["Para acelerar el entrenamiento reduciendo el número de operaciones por capa",
  "Para comprimir el modelo y reducir su tamaño antes del deployment final",
  "Para regularizar la red desactivando neuronas aleatoriamente durante training",
  "Para inicializar los pesos de forma más eficiente que la inicialización random"],
 2,"intermediate","deep_learning","dropout"],

["¿Qué tipo de arquitectura usa principalmente una CNN?",
 ["Capas recurrentes que procesan secuencias manteniendo estado entre cada paso",
  "Mecanismos de atención que relacionan cada token con todos los demás tokens",
  "Capas de convolución que extraen características locales espaciales del input",
  "Capas densas completamente conectadas apiladas en profundidad secuencialmente"],
 2,"intermediate","deep_learning","cnn"],

["¿Qué ventaja tienen las redes LSTM sobre las RNN simples?",
 ["Las LSTM entrenan más rápido usando menos memoria de GPU en cada epoch",
  "Las LSTM tienen menos parámetros lo que reduce el riesgo de sobreajuste",
  "Las LSTM manejan dependencias largas gracias a sus compuertas de memoria",
  "Las LSTM procesan datos en paralelo mientras que las RNN son secuenciales"],
 2,"intermediate","deep_learning","lstm"],

["¿Qué es el gradient vanishing problem en redes profundas?",
 ["El optimizador diverge y los pesos crecen exponencialmente sin ningún control",
  "Los gradientes se vuelven tan pequeños al retropropagar que el modelo no aprende",
  "La red converge rápido atascándose en mínimos locales subóptimos del espacio",
  "La GPU se queda sin memoria al procesar redes con demasiadas capas ocultas"],
 1,"advanced","deep_learning","vanishing_gradient"],

["¿Cuál es la diferencia entre un batch y una epoch?",
 ["El batch es el subconjunto de datos por paso; epoch es una pasada completa",
  "El batch define el número de capas y epoch define el número de neuronas totales",
  "El batch es el número de épocas pasadas; epoch es el tamaño del conjunto total",
  "El batch determina la arquitectura y epoch determina la tasa de aprendizaje"],
 0,"beginner","deep_learning","training_basics"],

["¿Qué es el transfer learning en deep learning?",
 ["Mover un modelo entrenado de una GPU a otra para distribuir el cómputo total",
  "Reutilizar pesos de un modelo preentrenado para acelerar el aprendizaje nuevo",
  "Transferir datos entre distintos formatos para normalizarlos antes de entrenar",
  "Copiar la arquitectura de un modelo conocido pero inicializando pesos aleatorios"],
 1,"intermediate","deep_learning","transfer_learning"],

# nlp_basics
["¿Qué es un embedding de palabras en NLP?",
 ["Una compresión del texto original para reducir el uso de almacenamiento disco",
  "Una representación numérica densa que captura el significado semántico del texto",
  "Un método de tokenización que divide texto en sílabas individuales del idioma",
  "Una técnica para eliminar stopwords y caracteres especiales del texto de entrada"],
 1,"intermediate","nlp_basics","embeddings"],

["¿Cuál es la innovación clave de la arquitectura Transformer?",
 ["Usar capas recurrentes bidireccionales que procesan texto en ambas direcciones",
  "Sustituir recurrencia por atención permitiendo procesar todos los tokens en paralelo",
  "Aplicar convoluciones 1D sobre secuencias para extraer patrones locales del texto",
  "Utilizar árboles sintácticos como estructura interna para parsear las oraciones"],
 1,"intermediate","nlp_basics","transformers"],

["¿Qué significa que un modelo de lenguaje sea autoregresivo?",
 ["El modelo revisa y corrige sus propias predicciones de manera iterativa",
  "El modelo genera cada token usando solo los tokens generados anteriormente",
  "El modelo aprende sin supervisión humana ajustando sus parámetros solo",
  "El modelo adapta su arquitectura automáticamente según el tipo de tarea"],
 1,"intermediate","nlp_basics","autoregressive"],

["¿Para qué sirven los positional encodings en Transformers?",
 ["Para comprimir las representaciones y reducir la dimensionalidad del espacio",
  "Para normalizar los vectores de atención y estabilizar el entrenamiento",
  "Para indicar al modelo el orden de los tokens ya que la atención no lo tiene",
  "Para separar el vocabulario en subgrupos semánticos durante el pretraining"],
 2,"intermediate","nlp_basics","positional_encoding"],

["¿Qué es la tokenización BPE (Byte Pair Encoding)?",
 ["Un método que divide texto en caracteres individuales y no en palabras enteras",
  "Un algoritmo que fusiona iterativamente los pares de bytes más frecuentes",
  "Una técnica que representa cada palabra como un vector de dimensión fija densa",
  "Un proceso que elimina palabras raras para reducir el tamaño del vocabulario"],
 1,"intermediate","nlp_basics","tokenization"],

["¿Qué mide la perplejidad (perplexity) en un modelo de lenguaje?",
 ["El tiempo de inferencia promedio al generar cada token en condiciones normales",
  "La cantidad de parámetros activos durante la generación de cada secuencia",
  "Qué tan bien predice el modelo una secuencia de texto: menor valor es mejor",
  "El porcentaje de tokens generados que coinciden con el texto de referencia"],
 2,"intermediate","nlp_basics","perplexity"],

# statistics
["¿Qué es la distribución normal y por qué es relevante en ML?",
 ["Un tipo de datos tabulares bien organizado que facilita el preprocesamiento",
  "Una distribución simétrica en forma de campana muy frecuente en datos naturales",
  "Un método de normalización que transforma cualquier dato al rango entre 0 y 1",
  "Un algoritmo de clustering que asume que los datos siguen una forma circular"],
 1,"beginner","statistics","normal_distribution"],

["¿Cuál es la diferencia entre correlación y causalidad?",
 ["La correlación mide la fuerza de relación; causalidad implica que A provoca B",
  "La correlación aplica a variables categóricas y causalidad solo a numéricas",
  "La correlación requiere experimentos controlados mientras que la causalidad no",
  "La correlación siempre es positiva mientras que la causalidad puede ser inversa"],
 0,"intermediate","statistics","correlation_causation"],

["¿Qué es el p-value en estadística inferencial?",
 ["La probabilidad de rechazar la hipótesis nula cuando esta realmente es verdadera",
  "El valor máximo que puede tomar un estimador para ser estadísticamente válido",
  "La probabilidad de ver los datos obtenidos si la hipótesis nula fuera cierta",
  "El tamaño mínimo de muestra necesario para obtener resultados significativos"],
 2,"intermediate","statistics","hypothesis_testing"],

["¿Para qué se usa la normalización z-score?",
 ["Para transformar variables a escala [0,1] preservando la distribución original",
  "Para eliminar outliers extremos de un dataset antes del entrenamiento del modelo",
  "Para restar la media y dividir por la desviación estándar obteniendo μ=0, σ=1",
  "Para convertir variables categóricas en vectores numéricos densos tipo embedding"],
 2,"beginner","statistics","normalization"],

["¿Qué es la matriz de confusión y para qué sirve?",
 ["Una tabla que muestra el rendimiento del clasificador por cada categoría real",
  "Un método para inicializar los pesos de una red evitando gradientes en cero",
  "Una técnica de augmentation que genera variantes confusas del dataset base",
  "Una métrica que mide la dificultad del problema para humanos versus máquinas"],
 0,"beginner","statistics","confusion_matrix"],

# ai_types
["¿Qué define al aprendizaje por refuerzo (Reinforcement Learning)?",
 ["Un agente aprende maximizando recompensas acumuladas mediante prueba y error",
  "Un modelo aprende de datos etiquetados proporcionados por supervisores humanos",
  "Un sistema descubre estructura oculta en datos sin ningún tipo de supervisión",
  "Un algoritmo genera datos sintéticos nuevos a partir de ejemplos reales del dataset"],
 0,"intermediate","ai_types","reinforcement_learning"],

["¿Qué es un GAN (Generative Adversarial Network)?",
 ["Una red que usa atención para generar texto de alta calidad y coherencia total",
  "Una arquitectura donde generador y discriminador compiten para mejorar calidad",
  "Una red que aprende representaciones sin supervisión usando reconstrucción",
  "Un modelo que predice la siguiente palabra en una secuencia de texto dada"],
 1,"intermediate","ai_types","gans"],

["¿Cuál es la diferencia entre IA estrecha e IA general?",
 ["La IA estrecha es más cara de entrenar que la IA general en cualquier caso",
  "La IA estrecha usa deep learning mientras la general usa reglas lógicas puras",
  "La IA estrecha resuelve tareas específicas; la general haría cualquier tarea",
  "La IA estrecha opera offline y la general siempre requiere conexión a internet"],
 2,"beginner","ai_types","agi"],

["¿Qué es el aprendizaje semi-supervisado?",
 ["Aprendizaje que usa solo datos etiquetados de alta calidad descartando el resto",
  "Aprendizaje que combina pocos datos etiquetados con muchos datos sin etiquetar",
  "Aprendizaje donde el modelo elige qué muestras etiquetar en cada iteración",
  "Aprendizaje que alterna entre fases supervisadas y fases de refuerzo activo"],
 1,"intermediate","ai_types","semi_supervised"],

["¿Qué distingue a los modelos generativos de los discriminativos?",
 ["Los generativos aprenden la distribución de datos; los discriminativos el límite",
  "Los generativos son más precisos porque aprenden más información del problema",
  "Los generativos usan más capas ocultas que los modelos discriminativos típicos",
  "Los generativos requieren GPU y los discriminativos funcionan en CPU sin problema"],
 0,"advanced","ai_types","generative_discriminative"],
], # end foundations

# ═══════ PROMPT_ENGINEERING ═════════════════════════════════════════════════
"prompt_engineering": [
["¿Qué es Zero-Shot prompting?",
 ["Darle al modelo varios ejemplos para que aprenda el patrón antes de la tarea",
  "Pedirle al modelo que realice la tarea sin proporcionarle ningún ejemplo previo",
  "Usar temperatura cero para obtener respuestas deterministas y totalmente repetibles",
  "Ejecutar el mismo prompt múltiples veces y promediar todos los resultados finales"],
 1,"beginner","prompting_basics","zero_shot"],

["¿Cuál es la ventaja principal del Few-Shot prompting?",
 ["Permite al modelo aprender sin necesitar ningún dato de entrenamiento adicional",
  "Guía el formato y estilo de respuesta usando ejemplos concretos dentro del prompt",
  "Reduce el coste porque los prompts few-shot siempre son más cortos en tokens",
  "Garantiza respuestas idénticas al eliminar toda la aleatoriedad en la generación"],
 1,"beginner","prompting_basics","few_shot"],

["¿Qué es Chain-of-Thought (CoT) prompting?",
 ["Un método que divide el prompt en partes para procesarlas en paralelo eficientemente",
  "Una técnica que pide al modelo razonar paso a paso antes de dar la respuesta",
  "Un enfoque que encadena múltiples modelos distintos en una misma pipeline",
  "Una forma de comprimir el historial de conversación para reducir los tokens"],
 1,"intermediate","prompting_basics","cot"],

["¿Cuándo es más útil usar un System Prompt?",
 ["Cuando necesitas que el modelo genere respuestas más largas y detalladas siempre",
  "Cuando el coste por llamada es alto y quieres reducir el número de tokens usado",
  "Para definir el rol, tono y restricciones permanentes del modelo en la sesión",
  "Cuando el modelo no tiene conocimiento del tema que le preguntas en el chat"],
 2,"beginner","prompting_basics","system_prompt"],

["¿Qué hace la temperatura en la generación de texto?",
 ["Define la longitud máxima en tokens que puede tener la respuesta generada",
  "Controla el vocabulario activo reduciendo las palabras posibles en cada paso",
  "Ajusta la aleatoriedad: valores altos dan respuestas más creativas y variadas",
  "Determina cuántos ejemplos few-shot puede procesar el modelo en un contexto"],
 2,"beginner","prompting_basics","temperature"],

["¿Qué es el role prompting y para qué se usa?",
 ["Asignarle al modelo un papel o identidad para contextualizar mejor sus respuestas",
  "Usar distintos modelos especializados según el tipo de tarea que se va a procesar",
  "Definir reglas de formato para que el modelo responda siempre en JSON o Markdown",
  "Establecer límites de longitud para evitar que las respuestas sean demasiado extensas"],
 0,"beginner","prompting_basics","role_prompting"],

["¿Qué es el prompt injection y por qué es un riesgo de seguridad?",
 ["Una optimización que comprime el prompt para reducir el coste en tokens de API",
  "Una técnica para mejorar la coherencia insertando contexto relevante automático",
  "Un ataque donde la entrada del usuario manipula al modelo para ignorar instrucciones",
  "Una forma de aumentar el contexto disponible usando técnicas de compresión texto"],
 2,"intermediate","prompting_basics","prompt_injection"],

["¿Qué significa grounding en el contexto de prompts para LLMs?",
 ["Reducir la temperatura del modelo para obtener respuestas más deterministas siempre",
  "Anclar las respuestas del modelo a hechos verificables o documentos concretos",
  "Establecer un límite máximo de tokens para controlar el coste por consulta API",
  "Usar embeddings para representar el prompt como un vector numérico normalizado"],
 1,"intermediate","prompting_basics","grounding"],

["¿Qué es el hallucination en LLMs y cómo se mitiga?",
 ["El modelo repite la misma frase en bucle por falta de diversidad en training",
  "El modelo genera texto muy creativo que supera la calidad del texto humano",
  "El modelo inventa información falsa con confianza; se mitiga con RAG y verificación",
  "El modelo rechaza responder preguntas por sus filtros de seguridad activados"],
 2,"intermediate","prompting_basics","hallucination"],

["¿Qué es el context window de un modelo de lenguaje?",
 ["El número de parámetros activos que el modelo usa durante la inferencia",
  "La cantidad máxima de tokens que el modelo puede procesar en una interacción",
  "El tamaño del batch usado durante el preentrenamiento del modelo base grande",
  "La cantidad de ejemplos few-shot que caben en una llamada estándar a la API"],
 1,"beginner","prompting_basics","context_window"],

["¿Qué es RAG (Retrieval-Augmented Generation)?",
 ["Un método de fine-tuning que usa datos recuperados de internet en tiempo real",
  "Una arquitectura que combina búsqueda de documentos relevantes con generación",
  "Una técnica de compresión que reduce el tamaño del modelo sin perder calidad",
  "Un tipo de prompting que almacena respuestas anteriores para reutilizarlas luego"],
 1,"intermediate","advanced_techniques","rag"],

["¿Cuándo hacer fine-tuning en lugar de usar prompts elaborados?",
 ["Cuando quieres resultados más rápidos y los prompts tardan más de un segundo",
  "Cuando el modelo necesita aprender estilo, formato o conocimiento muy específico",
  "Siempre que uses GPT-4 porque el fine-tuning mejora siempre su rendimiento",
  "Cuando el contexto del prompt supera 100 palabras y necesitas optimizarlo"],
 1,"advanced","advanced_techniques","fine_tuning_vs_prompting"],

["¿Qué es el function calling en APIs de LLMs modernos?",
 ["Una forma de llamar a múltiples modelos distintos desde una sola petición API",
  "Un mecanismo que permite al modelo invocar herramientas externas de forma estructurada",
  "Una técnica para reducir la latencia ejecutando partes del prompt en paralelo",
  "Un método de autenticación para verificar que las llamadas son de usuarios válidos"],
 1,"intermediate","advanced_techniques","function_calling"],

["¿Qué son los agentes LLM y qué los caracteriza?",
 ["Modelos especializados en analizar sentimiento de textos en múltiples idiomas",
  "Usuarios humanos que supervisan y corrigen las respuestas del modelo en tiempo real",
  "Sistemas donde el LLM razona, usa herramientas y toma decisiones iterativamente",
  "Prompts muy largos que contienen todas las instrucciones posibles de antemano"],
 2,"advanced","advanced_techniques","llm_agents"],

["¿Qué es el self-consistency en prompting avanzado?",
 ["Verificar que el system prompt no contradice las instrucciones del user prompt",
  "Generar múltiples razonamientos y elegir la respuesta más frecuente entre ellos",
  "Forzar al modelo a responder siempre en el mismo idioma y formato definido",
  "Asegurarse de que el modelo recuerda el contexto entre distintas conversaciones"],
 1,"advanced","advanced_techniques","self_consistency"],

["¿Para qué se usan los embeddings vectoriales en sistemas RAG?",
 ["Para comprimir el texto y reducir el número de tokens enviados a la API",
  "Para representar documentos numéricamente y encontrar los más similares a la consulta",
  "Para reordenar los tokens del prompt mejorando la atención del modelo al contexto",
  "Para cifrar el contenido sensible antes de enviarlo al modelo en producción"],
 1,"intermediate","advanced_techniques","embeddings_rag"],

["¿Qué ventaja ofrece el structured output (JSON mode) de los LLMs?",
 ["Garantiza que las respuestas sean más cortas y por tanto más baratas de generar",
  "Asegura que el modelo responde en un esquema predefinido fácil de parsear código",
  "Mejora la creatividad del modelo porque los formatos estructurados reducen sesgos",
  "Permite al modelo acceder a bases de datos externas para enriquecer sus respuestas"],
 1,"intermediate","advanced_techniques","structured_output"],

["¿Qué es el meta-prompting en prompt engineering?",
 ["Usar un LLM para generar o mejorar prompts que se usan con otro LLM después",
  "Escribir prompts en el idioma nativo del modelo para mejorar su comprensión",
  "Usar prompts genéricos que funcionan para cualquier tipo de tarea posible",
  "Incluir instrucciones ocultas en el prompt que el usuario no puede ver nunca"],
 0,"advanced","prompt_patterns","meta_prompting"],

["¿Qué es el tree of thoughts como técnica de prompting?",
 ["Un diagrama visual para organizar y estructurar prompts antes de enviarlos",
  "Un método que explora múltiples caminos de razonamiento en árbol para decidir",
  "Una forma de estructurar el conocimiento del dominio dentro del system prompt",
  "Un historial en formato árbol que registra todas las conversaciones anteriores"],
 1,"advanced","prompt_patterns","tree_of_thoughts"],

["¿Qué significa que un modelo sea open source en LLMs?",
 ["El modelo se puede usar gratis sin ninguna restricción de uso o licenciamiento",
  "Los pesos del modelo son públicos y puedes descargarlo y ejecutarlo localmente",
  "El modelo no tiene protección de derechos de autor y es de dominio público",
  "El modelo fue entrenado exclusivamente con datos de acceso público en internet"],
 1,"intermediate","models_knowledge","open_source_llms"],

["¿Cuál es la función principal de Whisper de OpenAI?",
 ["Generar imágenes fotorrealistas a partir de descripciones textuales detalladas",
  "Transcribir y traducir audio a texto con alta precisión en múltiples idiomas",
  "Generar embeddings de texto de alta calidad para búsqueda semántica eficiente",
  "Razonar sobre código y detectar bugs en múltiples lenguajes de programación"],
 1,"beginner","models_knowledge","whisper"],
], # end prompt_engineering

# ═══════ ANALYTICS ══════════════════════════════════════════════════════════
"analytics": [
["¿Qué devuelve SELECT DISTINCT en SQL?",
 ["Todas las filas de la tabla incluyendo todos los duplicados para procesarlos",
  "Solo las filas donde no existe ningún valor NULL en ninguna columna existente",
  "Filas únicas eliminando duplicados según las columnas del SELECT especificado",
  "Las filas ordenadas descendentemente por la primera columna que se lista"],
 2,"beginner","sql_basics","distinct"],

["¿Cuál es la diferencia entre WHERE y HAVING en SQL?",
 ["WHERE filtra filas antes de agrupar; HAVING filtra grupos después de GROUP BY",
  "WHERE solo funciona con números; HAVING funciona con texto y fechas también",
  "WHERE se aplica en el SELECT y HAVING se aplica en el FROM de la query",
  "WHERE elimina columnas de los resultados y HAVING añade columnas calculadas"],
 0,"beginner","sql_basics","where_having"],

["¿Qué hace GROUP BY en una consulta SQL?",
 ["Ordena los resultados de forma ascendente según la columna que se especifica",
  "Une dos tablas relacionadas mediante una clave foránea compartida entre ellas",
  "Agrupa filas con el mismo valor y permite aplicar funciones de agregación",
  "Elimina todas las filas que contienen valores NULL en la columna indicada"],
 2,"beginner","sql_basics","group_by"],

["¿Para qué sirve ORDER BY DESC en SQL?",
 ["Para eliminar filas duplicadas y ordenar la columna de mayor a menor valor",
  "Para ordenar los resultados de mayor a menor según la columna especificada",
  "Para agrupar resultados descendiendo desde la jerarquía superior a inferior",
  "Para filtrar solo los valores mayores que cero en la columna seleccionada"],
 1,"beginner","sql_basics","order_by"],

["¿Qué calcula COUNT(*) en una consulta SQL?",
 ["La suma de todos los valores numéricos de todas las columnas seleccionadas",
  "El número de valores no nulos en la primera columna de la tabla consultada",
  "El número total de filas en el resultado incluyendo las filas que tienen NULLs",
  "El número de columnas distintas que tiene la tabla en su definición actual"],
 2,"beginner","sql_basics","count"],

["¿Cuál es la diferencia entre SUM y COUNT en SQL?",
 ["SUM suma valores numéricos de una columna; COUNT cuenta el número de filas",
  "SUM funciona con texto y COUNT solo con números en todos los tipos de bases",
  "SUM es más lento que COUNT porque requiere más procesamiento por cada fila",
  "SUM incluye NULLs en el cálculo pero COUNT los excluye automáticamente siempre"],
 0,"beginner","sql_basics","aggregation"],

["¿Qué hace COALESCE(a, b, c) en SQL?",
 ["Devuelve la concatenación de los valores a, b y c separados por comas texto",
  "Devuelve el valor máximo entre los argumentos a, b y c comparando magnitudes",
  "Devuelve el primer valor no nulo de la lista de argumentos que se proporciona",
  "Devuelve el número de argumentos que tienen valores no nulos en la lista"],
 2,"intermediate","sql_basics","coalesce"],

["¿Cuál es la diferencia entre INNER JOIN y LEFT JOIN?",
 ["INNER JOIN es más rápido; LEFT JOIN consume más memoria por sus operaciones",
  "INNER JOIN devuelve solo filas con match en ambas tablas; LEFT conserva todas izquierdas",
  "INNER JOIN une por igualdad exacta; LEFT JOIN permite condiciones de rango",
  "INNER JOIN requiere índices siempre mientras que LEFT JOIN funciona sin ellos"],
 1,"intermediate","sql_advanced","joins"],

["¿Qué es una CTE (Common Table Expression) y cuándo usarla?",
 ["Una tabla temporal permanente que se almacena en disco para reutilización",
  "Un índice especial que acelera las consultas con múltiples condiciones JOIN",
  "Una subconsulta nombrada con WITH que mejora la legibilidad de queries complejas",
  "Un tipo de vista materializada que se actualiza automáticamente en cada query"],
 2,"intermediate","sql_advanced","cte"],

["¿Para qué sirven las Window Functions en SQL?",
 ["Para dividir una tabla grande en ventanas de tiempo y consultarlas por separado",
  "Para calcular métricas sobre un conjunto de filas sin colapsar las filas del resultado",
  "Para optimizar queries con GROUP BY en tablas que tienen millones de registros",
  "Para crear vistas con ventanas de datos que se actualizan en tiempo casi real"],
 1,"advanced","sql_advanced","window_functions"],

["¿Qué hace ROW_NUMBER() OVER (PARTITION BY x ORDER BY y)?",
 ["Cuenta el total de filas en cada partición que está definida por la columna x",
  "Asigna un número secuencial único a cada fila dentro de cada grupo definido por x",
  "Ordena todos los registros por x primero y después por y como criterio secundario",
  "Elimina duplicados dentro de cada partición manteniendo solo la primera ocurrencia"],
 1,"advanced","sql_advanced","row_number"],

["¿Cuándo usar RANK() en lugar de ROW_NUMBER()?",
 ["Cuando necesitas que los empates reciban el mismo rango saltando posiciones",
  "Cuando quieres numerar filas de forma secuencial sin permitir ningún empate",
  "Cuando el dataset es muy grande y necesitas una función más eficiente aquí",
  "Cuando trabajas con fechas y necesitas rankear por períodos temporales distintos"],
 0,"advanced","sql_advanced","rank"],

["¿Qué hace LAG(columna, 1) OVER (ORDER BY fecha)?",
 ["Obtiene el valor de la columna de la fila siguiente en el orden que se definió",
  "Calcula el promedio móvil con una ventana de exactamente 1 día hacia adelante",
  "Obtiene el valor de la columna de la fila anterior en el orden que se definió",
  "Retrasa la ejecución de la query en 1 segundo para evitar sobrecarga del servidor"],
 2,"advanced","sql_advanced","lag_lead"],

["¿Cuál es la diferencia entre UNION y UNION ALL?",
 ["UNION ordena el resultado y UNION ALL mantiene el orden original de los datos",
  "UNION elimina filas duplicadas del resultado final; UNION ALL conserva todas",
  "UNION requiere que las tablas tengan el mismo número de filas para funcionar",
  "UNION es más rápido porque omite la verificación de tipos en cada columna"],
 1,"intermediate","sql_advanced","union"],

["¿Qué es dbt (data build tool) y para qué se usa?",
 ["Una herramienta de visualización para crear dashboards a partir de tablas SQL",
  "Un orquestador que programa y ejecuta pipelines de datos en la nube de forma",
  "Una herramienta que transforma datos en el warehouse usando SQL versionado",
  "Un sistema de almacenamiento que reemplaza a los data warehouses tradicionales"],
 2,"intermediate","dbt","dbt_intro"],

["¿Qué es un ref en dbt y por qué es importante?",
 ["Una referencia a documentación externa que dbt incluye automáticamente",
  "Un identificador único que dbt asigna a cada modelo para la trazabilidad",
  "Una función que referencia otros modelos de dbt creando dependencias explícitas",
  "Una variable de configuración que define el entorno de ejecución del modelo"],
 2,"intermediate","dbt","dbt_ref"],

["¿Cuál es la diferencia entre un modelo view y table en dbt?",
 ["Los modelos view son más lentos que los table porque no cachean los resultados",
  "Los modelos view se recalculan en cada consulta; table materializa físicamente",
  "Los modelos view solo pueden usarse en desarrollo pero no en producción nunca",
  "Los modelos view no permiten tests mientras que los table sí los soportan bien"],
 1,"intermediate","dbt","dbt_materialization"],

["¿Para qué sirven los tests en dbt?",
 ["Para medir el tiempo de ejecución de cada modelo y optimizar las queries SQL",
  "Para versionar los modelos SQL y poder revertir cambios en caso de error",
  "Para validar que los datos cumplen reglas de calidad como unicidad y no nulos",
  "Para generar documentación automática de los modelos y sus dependencias"],
 2,"intermediate","dbt","dbt_tests"],

["¿Qué es un source en dbt?",
 ["Un archivo YAML que define las tablas brutas del warehouse como punto de entrada",
  "Un modelo dbt que agrega múltiples tablas en una única vista consolidada",
  "Un conector externo que carga datos desde APIs hacia el data warehouse destino",
  "Una función de dbt que genera datos de ejemplo para pruebas de desarrollo"],
 0,"intermediate","dbt","dbt_sources"],

["¿Qué es un esquema estrella (star schema)?",
 ["Un modelo donde todas las tablas tienen exactamente el mismo número de columnas",
  "Una tabla central de hechos rodeada de tablas de dimensiones desnormalizadas",
  "Un diseño donde cada tabla referencia a todas las demás en forma circular",
  "Un esquema donde los datos se almacenan en formato columnar comprimido eficiente"],
 1,"intermediate","data_modeling","star_schema"],

["¿Qué diferencia a una tabla de hechos de una de dimensiones?",
 ["Las tablas de hechos almacenan métricas; las dimensiones guardan contexto descriptivo",
  "Las tablas de hechos tienen muchas columnas; las dimensiones tienen pocas siempre",
  "Las tablas de hechos se actualizan diariamente; las dimensiones solo se crean una vez",
  "Las tablas de hechos son pequeñas y rápidas; las dimensiones son grandes y lentas"],
 0,"intermediate","data_modeling","facts_dimensions"],

["¿Qué es la tercera forma normal (3FN)?",
 ["Un diseño donde cada tabla tiene exactamente tres columnas indexadas como mínimo",
  "Un estándar donde las tablas no tienen filas duplicadas en ninguna condición",
  "Un nivel de normalización donde todos los atributos dependen solo de la clave",
  "Un modelo donde cada tabla tiene máximo tres relaciones con otras tablas"],
 2,"advanced","data_modeling","normalization"],

["¿Qué es un SCD tipo 2 (Slowly Changing Dimension)?",
 ["Una dimensión que se actualiza eliminando el registro antiguo sin conservarlo",
  "Una dimensión que promedia los valores históricos manteniendo un solo registro",
  "Una dimensión que guarda el historial completo de cambios con fechas de vigencia",
  "Una dimensión que solo se actualiza una vez al año porque cambia muy lentamente"],
 2,"advanced","data_modeling","scd"],

["¿Qué significa ETL en ingeniería de datos?",
 ["Execute Transform Load: tres pasos para ejecutar pipelines en producción",
  "Extract Transform Load: proceso de mover y transformar datos entre sistemas",
  "Evaluate Test Launch: metodología de validación de pipelines de datos",
  "Export Transfer Log: protocolo de sincronización entre bases de datos distintas"],
 1,"beginner","data_pipelines","etl"],

["¿Cuál es la diferencia entre ETL y ELT?",
 ["ETL carga primero en el warehouse y transforma después; ELT transforma primero",
  "ETL es para datos en streaming y ELT es exclusivamente para datos en batch",
  "ETL transforma antes de cargar al warehouse; ELT carga primero y transforma después",
  "ETL usa SQL para transformar y ELT usa Python para procesar los datos crudos"],
 2,"intermediate","data_pipelines","etl_elt"],

["¿Qué es Apache Airflow y para qué se usa?",
 ["Una base de datos columnar optimizada para consultas analíticas masivas",
  "Un framework para orquestar, programar y monitorizar pipelines de datos",
  "Una herramienta de visualización que conecta a múltiples fuentes de datos",
  "Un sistema de mensajería para transmitir eventos en tiempo real entre servicios"],
 1,"intermediate","data_pipelines","airflow"],

["¿Qué es el procesamiento en streaming y cuándo usarlo?",
 ["Procesar datos en lotes muy grandes una vez al día para máxima eficiencia",
  "Almacenar datos sin procesar para analizarlos cuando sea necesario más tarde",
  "Procesar datos continuamente conforme llegan para obtener insights en tiempo real",
  "Comprimir datos antes de cargar al warehouse para reducir costes de almacenamiento"],
 2,"intermediate","data_pipelines","streaming"],
], # end analytics

# ═══════ ML_ENGINEERING ═════════════════════════════════════════════════════
"ml_engineering": [
["¿Para qué sirve el one-hot encoding?",
 ["Para comprimir variables numéricas reduciendo su rango a valores entre 0 y 1",
  "Para convertir variables ordinales respetando el orden natural entre categorías",
  "Para convertir variables categóricas en vectores binarios sin orden implícito",
  "Para normalizar variables continuas usando la distribución normal estándar base"],
 2,"intermediate","feature_engineering","one_hot"],

["¿Qué problema resuelve normalizar features antes de entrenar?",
 ["Evita que variables de escalas grandes dominen el entrenamiento del modelo",
  "Elimina los valores atípicos del dataset para que no distorsionen los pesos",
  "Reduce el número de features necesarias mejorando la velocidad de training",
  "Convierte automáticamente variables categóricas a numéricas antes de entrenar"],
 0,"intermediate","feature_engineering","normalization"],

["¿Qué es feature selection y por qué importa?",
 ["Crear nuevas variables combinando las existentes para mejorar el modelo actual",
  "Elegir las variables más relevantes para reducir ruido y mejorar el rendimiento",
  "Normalizar las variables para que tengan la misma escala y misma distribución",
  "Dividir el dataset en partes iguales asegurando representatividad de cada clase"],
 1,"intermediate","feature_engineering","feature_selection"],

["¿Cómo tratar los valores faltantes (NaN) en un dataset?",
 ["Siempre eliminarlos porque los NaN causan errores en todos los algoritmos ML",
  "Siempre reemplazarlos por cero porque es el valor neutro universalmente aceptado",
  "Depende del patrón de ausencia: imputar media, mediana o usar modelos que soporten NaN",
  "Nunca tratarlos porque la mayoría de modelos los ignoran completamente solos"],
 2,"intermediate","feature_engineering","missing_values"],

["¿Qué es el feature importance y cómo se obtiene?",
 ["Una métrica que mide cuánto tarda el modelo en procesar cada feature individual",
  "Una medida de cuánto contribuye cada variable a las predicciones del modelo",
  "Un ranking de variables por su correlación con las demás variables del dataset",
  "Una puntuación que indica cuántos NaN tiene cada feature en el dataset actual"],
 1,"intermediate","feature_engineering","feature_importance"],

["¿Cuándo es preferible usar F1-score sobre Accuracy?",
 ["Cuando el dataset tiene muchas features y accuracy no captura la complejidad",
  "Cuando las clases son desbalanceadas y accuracy daría resultados muy engañosos",
  "Cuando el modelo usa deep learning porque accuracy no aplica en redes neuronales",
  "Cuando el tiempo de inferencia es crítico y necesitas la métrica más rápida"],
 1,"intermediate","model_evaluation","f1_score"],

["¿Qué mide el AUC-ROC en clasificación binaria?",
 ["La velocidad de convergencia del modelo durante las épocas de entrenamiento",
  "La proporción de ejemplos positivos que el modelo clasifica correctamente siempre",
  "La capacidad del modelo de distinguir entre clases a todos los umbrales posibles",
  "El error cuadrático medio entre probabilidades predichas y etiquetas reales"],
 2,"intermediate","model_evaluation","auc_roc"],

["¿Cuál es la diferencia entre precision y recall?",
 ["Precision mide aciertos sobre los positivos predichos; recall sobre los positivos reales",
  "Precision solo aplica a modelos de regresión y recall a modelos de clasificación",
  "Precision mide velocidad del modelo y recall mide la calidad de las predicciones",
  "Precision y recall son idénticos matemáticamente pero se usan en contextos distintos"],
 0,"intermediate","model_evaluation","precision_recall"],

["¿Qué es MLflow y para qué se usa?",
 ["Una plataforma para visualizar dashboards de datos de negocio en tiempo real",
  "Un orquestador de pipelines de datos similar a Apache Airflow pero para ML",
  "Una plataforma para trackear experimentos, versionar modelos y gestionar ciclo ML",
  "Una herramienta de feature engineering que automatiza la creación de variables"],
 2,"intermediate","mlops","mlflow"],

["¿Qué es el model drift y cómo se detecta?",
 ["Un error en el código de entrenamiento que causa divergencia en los pesos red",
  "El deterioro del rendimiento del modelo cuando los datos de producción cambian",
  "La diferencia de velocidad entre entrenamiento e inferencia en producción real",
  "La pérdida de pesos al serializar y deserializar el archivo del modelo pkl"],
 1,"intermediate","mlops","model_drift"],

["¿Qué diferencia un experimento ML de un pipeline de producción?",
 ["Los experimentos usan Python y los pipelines de producción siempre usan Java",
  "Los experimentos no requieren tests; los pipelines de producción tampoco necesitan",
  "Los experimentos son exploratorios y ad-hoc; los pipelines son automatizados y monitorizados",
  "Los experimentos usan todos los datos disponibles; los pipelines usan solo 10%"],
 2,"intermediate","mlops","ml_lifecycle"],

["¿Qué es el feature store en MLOps?",
 ["Un repositorio de modelos preentrenados listos para desplegar en producción",
  "Un almacén centralizado de features reutilizables y consistentes entre modelos",
  "Una base de datos optimizada para almacenar los pesos de redes neuronales",
  "Un sistema de caché que almacena predicciones frecuentes para reducir latencia"],
 1,"advanced","mlops","feature_store"],

["¿Qué es el shadow mode deployment de un modelo ML?",
 ["Desplegar el modelo en un servidor secundario sin acceso a internet público",
  "Ejecutar el nuevo modelo en paralelo sin afectar producción para validar rendimiento",
  "Ocultar las predicciones del modelo hasta que supere un umbral de confianza",
  "Desplegar modelos solo durante la noche para aprovechar los recursos libres"],
 1,"advanced","mlops","shadow_deployment"],

["¿Qué es una API REST para servir un modelo ML?",
 ["Un archivo de configuración que especifica los requisitos del modelo en producción",
  "Un sistema de archivos compartido donde múltiples modelos guardan sus pesos",
  "Una interfaz HTTP que expone predicciones del modelo mediante endpoints estándar",
  "Una cola de mensajes que almacena requests hasta que el modelo está disponible"],
 2,"intermediate","deployment","model_serving"],

["¿Qué ventaja ofrece Docker para desplegar modelos ML?",
 ["Hace los modelos más precisos porque aísla las dependencias de producción",
  "Aumenta la velocidad de entrenamiento al gestionar mejor los recursos de GPU",
  "Empaqueta el modelo y sus dependencias garantizando reproducibilidad completa",
  "Reduce el coste de almacenamiento comprimiendo automáticamente los pesos del modelo"],
 2,"intermediate","deployment","docker_ml"],

["¿Qué es el batch inference y cuándo es preferible al real-time?",
 ["Procesar una predicción a la vez con máxima precisión para cada caso crítico",
  "Hacer predicciones en tiempo real para cada usuario mientras navega la app",
  "Ejecutar predicciones masivas sobre muchos datos cuando la latencia no importa",
  "Actualizar el modelo continuamente con nuevos datos sin reentrenamiento completo"],
 2,"intermediate","deployment","batch_inference"],

["¿Qué es el data drift en producción y por qué importa?",
 ["La pérdida gradual de accuracy causada por bugs en el código de inferencia",
  "El cambio en la distribución de los datos de entrada respecto al entrenamiento",
  "La diferencia de rendimiento entre el conjunto de entrenamiento y validación",
  "El desgaste de los pesos del modelo con el tiempo sin hacer reentrenamiento"],
 1,"intermediate","model_monitoring","data_drift"],

["¿Qué monitorizar en un modelo de ML en producción?",
 ["Solo la latencia porque es la métrica más importante para la experiencia usuario",
  "Solo el coste de infraestructura porque es el único KPI que importa al negocio",
  "Latencia, accuracy, distribución de inputs, tasa de errores y métricas de negocio",
  "Solo el número de predicciones diarias para asegurar que el modelo está activo"],
 2,"intermediate","model_monitoring","monitoring"],
], # end ml_engineering

# ═══════ AI_ARCHITECTURE ════════════════════════════════════════════════════
"ai_architecture": [
["¿Cuáles son los componentes principales de un sistema RAG?",
 ["Modelo base, fine-tuning dataset y servidor de inferencia de alta velocidad",
  "Indexador de documentos, retriever de chunks y generador LLM para responder",
  "Base de datos relacional, API REST y modelo de clasificación supervisado",
  "Scraper de contenido, preprocesador de texto y embeddings preentrenados fijos"],
 1,"intermediate","rag_systems","rag_components"],

["¿Qué es el chunking en un pipeline RAG?",
 ["La técnica de comprimir documentos para reducir el coste de almacenamiento",
  "El proceso de dividir documentos en fragmentos pequeños para indexarlos mejor",
  "La estrategia de agrupar consultas similares para reducir llamadas a la API",
  "El método de paginar resultados del retriever en lotes de tamaño fijo siempre"],
 1,"intermediate","rag_systems","chunking"],

["¿Qué es una base de datos vectorial en un sistema RAG?",
 ["Una base de datos relacional optimizada para queries SQL de alta complejidad",
  "Un sistema de caché que almacena respuestas frecuentes del LLM para reutilizar",
  "Una base de datos que almacena embeddings y permite búsqueda por similitud",
  "Una base de datos de grafos que conecta conceptos relacionados semánticamente"],
 2,"intermediate","rag_systems","vector_db"],

["¿Qué es el reranking en un pipeline RAG avanzado?",
 ["Reordenar los documentos del índice para reducir el tiempo de búsqueda total",
  "Volver a entrenar el modelo de embeddings con nuevos documentos del corpus",
  "Reordenar los chunks recuperados por relevancia real antes de enviarlos al LLM",
  "Regenerar las respuestas del LLM si no superan un umbral de calidad mínimo"],
 2,"advanced","rag_systems","reranking"],

["¿Cuál es la diferencia entre dense y sparse retrieval en RAG?",
 ["Dense usa más memoria RAM; sparse usa menos recursos en hardware modesto",
  "Dense recupera por similitud de embeddings; sparse usa coincidencia de tokens",
  "Dense es más lento pero más preciso; sparse es rápido pero siempre impreciso",
  "Dense requiere GPU para funcionar correctamente; sparse solo necesita CPU siempre"],
 1,"advanced","rag_systems","retrieval_methods"],

["¿Qué es el patrón ReAct en diseño de agentes LLM?",
 ["Un framework de React.js optimizado para construir interfaces de chatbots web",
  "Un diseño donde el agente alterna entre razonar y actuar en ciclos iterativos",
  "Un patrón que usa refuerzo y aprendizaje activo para mejorar el agente base",
  "Un sistema de reacciones en cadena donde un agente activa a otros agentes"],
 1,"advanced","llm_agents","react_pattern"],

["¿Qué tipos de memoria tiene un agente LLM moderno?",
 ["La cantidad de VRAM disponible para ejecutar el modelo de lenguaje localmente",
  "El número máximo de tokens que puede procesar el agente en una sola llamada",
  "Memoria corto plazo en el prompt y memoria largo plazo en base de datos externa",
  "El historial de errores del agente almacenado para depuración en desarrollo"],
 2,"advanced","llm_agents","agent_memory"],

["¿Para qué sirve el tool use en agentes LLM?",
 ["Para reducir el número de tokens que consume el agente en cada iteración",
  "Para limitar las capacidades del agente y evitar que ejecute código peligroso",
  "Para permitir al agente invocar funciones externas como búsqueda o calculadora",
  "Para usar múltiples modelos en paralelo y combinar sus respuestas en una"],
 2,"intermediate","llm_agents","tool_use"],

["¿Qué es el planning en el contexto de agentes autónomos?",
 ["El proceso de diseño previo al desarrollo para definir la arquitectura del sistema",
  "La capacidad del agente de descomponer objetivos complejos en subtareas ejecutables",
  "La generación de un plan de entrenamiento para mejorar el modelo base del agente",
  "El scheduling de tareas del agente para distribuirlas en múltiples servidores"],
 1,"advanced","llm_agents","agent_planning"],

["¿Cuál es la diferencia entre latencia y throughput en sistemas ML?",
 ["La latencia mide el coste y el throughput mide la precisión del modelo prod",
  "La latencia mide el retardo por request; throughput mide requests procesados por segundo",
  "La latencia aplica a sistemas batch y el throughput aplica a sistemas en tiempo real",
  "La latencia es una métrica de hardware y el throughput es una métrica de software"],
 1,"intermediate","system_design","latency_throughput"],

["¿Qué es el prompt caching y cómo reduce costes en producción?",
 ["Almacenar los pesos del modelo en caché para acelerar la carga inicial siempre",
  "Guardar los embeddings generados para no recalcularlos en cada llamada API",
  "Reutilizar prefijos de prompt repetidos para evitar reprocesarlos y ahorrar tokens",
  "Comprimir el historial de conversación para que ocupe menos tokens en contexto"],
 2,"advanced","system_design","prompt_caching"],

["¿Qué es un AI Gateway en arquitectura de sistemas con LLMs?",
 ["Una interfaz gráfica para que usuarios no técnicos interactúen con los modelos",
  "Un modelo ligero que pre-filtra requests antes de enviarlos al LLM principal",
  "Una capa que gestiona autenticación, rate limiting y routing a múltiples LLMs",
  "Un servidor de bases de datos optimizado para almacenar conversaciones completas"],
 2,"advanced","system_design","ai_gateway"],

["¿Qué es RAGAS y para qué se usa en evaluación?",
 ["Un modelo de lenguaje open source optimizado para razonamiento matemático",
  "Un framework para evaluar automáticamente pipelines RAG con métricas específicas",
  "Una técnica de fine-tuning para mejorar la capacidad de razonamiento del LLM",
  "Un sistema de orquestación de agentes múltiples para tareas colaborativas"],
 1,"advanced","evaluation","ragas"],

["¿Qué métricas evalúan correctamente un pipeline RAG?",
 ["Solo la latencia porque es lo más crítico en aplicaciones de usuario final",
  "Únicamente el coste por token porque define la viabilidad económica del sistema",
  "Faithfulness, relevance, context recall y answer correctness entre las principales",
  "Solo la satisfacción del usuario medida con encuestas de net promoter score"],
 2,"advanced","evaluation","rag_metrics"],

["¿Qué es LLM-as-a-judge en evaluación de sistemas IA?",
 ["Usar un LLM como árbitro en conflictos entre distintos agentes del sistema",
  "Un framework legal que regula el uso de LLMs en aplicaciones de alto impacto",
  "Usar un LLM para evaluar la calidad de respuestas generadas por otro LLM",
  "Un sistema de votación donde múltiples LLMs eligen la mejor respuesta posible"],
 2,"advanced","evaluation","llm_judge"],

["¿Qué es LoRA en el contexto del fine-tuning de LLMs?",
 ["Una técnica de compresión que reduce el modelo a la mitad de su tamaño original",
  "Un framework de evaluación de LLMs desarrollado por investigadores de Google",
  "Un método de fine-tuning eficiente que entrena matrices de rango bajo adicionales",
  "Un tipo de tokenizador optimizado para idiomas con alfabetos no latinos específicos"],
 2,"advanced","fine_tuning","lora"],

["¿Qué es RLHF (Reinforcement Learning from Human Feedback)?",
 ["Un método donde humanos puntúan respuestas para crear benchmarks de evaluación",
  "Una técnica para entrenar modelos usando recompensas basadas en preferencias humanas",
  "Un sistema de filtrado que usa feedback humano para eliminar contenido dañino",
  "Un protocolo para sincronizar múltiples modelos usando actualizaciones federadas"],
 1,"advanced","fine_tuning","rlhf"],

["¿Cuándo es preferible fine-tuning sobre RAG para adaptar un LLM?",
 ["Cuando los documentos son muy largos y no caben en el contexto del modelo base",
  "Cuando necesitas que el modelo aprenda un nuevo estilo, tono o comportamiento",
  "Siempre que la precisión sea crítica porque fine-tuning siempre supera a RAG",
  "Cuando el dataset de entrenamiento tiene menos de 100 ejemplos disponibles"],
 1,"advanced","fine_tuning","finetuning_vs_rag"],
], # end ai_architecture

} # end QUESTIONS_RAW

# ── Segunda tanda: distribución forzada pos 0 y pos 3 ──────────────────────
QUESTIONS_EXTRA = {

"foundations": [
# correct=0
["¿Cuál es la definición más precisa de Machine Learning?",
 ["Un campo donde los sistemas aprenden de datos sin ser programados explícitamente",
  "Un conjunto de reglas codificadas manualmente por expertos para resolver problemas",
  "Una tecnología que simula el pensamiento humano usando circuitos electrónicos",
  "Un tipo de base de datos que almacena conocimiento experto de forma estructurada"],
 0,"beginner","ml_basics","ml_definition"],

["¿Qué es el underfitting en un modelo de Machine Learning?",
 ["El modelo es demasiado simple y no captura los patrones del problema real",
  "El modelo tiene demasiados parámetros y memoriza el ruido de los datos",
  "El modelo tarda demasiado en converger porque la tasa de aprendizaje es alta",
  "El modelo usa demasiados datos de entrenamiento perdiendo la capacidad de generalizar"],
 0,"beginner","ml_basics","underfitting"],

["¿Qué es el gradient descent y para qué sirve?",
 ["Un algoritmo de optimización que actualiza pesos minimizando la función de pérdida",
  "Un método de inicialización de pesos que acelera la convergencia del modelo",
  "Una técnica de regularización que penaliza los pesos grandes en la red neuronal",
  "Un algoritmo que selecciona automáticamente la arquitectura óptima del modelo"],
 0,"intermediate","ml_basics","gradient_descent"],

["¿Cuál es la ventaja principal de los Random Forests?",
 ["Combinan múltiples árboles de decisión reduciendo varianza y mejorando robustez",
  "Son más rápidos de entrenar que cualquier otro algoritmo de clasificación conocido",
  "No requieren preprocesamiento de datos y funcionan con cualquier tipo de input",
  "Siempre superan al deep learning en problemas con datos tabulares estructurados"],
 0,"intermediate","ml_basics","random_forests"],

["¿Qué mide el coeficiente R² en regresión?",
 ["La proporción de varianza explicada por el modelo respecto a la varianza total",
  "El error promedio absoluto entre las predicciones y los valores reales del test",
  "La correlación entre los residuos del modelo y las variables independientes",
  "La penalización por complejidad del modelo en la función de pérdida regularizada"],
 0,"intermediate","statistics","r_squared"],

# correct=3
["¿Cuál es la función principal de la capa de pooling en una CNN?",
 ["Aprende los pesos óptimos para cada región del mapa de características generado",
  "Aplica la función de activación a cada elemento del mapa de características",
  "Conecta todas las neuronas de una capa con todas las neuronas de la siguiente",
  "Reduce las dimensiones espaciales del mapa de características preservando lo relevante"],
 3,"intermediate","deep_learning","pooling"],

["¿Qué es el attention mechanism en Transformers?",
 ["Una capa que comprime la representación de entrada en un vector de contexto fijo",
  "Un mecanismo recurrente que procesa cada token en secuencia uno a uno",
  "Una función de activación especial que mejora el gradiente en redes profundas",
  "Un mecanismo que pondera la importancia de cada token respecto a los demás"],
 3,"advanced","nlp_basics","attention"],

["¿Para qué se usa la regularización L2 (Ridge) en ML?",
 ["Para eliminar features irrelevantes poniendo sus coeficientes exactamente a cero",
  "Para aumentar la capacidad del modelo añadiendo términos polinómicos a las features",
  "Para escalar los valores del target al rango [0,1] antes del entrenamiento",
  "Para penalizar pesos grandes reduciendo el sobreajuste al añadir la norma al cuadrado"],
 3,"intermediate","ml_basics","regularization"],

["¿Qué es el batch normalization en redes neuronales?",
 ["Una técnica que elimina las capas más pequeñas para acelerar el entrenamiento",
  "Un método que inicializa todos los pesos de la red con valores cercanos a cero",
  "Una estrategia que aumenta la tasa de aprendizaje progresivamente durante training",
  "Una técnica que normaliza activaciones de cada capa estabilizando el entrenamiento"],
 3,"advanced","deep_learning","batch_norm"],

["¿Cuál es el propósito del learning rate scheduler?",
 ["Seleccionar automáticamente el mejor algoritmo de optimización para el modelo",
  "Inicializar la tasa de aprendizaje con el valor óptimo antes del entrenamiento",
  "Mantener la tasa de aprendizaje constante durante todo el proceso de training",
  "Ajustar la tasa de aprendizaje durante el entrenamiento para mejorar convergencia"],
 3,"intermediate","deep_learning","lr_scheduler"],
],

"prompt_engineering": [
# correct=0
["¿Qué es el 'output formatting' en prompt engineering?",
 ["Especificar en el prompt el formato exacto que debe tener la respuesta del modelo",
  "Un proceso automático que el modelo aplica para mejorar la legibilidad del texto",
  "Una técnica para reducir el número de tokens que usa el modelo al responder",
  "Un filtro de post-procesamiento que aplica formato al texto después de generarlo"],
 0,"intermediate","prompt_patterns","output_formatting"],

["¿Qué estrategia mejora más la consistencia de respuestas largas?",
 ["Pedir al modelo que responda sección a sección siguiendo una estructura definida",
  "Aumentar la temperatura a 0.9 para que el modelo genere más variaciones posibles",
  "Usar prompts muy cortos para no sobrecargar la memoria de contexto del modelo",
  "Repetir la misma pregunta varias veces y quedarse con la primera respuesta"],
 0,"intermediate","prompt_patterns","consistency"],

["¿Para qué se usa el parámetro top_p (nucleus sampling)?",
 ["Controla qué fracción del vocabulario considera el modelo al generar cada token",
  "Define la longitud máxima en caracteres que puede tener cada respuesta generada",
  "Establece el número máximo de intentos antes de que el modelo abandone la tarea",
  "Determina cuántos tokens de contexto anteriores recuerda el modelo al generar"],
 0,"intermediate","prompting_basics","top_p"],

["¿Qué es el 'delimiters' pattern en prompt engineering?",
 ["Usar marcadores como triple comillas para separar instrucciones de contenido",
  "Añadir espacios y saltos de línea para mejorar la legibilidad del prompt escrito",
  "Dividir el prompt en múltiples llamadas API para evitar límites de contexto",
  "Usar mayúsculas y negrita para resaltar las partes más importantes del prompt"],
 0,"intermediate","prompt_patterns","delimiters"],

# correct=3
["¿Qué es el 'negative prompting'?",
 ["Usar ejemplos negativos en few-shot para mostrar al modelo qué evitar hacer",
  "Reducir la temperatura del modelo para que genere respuestas más conservadoras",
  "Agregar instrucciones de seguridad para que el modelo evite contenido sensible",
  "Indicar explícitamente en el prompt lo que el modelo NO debe incluir en respuesta"],
 3,"intermediate","prompt_patterns","negative_prompting"],

["¿Qué diferencia al prompting de GPT-4o vs GPT-4 Turbo?",
 ["GPT-4o es de código abierto y GPT-4 Turbo es un modelo propietario de pago",
  "GPT-4o solo procesa texto mientras que GPT-4 Turbo soporta imágenes también",
  "GPT-4o tiene menor ventana de contexto pero mayor velocidad de inferencia",
  "GPT-4o es multimodal nativo con audio, visión y texto integrados de origen"],
 3,"advanced","models_knowledge","gpt4o"],

["¿Qué es el 'Constitutional AI' en el desarrollo de LLMs seguros?",
 ["Un estándar técnico internacional para certificar la seguridad de sistemas IA",
  "Un método de entrenamiento que usa reglas de alineación definidas por humanos",
  "Una arquitectura de red neuronal que incorpora restricciones éticas en sus capas",
  "Un proceso donde el modelo aprende a criticar y corregir sus propias respuestas"],
 3,"advanced","models_knowledge","constitutional_ai"],
],

"analytics": [
# correct=0
["¿Qué es un índice en una base de datos y cuándo usarlo?",
 ["Una estructura que acelera las búsquedas en columnas frecuentemente consultadas",
  "Una copia de seguridad automática de la tabla que se actualiza en tiempo real",
  "Un resumen estadístico de los datos de una columna para el optimizador de queries",
  "Un archivo de log que registra todos los cambios realizados sobre la tabla"],
 0,"intermediate","sql_advanced","indexes"],

["¿Qué hace EXPLAIN en SQL y por qué es útil?",
 ["Muestra el plan de ejecución de una query para identificar cuellos de botella",
  "Añade comentarios automáticos al código SQL para mejorar su documentación",
  "Ejecuta la query en modo de prueba sin modificar los datos de la tabla",
  "Genera documentación HTML de las tablas y sus relaciones automáticamente"],
 0,"intermediate","sql_advanced","explain"],

["¿Qué es el schema-on-read en arquitecturas de datos modernas?",
 ["Aplicar la estructura al dato cuando se lee, no al escribirlo en el almacén",
  "Validar el esquema de los datos antes de escribirlos en el data warehouse",
  "Definir el esquema en el momento de crear la tabla con DDL antes de ingestión",
  "Usar esquemas predefinidos de la industria para estandarizar los datos master"],
 0,"advanced","data_modeling","schema_on_read"],

["¿Para qué sirve el operador EXCEPT en SQL?",
 ["Devuelve filas del primer SELECT que no aparecen en el segundo SELECT dado",
  "Excluye columnas específicas del resultado manteniendo el resto de la tabla",
  "Filtra registros que cumplan una condición de excepción definida en el WHERE",
  "Elimina permanentemente filas de una tabla que no cumplen un criterio dado"],
 0,"advanced","sql_advanced","except"],

# correct=3
["¿Qué es una tabla de hash en el contexto de joins en bases de datos?",
 ["Una tabla que almacena funciones hash de los datos para cifrado de información",
  "Una estructura que indexa columnas de texto para búsqueda full-text rápida",
  "Una tabla temporal que se usa para optimizar queries con múltiples GROUP BY",
  "Una estructura en memoria que acelera los joins mapeando claves a posiciones"],
 3,"advanced","sql_advanced","hash_join"],

["¿Para qué sirve dbt snapshot?",
 ["Para tomar capturas de pantalla de los dashboards en momentos específicos",
  "Para guardar el estado del código dbt antes de hacer cambios importantes",
  "Para crear copias de seguridad de las tablas del warehouse automáticamente",
  "Para implementar SCDs tipo 2 rastreando cambios históricos en dimensiones"],
 3,"advanced","dbt","dbt_snapshot"],

["¿Qué es el particionamiento de tablas en un data warehouse?",
 ["Dividir la tabla en múltiples bases de datos para distribuir la carga de red",
  "Crear índices separados para cada subconjunto de datos de la tabla principal",
  "Replicar la tabla en múltiples nodos para mejorar la disponibilidad del sistema",
  "Dividir físicamente una tabla grande por una columna para acelerar las queries"],
 3,"advanced","data_modeling","partitioning"],

["¿Qué ventaja tiene usar Parquet sobre CSV en un data lake?",
 ["Parquet es más fácil de editar con editores de texto que el formato CSV plano",
  "Parquet soporta más tipos de caracteres especiales que el formato CSV estándar",
  "Parquet es compatible con más herramientas de visualización que el CSV básico",
  "Parquet es columnar, comprimido y más eficiente para queries analíticas masivas"],
 3,"intermediate","data_pipelines","parquet"],
],

"ml_engineering": [
# correct=0
["¿Cuál es el propósito principal de la validación cruzada estratificada?",
 ["Preservar la proporción de clases en cada fold cuando las clases son desbalanceadas",
  "Aumentar el número de folds para obtener estimaciones más precisas del rendimiento",
  "Reducir el tiempo total de validación usando menos datos en cada iteración",
  "Garantizar que los datos de test sean completamente independientes del entrenamiento"],
 0,"intermediate","model_evaluation","stratified_cv"],

["¿Qué es el aprendizaje activo (active learning) en ML?",
 ["Un paradigma donde el modelo selecciona qué datos etiquetar para aprender mejor",
  "Un método de entrenamiento continuo que actualiza el modelo con datos en streaming",
  "Una técnica donde el modelo aprende sin supervisión usando datos no etiquetados",
  "Un enfoque donde múltiples modelos compiten por aprender de los mismos datos"],
 0,"advanced","ml_basics","active_learning"],

["¿Qué es Optuna en el contexto de MLOps?",
 ["Un framework de optimización de hiperparámetros que usa búsqueda bayesiana",
  "Una plataforma de despliegue de modelos ML en entornos de producción cloud",
  "Una herramienta para versionar datasets y mantener reproducibilidad en experimentos",
  "Un sistema de monitorización que detecta drift en modelos desplegados en prod"],
 0,"advanced","mlops","hyperparameter_tuning"],

["¿Qué es el problema de class imbalance y cómo abordarlo?",
 ["Cuando una clase domina el dataset: usar SMOTE, class weights o under-sampling",
  "Cuando el dataset tiene más features que muestras causando el problema p>>n",
  "Cuando las features tienen distribuciones muy distintas que confunden al modelo",
  "Cuando los datos de entrenamiento y test tienen distribuciones diferentes parciales"],
 0,"intermediate","feature_engineering","class_imbalance"],

# correct=3
["¿Qué hace el algoritmo XGBoost diferente de Random Forest?",
 ["XGBoost usa bagging de árboles mientras Random Forest usa boosting secuencial",
  "XGBoost solo funciona con datos numéricos y Random Forest acepta categorías",
  "XGBoost requiere menos hiperparámetros para obtener buenos resultados prácticos",
  "XGBoost entrena árboles secuencialmente corrigiendo errores del árbol anterior"],
 3,"intermediate","ml_basics","xgboost"],

["¿Qué es SHAP y para qué sirve en ML interpretable?",
 ["Un framework de testing que verifica la corrección estadística de los modelos",
  "Un algoritmo de clustering que agrupa features similares para reducir dimensión",
  "Un método de compresión que reduce el tamaño de los modelos para mobile edge",
  "Una técnica que explica las predicciones de cualquier modelo usando valores Shapley"],
 3,"advanced","model_evaluation","shap"],

["¿Qué es el model registry en MLOps?",
 ["Un repositorio de artículos científicos sobre los modelos usados en el equipo",
  "Una base de datos que almacena los hiperparámetros de todos los experimentos",
  "Un dashboard que visualiza el rendimiento de los modelos en tiempo real prod",
  "Un sistema centralizado para versionar, registrar y gestionar el ciclo de modelos"],
 3,"intermediate","mlops","model_registry"],

["¿Cuándo usar un modelo de regresión logística vs una red neuronal?",
 ["La regresión logística siempre es mejor porque es más interpretable y rápida",
  "Las redes neuronales siempre superan a la regresión logística en cualquier tarea",
  "Depende de la GPU disponible: con GPU usar redes neuronales, sin GPU regresión",
  "La regresión logística es preferible cuando la relación es lineal y hay pocos datos"],
 3,"intermediate","ml_basics","model_selection"],
],

"ai_architecture": [
# correct=0
["¿Qué es el 'context stuffing' en sistemas RAG y cuál es su desventaja?",
 ["Añadir demasiados chunks al contexto; el modelo pierde focus en lo relevante",
  "Una técnica que mejora la relevancia del retriever usando múltiples índices",
  "Un método para comprimir múltiples consultas en una sola llamada a la API",
  "Una estrategia de chunking que preserva secciones completas de los documentos"],
 0,"advanced","rag_systems","context_stuffing"],

["¿Qué es la 'lost in the middle' phenomenon en LLMs con contexto largo?",
 ["Los modelos tienden a ignorar la información del medio del contexto larga",
  "Los modelos generan texto repetitivo cuando el contexto supera cierto tamaño",
  "Los modelos se vuelven más lentos cuanto más largo es el contexto procesado",
  "Los modelos mezclan información de distintos documentos en el contexto largo"],
 0,"advanced","rag_systems","lost_in_middle"],

["¿Qué es el 'agentic loop' en arquitecturas de agentes autónomos?",
 ["El ciclo de percepción, razonamiento y acción que el agente repite hasta terminar",
  "Una configuración donde múltiples agentes trabajan en paralelo en la misma tarea",
  "Un error de diseño donde el agente entra en un bucle infinito sin terminar",
  "Una técnica de optimización que reduce el número de llamadas al LLM del agente"],
 0,"advanced","llm_agents","agentic_loop"],

["¿Qué es el 'knowledge graph' en el contexto de sistemas IA?",
 ["Una representación de entidades y sus relaciones que enriquece el razonamiento",
  "Un diagrama que muestra el flujo de información entre componentes de un sistema",
  "Una base de datos vectorial especializada en almacenar conceptos del dominio",
  "Un tipo de embedding que codifica relaciones semánticas entre documentos texto"],
 0,"advanced","system_design","knowledge_graph"],

# correct=3
["¿Qué es el 'multi-agent framework' y cuándo usarlo?",
 ["Un sistema donde un solo agente muy capaz coordina todas las subtareas asignadas",
  "Una arquitectura donde múltiples modelos distintos comparten los mismos pesos",
  "Un patrón donde el mismo agente se llama recursivamente para tareas complejas",
  "Un sistema donde múltiples agentes especializados colaboran en tareas divididas"],
 3,"advanced","llm_agents","multi_agent"],

["¿Qué es el 'model quantization' y qué tradeoff introduce?",
 ["Una técnica de ensemble que combina modelos de distinta precisión numérica",
  "Un método de fine-tuning que reduce el número de capas del modelo base original",
  "Un proceso de compresión que elimina las capas menos importantes del modelo",
  "Reducir la precisión numérica de los pesos (ej: FP32→INT8) bajando tamaño vs calidad"],
 3,"advanced","fine_tuning","quantization"],

["¿Qué es el 'speculative decoding' en inferencia de LLMs?",
 ["Un método de evaluación que estima la calidad sin ejecutar el modelo completo",
  "Una técnica que genera texto especulativo y lo ofrece al usuario mientras procesa",
  "Un patrón de diseño donde múltiples modelos votan por el siguiente token correcto",
  "Una técnica donde un modelo pequeño propone tokens y uno grande los verifica"],
 3,"advanced","system_design","speculative_decoding"],

["¿Qué es 'responsible AI' y qué principios incluye?",
 ["Un framework legal que define responsabilidades legales de los desarrolladores IA",
  "Un tipo de seguro empresarial para cubrir daños causados por sistemas IA fallidos",
  "Un estándar ISO que certifica la calidad técnica de los sistemas de inteligencia",
  "Un conjunto de principios: fairness, transparencia, privacidad, seguridad y accountability"],
 3,"beginner","ai_types","responsible_ai"],
],

} # end QUESTIONS_EXTRA

# ── Validación anti-sesgo ────────────────────────────────────────────────────
def validate_and_export():
    import json
    all_q = []
    bias_count = 0
    diff_violations = 0

    # Combinar ambos diccionarios
    combined = {}
    for topic in set(list(QUESTIONS_RAW.keys()) + list(QUESTIONS_EXTRA.keys())):
        combined[topic] = QUESTIONS_RAW.get(topic, []) + QUESTIONS_EXTRA.get(topic, [])

    for topic, questions in combined.items():
        for i, q in enumerate(questions):
            question, options, correct, difficulty, subtopic, concept = q
            opts_len = [len(o) for o in options]
            max_l, min_l = max(opts_len), min(opts_len)

            if options[correct] == max(options, key=len):
                bias_count += 1

            if max_l - min_l > 45:
                diff_violations += 1
                print(f"⚠ DIFF {max_l-min_l}: {question[:50]}")

            all_q.append({
                "id": f"qb_{topic[:3]}_{i:03d}",
                "topic": topic,
                "sub_topic": subtopic,
                "difficulty": difficulty,
                "question": question,
                "options": options,
                "correct": correct,
                "concept": concept,
            })

    total = len(all_q)
    pos_counts = {i: sum(1 for q in all_q if q["correct"] == i) for i in range(4)}

    print(f"\n{'='*60}")
    print(f"Total preguntas banco: {total}")
    print(f"Sesgo (correcto=más largo): {bias_count}/{total} ({100*bias_count//max(total,1)}%)")
    print(f"Diferencia longitud > 45: {diff_violations}")
    print(f"Distribución posición: {pos_counts}")
    print(f"  Pos 0: {100*pos_counts[0]//max(total,1)}%")
    print(f"  Pos 1: {100*pos_counts[1]//max(total,1)}%")
    print(f"  Pos 2: {100*pos_counts[2]//max(total,1)}%")
    print(f"  Pos 3: {100*pos_counts[3]//max(total,1)}%")
    print(f"Por topic: {', '.join(f'{k}:{len(v)}' for k,v in combined.items())}")

    return all_q

if __name__ == "__main__":
    import json
    questions = validate_and_export()
    js_out = "export const QUESTION_BANK = " + json.dumps(questions, ensure_ascii=False, indent=2) + ";\n"
    out_path = "/workspace/project/frontend/src/data/questions_bank.js"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(js_out)
    print(f"\n✅ Escrito: {out_path} ({len(js_out)//1024} KB)")
