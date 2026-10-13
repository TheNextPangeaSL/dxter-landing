// FAQ content (validated copy). Strings may contain inline <strong> markup.
export type FaqCategory = "tech" | "account";

export interface FaqEntry {
    category: FaqCategory;
    q: string;
    intro: string;
    items?: [label: string, text: string][];
    outro?: string;
}

const faqEs: FaqEntry[] = [
    {
        category: "tech",
        q: "¿Qué tipo de datos puede utilizar DxTER?",
        intro: "Puedes construir el dataset directamente en DxTER, introduciendo experimentos y creando variables <strong>manualmente</strong>, o, para mayor comodidad, cargar tus datos desde <strong>Excel o CSV</strong>.",
        items: [
            ["Factores", "Variables numéricas continuas o discretas que DxTER puede utilizar en la búsqueda."],
            ["Respuestas", "Salidas numéricas que quieres analizar, predecir u optimizar."],
            ["Filtros", "La información categórica puede utilizarse para seleccionar o segmentar experimentos, aunque no actúa como factor de optimización."],
            ["Variables calculadas", "Puedes crear nuevas variables mediante fórmulas basadas en otras variables del dataset."],
        ],
        outro: "Además, puedes definir unidades, rangos, límites físicos y valores permitidos para representar correctamente tu espacio experimental.",
    },
    {
        category: "tech",
        q: "¿Necesito muchos datos para empezar?",
        intro: "No existe un número universal de experimentos. En general, <strong>cuantos más datos de calidad tengas, mejor</strong>, pero la cantidad no es lo único importante.",
        items: [
            ["Cobertura del espacio", "Es preferible disponer de información representativa de distintas zonas del espacio experimental a tener muchos puntos concentrados en una única región."],
            ["Calidad y consistencia", "DxTER tiene en cuenta si los datos disponibles son suficientemente coherentes para construir el modelo."],
            ["Siguiente paso", "Según lo que ya conoce, DxTER puede orientar la estrategia hacia explorar regiones poco conocidas, equilibrar aprendizaje y rendimiento o explotar las zonas más prometedoras."],
        ],
        outro: "La plataforma te irá ayudando a entender qué tipo de información necesita el modelo para seguir avanzando.",
    },
    {
        category: "tech",
        q: "¿Qué objetivos, límites y restricciones puedo definir?",
        intro: "Puedes trabajar con <strong>uno o varios objetivos</strong> y definir si quieres maximizar, minimizar o aproximarte a un valor objetivo.",
        items: [
            ["Límites físicos", "Delimitan valores que no son posibles por la propia naturaleza del proceso o por la capacidad del equipamiento utilizado."],
            ["Valores permitidos", "Permiten definir rangos continuos o conjuntos discretos de valores válidos para cada factor."],
            ["Restricciones", "Representan relaciones adicionales entre factores o condiciones que debe cumplir una combinación para considerarse factible."],
        ],
        outro: "Con esta información, DxTER sabe <strong>dónde puede buscar</strong> y evita recomendar condiciones que no tengan sentido experimentalmente.",
    },
    {
        category: "tech",
        q: "¿Puede optimizar varios objetivos a la vez?",
        intro: "Sí. DxTER puede abordar problemas <strong>multiobjetivo</strong> y ayudarte a entender los compromisos entre respuestas que compiten, identificando soluciones que ofrecen distintos equilibrios dentro de las restricciones definidas.",
    },
    {
        category: "tech",
        q: "¿Cómo funciona la estrategia de búsqueda?",
        intro: "DxTER utiliza el conocimiento disponible y la incertidumbre del modelo para ayudarte a decidir qué tipo de búsqueda interesa en cada momento.",
        items: [
            ["Exploratoria", "Busca aprender más sobre regiones poco conocidas del espacio experimental."],
            ["Balanceada", "Combina aprendizaje y búsqueda de mejores resultados."],
            ["Explotativa", "Concentra las recomendaciones en las regiones que ya muestran mayor potencial."],
        ],
        outro: "El usuario mantiene el control sobre la estrategia aplicada.",
    },
    {
        category: "tech",
        q: "¿Qué ocurre si mis datos tienen huecos o calidad irregular?",
        intro: "DxTER realiza comprobaciones sobre la estructura del dataset, los tipos de variable y los valores ausentes antes de utilizar los datos para modelar y recomendar.",
        items: [
            ["Datos incompletos", "Pueden seguir siendo útiles para explorar el dataset, aunque el modelo utiliza las observaciones válidas para los factores y respuestas seleccionados."],
            ["Avisos", "La plataforma señala problemas que puedan limitar el análisis para que puedas revisarlos antes de ejecutar una optimización."],
        ],
    },
    {
        category: "tech",
        q: "¿Puede DxTER trabajar con simuladores o herramientas propias?",
        intro: "Sí. DxTER puede integrarse con <strong>entornos de simulación</strong> para incorporar resultados virtuales al ciclo de optimización y explorar más alternativas antes de pasar al ensayo físico. Las integraciones con simuladores, fuentes de datos o herramientas propias se plantean como servicios personalizados según el entorno del cliente.",
    },
    {
        category: "tech",
        q: "¿Qué requisitos de sistema o navegador tiene DxTER?",
        intro: "DxTER es una aplicación <strong>100 % web</strong>: los cálculos se realizan en la nube y no requiere instalación local ni hardware específico.",
        items: [
            ["Navegador actualizado", "Para la mejor experiencia, recomendamos utilizar una versión reciente del navegador."],
            ["Navegadores compatibles", "DxTER está optimizado para versiones modernas de Chrome, Firefox, Safari y Edge."],
        ],
    },
    {
        category: "account",
        q: "¿Qué incluye la suscripción y cuándo se consumen créditos?",
        intro: "La suscripción incluye el uso de la plataforma: proyectos y datasets, análisis y visualización, entorno colaborativo, configuración de diseños de experimentos y acceso desde navegador.",
        items: [
            ["Sin consumo de créditos", "Consultar, organizar y analizar la información o configurar un DoE no consume créditos."],
            ["Con consumo de créditos", "Los créditos se utilizan únicamente al generar recomendaciones de IA."],
            ["Coste visible", "Cada recomendación consume 1, 2 o 3 créditos según la complejidad del escenario, y el coste se muestra antes de ejecutar."],
        ],
    },
    {
        category: "account",
        q: "¿Cómo funciona la facturación mensual?",
        intro: "DxTER funciona con una <strong>suscripción mensual por usuario</strong>, sin permanencia. El precio por usuario depende del tramo publicado para el tamaño de tu equipo.",
        items: [
            ["Al contratar", "Al activar la suscripción se realiza la primera facturación. Cada usuario activado aporta sus 80 créditos iniciales a la bolsa común."],
            ["Renovación", "El día 1 de cada mes se factura el número de usuarios activos y se incorporan 80 créditos por cada uno a la bolsa de la organización."],
            ["Altas durante el mes", "Un nuevo usuario se factura al activarse y aporta 80 créditos en ese momento."],
            ["Bajas", "No se realizan prorrateos ni devoluciones. La baja afecta a la siguiente renovación mensual."],
        ],
        outro: "Los importes publicados se muestran sin impuestos; se aplica el impuesto correspondiente según la ubicación y situación fiscal del cliente.",
    },
    {
        category: "account",
        q: "¿Puedo añadir o reducir usuarios? ¿Hay permanencia?",
        intro: "Sí. La suscripción es flexible y <strong>no tiene permanencia</strong>. Puedes ampliar o reducir el equipo según tus necesidades. Cada organización mantiene al menos un usuario administrador para gestionar usuarios, acceso y facturación.",
    },
    {
        category: "account",
        q: "¿Los créditos se acumulan o caducan?",
        intro: "Cada usuario activo aporta <strong>80 créditos al mes</strong> a una bolsa común de la organización.",
        items: [
            ["Créditos incluidos", "Los créditos mensuales no utilizados se acumulan durante <strong>3 meses adicionales</strong>; después caducan."],
            ["Packs adicionales", "Los créditos comprados en packs son compartidos por la organización y tienen una validez de <strong>12 meses desde la compra</strong>."],
            ["Bolsa común", "El saldo no queda ligado a una persona concreta: el equipo puede utilizarlo allí donde lo necesite."],
        ],
    },
    {
        category: "account",
        q: "¿Cómo se protegen mis datos y resultados?",
        intro: "DxTER aplica medidas de seguridad orientadas a proteger los datos experimentales, resultados y propiedad intelectual de cada organización.",
        items: [
            ["Protección de datos", "La información se protege durante la transmisión y el almacenamiento."],
            ["Control de acceso", "El acceso se limita a usuarios autenticados y autorizados dentro de cada organización."],
            ["Seguridad operativa", "Se realizan revisiones de seguridad, pruebas de penetración y monitorización para detectar posibles amenazas."],
        ],
    },
    {
        category: "account",
        q: "¿Los datos de mi organización están aislados de los de otros clientes?",
        intro: "Sí. DxTER funciona en un entorno <strong>multi-tenant con aislamiento por organización</strong>. La información de cada cliente permanece separada y solo puede ser consultada por los usuarios autorizados de esa organización.",
    },
    {
        category: "account",
        q: "¿Se utilizan mis datos para entrenar modelos de otros clientes?",
        intro: "No. Los datos de una organización <strong>no se mezclan con datos de otras organizaciones</strong> ni se utilizan para entrenar modelos destinados a otros clientes. Los modelos asociados a tus diseños experimentales se construyen con la información de tu propio entorno de trabajo.",
    },
    {
        category: "account",
        q: "¿Cumple DxTER con el RGPD?",
        intro: "Sí. DxTER cumple con el <strong>Reglamento General de Protección de Datos (RGPD), Reglamento (UE) 2016/679</strong>, y aplica medidas de protección y tratamiento de la información acordes con la normativa europea de privacidad.",
    },
    {
        category: "account",
        q: "¿Dónde se aloja la infraestructura de producción?",
        intro: "La infraestructura de producción de DxTER se aloja en <strong>España</strong>, reforzando el control sobre la ubicación de los datos y su tratamiento dentro del marco europeo.",
    },
    {
        category: "account",
        q: "¿Cómo se crea una cuenta y se gestionan los usuarios?",
        intro: "DxTER utiliza un modelo de acceso por <strong>organización</strong> para mantener seguridad, trazabilidad y control sobre los usuarios.",
        items: [
            ["Organización", "Al contratar DxTER se crea el entorno de tu organización."],
            ["Administrador", "Se designa al menos un usuario administrador responsable de gestionar usuarios, accesos y facturación."],
            ["Equipo", "El administrador puede incorporar y gestionar a los usuarios de la organización según las necesidades del equipo."],
        ],
    },
    {
        category: "account",
        q: "¿Qué soporte incluye la suscripción?",
        intro: "La suscripción incluye soporte para <strong>consultas e incidencias relacionadas con el uso de DxTER</strong>. Si necesitas integración con herramientas propias, configuración específica, formación o un desarrollo adicional, podemos plantearlo como un servicio personalizado.",
    },
    {
        category: "account",
        q: "¿Puedo ver DxTER antes de contratar?",
        intro: "Sí. Puedes solicitar una <strong>demo guiada</strong> para revisar el funcionamiento de la plataforma y comentar tu caso de uso, especialmente si quieres validar previamente el encaje de tus variables, restricciones, datos o posibles integraciones.",
    },
    {
        category: "account",
        q: "¿Qué ocurre si falla un pago?",
        intro: "Si un pago no puede completarse, dispones de un <strong>periodo de gracia de 10 días naturales</strong> para regularizarlo.",
        items: [
            ["Hasta el día 10", "La organización continúa activa mientras se resuelve el pago pendiente."],
            ["A partir del día 11", "Si el pago sigue pendiente, la organización pasa a estado suspendido. No se borran los datos."],
            ["Durante la suspensión", "Se mantiene el acceso necesario para administración, facturación y pago, pero se bloquea el uso operativo de proyectos, datasets, ejecuciones y consumo de créditos."],
            ["Reactivación", "Al completarse correctamente el pago, la organización se reactiva automáticamente."],
        ],
    },
];

const faqEn: FaqEntry[] = [
    {
        category: "tech",
        q: "What type of data can DxTER work with?",
        intro: "You can build the dataset directly in DxTER by entering experiments and creating variables <strong>manually</strong>, or, for convenience, upload your data from <strong>Excel or CSV</strong>.",
        items: [
            ["Factors", "Continuous or discrete numerical variables that DxTER can use in the search."],
            ["Responses", "Numerical outputs you want to analyse, predict or optimise."],
            ["Filters", "Categorical information can be used to select or segment experiments, although it is not used as an optimisation factor."],
            ["Calculated variables", "You can create new variables using formulas based on other variables in the dataset."],
        ],
        outro: "You can also define units, ranges, physical limits and allowed values so the dataset accurately represents your experimental space.",
    },
    {
        category: "tech",
        q: "Do I need a large dataset to get started?",
        intro: "There is no universal minimum number of experiments. In general, <strong>the more high-quality data you have, the better</strong>, but quantity is not the only consideration.",
        items: [
            ["Space coverage", "Representative information from different areas of the experimental space is more useful than many points concentrated in a single region."],
            ["Quality and consistency", "DxTER considers whether the available data is sufficiently consistent to build the model."],
            ["Next step", "Based on current knowledge, DxTER can guide the strategy towards exploring less-known regions, balancing learning and performance, or exploiting the most promising areas."],
        ],
        outro: "The platform helps you understand what type of information the model needs in order to keep progressing.",
    },
    {
        category: "tech",
        q: "What objectives, limits and constraints can I define?",
        intro: "You can work with <strong>one or several objectives</strong> and define whether you want to maximise, minimise or approach a target value.",
        items: [
            ["Physical limits", "Define values that are impossible due to the nature of the process or the capabilities of the equipment being used."],
            ["Allowed values", "Define continuous ranges or discrete sets of valid values for each factor."],
            ["Constraints", "Represent additional relationships between factors or conditions that a combination must satisfy to be feasible."],
        ],
        outro: "This information tells DxTER <strong>where it is allowed to search</strong> and prevents it from recommending experimentally invalid conditions.",
    },
    {
        category: "tech",
        q: "Can DxTER optimise several objectives at once?",
        intro: "Yes. DxTER can address <strong>multi-objective</strong> problems and help you understand trade-offs between competing responses by identifying solutions that offer different balances within the defined constraints.",
    },
    {
        category: "tech",
        q: "How does the search strategy work?",
        intro: "DxTER uses available knowledge and model uncertainty to help determine which type of search is most useful at each stage.",
        items: [
            ["Exploratory", "Learn more about less-known regions of the experimental space."],
            ["Balanced", "Combine learning with the search for better results."],
            ["Exploitative", "Focus recommendations on regions already showing higher potential."],
        ],
        outro: "The user remains in control of the strategy applied.",
    },
    {
        category: "tech",
        q: "What if my dataset has missing or inconsistent data?",
        intro: "DxTER checks dataset structure, variable types and missing values before using the data for modelling and recommendations.",
        items: [
            ["Incomplete data", "It may still be useful when exploring the dataset, although the model uses valid observations for the selected factors and responses."],
            ["Warnings", "The platform highlights issues that may limit the analysis so you can review them before running an optimisation."],
        ],
    },
    {
        category: "tech",
        q: "Can DxTER work with simulation environments or proprietary tools?",
        intro: "Yes. DxTER can integrate with <strong>simulation environments</strong> to bring virtual results into the optimisation loop and explore more alternatives before moving to physical testing. Integrations with simulators, data sources or proprietary tools are scoped as customised services according to the customer environment.",
    },
    {
        category: "tech",
        q: "What are the system and browser requirements?",
        intro: "DxTER is a <strong>fully web-based</strong> application: computations are performed in the cloud, with no local installation or specific hardware requirements.",
        items: [
            ["Up-to-date browser", "For the best experience, we recommend using a recent browser version."],
            ["Supported browsers", "DxTER is optimised for modern versions of Chrome, Firefox, Safari and Edge."],
        ],
    },
    {
        category: "account",
        q: "What is included in the subscription and when are credits consumed?",
        intro: "The subscription includes use of the platform: projects and datasets, analysis and visualisation, collaborative workspace, Design of Experiments configuration and browser access.",
        items: [
            ["No credit consumption", "Viewing, organising and analysing information or configuring a DoE does not consume credits."],
            ["Credit consumption", "Credits are used only when generating AI recommendations."],
            ["Visible cost", "Each recommendation uses 1, 2 or 3 credits depending on scenario complexity, and the cost is shown before execution."],
        ],
    },
    {
        category: "account",
        q: "How does monthly billing work?",
        intro: "DxTER uses a <strong>monthly per-user subscription</strong> with no minimum commitment. The per-user price depends on the published tier for your team size.",
        items: [
            ["When subscribing", "The first invoice is issued when the subscription is activated. Each activated user contributes their initial 80 credits to the shared pool."],
            ["Renewal", "On the 1st of each month, active users are billed and 80 credits per active user are added to the organisation's pool."],
            ["Users added mid-month", "A new user is billed when activated and contributes 80 credits at that time."],
            ["Users removed", "There are no prorated refunds. Removal affects the next monthly renewal."],
        ],
        outro: "Published prices exclude taxes; the applicable tax depends on the customer's location and tax status.",
    },
    {
        category: "account",
        q: "Can I add or remove users? Is there a minimum commitment?",
        intro: "Yes. The subscription is flexible and has <strong>no minimum commitment</strong>. You can increase or reduce the team according to your needs. Each organisation keeps at least one administrator user to manage users, access and billing.",
    },
    {
        category: "account",
        q: "Do credits roll over or expire?",
        intro: "Each active user contributes <strong>80 credits per month</strong> to the organisation's shared pool.",
        items: [
            ["Included credits", "Unused monthly credits roll over for <strong>3 additional months</strong> and then expire."],
            ["Additional packs", "Credits purchased in packs are shared across the organisation and are valid for <strong>12 months from purchase</strong>."],
            ["Shared pool", "The balance is not tied to a specific person: the team can use it wherever it is needed."],
        ],
    },
    {
        category: "account",
        q: "How are my data and results protected?",
        intro: "DxTER applies security measures designed to protect each organisation's experimental data, results and intellectual property.",
        items: [
            ["Data protection", "Information is protected in transit and at rest."],
            ["Access control", "Access is restricted to authenticated and authorised users within each organisation."],
            ["Operational security", "Security reviews, penetration testing and monitoring are performed to detect potential threats."],
        ],
    },
    {
        category: "account",
        q: "Is my organisation's data isolated from other customers?",
        intro: "Yes. DxTER operates in a <strong>multi-tenant environment with organisation-level isolation</strong>. Each customer's information remains separate and can only be accessed by authorised users within that organisation.",
    },
    {
        category: "account",
        q: "Is my data used to train models for other customers?",
        intro: "No. An organisation's data is <strong>not mixed with data from other organisations</strong> and is not used to train models for other customers. Models associated with your experimental designs are built using information from your own working environment.",
    },
    {
        category: "account",
        q: "Does DxTER comply with GDPR?",
        intro: "Yes. DxTER complies with the <strong>General Data Protection Regulation (GDPR), Regulation (EU) 2016/679</strong>, and applies data protection and processing measures in line with European privacy requirements.",
    },
    {
        category: "account",
        q: "Where is the production infrastructure hosted?",
        intro: "DxTER's production infrastructure is hosted in <strong>Spain</strong>, reinforcing control over data location and its processing within the European framework.",
    },
    {
        category: "account",
        q: "How is an account created and how are users managed?",
        intro: "DxTER uses an <strong>organisation-based</strong> access model to maintain security, traceability and user control.",
        items: [
            ["Organisation", "When DxTER is subscribed to, your organisation's environment is created."],
            ["Administrator", "At least one administrator user is designated to manage users, access and billing."],
            ["Team", "The administrator can add and manage organisation users according to the team's needs."],
        ],
    },
    {
        category: "account",
        q: "What support is included with the subscription?",
        intro: "The subscription includes support for <strong>questions and incidents related to the use of DxTER</strong>. If you need integration with proprietary tools, specific configuration, training or additional development, these can be scoped as customised services.",
    },
    {
        category: "account",
        q: "Can I see DxTER before subscribing?",
        intro: "Yes. You can request a <strong>guided demo</strong> to review how the platform works and discuss your use case, especially if you want to validate the fit of your variables, constraints, data or potential integrations before subscribing.",
    },
    {
        category: "account",
        q: "What happens if a payment fails?",
        intro: "If a payment cannot be completed, there is a <strong>10-calendar-day grace period</strong> to resolve it.",
        items: [
            ["Until day 10", "The organisation remains active while the outstanding payment is resolved."],
            ["From day 11", "If payment is still outstanding, the organisation is suspended. Data is not deleted."],
            ["During suspension", "Access required for administration, billing and payment remains available, while operational use of projects, datasets, executions and credit consumption is blocked."],
            ["Reactivation", "Once payment is successfully completed, the organisation is automatically reactivated."],
        ],
    },
];

export const faq: Record<"es" | "en", FaqEntry[]> = { es: faqEs, en: faqEn };
